# 09 — Báo cáo test AI model cho các hoạt động tốn chi phí AI

> Ngày test: **10/10/2026** · Bản tương tác: tab **"So sánh model AI"** trong MVP (`http://localhost:8787`), chọn model cho từng hoạt động và xem chi phí theo video / tháng.
> Dữ liệu gốc: `mvp/data/benchmarks/` (đề bài, đáp án, output từng model, điểm giám khảo) · `mvp/data/benchmark-results.json` · bảng giá [appendix C](./appendix-c-ai-pricing-research.md).

## 1. Tóm tắt cho người ra quyết định

| Hoạt động | Đề xuất | Lý do | Rẻ hơn (đánh đổi) |
|---|---|---|---|
| Gắn nhãn footage mới (Media Hub) | **Claude Haiku 5.5** | Test thật: vai trò 100%, công đoạn 89% (100% trong ±1 bước), HuyK 100% · ~$0,5/1.000 clip | Gemini 2.5 Flash-Lite (~$0,46/1.000 clip, **chưa test**) |
| Lập kế hoạch kịch bản → phần video | **Claude Opus 5.5** | Giám khảo mù: 8,3/10 (Sonnet 7,2 · Haiku 7,0); chênh chỉ ~$0,08/video so với Sonnet | Sonnet 5.5 ($0,032/video) · Haiku 5.5 ($0,0016/video, phân vai kém hơn) |
| Lồng tiếng VO | **ElevenLabs eleven_v4 + clone giọng HuyK** | **Test thật:** WER 0,5% tiếng Việt, audio tag cảm xúc hoạt động, ~10s cho kịch bản 45s | Flash v2.5 / v4 Turbo (½ giá) — cần nghe thử mù |
| Phiên âm / kiểm phụ đề | ElevenLabs Scribe v2 | $0,22/giờ, có word timestamps, tiếng Việt tốt | Whisper large-v3 tự host |
| HuyK nói (avatar / dịch khớp môi) | HeyGen Avatar IV | Giá đã xác minh $3/phút (Enterprise API) | D-ID / Synthesia (giá **chưa xác minh**) |
| Sinh b-roll / cảnh sản phẩm | Google Veo 3.1 Fast | $0,12/giây 1080p, 9:16 | Veo 3.1 Lite $0,08/s · Grok Lite $0,03/s (720p) |
| SFX / nhạc bổ sung | ElevenLabs Sound Effects | Chỉ dùng khi kho thiếu | Lyria 3.5 |
| Embedding | OpenAI text-embedding-3-small | $0,02/1M token | — |

**Chi phí AI ước tính** (10.000 video/tháng × 4 ngôn ngữ, 3.000 clip mới/tháng):

| Cấu hình | / video | / tháng | Ghi chú |
|---|---|---|---|
| Rẻ nhất | **$0,34** | ~$3.418 | Nhiều model chưa test, avatar giá chưa xác minh |
| **Đề xuất ★** | **$1,55** | **~$15.492** | Avatar 52% · b-roll 23% · VO 13% · kịch bản 10% |
| Cao cấp | $2,70 | ~$26.960 | Veo Standard, Fable 5.1, MiniMax HD |

Chưa gồm hạ tầng render, lưu trữ, nhân sự. **Avatar HuyK là khoản lớn nhất**, nên đòn bẩy tiết kiệm số 1 là ưu tiên dùng clip HuyK thật, chỉ dùng avatar khi không có câu khớp (giả định hiện tại trung bình 4 giây avatar mỗi video mỗi ngôn ngữ).

## 2. Phạm vi & phương pháp

### Hoạt động có chi phí AI trong hệ thống
1. Gắn nhãn footage mới (vision) · 2. Lập kế hoạch kịch bản (LLM) · 3. Lồng tiếng (TTS) · 4. Phiên âm (ASR) · 5. Avatar / dịch khớp môi · 6. Sinh b-roll / cảnh sản phẩm · 7. SFX / nhạc · 8. Embedding.

### Test thực tế (Claude Haiku 5.5 / Sonnet 5.5 / Opus 5.5)
Chạy song song qua agent với **đề bài và input giống hệt nhau**:

| Test | Input | Chấm điểm |
|---|---|---|
| **T1 · Gắn nhãn vision** | 12 clip thật của VCB có đáp án đã xác minh (8 công đoạn chế tác, 1 sản phẩm hoàn thiện, 1 HuyK nói, 1 outro có logo, 1 clip Douyin). Mỗi clip là 1 contact sheet 12 frame, **không có gợi ý tên file** | Vai trò chính, công đoạn (chính xác / ±1 bước), có HuyK, logo/watermark |
| **T2 · Lập kế hoạch** | 3 kịch bản thật (A4_2, A4_3, A2) + quy tắc template + tóm tắt kho | 6 kiểm tra quy tắc tự động + **giám khảo mù** (Claude Opus 5.5, nhãn X/Y/Z xáo theo từng kịch bản, 5 tiêu chí 1–5 + điểm 1–10) |

