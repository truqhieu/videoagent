# Phụ lục A — Phân tích project CapCut mẫu thật (Nhan_Than_Hor)

> Báo cáo kỹ thuật gốc (tiếng Anh) do agent phân tích `Tài Nguyên VCB Real Sample/3.7 Project Capcut/Nhan_Than_Hor/` (chỉ đọc). Đơn vị CapCut = microsecond. Dùng làm tham chiếu khi viết CapCut adapter (xem 05).


Source: `.../3.7 Project Capcut/Nhan_Than_Hor/` (read-only). All durations in seconds (CapCut raw = microseconds).

## 1. File inventory
- NOT encrypted. All JSON plain text (crypto_key_store.dat exists but draft JSON readable; draft.extra / template*.tmp are opaque base64-ish blobs, ignore).
- **Authoritative timeline = `draft_info.json`** (root, 580 KB; identical bytes to `draft_info.json.bak`, `template-2.tmp`, and `Timelines/8E30.../draft_info.json`). Schema `new_version 185.0.0`, duration 64,166,666 us.
- `Timelines/8E30D78D-.../draft_content.json` (351 KB) = OLDER snapshot of same timeline (49.2 s, 32 video segs, 10 JP texts, 4 VO audio segs + music; draft_content.json.bak 345 KB older still). Use only for history. Older version had different JP text and VO split into 4 segments of the MiniMax mp3.
- `Timelines/project.json`: timeline index (1 timeline "Dong thoi gian 01"). `timeline_layout.json`: layout only.
- `subdraft/0D297E57.../draft_content.json` = "Clip ghep4" compound AUDIO (VO, 61.6 s; renders to `Resources/combination/A306498E..._audio.m4a`). `subdraft/E3D2D619.../` = "Clip ghep3" compound VIDEO (4.97 s). Both subdraft files are empty shells (only a self-referencing placeholder, no inner tracks) - the inner edit of compounds is NOT recoverable; only the flattened m4a audio exists.
- `draft_meta_info.json`: draft_name Nhan_Than_Hor, draft_new_version 164.0.0, draft_root_path `/Users/pp/Movies/CapCut/User Data/Projects/com.lveditor.draft`, materials size 631 MB, tm_duration 64166666, 8 draft_materials entries.
- `draft_settings`: cloud_last_modify_platform=mac, real_edit_seconds=6365 (~1.8 h editing).
- `materials/video` 33 mp4 (561 MB), `materials/audio` (MiniMax VO mp3 49.68 s; CapCut cached music mp3 93.6 s), `materials/beat`, `color_match/*.match+png` (CapCut "color match" reference feature files), `Resources/combination/*.m4a` (5 compound audio renders), `Resources/audioAlg/*.wav`, covers.
- Platform: created `windows 10.0.19045 / CapCut 8.3.0` (app_id 359289, app_source cc = CapCut international), last modified `mac 12.7.6 / CapCut 9.4.0`. Music cache path contains `com.lemon.lvoverseas` (CapCut Mac App Store). So the editor round-tripped Win -> Mac.
- Media path convention: relative-ish placeholder `##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/materials/video/<file>` for imported-copy media (material_save_mode 0 = copied into project). Exceptions with ABSOLUTE editor-machine paths: `/Users/pp/Downloads/IMG_9380.MOV` (finished-product phone footage) and music cache `/Users/pp/Library/Containers/com.lemon.lvoverseas/.../Cache/music/39716e...mp3`; effect/transition resource paths also absolute under `.../Cache/effect/<id>/<hash>`.

## 2. Canvas / fps / duration
- 1080x1920, ratio 9:16, background none. fps 30.0, color_space 0. Duration 64.167 s (1925 frames). config.video_mute=true (video tracks muted; audio comes only from audio tracks). maintrack_adsorb=true.
- Source clips: mostly 1080x1920 portrait; "1. VE PHAC THAO-12.mp4" is 1440x2560 (still 9:16).

