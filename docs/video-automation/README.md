# VCB Video Agent — Hệ thống agent sản xuất video human-in-the-loop

> Agent tự chọn footage trong kho, cắt, ghép nhạc/SFX/chữ/transition thành **1 video hoàn chỉnh**. Nhân sự không dựng từng video nữa mà chỉ **duyệt**:
> - **PASS** → có ngay MP4 dùng được.
> - **CẦN SỬA** → bấm *Export CapCut* → mở project nhiều track trong CapCut và sửa trực tiếp.
>
> Phiên bản: v1.0, 09/10/2026. Nguồn: blueprint `VCB_HuyK_Thiet_ke_he_thong_content.html` + phân tích kho mẫu thật `Tài Nguyên VCB Real Sample/`.
> Bộ tài liệu này **thay thế** `docs/HE_THONG_TAO_VIDEO_HANG_LOAT_ARCHITECTURE.md`. Bản nháp cũ đó có auto-publish và không có cổng duyệt, nên không dùng nữa.

## 1. Hệ thống làm gì? (đọc 1 phút)

```
 Kho footage NAS (đã xếp đúng thứ tự)   ─┐
 Kho content viral (bổ sung định kỳ)    ─┤
 Kho SFX / nhạc nền / effect / transition┼─► [AGENT SẢN XUẤT] ─► Video MP4 ─► Người duyệt
 Dữ liệu sản phẩm (SKU, facts)          ─┘          ▲                         │
                                                    │              PASS ──────┼──► Dùng ngay
 Footage mới ─► [MEDIA HUB: nạp NAS + index] ─────────┤
 Kho thiếu cảnh ─► [AI ASSET STUDIO: ElevenLabs/HeyGen/Veo/Seedance] ─┘ (sinh bổ sung, qua duyệt, vào kho)              CẦN SỬA ───┴──► Export CapCut → sửa tay
```

Bốn hệ thống con, chia thành **2 hệ thống triển khai riêng**: Media Hub (A) và Video Agent (B, C, D):

| Hệ thống con | Việc chính | Tài liệu |
|---|---|---|
| **A. VCB Media Hub** (hệ thống riêng, đặt cạnh NAS) | Nạp footage mới vào NAS đúng quy chuẩn tên → index (parse tên file, đo kỹ thuật, cắt shot, AI gắn nhãn) → người duyệt ngoại lệ → phát hành qua Catalog API | [03](./03-agent-phan-loai-footage.md) |
| **B. Production Agent** (dây chuyền dựng) | Brief → kịch bản (từ kho viral) → chọn clip → voice → nhạc/SFX/transition → Timeline IR → MP4 → QC → duyệt → (tùy chọn) export CapCut | [04](./04-pipeline-san-xuat-video.md), [05](./05-timeline-ir-render-capcut.md) |
| **C. Kho tài nguyên phụ trợ** | Nhạc nền, SFX, transition, effect, chữ/sticker, LUT: có nhãn, có giấy phép, render được bằng cả FFmpeg lẫn CapCut | [07](./07-kho-am-thanh-hieu-ung.md) |
| **D. AI Asset Studio** | Kho thiếu cảnh thì sinh bổ sung: ElevenLabs (voice/SFX/nhạc), HeyGen (talking head, dịch có lipsync), Veo/Seedance (b-roll, sản phẩm từ ảnh thật), xen kẽ với footage thật theo guardrail | [08](./08-ai-asset-studio-generate-bo-sung.md) |

**4 nguyên tắc không được phá:**
1. **AI đề xuất, code quyết định.** LLM chỉ trả JSON theo schema (kịch bản, ý định cảnh, mood nhạc). Timing, cắt, mix, xuất file do code làm, theo cách xác định (deterministic).
2. **Metadata rẻ trước, AI sau.** Tên file theo quy chuẩn NAS đã chứa ngày, loại, KOC, SKU, công đoạn, STT nên parse là có, không tốn tiền. AI chỉ bổ sung phần còn thiếu.
3. **Human-in-the-loop ở 2 cổng.** G1 duyệt kịch bản khi có claim mới. G2 duyệt bản cuối (PASS / CẦN SỬA / LOẠI). Không auto-publish.
4. **Một nguồn sự thật: Timeline IR.** MP4 và project CapCut đều được biên dịch từ cùng một IR, nên mở CapCut ra sẽ thấy đúng như video đã xem.

## 2. Quyết định đã chốt với VCB (09–10/10/2026)

