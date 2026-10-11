# 04 — Production Agent: pipeline sản xuất video

## 1. Luồng tổng quát

```
JOB (brief) ─► 1 Coverage check ─► 2 Script (LLM) ─► [G1 nếu cần] ─► 3 Voice ─► 4 Clip selection
           ─► 5 FX selection (nhạc/SFX/transition/chữ) ─► 6 Timeline Planner → Timeline IR
           ─► 7 Render MP4 ─► 8 QC ─► [G2 người duyệt] ─┬─ PASS ─────► MP4 dùng ngay
                                                       ├─ Sửa nhanh ─► change set → quay lại bước bị ảnh hưởng
                                                       ├─ CẦN SỬA ──► Export CapCut → editor sửa
                                                       └─ LOẠI ─────► ghi lý do (dữ liệu học)
```

## 2. Đầu vào job (brief)

```json
{
  "sku": "N0017",
  "template_id": "A4_v2",
  "market": "VN", "language": "vi",
  "target_duration_s": 45,
  "variants": 3,
  "angle": "auto",                       // hoặc customer_story | craft_difficulty | knowledge | gift ...
  "viral_ref_ids": [],                   // tùy chọn: ép dùng 1 mẫu viral cụ thể
  "voice_mode": "clone_tts",             // clone_tts | huyk_real_only | none (chỉ nhạc + chữ)
  "style_preset": "huyk_default",
  "channel": "tiktok_huyk_xuongchetac2",
  "budget_vnd": 50000,
  "allow_ai_gen": ["voice", "huyk_talk", "sfx", "bgm", "product_hero", "stock_action"],   // role được phép sinh bổ sung (08)
  "notes": "Không nhắc giá"
}
```

Batch: nhập CSV nhiều dòng như trên → mỗi dòng × `variants` = số job.

## 3. Template — `config/templates/*.yaml`

Dựng từ sơ đồ khách hàng (N1). **Thời lượng là khoảng mềm**; ràng buộc cứng là lời nói đồng bộ và thứ tự công đoạn.

Quy ước: `role: [a, b]` = **"X" trong sơ đồ khách hàng = các nguồn thay thế được cho nhau** (đã chốt 09/10/2026). Slot nhận *một trong* các role trong danh sách; slot nhiều shot có thể trộn các role đó. Bộ chọn cảnh lấy phương án điểm cao nhất, theo thứ tự `prefer` nếu điểm ngang nhau. Không có chia đôi màn hình.

```yaml
# A4_v1 — Quá trình chế tác, 1 nguồn/slot
id: A4_v1
family: A4
target_duration_s: [35, 60]
slots:
  - {id: s1, role: product_hero,   dur_s: [4, 6],  shots: [2, 3]}
  - {id: s2, role: huyk_talk, fallback: huyk_silent, dur_s: [3, 5], shots: [1, 1]}   # HuyK nói tại hình (thật hoặc avatar AI)
  - {id: s3, role: craft, dur_s: [3, 4], shots: [1, 2], step_seq: next}   # công đoạn kế tiếp theo order
  - {id: s4, role: craft, dur_s: [3, 4], shots: [1, 2], step_seq: next}
  - {id: s5, role: craft, dur_s: [3, 4], shots: [1, 2], step_seq: next}
  - {id: s6, role: huyk_talk, fallback: huyk_silent, dur_s: [3, 5], shots: [1, 1]}
  - {id: s7, role: craft, dur_s: [3, 4], shots: [1, 2], step_seq: next}
  - {id: s8, repeat: [craft, craft, huyk_talk], max_repeat: 3, dur_s: [3, 4]}  # "..." trong sơ đồ
  - {id: s9, role: product_final, dur_s: [5, 10], shots: [2, 4]}
  - {id: s10, role: outro, dur_s: [3, 5], shots: [1, 1], fixed_asset_pool: outro_huyk}
rules:
  product_set_required: [product_hero, craft, craft_macro, product_final]   # chỉ lấy từ bộ footage của đúng sản phẩm
  craft_order: strict_non_decreasing                        # không đảo công đoạn
  logo_overlay: {on_roles: [craft], fx: logo_huyk_corner}    # "Source gốc + tag logo HuyK"
```

