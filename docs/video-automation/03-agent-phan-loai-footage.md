# 03 — VCB Media Hub: hệ thống riêng nạp footage vào NAS & index dữ liệu

> **Hệ thống độc lập** (chốt 10/10/2026). Hub đặt cạnh NAS, sở hữu toàn bộ việc nạp, lưu, index và phát hành footage. Hệ thống sản xuất video (VCB Video Agent) chỉ dùng Hub qua **Catalog API / Media API / sự kiện** (§8), không đụng NAS và không gánh hạ tầng index.

## 1. Mục tiêu

- **Nạp đúng ngay từ đầu:** footage mới vào NAS qua Upload Portal, tên file theo quy chuẩn và nằm đúng thư mục sản phẩm, không còn cảnh `IMG_9380.MOV` hay `0930(1).mp4`.
- **Index tự động:** mỗi file mới có metadata, segment, nhãn, điểm chất lượng và embedding, sẵn sàng phát hành cho bên sản xuất trong ≤ 24h (mục tiêu ≤ 2h với file nạp qua portal).
- Con người chỉ duyệt **ngoại lệ** (file sai quy chuẩn, nhãn mâu thuẫn), không gõ tag tay từng clip.
- Chi phí AI tối thiểu: **code làm trước, model rẻ làm số đông, model mạnh chỉ xử lý ca khó**.
- Phục vụ được nhiều bên tiêu thụ: Video Agent hôm nay; Đồ da, Đá quý, đội thiết kế sau này.

## 2. Upload Portal: nạp footage mới vào NAS

Luồng cho đội quay / thợ / editor:

```
Chọn file (kéo-thả từ thẻ nhớ, điện thoại, máy tính; upload resumable)
  → Form 20 giây: loại (CT/CTX/ST/KB/Daily/IT/OT/Live/Sưu tầm) · KOC · sản phẩm (chọn từ danh sách SKU) · công đoạn (chọn từ 13 bước) · mã NV
      (ngày quay lấy từ metadata file; STT tự tăng theo thư mục)
  → Portal sinh tên chuẩn: 260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_7.mp4
  → Kiểm tra: trùng sha256? quá dài (> 15s theo quy định V8 → cảnh báo, tùy chọn tự cắt theo shot)? xoay/HDR?
  → Ghi vào đúng thư mục: THƯƠNG HIỆU/1. KIM HOÀN/2. DỰ ÁN HUYK CHẾ TÁC SP/1. NHẪN/[N0017_Nhan-mat-than-Horus-da-xanh]/
  → Đẩy ngay vào hàng index (ưu tiên cao)
```

- **Bulk mode:** chọn cả thư mục thẻ nhớ → áp cùng loại/SKU/mã NV; công đoạn được AI gợi ý từ contact sheet, người sửa nhanh trên bảng.
- **Footage sưu tầm:** loại `Sưu tầm` + ô nguồn (link/nền tảng) → `rights_status = collected`.
- **Asset AI** từ AI Asset Studio và **kho nhạc bản quyền** của VCB cũng nạp qua cổng này (API), với `origin` tương ứng.
- Ghi NAS bằng tài khoản dịch vụ riêng của Hub (SMB hoặc Synology File Station API, do đội Hub chọn). Chỉ Hub có quyền ghi vào cây thư mục footage.
- File đặt tay vào NAS ngoài portal vẫn được **quét đối soát hằng đêm** (trạm 0). Nếu sai quy chuẩn, file vào hàng "đặt tên lại": portal đề xuất tên mới, người bấm duyệt, Hub đổi tên trên NAS và giữ lịch sử đường dẫn.

## 3. Luồng index (8 trạm)

```mermaid
flowchart LR
  S0[0 Upload Portal / Quét đối soát] --> S1[1 Intake]
  S1 --> S2[2 Probe & Proxy]
  S2 --> S3[3 Filename Parser]
  S3 --> S4[4 Shot Analyzer]
  S4 --> S5[5 ASR]
  S5 --> S6[6 Vision Tagger]
  S6 --> S7[7 Reconciler]
  S7 --> S8{8 Rules Gate}
  S8 -->|auto_approved| REG[(Registry)]
  S8 -->|needs_review| RQ[Review Queue] --> REG
```