## 3. Tracks (4)
| # | type | segs | notes |
|---|---|---|---|
| 0 | video (main, attr=1) | 33 | no overlay track, no PiP |
| 1 | text | 14 | JP subtitle lines |
| 2 | audio | 1 | VO compound "Clip ghep4", vol 1.0, 0-61.6 |
| 3 | audio | 1 | music "Beautiful Acoustic Guitar", vol 0.32, src in 1.967, 0-64.167, fade-out 1.1 s, no fade-in |
No sticker, effect (VFX), filter (LUT) or logo/overlay tracks. No keyframes anywhere (keyframes dict all empty; common_keyframes empty on all segs). No in/out animations (material_animations all empty shells). No time_marks. No volume ducking: VO and BGM both constant (music is just pre-lowered to 0.32).

### Video segments (start-end s | dur | material | src start+dur | speed | scale | pos x,y | transition on seg | colour adj)
Position = CapCut normalized (-1..1 = half canvas); scale uniform. "Kết hợp"=Combine (classic, overlap, 0.467 s), "Mờ đen"=Fade to black, "Chồng lên nhau"=Overlay (all 0.467 s, CapCut cloud ids).

| i | time | dur | material | src in+len | spd | scale | pos | trans |
|---|---|---|---|---|---|---|---|---|
|0|0.00-2.30|2.30|银莫桑石戒指冰蓝湖水绿戒指#...(1).mp4 (Chinese Douyin stock ring clip)|0+2.3|1|1.308|-0.307,0.071|Chồng lên nhau; brightness -0.06, contrast +0.14|
|1|2.30-3.27|0.97|same|2.3+0.97|1|1.308|-0.137,0.245|-|
|2|3.27-4.93|1.67|same|7.37+1.67|1|1.250|-0.156,0.152|-|
|3|4.93-5.97|1.03|same|5.5+1.03|1|1.0|0,0|Mờ đen|
|4|5.97-8.47|2.50|1. VE PHAC THAO-12.mp4 (sketch)|0+2.5|1|1.0|0,0|Kết hợp|
|5|8.47-9.77|1.30|260525_CTX_N620144_..._Do-nguyen-lieu_DTA01_6|0.83+1.3|1|1.138|0,0.138|Kết hợp|
|6|9.77-10.90|1.13|..._Danh-lua_DTA01_8|0.63+1.13|1|1.0|0,0|Kết hợp|
|7|10.90-12.23|1.33|..._Nung-bac_DTA01_14|0+1.33|1|1.412|0,0.412|Kết hợp|
|8|12.23-13.60|1.37|..._Nung-bac_DTA01_3|4.43+1.82|1.33|1.518|0.119,0.518|Kết hợp|
|9|13.60-15.03|1.43|..._Do-khuon_DTA01_2|7.07+1.98|1.38|1.197|-0.160,0.197|Kết hợp|
|10|15.03-16.07|1.03|..._Can-bac_DTA01_6|1.1+1.32|1.28|1.112|0.111,-0.088|Kết hợp|
|11|16.07-18.07|2.00|..._Dap-thanh-bac_DTA01_4|1.03+2.44|1.22|1.080|0,0.056|Kết hợp|
|12|18.07-20.13|2.07|..._Dap-tron-thanh-bac_DTA01_1|7.43+4.13|2.0|1.229|-0.163,0.229|Kết hợp|
|13|20.13-21.50|1.37|..._Dap-tron-thanh-bac_DTA01_3|2.83+2.01|1.47|1.810|-0.213,0.809|Kết hợp|
|14|21.50-23.30|1.80|..._Cua-bac-thua_DTA01_2 (material_name empty)|8.9+1.8|1|1.0|0,0|Kết hợp|
|15|23.30-26.27|2.97|8. CUA BAC THUA-10.mp4|0.04+4.06|1.37|1.0|0,0|Kết hợp|
|16|26.27-28.27|2.00|..._Han-noi_DTA01_5|2.40+3.46|1.73|1.172|-0.041,-0.172|Kết hợp|
|17|28.27-29.67|1.40|..._Dua_DTA01_31|1.63+1.99|1.42|1.0|0,0|Kết hợp|
|18|29.67-33.30|3.63|12. DUA-15.mp4|1.57+4.76|1.31|1.0|0,0|Kết hợp|
|19|33.30-35.43|2.13|..._Dua_DTA01_4|2.87+2.13|1|1.149|0,0.119|Kết hợp|
|20|35.43-38.37|2.93|..._Dua-mat-chau-da_DTA01_6|0.83+2.93|1|1.210|-0.089,-0.110|Kết hợp|
|21|38.37-43.07|4.70|**"Clip ghep3"** compound (4.97 s, path empty; contents unrecoverable)|0+4.98|1.06|1.0|0,0|Mờ đen|
|22|43.07-45.50|2.43|N620112_Nhẫn mắt thần Horus đá xanh_Khoan chi tiết_DTA01_190326_ (7)|0+2.43|1|1.227|-0.114,0.096|Kết hợp; bright -0.11, contr +0.10, temp +0.11, color_match 0.72|
|23|45.50-46.73|1.23|..._Khoan chi tiết_..._(6)|0+1.79|1.45|1.203|-0.202,0.080|Kết hợp; contrast .09, sat .16, temp -0.38, light_sens -0.21, color_match .81|
|24|46.73-47.90|1.17|..._Đính đá viền_..._(9)|3.03+2.33|2.0|1.273|-0.057,-0.073|Kết hợp; shadow/white -0.23, light_sens -0.44, color_match .8|
|25|47.90-49.60|1.70|..._Đính đá viền_..._(10)|10.67+2.96|1.74|1.184|0,-0.082|Kết hợp; white/black -0.11, temp +.16, color_match .8, color_correct .8|
|26|49.60-51.17|1.57|N620120_Nhẫn Mắt Thần Horus đá xanh lá HK49336_Nhìn đá_DTA04_300326_2|10.13+1.57|1|1.0|0,0|Kết hợp|
|27|51.17-52.47|1.30|N620120..._Đính đá_DTA04_300326_2|1.47+1.3|1|1.123|-0.061,-0.069|none|
|28|52.47-53.83|1.37|N620120..._Đính đá_DTA04_300326_1|5.4+1.37|1|1.147|0.057,0.062|Kết hợp|
|29|53.83-55.50|1.67|N620112..._Gắn đá chủ_..._(4)|0+1.67|1|1.161|0.103,0|Kết hợp; sat .15, temp +.43|
|30|55.50-57.00|1.50|N620112..._Đánh bóng_..._(5)|7.33+1.5|1|1.0|0,0|Mờ đen|
|31|57.00-59.57|2.57|IMG_9380.MOV (phone, abs path /Users/pp/Downloads)|0.6+2.57|1|1.0|0,0|Kết hợp; contrast .10, smart_color_adjust .8, color_correct .8|
|32|59.57-64.17|4.60|IMG_9380.MOV|27.03+4.6|1|1.0|0,0|none; contrast .06, smart_color_adjust .8|

