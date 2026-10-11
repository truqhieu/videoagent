# 07 — Kho tài nguyên phụ trợ: nhạc nền, SFX, transition, effect, chữ, logo

## 1. Vì sao cần kho riêng?

Project CapCut thật của VCB dùng **nhạc và transition online của CapCut** ("Beautiful Acoustic Guitar", "Kết hợp", "Mờ đen"). Agent không thể dùng như vậy, vì 3 lý do:
1. Agent render MP4 bằng FFmpeg, nên không truy cập được tài nguyên online của CapCut.
2. Giấy phép nhạc thư viện CapCut gắn với việc dùng trong CapCut. Không mặc định được phép trích ra MP4 hay dùng cho quảng cáo.
3. Bản MP4 và bản CapCut export phải **giống nhau**, nên mỗi tài nguyên cần **ánh xạ kép** FFmpeg ↔ CapCut.

→ Mỗi tài nguyên là một **FX item** có ID, nhãn, giấy phép và cách render trên cả hai đường. Item nào thiếu một trong hai mapping thì không được vào whitelist.

## 2. Bản đồ kho

**Phân vai với Media Hub:** file media (nhạc, SFX, logo, LUT, font) được lưu và index ở **Media Hub** (thư mục `THƯ VIỆN FX` trên NAS). Video Agent giữ phần **cấu hình**: transition, effect, text style, style preset, ánh xạ CapCut, và tham chiếu file qua `asset_id` của Hub.

| Nhóm | Dạng lưu | Số lượng khởi đầu (đề xuất) | Ai bổ sung |
|---|---|---|---|
| **Nhạc nền (BGM)** | File WAV/MP3 trên NAS (qua Hub) | Toàn bộ kho nhạc bản quyền riêng của VCB; tối thiểu 60–100 bài phủ 8 mood | Editor lead nạp từ kho bản quyền VCB |
| **SFX** | File WAV trên NAS | 120–200 file (theo công đoạn chế tác + chuyển cảnh + UI) | Editor lead + thu âm thật tại xưởng |
| **Transition** | Định nghĩa YAML (không có file) | 5–8 loại | Media engineer (đã qua PoC) |
| **Effect / màu** | YAML + file LUT `.cube` | 3–5 preset màu, 2–3 hiệu ứng chuyển động | Media engineer + editor lead |
| **Text style** | YAML + font có giấy phép | 4–6 style | Designer |
| **Logo / sticker** | PNG nền trong | 3–5 biến thể | Designer |
| **Outro** | Video trong kho footage (`SOURCE OUTRO`, 102 file) | Pool đã duyệt | Đã có |

### Cây thư mục NAS đề xuất (thêm nhánh mới, không đụng nhánh cũ)

```
MEDIA VCB folder/
└── THƯ VIỆN FX/
    ├── 01_NHAC_NEN/
    │   ├── cam-dong/      FX_BGM_cam-dong_piano-am-ap_72bpm_001.wav
    │   ├── am-ap/
    │   ├── tu-hao/
    │   ├── to-mo/
    │   ├── nang-dong/
    │   ├── sang-trong/
    │   ├── hai-huoc/
    │   └── chua-lanh/
    ├── 02_SFX/
    │   ├── che-tac/       FX_SFX_che-tac_bua-go-kim-loai_003.wav
    │   ├── lua-nhiet/
    │   ├── da-quy/
    │   ├── chuyen-canh/
    │   ├── reveal/
    │   └── ui-chu/
    ├── 03_LOGO_STICKER/   FX_LOGO_huyk-goc-phai_v2.png
    ├── 04_LUT/            FX_LUT_trang-suc-am_v1.cube
    ├── 05_FONT/           (chỉ font license cho phép phân phối, vd OFL)
    └── 06_GIAY_PHEP/      chứng từ license (PDF/ảnh), tên = fx_id
```

Quy chuẩn tên: `FX_<LOAI>_<nhom>_<mo-ta-khong-dau>[_<bpm>bpm]_<STT>`. Đây cũng là một parser (giống 02 §2).

## 3. Schema FX item