| # | Câu hỏi | Quyết định | Tác động thiết kế |
|---|---|---|---|
| 1 | CapCut dùng trên OS nào? | **Windows là chính** | Target profile = CapCut Desktop Windows; Desktop Bridge cho Windows; Mac ngoài MVP ([05](./05-timeline-ir-render-capcut.md)) |
| 2 | Ký hiệu "X" trong sơ đồ | **Các nguồn thay thế được cho nhau** | Template dùng `role: [a, b]`; bỏ chia đôi màn hình ([04](./04-pipeline-san-xuat-video.md) §3) |
| 3 | Slot "HuyK" | **HuyK nói tại hình**, từ footage thật hoặc video AI | Role mặc định `huyk_talk`; nguồn thật trước, avatar HeyGen sau, dự phòng HuyK không nói + VO ([04](./04-pipeline-san-xuat-video.md) §4, [08](./08-ai-asset-studio-generate-bo-sung.md)) |
| 4 | HuyK đồng ý clone giọng / avatar | **Đồng ý 100%**; không quản lý consent trong hệ thống | Giọng và avatar HuyK là tài nguyên sẵn dùng (`voice_id`, `avatar_id`) |
| 5 | Footage sưu tầm (vd Douyin) | **Được khai thác** | `rights_status = collected`; dùng cho hook, stock, minh họa; chỉ lấy đoạn không có watermark bên thứ ba; không dùng thay cảnh sản phẩm ([02](./02-thu-vien-footage-va-metadata.md), [03](./03-agent-phan-loai-footage.md)) |
| 6 | Mã sản phẩm | **Mỗi sản phẩm một bộ footage riêng, không map chéo** | SKU lấy từ thư mục sản phẩm; `product_set_required` trong template |
| 7 | Phiên bản CapCut | **Windows 9.3, có tài khoản Pro** | Target profile `capcut-win-9.3-pro`; transition/effect Pro dùng được nếu đã vào whitelist ([05](./05-timeline-ir-render-capcut.md), [07](./07-kho-am-thanh-hieu-ung.md)) |
| 8 | Dữ liệu sản phẩm | **Chưa có → thiết kế mẫu** | Product Master 3 tab + file CSV mẫu; agent soạn nháp, người duyệt ([02 §6](./02-thu-vien-footage-va-metadata.md), [templates/](./templates/)) |
| 9 | Nhạc nền | **Có kho nhạc bản quyền riêng** | Nạp vào `THƯ VIỆN FX` qua Media Hub; nhạc AI chỉ bổ sung ([07](./07-kho-am-thanh-hieu-ung.md)) |
| 10 | Nhân sự | **~100 người** | RBAC theo vai trò, chia việc tự động, hiệu chuẩn duyệt; phân bổ gợi ý ([06 §1](./06-qc-van-hanh-lo-trinh.md)) |
| 11 | Nạp & index footage | **Hệ thống riêng**, không đặt nặng ở hạ tầng sản xuất | VCB Media Hub cạnh NAS; Agent chỉ gọi Catalog/Media API ([01 §3](./01-tong-quan-kien-truc.md), [03](./03-agent-phan-loai-footage.md)) |

## 3. Thứ tự đọc

| # | File | Ai cần đọc |
|---|---|---|
| 01 | [Tổng quan & kiến trúc](./01-tong-quan-kien-truc.md) | Tất cả |
| 02 | [Thư viện footage, viral & data model](./02-thu-vien-footage-va-metadata.md) | Backend, AI |
| 03 | [VCB Media Hub: nạp footage & index (hệ thống riêng)](./03-agent-phan-loai-footage.md) | Nhóm Media Hub, AI/ML |
| 04 | [Pipeline sản xuất video](./04-pipeline-san-xuat-video.md) | Backend, AI |
| 05 | [Timeline IR, render FFmpeg & export CapCut](./05-timeline-ir-render-capcut.md) | Media engineer |
| 06 | [QC, vận hành, API & lộ trình](./06-qc-van-hanh-lo-trinh.md) | Tech lead, QA, PM |
| 07 | [Kho SFX, nhạc nền, effect, transition](./07-kho-am-thanh-hieu-ung.md) | Media engineer, editor lead |
| 08 | [AI Asset Studio: sinh asset bổ sung](./08-ai-asset-studio-generate-bo-sung.md) | AI engineer, editor lead, brand owner |
| 09 | [Báo cáo test AI model (chi phí & chất lượng)](./09-bao-cao-test-ai-model.md) | Lãnh đạo VCB, tech lead |
| 10 | [MVP demo: hướng dẫn chạy & kịch bản demo](./10-mvp-demo-huong-dan.md) | Người demo, dev |
| A | [Phân tích project CapCut mẫu thật](./appendix-a-capcut-sample-analysis.md) | Media engineer |
| B | [Kiểm kê kỹ thuật video mẫu (ffprobe)](./appendix-b-media-inventory.md) | Media engineer |
| C | [Bảng giá AI provider (nghiên cứu 10/10/2026)](./appendix-c-ai-pricing-research.md) | Tech lead, mua hàng |