```yaml
# A4_v2 — slot "X": HuyK nói hoặc cận thao tác (thay thế cho nhau)
id: A4_v2
extends: A4_v1
override_slots:
  s4: {role: [huyk_talk, craft_macro], prefer: craft_macro, dur_s: [3.5, 4.5]}
  s5: {role: [craft, craft_macro],                          dur_s: [3.5, 4.5]}
  s6: {role: [huyk_talk, craft],       prefer: huyk_talk,   dur_s: [3.5, 4.5]}
```

```yaml
# A4_v3 — Sản phẩm hoặc HuyK nói (ít chế tác)
id: A4_v3
slots:
  - {id: s1, role: [product_hero, huyk_talk], prefer: product_hero, dur_s: [4, 6]}
  - {id: s2, role: [product_hero, huyk_talk], prefer: huyk_talk,    dur_s: [3, 5]}
  - {id: s3, role: [product_hero, huyk_talk], dur_s: [3, 5]}
  - {id: s4, role: [product_hero, huyk_talk], dur_s: [4, 6]}
  - {id: s5, role: product_final, dur_s: [3, 5]}
  - {id: s6, role: [product_hero, huyk_talk], dur_s: [3, 5]}
  - {id: s7, role: product_final, dur_s: [10, 15]}
  - {id: s8, role: outro, dur_s: [3, 5]}
rules: {no_same_role_more_than: 2}   # tránh 3 slot liền cùng 1 role khi role là thay thế
```

```yaml
# A1_A3 — Kiến thức / câu chuyện, VO dài, nhiều hình minh họa
id: A1_A3
slots:
  - {id: s1, role: hook_visual, dur_s: [4, 6]}                                   # được dùng footage sưu tầm
  - {id: s2, role: [huyk_talk, content_illustration], dur_s: [8, 12]}
  - {id: s3, role: [content_illustration, stock_action, craft], dur_s: [8, 12]}
  - {id: s4, role: huyk_talk, fallback: huyk_silent, dur_s: [4, 6]}
  - {id: s5, role: [content_illustration, craft], dur_s: [8, 12]}
  - {id: s6, repeat: [[huyk_talk, content_illustration]], max_repeat: 3, dur_s: [6, 10]}
  - {id: s7, role: huyk_talk, dur_s: [5, 10]}
  - {id: s8, role: outro, dur_s: [3, 5]}
```

**Bộ footage theo sản phẩm (đã chốt):** mỗi sản phẩm có một bộ footage riêng (thư mục `[Mã SP + Tên SP]`). Video về sản phẩm X chỉ lấy các role trong `product_set_required` từ bộ của X. Không map chéo giữa các mã, kể cả khi trùng tên (vd `N0017` và `N620144` cùng là "Nhẫn mắt thần Horus" nhưng là 2 bộ khác nhau). Footage dùng chung (HuyK, stock, sưu tầm, outro) không bị giới hạn này.

## 4. Các bước chi tiết

### Bước 1 — Coverage check (code, ~0 chi phí)
Gọi Catalog API của Media Hub (03 §8). Với từng slot: đếm segment `approved` thỏa role + SKU + step + `duration ≥ dur_min` + chưa dùng trong cooldown. Thiếu → nếu role của slot nằm trong danh sách được phép sinh và `job.allow_ai_gen=true` → `GEN_PENDING` (AI Asset Studio, [08](./08-ai-asset-studio-generate-bo-sung.md)); ngược lại → `MISSING_ASSET` + phiếu bổ sung kho (03 §5), **không gọi LLM/TTS**.

### Bước 2 — Script (LLM `script_writer`)
Input gọn: facts SKU từ Product Master (02 §6, có `fact_id`, chỉ dòng `approved`), danh sách slot, **3–5 viral item cùng template/angle, perf_tier=top**, 2 item `weak` làm ví dụ âm, Editorial Bible HuyK (xưng hô "mình/HuyK", câu kết "Mình là HuyK đến từ Viễn Chí Bảo", từ cấm), tóm tắt coverage (để không viết cảnh kho không có).

Output schema:

```json
{
  "angle": "craft_difficulty",
  "viral_ref_id": "VR-0012",
  "hook_text": "Mẫu nhẫn này mỗi lần khách đặt, thợ nhà HuyK chỉ biết nhìn nhau...",
  "lines": [
    {"slot": "s1", "vo": "…", "on_screen": "…", "fact_ids": [], "visual_intent": "macro mặt nhẫn, đá xanh bắt sáng"},
    {"slot": "s3", "vo": "…", "fact_ids": ["F-N0017-02"], "visual_intent": "gắn đá chủ, cận nhíp", "craft_step": "gan_da_chu"}
  ],
  "cta": "Mình là HuyK đến từ Viễn Chí Bảo.",
  "music_mood": ["touching", "warm"],
  "risk_flags": []
}
```