```sql
CREATE TABLE fx_items (
  id            text PRIMARY KEY,          -- bgm_touching_014, sfx_hammer_metal_03, tr_combine ...
  type          text NOT NULL,             -- bgm | sfx | transition | color | motion | text_style | logo
  name          text, file_uri text, sha256 text,
  duration_ms   int,
  tags          jsonb,                     -- xem §4–§8 theo từng type
  ffmpeg        jsonb,                     -- cách render bằng FFmpeg
  capcut        jsonb,                     -- cách biểu diễn trong draft CapCut
  license       jsonb NOT NULL,            -- {source, type, proof_uri, commercial, ads, platforms[], markets[], expires_at, redistributable}
  verified_profiles text[],                -- target CapCut profile đã test (vd 'capcut-win-9.3-pro'; MVP chỉ Windows)
  status        text DEFAULT 'draft',      -- draft | approved | retired | blocked
  usage_count   int DEFAULT 0, last_used_at timestamptz
);
```

**Rule gate:** chỉ `status=approved` AND license còn hạn AND phủ đúng `market` + `channel` của job (+ `ads=true` nếu job chạy quảng cáo) AND có `ffmpeg` mapping. Riêng nút Export CapCut còn cần thêm `capcut` mapping + `verified_profiles` chứa profile của máy editor.

## 4. Nhạc nền (BGM)

### Nhãn

```json
{
  "mood": ["cam-dong", "am-ap"],          // enum 8 mood ở §2
  "energy": 2,                            // 1 nhẹ … 5 mạnh
  "bpm": 72, "key": "C major",
  "instruments": ["piano", "strings"],
  "has_vocals": false,                    // mặc định chỉ dùng nhạc không lời dưới VO
  "loopable": true,
  "sections": [{"t_ms": 0, "label": "intro"}, {"t_ms": 14200, "label": "build"}, {"t_ms": 31000, "label": "peak"}, {"t_ms": 52000, "label": "ending"}],
  "ending_ms": 52000,                     // điểm bắt đầu đoạn kết tự nhiên
  "loudness_lufs": -16.2,
  "markets_style": ["VN", "JP", "TH"]
}
```

Code tự đo `bpm`, `loudness`, `duration`, `sections` (librosa: onset/beat tracking, novelty curve). Con người hoặc model audio chỉ gán `mood`, `energy`, `instruments`.

### Nguồn nhạc: kho nhạc bản quyền riêng của VCB
VCB **đã có kho nhạc bản quyền riêng**. Nạp hàng loạt vào `THƯ VIỆN FX/01_NHAC_NEN/` qua Media Hub (`POST /v1/assets/ingest`). Hub tự đo bpm, loudness, sections; AI gợi ý mood; editor lead xác nhận. Nhạc AI (ElevenLabs Music) chỉ dùng **bổ sung** khi kho thiếu một mood. **Không** dùng nhạc trending trên nền tảng hay nhạc thư viện CapCut cho đường MP4.

> **Trending sound:** hệ thống xuất thêm tùy chọn `final_no_music.mp4` (giữ VO + SFX), để người đăng tự gắn âm thanh trending ngay trong app TikTok/Reels, đúng quyền của nền tảng.

### Thuật toán chọn nhạc
1. Lọc cứng: license hợp lệ, `has_vocals=false` (trừ template cho phép), `duration ≥ video` hoặc `loopable`.
2. Chấm điểm: `mood` khớp `script.music_mood` (0.4) + `energy` khớp template (0.2) + freshness theo kênh (0.2) + `bpm` trong khoảng của style preset (0.2).
3. Chọn điểm bắt đầu sao cho `ending` của bài rơi vào outro (căn đuôi). Nếu không được thì fade-out 33 frame (≈1.1s, giống project thật).
4. Cooldown: một bài không lặp lại trên cùng kênh trong 7 ngày (cấu hình được).

### Mix (preset `huyk_default`)

| Thông số | Giá trị khởi đầu | Ghi chú |
|---|---|---|
| Nhạc khi không có VO | −10 dB | ≈ volume 0.32 trong project thật |
| Nhạc khi có VO (ducking) | thêm −6 dB, attack 80ms, release 400ms | FFmpeg `sidechaincompress`; CapCut: xuất stem đã duck |
| VO | 0 dB, lọc high-pass 80Hz | |
| Tổng | −14 LUFS, true peak ≤ −1 dBTP | Chuẩn social; đo sau encode |

## 5. SFX

### Nhóm & ánh xạ với công đoạn chế tác

