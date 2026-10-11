# Plan — MVP demo "kịch bản → timeline" + báo cáo test AI model

Ngày: 10/10/2026 · Trạng thái: hoàn thành phase 1–8 (chờ sửa theo code review)

## Mục tiêu
1. MVP demo cho khách: nhập kịch bản → chọn đoạn footage từ kho mẫu → đề xuất phần cần generate (VO, footage, b-roll) → video tương đối hoàn thiện trên timeline; mỗi phần có phương án thay thế.
2. Báo cáo test AI model cho các hoạt động tốn chi phí AI → khách tự chọn/so sánh (trang tương tác trong MVP + file docs).

## Ràng buộc môi trường
- Không có API key AI trong máy → MVP chạy offline (planner theo quy tắc, VO giọng hệ thống "Linh"); adapter Claude/ElevenLabs bật khi có key.
- Python 3.11 qua `uv`, FastAPI; ffmpeg 8 (zscale, tonemap, ass, drawtext, sidechaincompress có sẵn).

## Phases
| # | Phase | Trạng thái |
|---|---|---|
| 1 | Index 60 clip mẫu (V1–V8 + 32 clip project CapCut): proxy 720×1280 SDR, thumbnail, contact sheet, parse tên file | ✅ |
| 2 | Swarm agent (sonnet) gắn nhãn 60 clip → `mvp/data/catalog.json` | ✅ |
| 3 | Benchmark thật: Haiku/Sonnet/Opus gắn nhãn tập gold 12 clip (không gợi ý tên file) + lập kế hoạch kịch bản | ✅ |
| 4 | Nghiên cứu bảng giá provider (agent researcher) → `mvp/data/ai-models-pricing.json` | ✅ |
| 5 | Backend: planner, matcher, gen suggestions, TTS, timeline, renderer FFmpeg, API | ✅ |
| 6 | Frontend Studio: timeline nhiều track, inspector + phương án thay thế, tab so sánh model | ✅ |
| 7 | Test đầu-cuối với kịch bản thật, sửa lỗi, review code | ✅ |
| 8 | Báo cáo `docs/video-automation/09-bao-cao-test-ai-model.md` + hướng dẫn chạy MVP `10-mvp-demo-huong-dan.md` | ✅ |

## Quyết định
- Video-gen (Veo/Seedance/HeyGen): MVP tạo **đặc tả yêu cầu generate** (provider, prompt, thời lượng, chi phí) + khung placeholder trong video; không gọi API (không có key, job bất đồng bộ nhiều phút). Guardrail: không đề xuất AI cho cảnh chế tác của SKU.
- File Python dùng snake_case (bắt buộc để import); file web/config dùng kebab-case.