## 4. Sự thật quan trọng rút ra từ kho mẫu thật

| Phát hiện | Hệ quả thiết kế |
|---|---|
| NAS khoảng 1.55 TB, khoảng 49k file ở `THƯƠNG HIỆU` (riêng Kim hoàn có 38k .mp4) | Không AI-tag toàn kho một lần. **Index lười theo SKU/folder** khi cần, kèm backfill chạy nền có ngân sách. |
| Tên file theo quy chuẩn `YYMMDD_CT_HK_N0017_Ten-sp_Hanh-dong_DTA01_2` | Parser tên file là nguồn metadata số 1 (loại, SKU, công đoạn, thứ tự). |
| Có file lệch quy chuẩn: `1.mp4`, `0930(1).mp4`, `IMG_9380.MOV`, tên có dấu, ngày nằm ở cuối | Parser phải chịu được lỗi, gắn `parse_confidence` và đẩy file lệch vào hàng duyệt. |
| Footage trộn 30/60/59.94 fps, cả 1080p lẫn 4K; có 4 file iPhone **HLG 10-bit xoay 270°** | Bắt buộc có bước chuẩn hóa: auto-rotate, tone-map HLG→SDR, timeline 30fps. |
| Footage V8 ghi là "đã cắt ≤15s" nhưng thực tế dài 15–17s | Không tin tuyệt đối metadata của thư mục; luôn đo lại bằng ffprobe. |
| Project CapCut thật dài 64s, có **33 cut, trung bình 1.9s/cut**, speed 1.0–2.0×, punch-in scale 1.0–1.8, transition 0.467s, video tắt tiếng, VO + nhạc ở mức 0.32 | Một "slot" 4–5s trong template chứa **nhiều shot ngắn**. Đây là preset phong cách mặc định. |
| Project mẫu dùng transition và nhạc **online của CapCut** (Kết hợp, Mờ đen, "Beautiful Acoustic Guitar") | Kho effect/transition phải **ánh xạ kép** FFmpeg ↔ CapCut. Nhạc phải lấy từ kho có giấy phép của VCB (xem 07). |
| Draft CapCut (v8.3 Win / v9.4 Mac) là JSON **không mã hóa**, đơn vị microsecond | Về kỹ thuật có thể viết adapter export, nhưng vẫn phải qua PoC và thẩm định điều khoản. |
| Video hiệu quả tốt (VN 2.9M, TH 2.6M, JP 1M view) dùng VO đa ngôn ngữ (JP qua TTS) | Ngôn ngữ/thị trường là tham số của job, không hard-code tiếng Việt. |
| Kịch bản A4 là **câu chuyện khách hàng thật** | LLM **không được bịa** câu chuyện hay claim. Chỉ được biến tấu từ kịch bản đã duyệt trong kho viral cộng với facts của SKU. |

## 5. Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| **Asset** | 1 file media trong kho (video/audio/ảnh), định danh bằng sha256. |
| **Segment (shot)** | 1 đoạn dùng được trong asset (source in/out), có nhãn riêng. Đây là đơn vị mà pipeline chọn. |
| **Template (A1–A4)** | Công thức cấu trúc video: danh sách slot (vai trò + thời lượng + cách ghép). |
| **Slot** | 1 khối trong template (vd "Chế tác 4s"), chứa 1..n shot. |
| **"X"** | Trong sơ đồ khách hàng: các nguồn **thay thế được cho nhau** trong cùng slot (vd HuyK nói *hoặc* cận tay thao tác). Template ghi `role: [a, b]`. |
| **Bộ footage sản phẩm** | Thư mục `[Mã SP + Tên SP]`, mỗi sản phẩm một bộ riêng. Video về sản phẩm nào chỉ lấy cảnh sản phẩm/chế tác từ bộ đó. |
| **Viral item** | 1 video/kịch bản tham khảo có số liệu hiệu quả, dùng làm mẫu để viết kịch bản. |
| **FX item** | 1 tài nguyên phụ trợ: nhạc, SFX, transition, effect, text style, LUT, sticker/logo. |
| **Timeline IR** | JSON trung gian mô tả chính xác bản dựng, độc lập với CapCut. Là nguồn duy nhất để render MP4 và sinh draft CapCut. |
| **G1 / G2** | Cổng duyệt kịch bản / cổng duyệt bản cuối. |
| **Coverage** | Kho có đủ segment đã duyệt cho từng slot của 1 SKU hay không. |