Chi phí API tính bằng **cùng giả định token** cho mọi model (T1: 2.800 token vào / 450 ra mỗi clip; T2: 3.500 / 2.500 mỗi kịch bản) × giá công bố. Số token agent đo được bao gồm overhead của harness nên không dùng trực tiếp làm chi phí API.

### Không test được (chưa có API key)
Gemini, GPT, ElevenLabs, HeyGen, Veo, Seedance, Kling, Runway: báo cáo dùng **giá công bố đã kiểm tra trên trang nhà cung cấp** (130 dòng, 12 dòng chưa xác minh, có link nguồn).

## 3. Kết quả T1 — Gắn nhãn footage (12 clip, chỉ nhìn hình)

| Model | Vai trò chính | Công đoạn chính xác | Công đoạn ±1 bước | Có HuyK | Logo / watermark | Thời gian agent | $/1.000 clip (API) |
|---|---|---|---|---|---|---|---|
| Claude Haiku 5.5 | **100%** | 89% (8/9) | **100%** | **100%** | 50% | 180s | **$0,51** |
| Claude Sonnet 5.5 | 92% | **100%** | **100%** | **100%** | **100%** | **74s** | $10,10 |
| Claude Opus 5.5 | **100%** | **100%** | **100%** | **100%** | 50% | 92s | $20,20 |

Lỗi cụ thể:
- Haiku nhầm **đổ khuôn → nung chảy** (hai bước liền kề, cùng có lửa và chén nung).
- Sonnet nhận clip **outro thành hook**.
- Haiku và Opus gắn clip Douyin là `subtitle_text` (có phụ đề tiếng Trung) thay vì `third_party`. Về mặt hình ảnh đây không sai: lỗi nằm ở bộ enum, vì một trường đang gộp hai khái niệm. **Cần sửa schema:** tách `has_subtitle` khỏi `source_third_party`, vì quyền sử dụng phụ thuộc vào trường thứ hai.

**Kết luận T1:** Haiku 5.5 đủ tốt cho gắn nhãn hàng loạt, nhất là khi production có thêm gợi ý tên file NAS (tên file đã chứa công đoạn), với chi phí bằng 1/20 Sonnet. Clip mâu thuẫn hoặc nghi vấn bản quyền chuyển sang Sonnet làm bước đối chiếu, như thiết kế ở [03](./03-agent-phan-loai-footage.md).

## 4. Kết quả T2 — Lập kế hoạch kịch bản

**Kiểm tra quy tắc** (giữ nguyên văn, hook đầu, outro cuối, công đoạn không đi lùi, có HuyK, phát hiện cảnh thiếu): **cả 3 model đạt 100% / 3 kịch bản**. Cả 3 cũng tự phát hiện kịch bản A4_3 nói về "nhẫn xoay bánh răng" trong khi bộ footage là nhẫn Horus. Các kiểm tra quy tắc **không phân biệt được** chất lượng giữa các model, nên cần giám khảo.

**Giám khảo mù** (trung bình 3 kịch bản, thang 1–5; tổng 1–10):

| Model | Phân vai | Mô tả cảnh cụ thể | Nhịp (độ dài phần) | Đánh dấu thiếu cảnh | Hook | **Tổng /10** | Thời gian agent | $/1.000 kịch bản |
|---|---|---|---|---|---|---|---|---|
| Claude Opus 5.5 | **5,0** | **4,7** | 3,3 | **5,0** | **4,7** | **8,3** | 232s | $64 |
| Claude Sonnet 5.5 | 4,0 | 4,0 | 4,0 | 4,7 | 4,0 | 7,2 | **161s** | $32 |
| Claude Haiku 5.5 | 3,3 | 3,0 | **4,7** | 4,7 | **4,7** | 7,0 | 279s | **$1,6** |

Nhận xét của giám khảo:
- **Opus** thắng cả 3 kịch bản: phân vai hợp nội dung, mô tả cảnh cụ thể, tận dụng clip HuyK có sẵn để khỏi phải generate. Điểm trừ là chia quá vụn (13 phần), nhịp kém.
- **Sonnet** cấu trúc chắc chắn. Điểm trừ: kịch bản A2 thiếu outro, và có phần quá dài.
- **Haiku** nhịp tốt nhất và hook tốt. Điểm trừ: mô tả cảnh chỉ nhắc lại tên công đoạn, và có câu cảm ơn bị đặt lên cảnh sản phẩm.

**Kết luận T2:** dùng **Opus 5.5** cho lập kế hoạch, kèm ràng buộc nhịp trong prompt (gộp phần dưới 14 từ) để sửa điểm yếu duy nhất của nó. Ở quy mô 10k video, chênh lệch so với Sonnet khoảng $800/tháng, nhỏ so với chi phí avatar và b-roll, trong khi chất lượng kế hoạch ảnh hưởng tới mọi video. Haiku phù hợp cho các việc phụ như dịch hoặc chuẩn hóa văn bản.

## 5. Kết quả T3 — Lồng tiếng eleven_v4 + clone giọng HuyK (test thật, 10/10/2026)

