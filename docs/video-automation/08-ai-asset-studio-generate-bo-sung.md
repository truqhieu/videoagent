# 08 — AI Asset Studio: sinh asset bổ sung bằng AI để kho luôn sẵn sàng

## 1. Mục tiêu

Footage thật là xương sống của thương hiệu ("xưởng chế tác thật của HuyK"). Tuy vậy kho luôn có chỗ trống: SKU mới chưa quay xong, thiếu cảnh sản phẩm hoàn thiện, thiếu câu nối của HuyK, cần bản tiếng Nhật hoặc tiếng Thái, thiếu SFX đúng hành động, hoặc nhạc đã dùng quá nhiều.

AI Asset Studio **lấp khoảng trống bằng asset do AI sinh**, xen kẽ với footage thật, để:
- Job **không bị kẹt ở `MISSING_ASSET`** khi chỗ thiếu có thể sinh được.
- Đội quay chỉ quay lại những cảnh **bắt buộc phải thật** (quá trình chế tác đúng SKU).
- Mỗi asset **sinh một lần, dùng nhiều lần**: kết quả được nạp vào Media Hub (qua index và người duyệt) giống footage thường.

## 2. Ma trận: loại asset → provider → điều kiện

| Nhu cầu | Provider đề xuất (qua `model_gateway`) | Đầu vào | Được phép dùng cho role | Điều kiện bắt buộc |
|---|---|---|---|---|
| **Voice-over** (vi/ja/th/en) | ElevenLabs: Eleven v4 + giọng HuyK PVC. Dự phòng: Flash v2.5, MiniMax (đã dùng cho JP trong mẫu thật) | Script đã qua G1/validator | `voice` | Giọng HuyK có sẵn (`voice_id`); có từ điển phát âm |
| **SFX** | ElevenLabs Sound Effects (text-to-SFX) | Mô tả hành động + thời lượng | `sfx` | Kho SFX thiếu đúng nhóm; nghe duyệt 1 lần rồi đưa vào kho FX |
| **Nhạc nền** | ElevenLabs Music (hoặc provider nhạc AI có license thương mại) | mood, bpm, thời lượng, nhạc cụ | `bgm` | Gói dịch vụ cho phép thương mại + quảng cáo; lưu chứng từ license |
| **HuyK nói tại hình** (song song với footage thật) | HeyGen: Avatar / Digital Twin của HuyK + giọng clone ElevenLabs | Script đã qua validator/G1 | `huyk_talk` (nguồn `ai_avatar`) | Avatar HuyK có sẵn (`avatar_id`); nội dung chỉ từ script đã duyệt |
| **Bản địa hóa HuyK** (VN → JP/TH) | HeyGen Video Translate (lipsync) hoặc ElevenLabs Dubbing + lipsync | Clip `huyk_talk` thật + bản dịch đã duyệt | `huyk_talk` (bản dịch) | Bản dịch do người bản ngữ duyệt; giữ nguyên nội dung gốc |
| **B-roll trung tính** | Veo 3.x / Seedance 2.0 (text-to-video, 9:16) | Prompt từ `visual_intent` + style guide | `stock_action`, `content_illustration`, `hook_visual` (trừu tượng: lửa, ánh kim, bụi sáng, bàn thợ) | Không có SKU cụ thể, không có người thật nhận diện được |
| **Sản phẩm chuyển động** | Veo / Seedance image-to-video | **Ảnh thật** của SKU (`KHO SP THƯƠNG MẠI/ẢNH`) | `product_hero` | Kiểm tra độ trung thực (§5); người duyệt từng asset; không đổi màu đá, hình dáng, kim loại |
| **Ảnh minh họa** (A1–A3) | Imagen / Nano Banana / tương đương | Prompt chủ đề | `content_illustration` | Không tái tạo người nổi tiếng, logo hay thương hiệu khác |