| # | Trạm | Công cụ | AI? | Đầu ra |
|---|---|---|---|---|
| 0 | **Nguồn vào** | Upload Portal (chính, tức thì) + quét đối soát NAS hằng đêm (file đặt tay, đổi tên, xóa) | Không | Danh sách file mới/đổi/xóa |
| 1 | **Intake** | sha256 (đọc stream), pHash từ 3 frame | Không | `assets` row; trùng sha256 → chỉ thêm path; gần trùng pHash → cờ `near_duplicate` |
| 2 | **Probe & Proxy** | ffprobe; FFmpeg | Không | Thông số kỹ thuật; proxy 540×960 H.264 SDR 30fps; thumbnail; contact sheet 3×4 |
| 3 | **Filename Parser** | regex + từ điển (02 §2) | Không | `parsed`, `sku`, `source_type`, `craft_step`, `role_hint`, `parse_confidence` |
| 4 | **Shot Analyzer** | PySceneDetect (ContentDetector), OpenCV | Không | Danh sách segment + `quality` + `best_in/out` |
| 5 | **ASR** | Scribe v2 / faster-whisper — **chỉ khi** có giọng người (VAD) | Model ASR | `transcript`, `words` |
| 6 | **Vision Tagger** | Model rẻ (Gemini Flash video / Claude Haiku 5.5 trên contact sheet) | Có | Nhãn theo taxonomy (02 §3) + `description_vi` |
| 7 | **Reconciler** | Claude Sonnet 5.5 — **chỉ khi** mâu thuẫn hoặc conf < ngưỡng | Có (ít) | Nhãn chốt + lý do |
| 8 | **Rules Gate** | Code | Không | `approved` hoặc `needs_review` + lý do |

### Chi tiết từng trạm

**Trạm 2 — chuẩn hóa (bắt buộc theo dữ liệu thật):**
- Xoay: áp `rotation` tag (4 file iPhone xoay 270°) khi tạo proxy.
- HDR: `color_transfer = arib-std-b67` (HLG) hoặc `smpte2084` (PQ) → tone-map khi tạo proxy:
  `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`
- FPS: proxy về 30fps; giữ `fps_num/den` gốc để tính source in/out chính xác trên file gốc.
- Không chuyển đổi bản gốc. Bản "mezzanine" chất lượng cao chỉ tạo **khi segment được chọn vào video** (lazy).

**Trạm 4 — shot & chất lượng (trên proxy):**
- Cắt shot: `ContentDetector(threshold=27, min_scene_len=0.5s)`. File ≤ 15s thường chỉ 1–3 shot.
- Mỗi shot, lấy mẫu 4 fps:
  - `blur` = phương sai Laplacian (thấp = mờ) · `exposure` = % pixel cháy (>250) / bệt (<10)
  - `motion` = trung bình độ lớn optical flow (Farneback) · `shake` = phương sai vector chuyển động toàn cục
  - `black_frames` (ffmpeg `blackdetect`), `freeze` (`freezedetect`)
- `best_in/out`: cửa sổ 1.5–4s có `motion` trong ngưỡng "đang thao tác" và `blur` tốt nhất.
- `quality.score` ∈ [0,1] = trọng số chuẩn hóa (cấu hình được). Shot < 0.3 → `rejected` tự động (vẫn lưu, không dùng).

**Trạm 5 — ASR có điều kiện:** chạy `silero-vad`; nếu speech > 30% thời lượng → ASR. Bỏ qua clip chỉ có tiếng máy/búa (tiết kiệm phần lớn chi phí ASR). Keyterms: "HuyK", "Viễn Chí Bảo", "Moissanite", "S925", tên SKU.

**Trạm 6 — Vision Tagger (prompt rút gọn):**

```text
SYSTEM: Bạn là chuyên viên phân loại footage xưởng kim hoàn. Chỉ trả JSON đúng schema.
Chỉ dùng giá trị trong enum. Không suy đoán SKU. Không nhận diện danh tính người
ngoài việc trả lời huyk_present dựa trên ảnh tham chiếu HuyK được cung cấp.

USER:
- Ảnh tham chiếu HuyK: <3 ảnh>
- Contact sheet 12 frame (timestamp ghi trên frame) của shot <id>, thời lượng 6.2s
- Gợi ý từ tên file (có thể sai): type=CT, action_slug="Gan-da-chu", folder="DỰ ÁN HUYK CHẾ TÁC SP/NHẪN"
- Taxonomy: roles=[...], craft_steps=[...], shot_size=[...], ...
Trả về: roles[{role,conf}], craft_step{value,conf}, shot_size, camera, subject[],
huyk_present, mouth_visible_speaking, product_visible, metal, stone_color[],
lighting, text_or_watermark, motion_level, aesthetic, best_moment_s, description_vi (≤ 30 từ)
```