| Nhóm SFX | Gắn với `craft_step` / sự kiện | Ví dụ fx_id |
|---|---|---|
| lửa-nhiệt | `nung_nau`, `han` | `sfx_torch_whoosh_01`, `sfx_fire_crackle_02` |
| chế tác | `dap_can` (búa), `cua_cat` (cưa), `dua_mai` (giũa), `khoan` (khoan mini), `danh_bong` (máy đánh bóng) | `sfx_hammer_metal_03`, `sfx_file_rasp_01`, `sfx_micro_drill_02` |
| đá quý | `gan_da_chu`, `dinh_da` (tiếng nhíp, click chấu) | `sfx_tweezer_click_01` |
| reveal | `product_final`, khoảnh khắc lấp lánh | `sfx_shimmer_soft_01`, `sfx_chime_01` |
| chuyển cảnh | transition, đổi chương | `sfx_whoosh_soft_02`, `sfx_riser_short_01`, `sfx_impact_light_01` |
| ui-chữ | chữ hook / fact badge xuất hiện | `sfx_pop_01`, `sfx_tick_01` |

Nhãn SFX: `{group, craft_steps[], sync_point_ms (điểm đỉnh cần khớp hình), duration_ms, intensity 1–3, peak_dbfs}`.

**Ưu tiên tiếng thật:** footage xưởng đã có tiếng búa, tiếng khò thật. Nên thu một bộ SFX ngay tại xưởng VCB (thợ gõ, khò, giũa, khoan) vì vừa chân thực vừa sở hữu 100% quyền. Tùy chọn style: giữ âm hiện trường của clip `craft` ở −18 dB trên track `A4` thay vì SFX.

### Quy tắc đặt SFX (code)
- Mật độ tối đa 1 SFX mỗi 3 giây. Không đặt SFX trùng câu VO quan trọng (kiểm alignment).
- SFX hành động chỉ đặt khi shot có `craft_step` khớp và `motion_level ≥ 2`, căn `sync_point` vào frame có chuyển động đỉnh (từ shot analyzer).
- `whoosh` chỉ đặt ở transition đổi chương (vd chế tác → sản phẩm hoàn thiện), không đặt ở mọi cut.
- Reveal: đúng 1 `shimmer` tại đầu slot `product_final`. **Không** thêm hiệu ứng lấp lánh hình ảnh làm sai đặc tính đá.

## 6. Transition (whitelist ánh xạ kép)

| fx_id | Dùng khi | FFmpeg | CapCut (tên / effect_id) | Frames mặc định | Trạng thái |
|---|---|---|---|---|---|
| `tr_cut` | Mặc định giữa shot cùng slot nhịp nhanh | concat (không xfade) | không transition | 0 | ✔ |
| `tr_combine` | Giữa phần lớn các cut (project thật dùng 25/29 lần) | `xfade=transition=dissolve` | "Kết hợp" / `6724845717472416269` | 14 | ✔ id từ mẫu, cần test render |
| `tr_fadeblack` | Đổi chương (hook → thân, thân → reveal) | `xfade=transition=fadeblack` | "Mờ đen" / `6724239388189921806` | 14 | ✔ id từ mẫu |
| `tr_overlay` | Mở đầu từ hook | `xfade=transition=fade` | "Chồng lên nhau" / `6917578154089386498` | 14 | ✔ id từ mẫu |
| `tr_zoom_in` | Nhấn vào chi tiết | `xfade=transition=zoomin` | lấy id ở PoC | 10 | ⏳ PoC |
| `tr_flash_white` | Reveal sản phẩm | `xfade=transition=fadewhite` | lấy id ở PoC | 8 | ⏳ PoC |
| `tr_slide_up` | Chuyển ý trong A1–A3 | `xfade=transition=slideup` | lấy id ở PoC | 12 | ⏳ PoC |

- FFmpeg và CapCut sẽ không giống nhau từng pixel. Tiêu chí parity là **cùng loại, cùng thời lượng, cùng vị trí**.
- Transition CapCut là tài nguyên online, nên máy editor phải có mạng và đăng nhập tài khoản Pro khi mở project lần đầu. Ghi rõ điều này trong `README-import.txt`.
- Style preset quy định tỷ lệ: vd `huyk_default` = 70% `tr_cut`/`tr_combine` trong slot, `tr_fadeblack` khi đổi chương, tối đa 1 transition "màu mè" mỗi video.

## 7. Effect

### 7.1 Màu (color preset)

