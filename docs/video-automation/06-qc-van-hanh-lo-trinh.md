# 06 — QC, vận hành, API & lộ trình triển khai

## 1. Vai trò con người & đội ~100 người

### 1.1 Vai trò trong hệ thống (phân quyền RBAC)

| Vai trò | Hệ thống | Việc làm | Thời gian kỳ vọng |
|---|---|---|---|
| `hub_uploader` | Media Hub | Nạp footage qua Upload Portal | 20 giây/lô file |
| `hub_tag_reviewer` | Media Hub | Duyệt ngoại lệ ở hàng nhãn (03 §4) | ≥ 200 shot/giờ |
| `planner` | Agent | Chọn SKU, góc kể, nhập brief theo lô, quản lý kho viral | 1–2 phút/lô |
| `script_reviewer_<lang>` | Agent | Duyệt G1 kịch bản và bản dịch VN/TH/JP/EN, theo kịch bản chứ không theo video | Theo lô |
| `reviewer_g2` | Agent | Xem video → PASS / sửa nhanh / Export CapCut / LOẠI | 1–3 phút/video PASS |
| `capcut_editor` | Agent | Sửa sâu video được Export CapCut; làm video "hero" thủ công | 5–15 phút/video |
| `product_owner` | Agent | Duyệt Product Master (02 §6), claim mới | 2–3 phút/SP |
| `lead` | Cả hai | Template, style preset, kho FX, alias công đoạn, chính sách duyệt theo độ tin cậy | Hằng tuần |
| `admin` | Cả hai | Model, ngân sách, tài khoản provider, phân quyền | Khi cần |

### 1.2 Phân bổ gợi ý cho đội ~100 người (10.000 video/tháng, 4 ngôn ngữ)

| Nhóm | Người | Ghi chú |
|---|---|---|
| Duyệt G2 video | 8 | Tính toán cần ~5 (3,5 phút/video); +3 dự phòng nghỉ phép, duyệt chéo hiệu chuẩn |
| Duyệt kịch bản & bản ngữ | 8 | 2 người/ngôn ngữ × VN/TH/JP/EN |
| Chiến lược nội dung & brief | 10 | Chọn SKU, góc kể, kế hoạch lô theo thị trường, kho viral |
| Sửa CapCut & video hero | 10 | ~10% video cần sửa sâu + video chiến dịch làm tay |
| Media Hub: quay bổ sung, nạp, duyệt nhãn | 25 | Theo phiếu thiếu cảnh; đây là nơi tạo ra "nguyên liệu" |
| Dữ liệu sản phẩm | 2 | Product Master |
| Phân phối & phân tích hiệu quả | 12 | Đăng theo kênh/thị trường, nhập số liệu sau đăng |
| Lead, QA, vận hành hệ thống | 5 | |
| Mở rộng (KOC khác, Đồ da, Đá quý) | 20 | Dùng cùng 2 hệ thống |

Đây là gợi ý; VCB tự quyết. Điểm chính: **8 người duyệt G2 đủ năng lực ~18.000 video/tháng** (8 × 132 giờ × 60 ÷ 3,5 phút). Khi đó trần sản lượng không còn là số người mà là **kho footage** và **số kênh phân phối**.

### 1.3 Chia việc cho nhiều người (`work-distribution`)

- Hàng đợi theo vai trò × ngôn ngữ × ngành hàng; tự giao việc theo kỹ năng và tải hiện tại; mỗi item bị **khóa** khi có người mở, hết hạn khóa sau 10 phút.
- SLA: video chờ duyệt > 24 giờ được đẩy lên đầu hàng; dashboard theo người, theo nhóm.
- **Hiệu chuẩn:** 5% video được 2 người duyệt độc lập; đo tỷ lệ đồng thuận theo người. Chèn "video lỗi cố ý" (gold) để đo độ tập trung. Người lệch chuẩn được lead xem lại.
- Mọi quyết định gắn người duyệt + revision + thời gian xem thực tế (chống bấm PASS mà không xem).

## 2. QC tự động (chặn bàn giao khi fail)

| Lớp | Kiểm tra | Chặn khi |
|---|---|---|
| Dữ liệu & quyền | Mọi segment/FX `approved`; license còn hạn và phủ market/channel | Có item không hợp lệ |
| Sản phẩm | Slot `product_set_required` chỉ chứa footage từ bộ của đúng sản phẩm; fact_id khớp phiên bản facts | Lẫn footage sản phẩm khác, claim không nguồn |
| Timeline | Không gap V1, không overlap sai; src trong giới hạn; tổng thời lượng khớp ±1 frame; thứ tự công đoạn không đảo | Bất kỳ lỗi nào |
| Hình | `blackdetect` ngoài transition; `freezedetect`; độ phân giải/fps/pix_fmt xuất | Khung đen/đứng hình ngoài ý đồ |
| Âm thanh | −14 ±1 LUFS, TP ≤ −1 dBTP; VO không bị nhạc đè (đo chênh lệch dB ở vùng VO ≥ 10 dB); không clipping | Vượt ngưỡng |
| Phụ đề | ASR của final so với script (WER ≤ 5%; tên riêng/số = 100% đúng); nằm trong safe area; ≤ 2 dòng | Sai tên/số/giá |
| AI | Tỷ lệ AI ≤ ngưỡng; không 2 shot AI liền nhau; `ai_disclosure_required` được ghi vào manifest | Vượt policy |
| Trùng lặp | Fingerprint so với lịch sử kênh (04 §6) | Gần trùng vượt ngưỡng |
| CapCut (khi export) | Project mở được trên profile; số track, số clip, thời lượng khớp IR | Không mở được / lệch |

