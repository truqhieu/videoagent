# Code review — MVP demo (10/10/2026)

Reviewer: code-reviewer agent (Sonnet) · Scope: `mvp/server`, `mvp/web`, `mvp/indexer` · Kết quả: 3 High, 8 Medium, 5 Low — **đã sửa toàn bộ High/Medium**, Low sửa 3/5.

| # | Mức | Vấn đề | Sửa |
|---|---|---|---|
| 1 | High | Render đồng thời dùng chung `concat.txt/video.mp4/subs.ass` → hỏng file | Thư mục riêng mỗi revision `renders/<job>/r<rev>/` |
| 2 | High | Thread render cũ ghi đè trạng thái lỗi của bản mới; render đọc job đang bị sửa | Kiểm revision ở cả nhánh lỗi; render trên deep-copy snapshot |
| 3 | High | `say` nhận text đầu `-` như option (`-f<path>` đọc file) | Thêm `--` trước text |
| 4 | Med | Kịch bản toàn khoảng trắng → job 0 phần | `ValueError` → 422 |
| 5 | Med | `shot_index` ngoài khoảng làm hỏng phần vĩnh viễn | Kiểm `0 <= idx < len(shots)` |
| 6 | Med | `clip_id` kiểu lạ → 500 | Pydantic `Option(kind: Literal, clip_id/gen_id: str)` + kiểm thuộc danh sách đề xuất |
| 7 | Med | UI poll race (response cũ ghi đè) | Bỏ qua response khác job / revision cũ; try/catch |
| 8 | Med | drawtext mở rộng `%` trong prompt | `expansion=none` |
| 9 | Med | Cache file ghi tại chỗ, file dở bị tái sử dụng | Ghi file tạm + `os.replace` (shot, card, TTS) |
| 10 | Med | Job store không khóa khi sửa; serialize dict đang đổi | `RLock` + trả deep-copy + ghi JSON nguyên tử |
| 11 | Med | `craft_step` AI ngoài taxonomy có thể làm sập matcher | Indexer chỉ nhận giá trị trong `CRAFT_STEPS` |
| L | Low | SKU lạ được chấp nhận | 422 khi SKU không có bộ footage |
| L | Low | Cache TTS fallback gắn nhầm nhãn ElevenLabs | Key cache theo provider thực tế |
| L | Low | Không kiểm Host (DNS rebinding) | `TrustedHostMiddleware` (localhost) |
| L | Low | Tham số `used` của `rank_candidates` luôn rỗng | Giữ nguyên (chống lặp do timeline xử lý) |
| L | Low | Đường dẫn repo chứa `'` làm hỏng concat/drawtext | Giữ nguyên (đường dẫn hiện tại không có) |

Kiểm lại sau sửa: 3 lần đổi phương án song song trong 0,1s → bản render 4 hoàn chỉnh (8 MB); kịch bản rỗng → 422; câu bắt đầu bằng `- ` đọc bình thường; prompt có `%` render đúng. XSS: không có đường khai thác (mọi text từ kịch bản đi qua `esc()`).

Thêm lỗi tự phát hiện khi test giao diện: phần minh họa tự chọn đề xuất avatar thay vì b-roll → ưu tiên đề xuất cùng loại với phần.