Observations: every seg has volume 0 (video_mute). Speed ramp is constant per segment (not curve), 1.0-2.0x, mostly 1.2-1.7x on chế tác cuts; speed mode 0 (normal). Scale 1.0-1.81 with offsets = manual punch-in/re-framing (crop to ring). Transition attached to a seg is stored on that seg (CapCut applies it between that seg and the next; verify empirically before relying on it). Average cut ~1.9 s, median ~1.5 s: fast montage. No hold on a single shot > 4.7 s except end product (4.6 s).

### Text segments (track 1, 14 segs, JP only, all same style)
Position (0,-0.424) ~ lower third (y≈ +0.29*1920 below centre... i.e. 407 px below centre), scale 1, no animation. Style: font = CapCut system font `/Applications/CapCut.app/Contents/Resources/Font/SystemFont/en.ttf` (default; JP glyphs via fallback), font_size 6.0 (text_size 30), fill black #000000, alignment 1 (center), line_spacing 0.25, background white (#ffffff) alpha 0.5 style 1 rounded (radius 0.097), no stroke, no shadow, no bold. i.e. default plain subtitle box. Timing is back-to-back (no gaps), each line = one VO sentence/phrase; manual `\n` line breaks, 2 lines max, ~18-22 JP chars per line.
Lines: 0-5.97 hook ("A wounded eye... symbol of healing"), 5.97-8.47 "That is the Eye of Horus (Wadjet)", 8.47-13.43 myth (Horus vs Set), 13.43-15.63 "eye was restored", 15.63-21.3 meaning protection/healing/rebirth, 21.3-27.37 "when making this ring I didn't want to just reproduce ancient design", 27.37-32.87 strength + quiet depth, 32.87-37.4 simple design, balance, 37.4-39.5 expression changes, 39.5-42.93 adjust every line, 42.93-47.33 strong but not heavy, 47.33-51.97 / 51.97-56.87 "no matter wounds, one can heal again", 56.87-64.17 CTA question "Do you feel protection or rebirth more strongly?" (engagement question outro).
Older draft (Timelines/draft_content.json) had a different, more "maker intro" script (10 lines; "I spent a whole day..."); script was rewritten between versions.