QC ngữ nghĩa (cảnh báo, không chặn): model `hard_cases` xem storyboard + transcript, gắn cờ "hình không khớp lời", "nhịp chán", "hook yếu" để editor chú ý.

## 3. API nội bộ (FastAPI)

| Endpoint | Chức năng |
|---|---|
| `POST /v1/assets/scan` | Kích hoạt quét NAS (folder, SKU) — thường do scheduler gọi |
| `GET /v1/assets/search?q=&sku=&role=&step=` | Tìm segment (lọc cứng + vector) cho UI kho |
| `GET /v1/coverage/{sku}?template=A4_v2` | Ma trận coverage + phần thiếu + gợi ý sinh AI |
| `POST /v1/review-tasks/{id}/decision` | Duyệt tag / G1 / G2 / asset AI |
| `POST /v1/jobs` (header `Idempotency-Key`) | Tạo job từ brief; hỗ trợ batch |
| `GET /v1/jobs/{id}` | Trạng thái, chi phí, revision, cảnh báo |
| `POST /v1/jobs/{id}/revisions` | Change set (thay shot, đổi nhạc, sửa câu…), kèm `base_revision` chống ghi đè |
| `POST /v1/jobs/{id}/approve` | PASS revision cụ thể (gắn hash bản đã xem) |
| `POST /v1/jobs/{id}/export-capcut` | Sinh project CapCut cho revision hiện hành |
| `GET /v1/jobs/{id}/artifacts` | Link tải có hạn: final.mp4, srt, manifest, capcut zip |
| `POST /v1/viral-items` | Thêm item viral (URL/file + số liệu) → Viral Analyzer |
| `POST /v1/fx-items` | Thêm nhạc/SFX/effect + license |
| `POST /v1/gen-requests` | Sinh asset AI thủ công/chủ động (08) |
| `POST /v1/metrics/import` | Nhập số liệu sau đăng theo `job_id ↔ platform_video_id` |

Webhook ra (tùy chọn): `job.ready_for_review`, `job.passed`, `job.missing_asset`, `gen.ready_for_review` → Lark/Zalo/Slack nội bộ.

## 4. Web admin — 5 màn hình

1. **Job board**: tạo brief/lô, xem trạng thái, chi phí, ước tính năng lực kho trước khi chạy.
2. **Kho footage**: tìm theo mô tả/SKU/công đoạn, xem segment, quyền, lượt dùng; ma trận coverage; phiếu bổ sung kho.
3. **Hàng duyệt**: tab Tag · G1 · G2 · Asset AI — phím tắt, duyệt hàng loạt.
4. **Bàn duyệt video (G2)**: player + storyboard theo slot + nút PASS / thay shot / đổi nhạc / sửa chữ / Export CapCut / LOẠI; ô lệnh tự nhiên.
5. **Kho FX & cấu hình**: nhạc/SFX/transition/effect/text style, template, style preset, viral approved.

## 5. Vận hành & chi phí

- **Cost ledger** cho mọi lần gọi AI/render: job_id, role, provider, model, đơn vị (token/giây audio/giây video), chi phí. Báo cáo chi phí / video PASS (gồm cả job bị loại và retry).
- **Ngân sách**: trần theo job, theo ngày, theo provider; reserve trước bước có phí; nút dừng lô.
- **Giám sát**: queue age, P50/P95 thời gian job, tỷ lệ PASS ngay, tỷ lệ phải mở CapCut, tỷ lệ MISSING_ASSET, tỷ lệ GEN, lỗi provider.
- **Bảo mật**: API key trong secret manager; NAS mount chỉ đọc cho worker; link tải có hạn; file nguồn coi là không tin cậy (decode trong sandbox, giới hạn kích thước); LLM không được tạo lệnh shell/URL; nội dung viral bên ngoài là dữ liệu, không phải chỉ dẫn.
- **Backup**: Postgres hằng ngày (RPO 24h), config/template trong git; proxy/mezzanine tái tạo được nên không cần backup.
- **Thu hồi**: asset/license bị thu hồi → chặn job mới, đánh dấu job chưa giao, xuất danh sách video đã dùng.

