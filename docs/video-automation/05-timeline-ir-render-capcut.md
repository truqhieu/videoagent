# 05 — Timeline IR, render FFmpeg & export CapCut

## 1. Timeline IR — bản vẽ kỹ thuật duy nhất

```
Timeline IR (JSON, có version)
   ├─► ffmpeg_compiler  → preview.mp4 / final.mp4      (luôn chạy)
   └─► capcut_adapter   → project CapCut nhiều track    (chỉ khi người duyệt bấm Export)
```

Quy tắc thời gian:
- Đơn vị trên timeline: **frame nguyên** @ `fps_num/fps_den` (mặc định 30/1). Audio: sample @48kHz.
- Source in/out lưu theo **thời gian hữu tỉ của file gốc** (`ms` hoặc `frame@fps_gốc`); chuyển đổi khi biên dịch, không cộng dồn số thập phân đã làm tròn.
- `timeline_dur = (src_out − src_in) / speed`, lượng tử về frame từ mốc tuyệt đối.

### Schema rút gọn (`packages/timeline_ir/schema.json`, `vcb.timeline.v1`)

```json
{
  "schema_version": "vcb.timeline.v1",
  "job_id": "J-20261009-0001", "revision": 2,
  "canvas": {"w": 1080, "h": 1920, "fps_num": 30, "fps_den": 1, "bg": "black"},
  "duration_frames": 1350,
  "template": {"id": "A4_v2", "version": "1.0"}, "style_preset": "huyk_default@1.2",
  "product": {"sku": "N0017", "facts_version": 3},
  "tracks": [
    {"id": "V1", "kind": "video", "role": "main", "clips": [
      {"clip_id": "c01", "slot": "s1", "segment_id": "seg-…", "asset": {"id": "…", "sha256": "…"},
       "start": 0, "dur": 66,
       "src": {"in_ms": 1200, "out_ms": 3400}, "speed": {"num": 1, "den": 1},
       "transform": {"scale": 1.15, "x": 0.0, "y": 0.08, "rotation": 0},
       "color": {"fx_id": "lut_jewelry_warm", "intensity": 0.6},
       "audio": {"mode": "mute"},
       "transition_out": {"fx_id": "tr_combine", "frames": 14}}
    ]},
    {"id": "V2", "kind": "video", "role": "overlay", "clips": [
      {"clip_id": "logo1", "fx_id": "logo_huyk_corner", "start": 270, "dur": 420, "opacity": 0.85}
    ]},
    {"id": "T1", "kind": "text", "role": "subtitle", "clips": [
      {"start": 0, "dur": 66, "text": "Bạn thường nhìn chi tiết nào trước?", "style_id": "sub_huyk_default"}
    ]},
    {"id": "T2", "kind": "text", "role": "title", "clips": []},
    {"id": "A1", "kind": "audio", "role": "voice", "clips": [
      {"start": 0, "asset_id": "vo-…", "src": {"in_ms": 0, "out_ms": 2150}, "gain_db": 0, "voice_id": "huyk_vi_v1"}
    ]},
    {"id": "A2", "kind": "audio", "role": "music", "clips": [
      {"start": 0, "dur": 1350, "fx_id": "bgm_touching_014", "src": {"in_ms": 1967},
       "gain_db": -10, "duck": {"under": "A1", "depth_db": -6}, "fade_in": 0, "fade_out": 33}
    ]},
    {"id": "A3", "kind": "audio", "role": "sfx", "clips": [
      {"start": 270, "fx_id": "sfx_hammer_metal_03", "gain_db": -8}
    ]},
    {"id": "A4", "kind": "audio", "role": "source", "clips": []}
  ],
  "captions_srt": "captions.srt",
  "policies": {"require_exact_sku": true, "allow_unlicensed": false, "allow_talking_head_redub": false},
  "fx_manifest": ["tr_combine", "bgm_touching_014", "sfx_hammer_metal_03", "sub_huyk_default", "logo_huyk_corner"]
}
```

Track tối thiểu: `V1` main · `V2` overlay (logo/PIP/X split) · `T1` subtitle · `T2` chữ tiêu đề/CTA · `A1` voice · `A2` music · `A3` sfx · `A4` âm hiện trường (tiếng gốc `huyk_talk`, tiếng máy được giữ có chủ đích).