- Output validate bằng JSON Schema (Pydantic). Sai schema → retry 1 lần → vẫn sai thì `needs_review`.
- Batch: 1 request / shot; song song 20–50 worker; rate-limit theo provider.
- Cache theo `sha256 + shot range + prompt_version + model` → không tag lại khi chỉ đổi tên/di chuyển file.

**Trạm 7 — Reconciler, chỉ gọi khi:**
- `craft_step` từ tên file ≠ từ vision với cả hai conf > 0.6.
- `role` conf cao nhất < 0.6.
- `text_or_watermark = third_party` (logo Douyin/TikTok) → đánh dấu khoảng thời gian có watermark trên segment (`third_party_mark_ranges`). Asset vẫn dùng được, nhưng bộ chọn cảnh chỉ lấy đoạn sạch.
- `huyk_present` mâu thuẫn với `koc = HK` + `type = ST`.

Reconciler nhận: kết quả 2 nguồn + contact sheet + transcript; trả `final_labels` + `reason` + `needs_human: bool`.

**Trạm 8 — Rules Gate:**

| Điều kiện | Kết quả |
|---|---|
| `parse_confidence ≥ 0.8` AND không mâu thuẫn AND `quality.score ≥ 0.5` AND rights xác định từ folder nội bộ | `approved` (label_source = filename+ai) |
| Folder `Sưu tầm` | `rights_status=collected`; duyệt như footage thường theo chất lượng; chỉ dùng cho `hook_visual`, `stock_action`, `content_illustration` |
| Không xác định được nguồn (ngoài các folder đã biết) | `needs_review` + `rights_status=unknown` (pipeline không dùng) |
| `huyk_talk` (HuyK nói tại hình) | `needs_review` lần đầu để xác minh transcript (`verified_text`) |
| Còn lại | `needs_review` với lý do cụ thể |

Quyền mặc định theo folder: `CT/CTX/ST/KB/DAILY/OT/IT` của VCB → `owned`; `Sưu tầm` → `collected` (VCB chốt cho phép khai thác, 09/10/2026); `Tự quay` → `owned` sau khi người xác nhận người quay.

## 4. Hàng duyệt cho người (Review Queue UI)

- Mỗi thẻ: video proxy tự phát, contact sheet, nhãn đề xuất (màu theo conf), **lý do cần duyệt**, nút `Đúng hết` / sửa từng trường / `Loại`.
- Bulk: chọn nhiều shot cùng SKU/công đoạn → duyệt 1 lần. Phím tắt (J/K chuyển, A duyệt, R loại).
- Ưu tiên: segment thuộc SKU đang có job chờ > SKU trong kế hoạch tháng > backfill.
- Mục tiêu năng suất: ≥ 200 shot/giờ/người với duyệt bulk.
- **Mỗi lần sửa nhãn được lưu làm ví dụ** (`tag_corrections`) → nạp vào prompt few-shot của Vision Tagger theo `craft_step` → độ chính xác tăng dần.

## 5. Báo cáo coverage & phiếu bổ sung kho

Sau mỗi lần ingest, cập nhật ma trận **SKU × role × craft_step** (số segment approved).

```
SKU N0017 (Nhẫn mắt thần Horus đá xanh)   template A4 cần:
  product_hero ........ 4  ✔        huyk_silent ......... 1  ⚠ cần ≥ 3
  craft: nung_nau ..... 0  ✘        craft: gan_da_chu ... 6  ✔
  craft: dua_mai ...... 5  ✔        product_final ....... 0  ✘ → PHIẾU BỔ SUNG
  outro (chung) ....... 102 ✔
```

Phiếu bổ sung kho gửi đội quay: "N0017 thiếu: 3 shot sản phẩm hoàn thiện cận (macro, xoay), 2 shot HuyK quan sát/thao tác không nói".

## 6. Chiến lược quy mô & chi phí

- **Không backfill mù 38k file.** Thứ tự xử lý:
  1. Folder dùng chung mọi video: `SOURCE OUTRO` (102), `INTRO` (102), `DAILY HUYK` (1.153), `STOCK HÀNH ĐỘNG` (1.903).
  2. SKU trong kế hoạch content tháng (từ editor lead) → toàn bộ CT/CTX của SKU đó.
  3. **Index lười**: tạo job cho SKU chưa index → tự đẩy SKU đó lên đầu hàng ingest; job chờ trạng thái `MISSING_ASSET` đến khi xong.
  4. Backfill nền phần còn lại với **trần ngân sách/ngày**.