**Cấm sinh bằng AI** (chính sách mặc định, chỉ editor lead + brand owner mới đổi được):
- Quá trình chế tác **của một SKU cụ thể** (`craft` có `sku`). Đây là bằng chứng tay nghề, phải là footage thật.
- Câu chuyện khách hàng, cảnh giao hàng hay cảnh khách nhận quà được dựng như sự kiện có thật.
- HuyK nói hoặc làm điều chưa có trong script đã duyệt; giọng hoặc mặt của người khác.
- Chứng thư, giấy kiểm định, giá, con số.

## 3. Hai chế độ chạy

### 3.1 Just-in-time (trong job)
```
Coverage check (04 §4 bước 1) thấy slot thiếu
  → Gen Policy: slot.role có thuộc danh sách được phép sinh? job.allow_ai_gen? còn ngân sách?
      không → MISSING_ASSET (như cũ) + phiếu bổ sung kho
      có    → GEN_PENDING: tạo gen_request(s) → provider (bất đồng bộ)
            → nhận N ứng viên (2–4) → Auto-score (§5) → ứng viên tốt nhất nạp vào Media Hub
            → nếu policy yêu cầu duyệt (product_hero, huyk_talk avatar): review task "chọn 1 / sinh lại / bỏ"
            → asset approved → job tiếp tục bước 4 (Clip selection)
```

### 3.2 Chủ động (giữ kho luôn sẵn sàng)
Mỗi đêm, đọc báo cáo coverage (03 §5) của các SKU trong kế hoạch content tháng:
- SKU thiếu `product_hero` hoặc `product_final` và có ảnh thật → sinh sẵn 3–5 clip image-to-video, chờ duyệt.
- Nhóm SFX hoặc mood nhạc thiếu, hoặc đã quá cooldown → sinh bổ sung vào kho FX.
- Kịch bản viral top của thị trường VN chưa có bản JP/TH → tạo job bản địa hóa HuyK.
- Có trần ngân sách theo ngày và tuần; editor lead duyệt danh sách đề xuất (1 click) trước khi chạy.

## 4. Nguyên tắc xen kẽ AI với footage thật

| Quy tắc | Mặc định (cấu hình trong style preset) |
|---|---|
| Tỷ lệ b-roll / sản phẩm AI tối đa / video | 30% (không tính slot HuyK avatar) |
| Hai shot b-roll AI liền nhau | Không (phải có shot thật xen giữa) |
| Hook (0–3s) | Ưu tiên thật; AI chỉ dùng hook trừu tượng (`hook_visual`) |
| HuyK avatar (`huyk_talk`, nguồn `ai_avatar`) | Lấp mọi slot `huyk_talk` khi không có clip thật khớp câu; ưu tiên clip thật khi điểm ngang nhau. Pilot: duyệt 100% avatar; sau đó theo mức tin cậy (06) |
| Slot `craft` của SKU | 0% AI |
| Slot "X" (role thay thế, vd `[huyk_talk, craft]`) | Được lấp bằng asset AI của bất kỳ role nào trong danh sách, trừ `craft` của sản phẩm |

Clip selector (04 §4) chấm điểm asset AI như mọi asset khác, cộng thêm **phạt nhẹ** (−0.1) để ưu tiên footage thật khi điểm ngang nhau.

## 5. Kiểm soát chất lượng asset AI (Auto-score + người)

| Kiểm tra | Cách làm | Loại khi |
|---|---|---|
| Kỹ thuật | ffprobe, độ phân giải ≥ 1080×1920 (upscale nếu cần), fps chuẩn hóa về 30, không khung đen | Lỗi decode, < 720p |
| Lỗi hình AI | Vision model chấm: tay hoặc ngón biến dạng, vật thể tan chảy, chữ vô nghĩa, nhấp nháy | Điểm < ngưỡng |
| **Trung thực sản phẩm** (image-to-video) | So frame đầu, giữa, cuối với ảnh gốc: embedding similarity + vision model trả lời "màu đá, hình đá, số chấu, màu kim loại có giữ nguyên không?" | Bất kỳ thuộc tính nào thay đổi |
| Khớp ý | Cosine(`visual_intent`, mô tả clip) | Thấp hơn ứng viên thật tốt nhất |
| Talking head | Lipsync offset, so ASR bản sinh với script (WER), HuyK hoặc người được ủy quyền nghe/xem mẫu đầu | WER > 5% hoặc người duyệt từ chối |
| Âm thanh (VO/SFX/nhạc) | LUFS, clipping, silence, ASR so với script (VO) | Sai chữ ở tên riêng, số, đơn vị |