Validator bắt buộc: không overlap trong cùng track (trừ vùng transition) · không gap trên V1 · `src` nằm trong duration asset · mọi `fx_id` tồn tại và có `ffmpeg` + `capcut` mapping hợp lệ (07) · tổng thời lượng khớp ±1 frame.

## 2. FFmpeg compiler

Nguyên tắc: **render theo từng clip rồi ghép**, không một filter graph khổng lồ (dễ debug, cache được).

1. **Mezzanine theo clip**: Media API của Hub trả đoạn src in/out đã chuẩn hóa (03 §8); Agent cache theo `sha256 + range`, rồi áp phần còn lại:
   `-i mezzanine` → rotate/tonemap (nếu HLG) → `fps=30` → `setpts=PTS/speed` → `scale` + `crop` theo transform → LUT (`lut3d`) → 1080×1920 yuv420p → ProRes/intermediate H.264 CRF 12.
2. **Ghép V1** bằng `xfade` cho clip có transition (`transition=fade|fadeblack|dissolve…` theo mapping 07, `duration=frames/30`, `offset` tính từ IR); clip không transition dùng concat.
3. **Overlay V2** (logo/PIP): `overlay=enable='between(t,a,b)'`.
4. **Chữ**: render từ `style_id` bằng `drawtext`/ASS (libass) với font có quyền, hỗ trợ tiếng Việt/Nhật/Thái (vd Be Vietnam Pro, Noto Sans JP/Thai).
5. **Audio mix**: `A1` voice; `A2` music `volume` + `sidechaincompress` với voice làm sidechain (ducking) + `afade`; `A3` sfx `adelay`; `amix` → `loudnorm=I=-14:TP=-1:LRA=11` (2-pass).
6. Encode: `libx264 -profile:v high -pix_fmt yuv420p -r 30 -b:v 10M -maxrate 12M -bufsize 20M -movflags +faststart`, AAC 48kHz 192k.
7. Kiểm tra sau encode: ffprobe (thời lượng, fps, kích thước), `ebur128` (LUFS), `blackdetect`, `silencedetect`.

Hiệu năng mục tiêu (đo lại): video 45s, preview 720p < 60s, final < 3 phút trên worker 8 core; mezzanine cache làm lần render sửa nhanh < 30s.

## 3. CapCut export (chỉ khi CẦN SỬA)

### 3.1 Cấu trúc draft học từ project thật `Nhan_Than_Hor`

| Khía cạnh | Quan sát thật | Ý nghĩa cho adapter |
|---|---|---|
| File timeline | `draft_info.json` (JSON thường, không mã hóa) + `draft_meta_info.json` | Sinh 2 file này + thư mục `materials/` |
| Phiên bản | Tạo bằng CapCut **8.3.0 Windows**, mở/lưu bằng **9.4.0 macOS** | **Đã chốt: target profile `capcut-win-9.3-pro`** = CapCut Desktop **Windows 9.3**, đăng nhập **tài khoản Pro**. Mac ngoài MVP. Khi VCB nâng phiên bản, chạy lại golden test rồi mới đổi profile |
| Đơn vị | **microsecond** (`duration: 64166666`) | `us = round(frame * 1e6 * fps_den / fps_num)` |
| Canvas | 1080×1920, ratio 9:16, fps 30 | Lấy từ IR |
| Tracks | 1 video (33 seg), 1 text (14), 2 audio | Map 1-1 từ IR tracks |
| Segment video | `source_timerange{start,duration}`, `target_timerange{start,duration}`, `speed`, `volume=0`, `clip.scale{x,y}`, `clip.transform{x,y}` (chuẩn hóa −1..1) | Map từ `src`, `start/dur`, `speed`, `transform` |
| Transition | Tham chiếu material transition: "Kết hợp" id `6724845717472416269`, "Mờ đen" `6724239388189921806`, "Chồng lên nhau" `6917578154089386498`, dài 0.467s | **Tài nguyên online** → máy editor phải tải được; nằm trong whitelist (07) |
| Chỉnh màu | "adjust" (brightness/contrast/temperature/color_match) trên 8 segment | Map `color` sang adjust cơ bản; LUT tùy chỉnh không đảm bảo |
| Text | Font hệ thống CapCut, chữ đen trên nền trắng 50%, lower-third y≈−0.42, không animation | Map `style_id` → text material; font phải có trên máy editor |
| Audio | VO volume 1.0; nhạc thư viện CapCut volume 0.32, fade-out 1.1s; **không ducking** | Xuất music stem đã duck sẵn **hoặc** volume cố định + keyframe; giữ VO/nhạc/SFX tách track |
| Đường dẫn media | `##_draftpath_placeholder_<UUID>_##/materials/video/<file>` hoặc đường dẫn tuyệt đối | Copy media vào `materials/` của draft, dùng placeholder; tên file ASCII (tránh lỗi NFC/NFD tiếng Việt trên macOS) |
| Compound clip | `subdraft/` (rỗng ở bản mẫu) | **Không dùng** compound trong MVP |