- File mới hằng ngày (từ đội quay) luôn được xử lý ngay.
- Ước lượng (phải đo lại ở pilot): trạm 0–4 chạy CPU nội bộ; AI chỉ ở trạm 5–7. Với contact sheet 12 frame, chi phí vision/shot ở mức rất nhỏ; trạm 7 chỉ ~10–20% shot. Ghi `cost_ledger` từng lần gọi để tính chi phí/shot thực tế.

## 7. Hạ tầng & vận hành worker (cạnh NAS)

Hub chạy trên **máy chủ on-prem cạnh NAS** (LAN 10GbE, CPU nhiều nhân, GPU tùy chọn cho ASR tự host / shot analyzer). Hạ tầng sản xuất video co giãn riêng, không chia tài nguyên với Hub.

| Hàng đợi | Loại worker | Song song | Ghi chú |
|---|---|---|---|
| `ingest.io` | Upload, intake, probe, proxy | theo số core CPU | Đọc/ghi NAS qua LAN; giới hạn băng thông giờ làm việc |
| `media.mezz` | Cắt mezzanine theo yêu cầu của Agent | 4–8 | Ưu tiên cao hơn backfill; cache theo sha256 + range |
| `ingest.cv` | Shot analyzer | CPU (GPU tùy chọn) | |
| `ingest.asr` | ASR | 4–8 | Có điều kiện VAD |
| `ingest.ai_cheap` | Vision tagger | 20–50 | Rate-limit, circuit breaker theo provider |
| `ingest.ai_strong` | Reconciler | 2–5 | Chỉ ca khó |

- Mỗi trạm **idempotent**: key = `sha256 + station + version`. Chạy lại không tốn thêm phí.
- Đổi `prompt_version` / `taxonomy_version` → chỉ tag lại khi editor lead bật "re-tag", có ước tính chi phí trước.
- File bị xóa/di chuyển trên NAS: giữ `asset` theo sha256, cập nhật path; nếu mất hẳn → `status = missing`, các job phụ thuộc bị cảnh báo.

## 8. Giao tiếp với hệ thống sản xuất (Catalog API · Media API · sự kiện)

| Endpoint / sự kiện | Dùng để |
|---|---|
| `GET /v1/segments/search` (`q`, `sku`, `roles[]`, `craft_step`, `min_quality`, `rights[]`, `exclude_used_by_channel`, `limit`) | Lọc cứng + tìm theo vector; chỉ trả segment `approved` |
| `GET /v1/coverage/{sku}?template=A4_v2` | Ma trận đủ/thiếu cảnh của một sản phẩm theo template |
| `GET /v1/products/{sku}/footage-set` | Toàn bộ segment thuộc bộ footage của sản phẩm, xếp theo công đoạn |
| `GET /v1/taxonomy` | Roles, 13 công đoạn, enum nhãn (có phiên bản) để 2 hệ thống dùng chung |
| `POST /v1/media/{segment_id}/mezzanine` → URL có hạn | Cắt sẵn đoạn src in/out ở chất lượng cao (1080×1920, SDR, 30fps) để render; cache theo sha256 + range |
| `GET /v1/media/{asset_id}/proxy` | Proxy xem nhanh cho bàn duyệt |
| `POST /v1/assets/ingest` | Nạp asset (AI Studio, kho nhạc) qua API, cùng luồng với portal |
| `POST /v1/usage` | Agent báo clip đã dùng (job, kênh, thị trường) → Hub tính `usage_count`, cooldown |
| `POST /v1/gap-reports` | Agent báo slot thiếu cảnh → Hub gộp thành phiếu bổ sung kho |
| Webhook `asset.approved` / `asset.updated` / `asset.revoked` | Agent cập nhật cache, vô hiệu job phụ thuộc asset bị thu hồi |

Nguyên tắc: API có version (`/v1`), xác thực bằng token dịch vụ, webhook ký HMAC và chống trùng theo `event_id`. Hub không biết gì về job, template hay kịch bản; Agent không biết gì về đường dẫn NAS.

## 9. Đánh giá chất lượng agent

- **Gold set**: 300 shot do editor gán tay (phủ đủ 13 công đoạn, HuyK nói/không nói, sản phẩm, outro, file sai quy chuẩn, footage sưu tầm có watermark).
- Chỉ số mỗi trường: precision/recall `role`, accuracy `craft_step`, F1 `huyk_present`, recall `third_party watermark` (**phải ≈ 100%**).
- Ngưỡng go-live: `role` top-1 ≥ 90%, `craft_step` ≥ 85%, tỷ lệ cần người duyệt ≤ 25%.
- Chạy lại gold set mỗi khi đổi model/prompt/taxonomy (regression).