| fx_id | Mục đích | FFmpeg | CapCut |
|---|---|---|---|
| `color_none` | Mặc định | — | — |
| `color_jewelry_warm` | Vàng/đá ấm, tăng tương phản nhẹ | `lut3d=FX_LUT_trang-suc-am_v1.cube` | adjust: contrast +0.10, temperature +0.10, saturation +0.08 |
| `color_silver_cool` | Bạc/đá xanh | `lut3d=…cool_v1.cube` | adjust: contrast +0.10, temperature −0.10 |
| `color_match_neutral` | Ghép footage nhiều nguồn (điện thoại + máy quay) | `eq` + `colorbalance` từ thống kê frame | adjust cơ bản (project thật đã làm tay cho 8 segment) |

Chỉ dùng các tham số adjust **cơ bản** đã test (brightness, contrast, saturation, temperature). LUT tùy chỉnh không đảm bảo hiển thị giống trong CapCut, nên phía CapCut ánh xạ sang adjust gần đúng.

### 7.2 Chuyển động

| fx_id | Mô tả | FFmpeg | CapCut | Giai đoạn |
|---|---|---|---|---|
| `mo_punch_in` | Phóng tĩnh 1.0–1.3 theo tâm chủ thể | `scale`+`crop` | `clip.scale` + `clip.transform` | MVP (project thật dùng nhiều) |
| `mo_speed` | Tăng tốc shot chế tác 1.2–2.0× | `setpts` | `speed` | MVP |
| `mo_slow_zoom` | Zoom chậm (Ken Burns) cho sản phẩm | `zoompan` | keyframe scale | Sau PoC keyframe |

Không dùng: hiệu ứng VFX online/Pro của CapCut, filter làm đổi màu đá/kim loại, sparkle giả.

## 8. Text style & logo

| style_id | Dùng cho | Thông số (FFmpeg ASS ↔ CapCut text) |
|---|---|---|
| `sub_huyk_default` | Phụ đề VO | Theo project thật: chữ đen trên nền trắng 50%, lower-third (y = −0.42), không animation; font Be Vietnam Pro SemiBold 46px; tối đa 2 dòng × 22 ký tự |
| `title_hook` | Câu hook 0–3s | Chữ trắng viền đen, phía trên, 64px Bold |
| `fact_badge` | Thông số đã có fact_id (vd "Bạc S925") | Nhãn nhỏ góc dưới trái |
| `cta_end` | CTA cuối | Giữa màn hình, trên outro |
| `sub_jp` / `sub_th` | Thị trường JP/TH | Noto Sans JP / Noto Sans Thai, cùng layout |

- Font bắt buộc có license cho phép nhúng/phân phối (OFL như Be Vietnam Pro, Noto). Font phải được cài trên máy editor (Desktop Bridge kiểm tra trước khi mở).
- Safe area 9:16: tránh 220px dưới cùng và 140px trên cùng (vùng UI của TikTok/Reels).
- Logo `logo_huyk_corner`: PNG, góc trên phải, opacity 0.85, đặt trên slot `craft` theo rule template ("Source gốc + tag logo HuyK"). Không đặt logo đè lên logo gốc đã có trong outro.

## 9. Quy trình bổ sung FX item

```
Editor lead upload file + điền license (bắt buộc proof)
   → code đo: duration, loudness, bpm, sections, sha256, peak
   → AI gợi ý mood/group (tùy chọn) → người xác nhận
   → [transition/effect/text] media engineer thêm mapping + chạy golden test FFmpeg & CapCut
   → status = approved → vào whitelist
License sắp hết hạn (30 ngày) → cảnh báo; hết hạn → blocked, job mới không dùng, liệt kê video đã dùng.
```

## 10. Style preset — gói mọi lựa chọn FX thành 1 cấu hình

```yaml
# config/style_presets/huyk_default.yaml  (giá trị rút từ project CapCut thật)
id: huyk_default
version: 1.2
shot_len_s: {craft: [1.0, 2.5], product: [1.5, 3.0], huyk: [2.0, 4.0]}
speed: {craft: [1.0, 2.0], default: 1.0}
punch_in_scale: [1.0, 1.3]
transitions: {within_slot: tr_cut, between_slots: tr_combine, chapter_change: tr_fadeblack, first: tr_overlay, frames: 14}
color: color_jewelry_warm
music: {base_db: -10, duck_db: -6, fade_out_frames: 33}
sfx: {max_per_sec: 0.33, keep_source_ambience_db: null}
subtitle_style: sub_huyk_default
logo: {fx_id: logo_huyk_corner, on_roles: [craft]}
outro_pool: outro_huyk
```

Có thể tạo thêm preset (vd `huyk_fast_cut`, `huyk_jp_healing`). A/B test preset theo kênh bằng số liệu sau đăng từ kho viral.
