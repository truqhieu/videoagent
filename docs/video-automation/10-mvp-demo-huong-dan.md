# 10 — MVP demo: kịch bản → timeline footage + đề xuất AI generate

> MVP chạy trên máy local, offline được, dùng 60 clip mẫu thật của VCB (V1–V8 + 32 clip chế tác trong project CapCut `Nhan_Than_Hor`).
> Mục đích: cho khách thấy luồng **nhập kịch bản → agent chọn footage → đề xuất phần cần generate → video hoàn chỉnh trên timeline → đổi phương án từng phần**.

## 1. Chạy demo

```bash
uv run --project mvp uvicorn main:app --app-dir mvp/server --port 8787
```

Mở `http://localhost:8787`. Lần đầu `uv` tự cài dependency (Python ≥ 3.11). Cần có ffmpeg (đã có qua Homebrew) và macOS (giọng đọc demo "Linh").

Tùy chọn bật AI thật (không bắt buộc cho demo):

| Biến môi trường | Tác dụng |
|---|---|
| `ANTHROPIC_API_KEY` | Bật planner **Claude Opus 5.5** (structured output); đổi model bằng `VCB_PLANNER_MODEL` |
| `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` | Copy `mvp/local-secrets.example.json` → `mvp/local-secrets.json` (gitignore, quyền 600) rồi điền key: giọng HuyK clone (IVC), model `eleven_v4`; biến môi trường sẽ ghi đè. Không có key → giọng demo |
| Bỏ file nhạc vào `mvp/data/music/` | Dùng nhạc bản quyền của VCB thay nhạc nền mẫu |

## 2. Kịch bản demo cho khách (5 phút)

1. **Chọn "A4 · Mẫu nhẫn khó tới mức thợ đòi bỏ nghề"** (bộ footage N620144, 17 clip chế tác) → bấm **Dựng video**. Chưa tới 20 giây sau có video ~53 giây (giọng HuyK eleven_v4) với phụ đề, VO, nhạc, SFX, logo HuyK ở cảnh chế tác.
2. **Chỉ vào timeline:** 17 shot footage thật được chọn theo đúng thứ tự công đoạn (chuẩn bị nguyên liệu → cưa cắt → khoan). Khối **sọc xanh** ở "Sản phẩm hoàn thiện" cho biết kho không có cảnh này của N620144, nên agent đề xuất **Veo 3.1 image-to-video** từ ảnh sản phẩm thật (≈ $0,96) và hiển thị khung chờ ghi rõ prompt trong video.
3. **Bấm một shot chế tác** → panel phải hiện các phương án footage khác (rê chuột để xem trước, kèm điểm và lý do: "✓ công đoạn Khoan · nhãn AI craft 95% · đẹp 4/5"). Bấm một phương án → video được dựng lại trong khoảng 4 giây.
4. **Bấm phần "HuyK nói"** → có thêm đề xuất **HeyGen avatar** để HuyK nói đúng câu trong kịch bản (≈ $0,15–0,5 tùy độ dài câu). Chọn thử để thấy cách AI xen vào footage thật.
5. **Đổi sang kịch bản "A2 · Huy chương Olympic"** (không gắn sản phẩm) → kho không có hình huy chương nên agent tự chọn **b-roll minh họa AI** cho các phần nội dung, còn các phần HuyK vẫn dùng footage thật. Sau đó mở tab **So sánh model AI** để bàn chi phí ([09](./09-bao-cao-test-ai-model.md)).

## 2b. Giao diện Studio (bố cục kiểu CapCut)

Ảnh chụp: `assets/mvp-screens/01…08`. Slide trình bày khách giải thích từng vùng: `VCB_Video_Agent_Slides.html` slide 16–22 (bản PDF: `VCB_Video_Agent_Slides.pdf`).