| Hạng mục | Kết quả |
|---|---|
| Mẫu giọng | 36,8s giọng HuyK nói tại hình (clip KB "3 điều về vàng"), lọc ồn nhẹ, bỏ khoảng lặng và đoạn nhạc cuối → **Instant Voice Clone** |
| Model | `eleven_v4` (đã xác nhận qua API: hỗ trợ tiếng Việt, tối đa 10.000 ký tự/request, không có thanh "style") |
| Điều khiển cảm xúc | **Audio tag** `[intrigued]`, `[serious]`, `[softly, emotional]`, `[thoughtful]`, `[warm, grateful]`, `[heartfelt]`, `[warm, confident]` do bộ đạo diễn giọng chọn theo vai trò + từ ngữ từng câu. Đã kiểm chứng tag **không bị đọc thành lời** (Scribe chỉ ghi nhận thành âm thanh như `[thở dài]`, `[cười khẽ]`) |
| Phát âm | Từ điển: HuyK → "Huy Ka" (cách HuyK tự đọc trong clip mẫu), 18K → "mười tám ca", S925 → "ét chín hai lăm" |
| Độ chính xác | Đọc cả kịch bản A4_2 (190 từ) một lượt; Scribe v2 nghe lại: **WER 0,5% (1 lỗi / 190 từ)**, không rò tag nào |
| Ghép vào video | Một lượt đọc liền (cảm xúc nối mạch) + mốc thời gian từng ký tự → cắt chính xác theo phần (đã nghe lại các đoạn cắt: đúng ranh giới câu) |
| Tốc độ / chi phí | ~10s cho kịch bản 45–50s; ~800–900 ký tự ≈ **$0,07 / video / ngôn ngữ** (giá niêm yết $0,08/1K ký tự) |

Khuyến nghị: dùng IVC cho demo và pilot. Khi lên production, chuyển sang **Professional Voice Cloning** (cần khoảng 30 phút giọng sạch, HuyK tự xác minh trên ElevenLabs) để giống giọng hơn, và mở rộng từ điển phát âm (tên sản phẩm, thuật ngữ đá quý).

## 6. Bảng giá & cách tự chọn

Mở tab **"So sánh model AI"** trong MVP:
1. Mỗi hoạt động có bảng phương án gồm hạng (rẻ / cân bằng / cao cấp), chi phí cho 1 đơn vị công việc, cột so sánh, nhãn "đã test", nhãn "giá chưa xác minh" và link nguồn.
2. Chọn model bằng radio, hoặc bấm nhanh **Chọn rẻ nhất / Chọn đề xuất ★ / Chọn cao cấp**.
3. Nhập số video/tháng, số ngôn ngữ, số clip mới/tháng và tỷ giá. Bảng bên phải tính chi phí mỗi video, mỗi tháng và phân bổ theo hoạt động.

Công thức: VO, ASR và avatar nhân theo số ngôn ngữ; kịch bản tính 1 bản gốc cộng 50% cho mỗi ngôn ngữ thêm (chuyển thể); gắn nhãn chia đều theo số video trong tháng. Lượng dùng giả định mỗi video ghi ngay dưới tiêu đề từng bảng.

## 7. Lưu ý quan trọng

- **Mẫu nhỏ:** 12 clip và 3 kịch bản đủ để định hướng, chưa đủ để chốt. Pilot cần mở rộng lên 300 clip gold và 30 kịch bản (06 §7).
- **Giám khảo là Opus**, có thể thiên vị output của chính nó. Nên chấm thêm bằng editor của VCB, cũng theo kiểu mù.
- **Giá thay đổi theo thời gian:** Gemini 3.x tăng gấp đôi từ 01/01/2027; khuyến mãi ElevenLabs v4 hết ngày 12/10/2026 (đã dùng giá niêm yết); Sora API đã bị gỡ.
- **Chưa test** avatar khớp môi tiếng Việt, độ trung thực sản phẩm của Veo/Seedance. Bộ test cho các hạng mục này đã thiết kế ở [08 §5](./08-ai-asset-studio-generate-bo-sung.md); chạy được ngay khi có API key.

## 8. Bước tiếp theo
1. Cấp API key thử (Gemini, OpenAI, ElevenLabs, HeyGen, Veo) để chạy lại T1/T2 trên cùng bộ test, bổ sung cột "đã test" cho các provider khác.
2. Test nghe mù 30 câu tiếng Việt / Nhật / Thái giữa ElevenLabs v4 (clone HuyK), Flash v2.5 và MiniMax HD; HuyK duyệt giọng clone.
3. Test 10 cảnh image-to-video từ ảnh sản phẩm thật để đo độ trung thực (màu đá, số chấu).
4. Sửa schema nhãn (`has_subtitle` tách khỏi `source_third_party`) rồi chạy lại T1.

## Câu hỏi còn mở
- VCB có tài khoản HeyGen Enterprise không, hay sẽ dùng gói self-serve (giá cao hơn, chưa xác minh)?
- Có chấp nhận nhập liệu qua Batch API (giảm 50% giá LLM) với độ trễ vài giờ cho gắn nhãn kho cũ không?