Validator (code): đúng schema · mọi số/chất liệu/giá phải có `fact_id` tồn tại · **không bịa câu chuyện khách hàng** (nếu `angle=customer_story` thì phải trích `viral_item.is_true_story` của **chính SKU** hoặc từ kho kịch bản đã duyệt) · độ dài VO mỗi slot ≤ `dur_max × tốc độ đọc` (vi ≈ 4.5 âm tiết/s, cấu hình theo giọng) · không chứa từ cấm.

**G1** bật khi: claim mới chưa có trong kịch bản đã duyệt, `risk_flags` ≠ ∅, hoặc angle mới. Biến thể trong khung đã duyệt → bỏ qua G1.

### Bước 3 — Voice
| Loại slot | Xử lý |
|---|---|
| `huyk_talk` (HuyK nói tại hình) | **Ưu tiên 1, footage thật:** segment có `verified_text` khớp ý câu (tìm bằng embedding transcript) → giữ hình + tiếng gốc; script được chỉnh quanh câu thật đó. **Ưu tiên 2, avatar AI:** HeyGen tạo HuyK nói đúng câu script (ngôn ngữ của job, giọng clone ElevenLabs), xem [08](./08-ai-asset-studio-generate-bo-sung.md). **Dự phòng:** `huyk_silent` + VO. Không bao giờ lồng giọng khác lên miệng đang nói câu khác. |
| Còn lại | TTS từng câu (giọng clone đã được HuyK cho phép; ngôn ngữ theo market) → **đo duration thật** → alignment word-level → subtitle. |
| `voice_mode=none` | Chỉ nhạc + chữ; độ dài slot theo template. |

Chuẩn hóa trước TTS: số, đơn vị (18K → "mười tám ca"), tên riêng (HuyK, Viễn Chí Bảo, Moissanite) theo từ điển phát âm. Cache key: `hash(text_norm + voice_id + model + settings)`.

### Bước 4 — Clip selection (code + embedding)

```
for slot in template.slots (theo thứ tự):
   need = slot.duration_after_voice                  # từ bước 3
   C = hard_filter(segments):
        status=approved, rights_status ∈ {owned, licensed, collected}, role ∈ slot.role,
        sku == job.sku nếu role ∈ product_set_required (footage sưu tầm không bao giờ lấp role này),
        không có watermark bên thứ ba trong khoảng src được dùng,
        craft_step thỏa step_seq (≥ step của slot trước, ưu tiên step kế tiếp),
        usable_len ≥ min_shot_len (0.8s), không dùng trong cooldown kênh (30 ngày),
        không trùng source range với slot khác của cùng video
   rank by score = 0.35*semantic(visual_intent, description/embedding)
                 + 0.20*quality.score
                 + 0.15*continuity(segment trước: cùng SKU/ánh sáng/hướng)
                 + 0.15*freshness(1 - usage_count chuẩn hóa)
                 + 0.15*action_match(craft_step, motion_level)
   fill slot bằng 1..n shot (top-k, đa dạng asset) cho tới khi tổng ≈ need
```

- `semantic` = cosine(embedding(visual_intent), segment.embedding). Lấy top 30–50 ứng viên sau lọc cứng; LLM **không** chọn clip (chỉ khi editor yêu cầu "thay cảnh bằng…").
- Mỗi shot dùng `best_in/out` làm tâm; độ dài shot theo style preset (mặc định 1.2–2.5s, như project thật).
- Thiếu ứng viên: thử nới `step_seq` sang step lân cận → đổi slot sang `stock_action` (nếu template cho phép) → sinh bằng AI nếu policy cho phép (08) → `MISSING_ASSET`. **Không** thay bằng SKU khác. Asset AI bị phạt −0.1 điểm để footage thật được ưu tiên khi ngang điểm; tỷ lệ AI ≤ 30% thời lượng, không 2 shot AI liền nhau.

### Bước 5 — FX selection
Theo [07](./07-kho-am-thanh-hieu-ung.md): nhạc theo `music_mood` + thời lượng + market; SFX theo `craft_step` và điểm cut; transition theo style preset; text style; logo theo `rules.logo_overlay`.