| Vùng | Nội dung & tùy chọn |
|---|---|
| ① Thanh trên | Tên dự án · tab **So sánh model AI** · chip trạng thái (số clip, giọng, planner) · menu **Xuất**: MP4, Gói dữ liệu cho dev (zip: MP4 + SRT + timeline.json + VO), CapCut (sắp có) |
| ② Thư viện, 6 tab | **Kịch bản** (mẫu/dán mới, bộ footage sản phẩm, template, planner, Dựng video) · **Footage** (lọc Đúng SKU / Chung VCB / Sưu tầm + công đoạn, bấm để thay shot) · **Âm thanh** (giọng HuyK/demo, nhạc nền, âm lượng, SFX) · **Văn bản** (phụ đề, kiểu chữ, câu hook) · **Hiệu ứng** (chuyển cảnh cắt/mờ qua đen, màu Gốc/Trang sức ấm/Bạc lạnh, logo) · **AI** (mọi đề xuất generate + giá, nút Dùng) |
| ③ Trình phát 9:16 | Phát/dừng (Space), mốc thời gian, toàn màn hình |
| ④ Thuộc tính, 3 tab | **Cảnh** (clip đang dùng, shot 1/2/3, 8 phương án có điểm + lý do, đề xuất generate) · **Giọng** (nghe câu, đổi 1 trong 11 tag cảm xúc → đọc lại) · **Tốc độ & khung** (0,75–2×, phóng 1,0–1,4×) |
| ⑤ Timeline | Track: Phần kịch bản · Văn bản · Hình chính · Lồng tiếng · Nhạc nền · SFX · Logo; nút bật/tắt đầu track; Hoàn tác (30 bước); zoom; chú giải màu (VCB / sưu tầm / AI / thiếu) |

Deep link để mở đúng trạng thái: `/?job=<id>&part=p3&shot=1&lib=footage&insp=scene&zoom=1` hoặc `/?tab=models`.

## 3. Kiến trúc MVP (ánh xạ sang thiết kế production)

```
mvp/
├── indexer/                         # = Media Hub (03), chạy offline 1 lần
│   ├── build_media_index.py         # ffprobe, proxy 720×1280 SDR (tone-map HLG, xoay), thumbnail, contact sheet
│   ├── write_agent_task_files.py    # sinh đề bài cho swarm agent gắn nhãn + bộ benchmark
│   ├── merge_tags_into_catalog.py   # gộp nhãn AI + tên file → data/catalog.json
│   ├── score_model_benchmarks.py    # chấm benchmark Haiku/Sonnet/Opus
│   └── build_pricing_options.py     # bảng phương án model + đơn giá
├── server/                          # = Video Agent (04, 05, 07, 08)
│   ├── main.py                      # FastAPI: /api/bootstrap, /api/jobs, /api/jobs/{id}/select, /api/ai-models
│   ├── job_service.py               # vòng đời job, render nền, lưu data/jobs/*.json
│   ├── script_planner_rules.py      # planner offline theo nhịp template
│   ├── script_planner_claude.py     # planner Claude (structured output, fallbacks)
│   ├── footage_matcher.py           # lọc cứng (bộ footage sản phẩm, quyền) + xếp hạng
│   ├── generation_suggestions.py    # đề xuất Veo / HeyGen / phiếu quay + chi phí + guardrail
│   ├── timeline_builder.py          # thời lượng theo VO thật, chia shot, phụ đề, SFX, logo
│   ├── shot_segment_renderer.py     # cắt shot từ proxy / khung đề xuất AI
│   ├── final_mix_renderer.py        # ghép, logo, phụ đề ASS, mix VO + nhạc (ducking) + SFX, −14 LUFS
│   └── voice_tts.py                 # ElevenLabs hoặc giọng macOS "Linh", cache, đo thời lượng
├── web/                             # Studio + tab So sánh model AI (vanilla JS, không cần build)
└── data/                            # catalog.json, tags/, benchmarks/, ai-models-pricing.json, sample-scripts.json
```