### Audio
- Track 2 VO: "Clip ghep4" compound m4a 61.6 s (source MiniMax TTS, `MiniMax_2026-05-28_13_51_44_HUYK.JP.mp3`, 49.68 s raw; HUYK = voice name; JP = Japanese; stretched/edited into 61.6 s compound, i.e. VO re-timed with pauses). vol 1.0, no fade.
- Track 3 BGM: "Beautiful Acoustic Guitar", CapCut library, category "Chua lanh" (Healing), music_id 7274000459413014567, source_platform 0, app_id 1775 -> online library track (licence = CapCut commercial library; cache mp3 present). vol 0.32, fade-out 1.1 s. Beats material present (beat detection off).
- No SFX. No ducking/envelope.

## 4. Materials summary
- Videos 33 refs (29 distinct files + 2 compound/IMG): 3 Chinese stock clip refs (one file; third-party, likely Douyin download, "银莫桑石戒指..." = silver moissanite ring), 3 generic numbered clips (`1. VE PHAC THAO-12`, `8. CUA BAC THUA-10`, `12. DUA-15` = sketch/saw/file steps; numbered-index naming, different from VCB convention), many VCB-convention clips, IMG_9380.MOV (iPhone 43.9 s finished-product reel; only used 0.6-3.2 and 27.0-31.6 s).
- VCB naming patterns seen: (A) `YYMMDD_CTX_N<6-digit product>_<Product-slug>_<Step-slug>_DTA01_<n>.mp4` e.g. `260525_CTX_N620144_Nhan-mat-than-Horus_Khoan-hoc-da_DTA01_4` (CTX = chế tác; date 2026-05-25; ASCII slug, step e.g. Do-nguyen-lieu, Danh-lua, Nung-bac, Do-khuon, Can-bac, Dap-thanh-bac, Dap-tron-thanh-bac, Cua-bac-thua, Han-noi, Dua, Dua-mat-chau-da, Khoan-hoc-da); (B) `N<6d> <Vietnamese title with diacritics>_<Step with diacritics>_DTA01_190326_ (n).mp4` (older Windows/phone export style, date as DDMMYY=19/03/26; steps Khoan chi tiết, Đính đá viền, Gắn đá chủ, Đánh bóng, Hoàn thành); (C) `N620120_Nhẫn Mắt Thần Horus đá xanh lá HK49336_<Step>_DTA04_300326_n.mp4` (HK49336 = product code, DTA04 = camera/operator id, date 30/03/26). Three different product codes (N620144, N620112, N620120) mixed in one video: editor mixed footage from sibling variants of the same Horus ring. Diacritics in filenames -> macOS NFD/NFC mismatch risk.
- Unused materials in folder: Khoan-hoc-da x3 (4/15/20), `Hoàn thành` (3),(5) (finished-product clips replaced by IMG_9380.MOV).
- Texts: 14, all JP, default style (see above).
- Effects (adjust): 34 CapCut adjust-panel entries (brightness, contrast, saturation, temperature, highlight/shadow/white/black, light_sensation, color_match 0.7-0.8, color_correct 0.8, smart_color_adjust 0.8) all effect_id 7501974767453474064 (built-in adjust); applied on only 8 of 33 segs (0, 22-25, 29, 31, 32) to unify look of mismatched sources. No named filters/LUT, no video effects.
- Transitions: 29 total (per-segment listing) = Kết hợp (Combine, id 6724845717472416269) x25, Mờ đen (Fade to black, id 6724239388189921806) x3 (seg 3, 21, 30), Chồng lên nhau (Overlay, id 6917578154089386498) x1 (seg 0). Segments 1,2,27,32 have none. All 0.467 s (466,666 us), cloud-downloaded resources (cached in CapCut effect cache). Categories "Cổ điển" (Classic) / "Đang thịnh hành". They are free library items; no "Pro" flag fields observed (no `is_vip`/pro attrs), but all are ONLINE resources needing the CapCut effect cache/network. Music online library as well.
- Stickers/logo/overlay: none. Subtitles: none VN/EN (JP only). No cover text. Canvas blur/colour bg: none.
- Compound clips: "Clip ghep3" (video 4.97 s) and "Clip ghep4" (audio 61.6 s) in `materials.drafts` with draft_file_path to subdraft folders.