### Bước 6 — Timeline Planner (code thuần)
1. Tính thời lượng slot: `dur = clamp(voice_dur(slot) + pad_out, dur_min, dur_max)`; nếu VO > `dur_max` → quay lại bước 2 rút câu (tối đa 2 lần) **trước khi** tăng tốc độ đọc.
2. Đặt shot: cắt tại ranh giới từ/câu (word timestamps) hoặc beat nhạc gần nhất trong ±4 frame.
3. Speed: shot `craft` được 1.0–2.0× (như project thật) để vừa slot; `huyk_talk` luôn 1.0×.
4. Punch-in: scale 1.0–1.3 lấy tâm theo vùng `subject` (hands/product) nếu có bbox; mặc định 1.0.
5. Transition 14 frame (0.467s @30fps) theo preset; transition ăn vào handles hai bên, không cắt mất từ đang nói.
6. Sinh Timeline IR (xem 05) → validate (gap/overlap, source bounds, tổng thời lượng).

### Bước 7–8 — Render & QC
FFmpeg compiler → `preview.mp4` (720p, nhanh) và `final.mp4` (1080×1920, 30fps, H.264 High, AAC 48k, −14 LUFS cho social). QC tự động (06 §2). Fail kỹ thuật → tự sửa có quy tắc 1 lần → vẫn fail → `NEEDS_REVIEW`.

## 5. Human-in-the-loop tại G2

Màn hình duyệt: video bên trái; storyboard theo slot bên phải (mỗi slot: thumbnail, nguồn, fact_id, lý do chọn, cảnh báo).

| Hành động | Hệ thống làm |
|---|---|
| **PASS** | Khóa revision, xuất package (final.mp4 + subtitles.srt + manifest), ghi `segment_usage`. |
| **Sửa nhanh** (trên web) | "Thay shot 3", "đổi nhạc", "sửa chữ câu 2", "giảm nhạc 3dB", "đổi hook" → tạo `change_set` → chỉ chạy lại bước bị ảnh hưởng → bản revision mới → QC → duyệt lại. Có thể gõ lệnh tự nhiên; LLM chuyển thành change_set để người xem trước. |
| **CẦN SỬA (CapCut)** | Bấm *Export CapCut* → adapter sinh project từ IR hiện tại → tải về/đồng bộ vào máy editor → editor sửa & tự xuất. Hệ thống ghi nhận "đã chuyển CapCut" + (tùy chọn) editor upload bản cuối để lưu số liệu. |
| **LOẠI** | Chọn lý do (sai SKU, nhịp chán, hook yếu, giọng sai, cảnh xấu…) → lưu làm dữ liệu cải tiến. |

Đo được: tỷ lệ PASS ngay, tỷ lệ sửa nhanh, tỷ lệ phải mở CapCut, phút công/video — đây là KPI chính của hệ thống.

## 6. Biến thể & chống lặp

- Biến thể của cùng SKU phải khác ở **ít nhất 2/4 trục**: angle/viral_ref, hook shot, bộ shot thân (Jaccard source-range < 0.5), nhạc.
- Fingerprint video = chuỗi `(segment_id, in, out)` + hash transcript VO. So với lịch sử theo kênh trước khi giao.
- Cooldown segment theo kênh (mặc định 30 ngày; outro/logo được miễn).

## 7. State machine của job

```
CREATED → COVERAGE_OK → SCRIPT_READY → (G1) SCRIPT_APPROVED → VOICE_READY → CLIPS_SELECTED
→ TIMELINE_READY → RENDERED → QC_PASSED → (G2) PASSED → DELIVERED
                                             ├→ REVISING → TIMELINE_READY …
                                             └→ CAPCUT_EXPORTED → (EDITED_EXTERNALLY)
Nhánh sinh bổ sung: COVERAGE_GAP → GEN_PENDING → GEN_REVIEW → COVERAGE_OK
Nhánh lỗi: MISSING_ASSET | NEEDS_REVIEW | RETRYABLE_ERROR (≤2 lần, backoff) | BLOCKED (quyền/SKU) | REJECTED | CANCELLED
```

Mỗi bước lưu output bất biến + `input_fingerprint`. Revision mới chỉ invalid các node phụ thuộc thay đổi.