### 3.2 Ánh xạ IR → CapCut

| IR | CapCut draft |
|---|---|
| `canvas` | `canvas_config`, `fps` |
| track `V1/V2` | track `type=video` (V2 là track phụ, render level cao hơn) |
| clip.src / start,dur | `source_timerange` / `target_timerange` (µs) |
| clip.speed | material `speeds` + `segment.speed` |
| clip.transform | `segment.clip.scale`, `segment.clip.transform` |
| clip.transition_out | material `transitions` (id từ 07 `capcut.effect_id`), tham chiếu qua `extra_material_refs` |
| clip.color | material `effects` loại adjust (chỉ tham số cơ bản đã test) |
| T1/T2 | track `type=text` + material `texts` (content, font, size, color, bg, position) |
| A1/A2/A3/A4 | track `type=audio` + material `audios` (local file), `volume`, fade |
| logo | video track phụ (ảnh PNG) — không dùng sticker online |

### 3.3 Cách triển khai

- Ứng viên: viết adapter riêng theo cấu trúc trên, tham khảo thư viện cộng đồng (pyCapCut / pyJianYingDraft) — **không phải SDK chính thức**. Kiểm tra giấy phép thư viện và Điều khoản CapCut (hạn chế tự động hóa/reverse engineering) trước production.
- **Template-based**: lấy 1 draft rỗng do editor tạo trên đúng phiên bản target làm "khuôn" (giữ các trường version/platform), adapter chỉ chèn tracks/materials → giảm rủi ro thiếu trường.
- **Desktop Bridge** (app nhỏ chạy trên máy editor Windows): nhận package (zip có checksum) → giải nén vào thư mục draft của CapCut → map placeholder → báo "đã sẵn sàng mở". Không ghi đè draft đang mở; mỗi revision 1 thư mục mới `VCB_<SKU>_<job>_r<rev>`.
- Tài khoản Pro cho phép dùng thêm transition/effect Pro, nhưng **chỉ những item đã vào whitelist 07** và có mapping FFmpeg tương đương.
- Không dùng: effect Pro/online chưa whitelist, compound clip, keyframe phức tạp, template CapCut.

### 3.4 PoC bắt buộc (Giai đoạn 0, 3–5 ngày)

Target: CapCut Desktop **Windows 9.3**, đăng nhập tài khoản Pro, máy sạch cài như máy editor. Sinh 10 project đại diện (A4_v1/v2/v3, A1_A3, có HuyK avatar, có logo, có chữ tiếng Việt + Nhật). Mỗi project: mở trên 2 máy sạch → sửa 1 chữ, thay 1 clip, chỉnh volume 1 track → lưu → export.

| Tiêu chí | Đạt khi |
|---|---|
| Mở được | 10/10, không missing media |
| Track tách | Video, VO, nhạc, SFX, chữ ở track riêng, sửa được |
| Timing | Lệch ≤ 1 frame so với IR; export khớp preview.mp4 (so frame tại mốc cut) |
| Chữ | Không lỗi dấu tiếng Việt, đúng vị trí safe area |
| Transition/adjust | Mọi item whitelist hiển thị đúng |

**Không đạt PoC → phương án dự phòng**: package "lắp tay có cấu trúc" (media đã cắt đánh số theo thứ tự + stems audio + SRT + timeline CSV/EDL) để editor kéo vào CapCut trong vài phút. Khi đó KPI và phạm vi phải được khách hàng chấp thuận lại.

## 4. Package bàn giao

```
VCB_N0017_J-20261009-0001_r02/
  final.mp4                 # PASS → dùng ngay
  preview.mp4
  subtitles.srt
  timeline.ir.json
  manifest.json             # asset sha256, nguồn, giấy phép, fx_id, model/voice version
  qc-report.json
  capcut/                   # chỉ có khi Export CapCut
    draft_info.json, draft_meta_info.json, materials/{video,audio,image}/
  README-import.txt         # cách mở trên máy editor
```