## 6. Gắn nhãn, lưu vết & công bố AI

- Mọi asset sinh ra: `assets.origin = 'ai_generated'`, `gen_meta = {provider, model, version, prompt, seed, reference_asset_ids, request_id, cost, created_at}`, `rights_status = 'licensed'` (theo điều khoản provider).
- Manifest video ghi tỷ lệ AI cùng danh sách asset AI. QC gắn cờ `ai_disclosure_required = true` khi có nội dung AI mang tính chân thực (người, sản phẩm thật). Khi đăng, phải bật nhãn "AI-generated" hoặc tương đương theo chính sách của TikTok, Meta, YouTube.
- Giữ watermark hoặc metadata nguồn gốc của provider (vd SynthID của Veo, C2PA nếu có). Không gỡ.

## 7. Kỹ thuật tích hợp

```yaml
# config/model_gateway.yaml (trích)
roles:
  tts:            {provider: elevenlabs, model: eleven_v4, voice: huyk_pvc_v1, fallback: [elevenlabs/eleven_flash_v2_5, minimax/speech]}
  sfx_gen:        {provider: elevenlabs, endpoint: sound-generation}
  music_gen:      {provider: elevenlabs, endpoint: music}
  avatar_video:   {provider: heygen, avatar: huyk_twin_v1, mode: async}
  video_translate:{provider: heygen, mode: async}
  video_gen:      {provider: google_veo, model: veo-3.x, aspect: "9:16", fallback: [seedance-2.0]}
  image_gen:      {provider: google, model: imagen-or-nano-banana}
```

- Video và avatar gen là **job bất đồng bộ** (tính bằng phút): dùng webhook nếu provider có, nếu không thì poll với backoff. Lưu `request_id` để không trả tiền hai lần khi retry.
- **Reserve ngân sách** trước khi gọi, đối soát sau bằng usage thực. Trần theo job, ngày và provider; circuit breaker khi provider lỗi.
- Cache theo `hash(prompt_norm + reference_ids + model + settings)`.
- Prompt builder (code + template, LLM chỉ điền `visual_intent`):
  `"{shot_size} shot, {subject}, jeweler workshop, warm tungsten light, shallow depth of field, vertical 9:16, realistic, no text, no logo, {duration}s, camera {camera_move}"`.
  Mỗi role có negative prompt riêng (vd "no human face, no brand logo, no text").
- Hậu xử lý: chuẩn hóa về 1080×1920 / 30fps / SDR, cắt bỏ 0.3s đầu và cuối (thường lỗi), rồi nạp vào Media Hub qua `POST /v1/assets/ingest` (03 §8) để có segment, nhãn và embedding.
- **Tên model, giá, khả năng tiếng Việt và điều khoản của từng provider phải xác minh lại ở Giai đoạn 0.** Danh sách trên là ứng viên, chưa phải cam kết.

## 8. Thay đổi trong các tài liệu khác

- 04 §4 bước 1: nhánh `MISSING_ASSET` có thêm lối sang `GEN_PENDING` khi policy cho phép.
- 04 §7 state machine: `CLIPS_SELECTED` có thể đi qua `GEN_PENDING → GEN_REVIEW`.
- 06 QC: thêm kiểm tra tỷ lệ AI, cờ disclosure.
- 07: SFX và nhạc AI vào kho FX qua cùng quy trình license (`license.source = 'elevenlabs'`, kèm plan và ngày).