## 5. Scene sequence vs A4 template
A4 template: Sản phẩm 5 s -> HuyK 4 s -> Chế tác 5 s -> HuyK 4 s -> Chế tác 5 s -> montage -> Sản phẩm hoàn thiện 5-10 s -> outro 5 s.

| time | role guess | source | notes |
|---|---|---|---|
|0.0-5.97|hook (product/stock)|Chinese stock ring clip (3 cuts, punch-in 1.25-1.31)|6 s hook; third-party footage, not VCB product; JP VO line 1|
|5.97-8.47|concept/sketch (design lead-in)|1. VE PHAC THAO-12|2.5 s sketch; VO "That is the Eye of Horus"|
|8.47-21.50|chế tác (stage 1: material, melt, pour, hammer)|CTX N620144 Do-nguyen-lieu -> Dap-tron-thanh-bac|7 cuts, 1.0-2.1 s each, speed up to 2x|
|21.50-33.30|chế tác (cut, solder, file)|Cua-bac-thua, 8. CUA BAC THUA, Han-noi, Dua x2|5 cuts|
|33.30-38.37|chế tác (file/stone seat)|Dua, Dua-mat-chau-da|2 cuts|
|38.37-43.07|montage / compound|Clip ghep3 (unknown inside; Mờ đen transition in)|chapter break; 4.7 s|
|43.07-57.00|chế tác montage (drill, set stones, polish) from N620112/N620120|9 cuts, color-matched (adjust) because different sources|fast montage 1.2-2.4 s, speed to 2x|
|57.0-64.17|sản phẩm hoàn thiện (finished product)|IMG_9380.MOV 2 cuts (2.57 s + 4.6 s)|7.2 s; ends with JP CTA question text|
|(none)|HuyK on-camera|-|ABSENT; "HUYK" only a TTS voice id; no talking-head, no VCB logo outro (0 s outro; ends on product + CTA text)|