## 6. Lộ trình

| Giai đoạn | Thời lượng | Bàn giao | Điều kiện đi tiếp |
|---|---|---|---|
| **0. Khám phá + PoC** | 1 tuần | PoC CapCut export trên **Windows 9.3 Pro** (10 project), agent soạn nháp Product Master cho 10 SKU, benchmark giọng HuyK (blind test 30 câu) + thử avatar HeyGen 5 câu, parser tên file chạy trên toàn bộ danh sách file NAS (chỉ đọc tên), chốt câu hỏi §8 | Biết rõ CapCut export đạt/không; giọng HuyK được duyệt |
| **1. Media Hub MVP** (nhóm riêng, chạy song song) | Tuần 2–3 | Upload Portal, trạm 0–8, review queue, Catalog/Media API, coverage; index: Outro, Intro, Daily HuyK, Stock + 10 SKU ưu tiên | Gold set đạt ngưỡng (03 §9) |
| **2. Production MVP** | Tuần 4–5 | Template A4_v1 + A1_A3, script writer, TTS, selector, planner, FFmpeg compiler, kho FX khởi đầu (07), QC kỹ thuật | Lô 20 video A4 đầu-cuối, ≥ 50% PASS ngay |
| **3. Human loop + CapCut** | Tuần 6–7 | Bàn duyệt G2, sửa nhanh, Export CapCut + Desktop Bridge, A4_v2/v3, viral analyzer | Editor dùng hằng ngày; project CapCut mở 100% |
| **4. AI Asset Studio** | Tuần 7–8 | SFX/nhạc AI vào kho FX → image-to-video sản phẩm → b-roll Veo/Seedance → HeyGen translate/avatar (bật dần theo policy, duyệt từng asset). VO AI đã có từ GĐ2 | Asset AI qua QC trung thực |
| **5. Pilot** | Tuần 9–10 | 100 job (20 A1 + 20 A2 + 20 A3 + 40 A4) + 20 ca lỗi cố ý; báo cáo phút công, chi phí, tỷ lệ PASS | Đạt KPI (01 §1) → tăng sản lượng |
| **6. Mở rộng** | Sau pilot | Thị trường JP/TH, KOC khác (Nhạn Nhạn, NamBling…), Đồ da/Đá quý, analytics sau đăng → tối ưu preset | Theo dữ liệu |

### Phân công gợi ý (đội tối thiểu)

| Người | Phụ trách |
|---|---|
| Tech lead / backend | DB, API, job state machine, model gateway, cost ledger, review queue backend |
| Media engineer | Probe/proxy/normalize, shot analyzer, Timeline IR, FFmpeg compiler, CapCut adapter, kho FX mapping |
| AI engineer | Vision tagger, reconciler, viral analyzer, script writer, AI Asset Studio, gold set & eval |
| Frontend | 5 màn hình admin |
| QA (bán thời gian) | Golden tests, ca âm tính, PoC CapCut |
| Phía VCB | Editor lead, người duyệt sản phẩm/quyền, HuyK (giọng/avatar/phát ngôn) |

**Tối ưu chi phí khi phát triển:** việc khối lượng lớn nhưng đơn giản (index tên file NAS, ffprobe hàng loạt, sinh fixture, chạy gold set, viết test) giao cho agent model rẻ chạy song song (Haiku/Sonnet); model mạnh chỉ dùng cho thiết kế, review code và ca khó.

## 7. Bộ test

- `tests/fixtures/`: 38 video trong `Tài Nguyên VCB Real Sample` (đủ trường hợp: HLG xoay 270°, 4K, 60fps, không audio, tên sai chuẩn, footage sưu tầm).
- `tests/golden/`: 10 IR chuẩn → MP4 chuẩn (so frame tại mốc cut, LUFS) + 10 project CapCut chuẩn.
- Ca âm tính bắt buộc bị chặn: sai SKU, asset `rights=unknown`, claim không fact_id, giá xuất hiện khi `cho_phep_noi_gia = FALSE`, câu chuyện khách hàng gán sang SKU khác, 2 shot AI liền nhau, VO vượt slot.
- Regression mỗi khi đổi model/prompt/template/preset/phiên bản CapCut.

## 8. Quyết định với VCB

Toàn bộ quyết định đã chốt (09–10/10/2026) và tác động thiết kế: [README §2](./README.md).

### Còn mở (không chặn việc bắt đầu)
1. Thị trường ưu tiên và tỷ lệ sản lượng theo thị trường (mặc định thiết kế: VN, TH, JP, EN).
2. Có chạy quảng cáo trả phí (paid ads) bằng các video này không? (ảnh hưởng điều kiện license nhạc/footage sưu tầm cho quảng cáo)
3. Danh sách kênh phân phối theo thị trường (để đặt cooldown chống lặp theo kênh).