Quy tắc đã cài trong MVP (theo bộ docs):
- **Không map chéo SKU:** cảnh sản phẩm và chế tác chỉ lấy từ bộ footage của đúng sản phẩm.
- **Footage sưu tầm** chỉ dùng làm hook hoặc minh họa.
- **Outro có logo** chỉ đặt cuối video.
- **Không dùng AI để tạo quá trình chế tác** của SKU; thiếu cảnh thì ra phiếu quay bổ sung.
- **"X" = vai trò thay thế:** A4_v2/v3 cho phép HuyK hoặc cận thao tác trong cùng slot.
- **Không lặp clip trong một phần.** Khi phải dùng lại clip ở phần khác thì lấy đoạn khác của clip.
- **Phần minh họa không có cảnh khớp chủ đề** (cần ít nhất 2 từ khóa trùng, so khớp giữ dấu tiếng Việt) thì tự chọn phương án generate.

## 4. Lồng tiếng giọng HuyK (ElevenLabs eleven_v4)

- `vo_director.py` gắn **tag cảm xúc** cho từng phần (hook `[intrigued]`, khó khăn `[serious]`, câu chuyện buồn `[softly, emotional]`, suy ngẫm `[thoughtful]`, cảm ơn `[warm, grateful]`, cao trào `[heartfelt]`, outro `[warm, confident]`) và sửa phát âm (HuyK → "Huy Ka").
- `voice_tts.py` đọc **cả kịch bản trong một lượt** qua endpoint `with-timestamps`, rồi cắt theo phần bằng mốc thời gian ký tự (fade 15 ms ở điểm cắt). Phụ đề vẫn giữ nguyên chữ gốc.
- Cache theo nội dung: kịch bản đã đọc thì lần sau không tốn credit. 6 kịch bản mẫu đã tạo sẵn.
- Tạo lại giọng clone / kiểm chứng: `uv run --project mvp python mvp/indexer/elevenlabs_voice_setup.py {models|sample|clone|transcribe}`.

## 5. Giới hạn của MVP (khác production)

| MVP | Production |
|---|---|
| Video generation chỉ là **đặc tả + khung chờ** (provider, prompt, chi phí); chưa gọi Veo/HeyGen | AI Asset Studio gọi API bất đồng bộ, auto-score, người duyệt (08) |
| VO giọng HuyK clone (IVC, eleven_v4, audio tag cảm xúc); giọng "Linh" chỉ khi không có key | Professional Voice Cloning + từ điển phát âm đầy đủ |
| Planner quy tắc khi chưa có key (Claude bật khi có key) | Claude Opus 5.5 + validator (04 §4) |
| 60 clip, nhãn do swarm agent Sonnet gắn 1 lần | Media Hub index liên tục cạnh NAS (03) |
| Chưa export CapCut | Adapter CapCut 9.3 Windows (05) |
| Không có đăng nhập, chạy local | RBAC cho đội 100 người (06 §1) |
| Một số kịch bản dài làm phần quá dài/ngắn (planner quy tắc) | LLM planner + ràng buộc nhịp |

## 6. Kết quả kiểm thử MVP (10/10/2026)

Bảng dưới đo với giọng demo; với giọng HuyK (eleven_v4), A4_2 dài 53,4s (20 shot thật + 1 khối AI), render ~3,5s.

| Kịch bản | Bộ footage | Thời lượng | Shot thật / AI | Ghi chú |
|---|---|---|---|---|
| A4_2 Thợ đòi bỏ nghề | N620144 | 47,0s | 17 / 1 | Thiếu cảnh hoàn thiện → đề xuất Veo |
| A4_1 Nhẫn tàng hình | N0006 | 35,8s | 16 / 0 | 100% footage thật |
| A4_4 Nhẫn tặng bà | N620112 | 45,9s | 20 / 0 | Có cảnh hoàn thành, đánh bóng |
| A4_3 Nhẫn bánh răng | N101220 (2 clip) | 41,5s | 18 / 1 | Kho mỏng: dùng footage chung VCB + đề xuất AI |
| A2 Huy chương Olympic | — | 38,3s | 5 / 3 | 3 phần minh họa AI, HuyK vẫn dùng footage thật |

Thời gian: lập kế hoạch + lồng tiếng giọng HuyK khoảng 10 giây ở lần đầu (sau đó lấy từ cache); render 3–8 giây; dựng lại sau khi đổi phương án khoảng 4–5 giây. Âm lượng đầu ra khoảng −14,7 LUFS.