Comparison: sample is VO-driven, single narrative (myth + craft) rather than A4's alternating Sản phẩm/HuyK/Chế tác blocks. No dedicated HuyK segments, no separate 5 s outro card, no product-first intro (hook is a stock clip). Chế tác ~45 s of 64 s (70 %); finished product 11 % ; hook+sketch 13 %. Cut rhythm ~1.9 s. Segment durations are NOT fixed multiples of A4 blocks; they are cut to VO sentences (text boundaries 5.97, 8.47, 13.43, 15.63, 21.3, 27.37, ... align with some video cuts: 5.97 hook->sketch at text 1->2; 8.47 sketch->CTX at text 2->3; 38.37 compound at ~text 8/9; 56.87 text 13 starts ~when finished product begins at 57.0).

## 6. Implications for an automated generator
Needed features (minimum to reproduce): 
1. Canvas 1080x1920/30fps, one video track + one text track + two audio tracks; video_mute true (or per-seg volume 0).
2. Per-segment: source trim (in/duration), constant speed 1.0-2.0, uniform scale 1.0-1.8 + position offset (crop-in re-framing; derive from subject detection or default 1.0-1.2), optional adjust values (brightness/contrast/saturation/temperature/color_match) for look matching.
3. Transitions: 0.467 s Combine/Fade-to-black between most cuts. Online CapCut resources (need effect_id + resource_id; in a generated draft CapCut must have them cached or will download on open). Safer: crossfade/cut only, or use the same ids and accept online fetch. Also consider rendering with ffmpeg instead of CapCut draft if offline determinism matters.
4. Text: simple subtitle style (system font, black 6pt on white 50% box, lower third y=-0.42, no animation); for JP need a CJK-capable font path (relative to CapCut install on editor machine: `/Applications/CapCut.app/.../en.ttf` is machine-specific). Auto line-break at ~18-22 chars/line, max 2 lines. Text timings = VO sentence timings (needs forced alignment / TTS word timestamps; sample uses back-to-back, gap-free).
5. Audio: VO full volume + BGM at ~0.32 constant with 1.1 s fade-out (no ducking needed; ducking is a simplification win: pre-lower BGM). BGM from CapCut online library (licence; generator should use local/licensed mp3 instead). VO generated by MiniMax TTS (voice HUYK, JP); VO re-timed to 61.6 s -> generator should build VO timeline first, then fit cuts to it.
6. Keyframes: not used; no stickers/logo/overlay/VFX; compound clips avoided -> unnecessary for MVP.
7. Path handling: CapCut json uses placeholder `##_draftpath_placeholder_<UUID>_##/materials/video/<file>` or absolute paths; generator should emit absolute paths (CapCut accepts) or the placeholder with the draft's `draft_meta_info` UUID, copy media into `materials/video`, and handle NFD/NFC diacritics and spaces (names like `... (7).mp4`, Chinese hashtags, `#`) in names. Windows vs mac path forms both appear in sibling drafts.
8. Media library semantics: filename parsing for role/step (`CTX`=chế tác, step slug ordering: Do-nguyen-lieu, Danh-lua, Nung-bac, Do-khuon, Can-bac, Dap, Cua, Han-noi, Dua, Khoan, Dinh-da, Gan-da, Danh-bong, Hoan-thanh) gives natural chronological craft order (editor followed it exactly). Source clips are long (5-43 s) with 1-5 s windows used -> need in-point selection (editor used arbitrary in offsets) and speed up.
9. Rights/quality notes: hook uses third-party Chinese stock; mixed product codes; phone footage with absolute Downloads path; Pro/online resources (transitions, BGM) must be validated.

## Unresolved questions
- What is inside "Clip ghep3" (38.4-43.1 s)? Subdraft empty; check older `Timelines/.../draft_content.json` segs 19-20 region? (older draft lacks it as compound too.)
- Does "HuyK" in A4 mean on-camera founder clips? Here HUYK appears only as TTS voice name; confirm.
- Is hook (Chinese stock) intended practice or a placeholder?
- Exact transition semantic (attached to left or right seg) not verified in CapCut UI.
- (Transition counts resolved above.)
