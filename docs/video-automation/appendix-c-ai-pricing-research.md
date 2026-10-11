# AI API pricing + capabilities - VCB automated short-video system

Checked: **2026-10-10**. All USD. Full machine-readable rows: `ai-pricing-research.json` (130 rows; 12 flagged `verified:false`).
"V" = read on vendor page this session. "U" = unverified (third-party / derived / snippet only).
Derived numbers are my arithmetic, labelled as such.

## 0. Time-sensitive things to know first
- **Gemini 3.x prices step up 2027-01-01**: 3.8/3.6-flash $0.75/$3.75 -> $1.50/$7.50; Gemini TTS flash $9 -> $18 per 1M audio tok; Lite TTS $6 -> $12. Budget for 2027 numbers.
- **ElevenLabs v4 promo $0.022/1K chars ends 2026-10-12** (list $0.08/1K). Plan char allowances on the page (Creator 1M, Pro 4.5M ...) are computed at promo rate; expect ~72% fewer chars after.
- **Sora 2 API is gone** (removed 2026-09-24 per OpenAI deprecations page). No replacement.
- MiniMax Music closed to new users after 2026-08-20. `gemini-2.5-flash-image` scheduled shutdown 2026-10-02 (per Gemini pricing page).
- Claude 4.7+ tokenizer yields ~30% more tokens for same text (matters for VI/TH/JA text cost). Claude Sonnet 5 intro price ($2/$10) made permanent.

## 1. Vision tagging (12-frame contact sheet or video)
Sources: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), [OpenAI pricing](https://developers.openai.com/api/docs/pricing). All V.

| Model | In /1M | Out /1M | Notes |
|---|---|---|---|
| gemini-2.5-flash-lite | 0.10 | 0.40 | Older gen, still available. Batch 50% off |
| gemini-3.1-flash-lite | 0.25 | 1.50 | Stable |
| gemini-3.5-flash-lite | 0.30 | 2.50 | Stable |
| gemini-3.6 / 3.8-flash | 0.75 | 3.75 | **$1.50/$7.50 from 2027-01-01** |
| gemini-3.1-pro-preview | 2.00 (>200k: 4.00) | 12.00 (>200k: 18.00) | Preview |
| claude-haiku-5-5 | 0.10 (>100k prompt: 0.50) | 0.50 (>100k: 2.50) | Batch 0.05/0.25. 1M ctx |
| claude-sonnet-5-5 | 2.00 | 10.00 | |
| claude-opus-5-5 | 4.00 | 20.00 | |
| claude-fable-5-1 | 10.00 | 50.00 | Top public tier |
| gpt-6-luna | 0.10 | 0.50 | "mini/nano" now = Luna tier |
| gpt-5-nano / gpt-5-mini / gpt-5.4-mini | 0.05 / 0.25 / 0.75 | 0.40 / 2.00 / 4.50 | Older gen; vision support not confirmed per model |
| gpt-6.1-sol / gpt-6-astra | 2.00 / 10.00 | 10.00 / 50.00 | |

Cached-input and batch (50%) discounts exist for all three vendors.

**Tokens per image / second of video**
- Gemini 3.x ([media-resolution doc](https://ai.google.dev/gemini-api/docs/media-resolution), V): image default 1,120 tok (low 280, med 560, ultra_high 2,240). Video frame 70 tok (high 280) at 1 fps + audio 32 tok/s => **~102 tok/s of video** at default. 1080p image = 1,120 tok (resolution-capped, not size-based).
- Gemini 2.5-gen ([image doc](https://ai.google.dev/gemini-api/docs/image-understanding), [video doc](https://ai.google.dev/gemini-api/docs/video-understanding), V): 258 tok per 768px tile (1080p ~1,548 tok est.); video 258 tok/frame + 32 audio = **~290 tok/s** (66/frame at low res => ~98 tok/s). 1 fps default; fps and start/end offsets configurable. Up to 3,600 images/request.
- Claude ([vision doc](https://platform.claude.com/docs/en/build-with-claude/vision), V): ceil(w/28)*ceil(h/28). 1920x1080 = **2,691 tok** on 4.7+ models, 1,560 on older. No native video. 600 imgs/request, 10MB each.
- OpenAI ([images guide](https://developers.openai.com/api/docs/guides/images-vision), V for astra): ceil(w/32)*ceil(h/32) x multiplier (astra 1.2): 1080p high = 2,040 patches ~2,448 tok; low detail ~173 tok. Luna multiplier not verified.

**Derived cost per clip** (1 contact-sheet 1080p image + 600 prompt tok + 500 out tok; excludes thinking tokens, caching, batch):

| Model | $/clip | $/1,000 clips |
|---|---|---|
| gemini-2.5-flash-lite | 0.00041 | 0.41 |
| gpt-6-luna (assumes ~2,448 img tok) | 0.00055 | 0.55 |
| claude-haiku-5-5 | 0.00058 | 0.58 |
| gemini-3.1-flash-lite | 0.00118 | 1.18 |
| gemini-3.5-flash-lite | 0.00177 | 1.77 |
| gemini-3.8-flash | 0.00316 (0.0063 in 2027) | 3.17 |
| gemini-3.1-pro-preview | 0.00944 | 9.44 |
| gpt-6.1-sol | 0.0111 | 11.10 |
| claude-sonnet-5-5 | 0.0116 | 11.58 |
| claude-opus-5-5 | 0.0232 | 23.16 |

Gemini native 10 s video clip (default res) costs about the same as one contact sheet (~1,020 tok on 3.x; ~2,900 on 2.5-gen). Bill is dominated by output; Gemini thinking tokens count as output - cap thinking.
Accuracy of each model at jewelry tagging is **not benchmarked here**; run a 100-clip bake-off.

## 2. Script writing / planning LLM
Same price rows as section 1. Derived cost for one script (3k in / 1.5k out tok): Haiku 5.5 $0.001; GPT-6 Luna $0.001; Gemini 3.8 Flash $0.008; Sonnet 5.5 $0.021; GPT-6.1 Sol $0.021; Gemini 3.1 Pro $0.024; Opus 5.5 $0.042; Fable 5.1 / GPT-6 Astra $0.105. Cost is trivial vs video/TTS; pick on quality.
- Context: Claude 5.5 family 1M ctx / 128k out ([models overview](https://platform.claude.com/docs/en/about-claude/models/overview)); GPT-6 family 1.05M / 128k ([OpenAI models](https://developers.openai.com/api/docs/models)).
- API IDs (V): `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-fable-5-1`; `gpt-6-luna`, `gpt-6.1-sol`, `gpt-6-astra`; `gemini-3.8-flash`, `gemini-3.1-pro-preview`.
- **Vietnamese quality: unknown.** Vendors claim multilingual; no public Vietnamese ranking of these models found (VinUni V-Bench launched Jul 2026, scores for the big US models not retrieved). Run own VI/TH/JA eval.

## 3. Speech-to-text with word timestamps
| Model | Price | Word ts? | VI/TH/JA | Source |
|---|---|---|---|---|
| ElevenLabs **Scribe v2** | $0.22/h = $0.0037/min (V) | Yes + diarization (32 spk) | VI & JA "Excellent" (<=5% WER), TH "Good" (10-20%) per vendor docs | [pricing](https://elevenlabs.io/pricing/api), [docs](https://elevenlabs.io/docs/capabilities/speech-to-text) |
| OpenAI whisper-1 | $0.006/min (V) | **Yes (only OpenAI model with it)** | Whisper langs | [pricing](https://developers.openai.com/api/docs/pricing), [guide](https://developers.openai.com/api/docs/guides/speech-to-text) |
| OpenAI gpt-transcribe | $0.0045/min (V) | **No** | not named | same |
| OpenAI gpt-4o-mini-transcribe / gpt-4o-transcribe | ~$0.003 / ~$0.006 per min (V, est. from tokens) | No | not named | same |
| Gemini gemini-3.5-transcribe | ~$0.005/min (audio in $0.003 + text out $0.002) (V) | Not documented | unknown | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| Google Cloud STT v2 Chirp 3 | $0.016/min **(U, aggregators)** | Offsets via enable_word_time_offsets, "experimental" | unknown | [OpenRouter](https://openrouter.ai/google/chirp-3) |
| Self-hosted Whisper large-v3 (faster-whisper) | **~$0.0005/min derived (U)** | Yes (+WhisperX alignment) | Weaker on VI/TH than EN | [RunPod](https://www.runpod.io/gpu-cloud/pricing) |

Self-host maths: RTX 4090 pod $0.89/h (RunPod page dated 2026-09-27; page structured data disagrees - verify), L4 $0.59/h, serverless 4090 $1.10/h. Community throughput for large-v3: 20-50x real-time on 4090, 12-16x on L4 (no rigorous benchmark found). => ~$0.02-0.045 per audio-hour at 100% utilisation; real cost is idle time + ops. At 10k videos/month x 1 min = 10k min = ~$37 on Scribe vs ~$5 + GPU idle self-hosted. Self-host only if you already run GPUs.
ElevenLabs Scribe max 3 GB / 10 h per file; extra for keyterm prompting (+$0.05/h).

## 4. TTS / voice cloning (price per 1K chars; assume ~1,000 chars ~ 1 min speech for VI - my assumption)
| Model | $/1K chars | VI | Notes | Source |
|---|---|---|---|---|
| ElevenLabs Eleven v4 | **0.08** (promo 0.022 to 2026-10-12) | Yes | 90+ langs, 10k chars/req, best quality | [pricing](https://elevenlabs.io/pricing/api), [models](https://elevenlabs.io/docs/overview/models) |
| ElevenLabs v4 Turbo | 0.04 (promo 0.011) | Yes | ~100 ms | same |
| ElevenLabs v3 / v3 Conversational | 0.08 / 0.04 | Yes | 70+ langs, 5k chars/req | same |
| ElevenLabs Multilingual v2 | 0.08 | **No** | 29 langs | same |
| ElevenLabs Flash v2.5 (row "Flash/Turbo" - mapping inferred) | 0.04 | Yes | 32 langs, 40k chars/req | same |
| MiniMax speech-2.8-hd | 0.10 ($100/1M) | Yes | word timestamps via subtitle_enable; 10k chars/req | [MiniMax pricing](https://platform.minimax.io/docs/guides/pricing-paygo), [T2A API](https://platform.minimax.io/docs/api-reference/speech-t2a-http) |
| MiniMax speech-2.8-turbo | 0.06 | Yes | | same |
| OpenAI gpt-4o-mini-tts | tokens: $0.60/1M text in + $12/1M audio out (~$0.015/min **U**) | Yes (voices EN-optimised) | custom voices w/ consent | [pricing](https://developers.openai.com/api/docs/pricing), [guide](https://developers.openai.com/api/docs/guides/text-to-speech) |
| OpenAI tts-1 / tts-1-hd | 0.015 / 0.030 | Yes | legacy | same |
| Google Cloud Chirp 3: HD | 0.030 (1M free/mo; snippet of official page) | Yes (vi-VN, th-TH, ja-JP) | Instant custom voice $0.060 | [GCP pricing](https://cloud.google.com/text-to-speech/pricing), [Chirp 3 HD docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd) |
| Gemini gemini-3.8-flash-tts | $9/1M audio tok = ~$0.0135/min (**~0.0137/1K chars derived**); doubles 2027-01-01 | Yes (VI, JA, TH) | 30 voices, 2 speakers | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [TTS doc](https://ai.google.dev/gemini-api/docs/speech-generation) |
| Gemini gemini-3.8-flash-lite-tts | $6/1M audio tok = ~$0.009/min | VI, JA yes; **TH no** | | same |

Voice cloning: ElevenLabs **PVC needs Creator plan ($22/mo) or above**; IVC on most plans ([voices docs](https://elevenlabs.io/docs/capabilities/voices)); which models PVC supports is not stated - confirm Vietnamese cloning on v3/v4/Flash. MiniMax Rapid Voice Cloning **$1.50 per voice** (charged on first use; Voice Design $3). Google Chirp 3 Instant Custom Voice $0.06/1K chars (languages unstated). OpenAI custom voices need consent recording. Gemini TTS: no cloning mentioned.

## 5. Talking-head avatar / video translation
| Provider / product | $/min | Status | Source |
|---|---|---|---|
| HeyGen Avatar IV / V (Enterprise API; 1 credit=$0.50) | **3.00** | V | [HeyGen enterprise pricing](https://developers.heygen.com/docs/enterprise-pricing) |
| HeyGen Avatar III (digital twin/studio / photo) | 0.50 / 1.30 | V | same |
| HeyGen Video Translation Speed (audio-only or lip-sync) / Precision lip-sync / Proofread | 1.50 / 3.00 / 0.25 (billed on source duration) | V | same |
| HeyGen Video Agent (prompt->video) | 2.00 | V | same |
| HeyGen self-serve PAYG: Avatar IV digital twin/studio / photo | 4.83 / 2.31 | **U** (help article snippet; another HeyGen article says ~$4 1080p, $5 4K) | [help](https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained) |
| HeyGen PAYG video translation | not found | **U** | |
| Synthesia (credits, 100 credits/min) | ~1.07-2.32 derived (Pro $89/mo = 6,000 cr; Starter $29 = 1,250 cr); **API plan unclear** | **U** | [Synthesia](https://www.synthesia.io/pricing) |
| D-ID (1 credit per 15 s) | ~0.69-0.78 derived | **U** (third-party) | [Creatify](https://creatify.ai/blog/d-id-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay) |
| Hedra Character-3 (6 credits/s) | ~1.88-2.00 derived; web plans only | **U** | [dailyaifixs](https://dailyaifixs.com/blog/hedra-pricing-2026-credits-burn-by-the-second) |
| ElevenLabs Dubbing v2 (audio only, no lip-sync) | 2.20 (v1: 0.33-0.50) | V | [pricing](https://elevenlabs.io/pricing/api) |

HeyGen: no free API credits since Feb 2026; PAYG credits expire after 12 months; 10 concurrent videos on PAYG (help article). Enterprise = sales contract (20 concurrent). Vietnamese/Thai/Japanese avatar-speech availability not verified for any provider.

## 6. Text/image-to-video B-roll (9:16)
| Model | $/s | Limits | Source |
|---|---|---|---|
| Veo 3.1 Lite `veo-3.1-lite-generate-preview` | 720p **0.05**, 1080p 0.08 | 4/6/8 s; 9:16 ok; no 4K, no ref images; audio incl. | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Veo doc](https://ai.google.dev/gemini-api/docs/veo) |
| Veo 3.1 Fast `veo-3.1-fast-generate-preview` | 0.10 / 0.12 / 4K 0.30 | same; extend +7 s up to 20x | same |
| Veo 3.1 Standard `veo-3.1-generate-preview` | 0.40 (720p, 1080p) / 4K 0.60 | 1080p/4K/ref-images need 8 s | same |
| Veo 3 (non-3.1) | not listed | treat as retired | **U** |
| Gemini Omni Flash `gemini-omni-1.1-flash` | ~0.10 (720p) | docs recommend as default video path | Gemini pricing |
| Seedance 2.0 via fal.ai | 720p 0.3034, 1080p 0.682, Fast 720p 0.2419 | 4-15 s; **9:16 yes (720x1280)**; audio incl. | [fal](https://fal.ai/models/bytedance/seedance-2.0/text-to-video) |
| Seedance via Runway API | seedance2 0.36 (480/720p), 0.40 (1080p), 4K 1.50; fast 0.29; mini 0.16 | | [Runway pricing](https://docs.dev.runwayml.com/guides/pricing/) |
| Seedance 1.0 Pro / BytePlus ModelArk direct | **not found (U)** | pricing page JS-rendered | [ModelArk](https://docs.byteplus.com/en/docs/modelark/model-pricing) |
| Kling v3 Standard via fal | 0.084 (no audio), 0.126 (audio) | 3-15 s; 9:16 yes; native audio zh/en only | [fal std](https://fal.ai/models/fal-ai/kling-video/v3/standard/text-to-video) |
| Kling v3 Pro via fal | 0.112 / 0.168 | 3-15 s; 9:16 | [fal pro](https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video) |
| Kling official API (unit packs ~$0.14/unit; std 0.6 unit/s, pro 0.8-1.2) | 0.084 / 0.112-0.168 (matches fal) | **U**; kling-v2-6 rate not found | [CostBench](https://www.costbench.com/software/ai-media-apis/kling-api/) |
| Runway gen4.5 / gen4_turbo / aleph2 | 0.12 / 0.05 / 0.28 | duration & 9:16 **not verified**; "Gen-4" not listed | [Runway pricing](https://docs.dev.runwayml.com/guides/pricing/) |
| Wan 3 via Runway | 480p 0.05, 720p 0.10, 1080p 0.20 | | same |
| Grok Imagine 1.5 Lite via Runway | 480p 0.02, **720p 0.03**, 1080p 0.14 | quality unknown | same |
| MiniMax-H3 | 768P 0.08, 2K 0.13 | 9:16 not verified | [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo) |
| OpenAI Sora 2 | **removed 2026-09-24** | historical $0.10/s (U) | [deprecations](https://developers.openai.com/api/docs/deprecations) |

Example 5 s 9:16 clip: grok-lite 720p $0.15; gen4_turbo $0.25; Veo Lite 1080p (6 s) $0.48; Kling v3 std no-audio $0.42; Veo Fast 1080p (6 s) $0.72; Seedance 2 Fast 720p $1.21; Veo Standard (6 s) $2.40. Veo bills per second of generated video and only on success; Veo outputs are kept 2 days only (download immediately).

## 7. Sound effects and music
| Product | Price | Limits | Source |
|---|---|---|---|
| ElevenLabs Sound Effects | $0.12/min (per generation) | 0.1-30 s per gen; loop; MP3/WAV 48k | [pricing](https://elevenlabs.io/pricing/api), [SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) |
| ElevenLabs Music (`music_v1/v2/v2_5`) | $0.15/min; commercial use on Starter+ | pricing page: 5 min; API doc: up to 10 min (conflict) | [pricing](https://elevenlabs.io/pricing/api), [API](https://elevenlabs.io/docs/api-reference/music/compose) |
| Google Lyria 3.5 | $0.08 per full song; lyria-3-clip-preview $0.04 per 30 s | licensing not checked | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| MiniMax Music 3.0/2.6 | $0.15/track | closed to new users after 2026-08-20 | [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo) |
Stable Audio / others: not researched (optional per brief).

## 8. Embeddings ($/1M tokens)
| Model | Price | Notes | Source |
|---|---|---|---|
| OpenAI text-embedding-3-small | 0.02 | cheapest | [OpenAI](https://developers.openai.com/api/docs/pricing) |
| OpenAI text-embedding-3-large | 0.13 | | same |
| Gemini gemini-embedding-2 | text 0.20 (batch 0.10); image 0.45; audio 6.50; video 12.00 | multimodal; models page calls it `-preview`; `gemini-embedding-001` price not on page | [Gemini](https://ai.google.dev/gemini-api/docs/pricing) |
| Voyage voyage-4 / 4-large / 3.5 / 3-large | 0.06 / 0.12 / 0.06 / 0.18 | 200M free tokens on 4 and 4-large | [Voyage](https://docs.voyageai.com/docs/pricing) |
| Voyage voyage-multilingual-2 | 0.12 | only one explicitly multilingual | same |
Multilingual (VI/TH/JA) retrieval quality: **not verified** for any; test on your own tag corpus.

## Cheapest vs best per activity (verified prices unless marked)
| Activity | Cheapest | Best quality (tier-based, not benchmarked) |
|---|---|---|
| Vision tagging | gemini-2.5-flash-lite ($0.0004/clip); Haiku 5.5 / GPT-6 Luna ~$0.0006 | gemini-3.1-pro-preview or Opus 5.5; value: gemini-3.8-flash |
| Script LLM | Haiku 5.5 / GPT-6 Luna (~$0.001/script) | Fable 5.1 / GPT-6 Astra / Opus 5.5; value: Sonnet 5.5 |
| ASR | Scribe v2 $0.0037/min (API); self-host ~$0.0005 (U) | Scribe v2 (word ts + VI/JA "Excellent") |
| TTS | Gemini 3.8 Flash TTS ~$0.014/min; Chirp 3 HD $0.03/1K | ElevenLabs v4 (+PVC) |
| Avatar | D-ID ~$0.7/min (U); verified: HeyGen Enterprise $3.00 | HeyGen Avatar IV/V |
| Video gen | Grok Lite 720p $0.03/s (Runway); Veo 3.1 Lite $0.05/s first-party | Veo 3.1 Standard / Seedance 2.0 |
| SFX/music | Lyria 3.5 $0.08/song; ElevenLabs SFX $0.12/min | ElevenLabs Music (licensing) / Lyria 3.5 |
| Embeddings | text-embedding-3-small $0.02 | gemini-embedding-2 / voyage-4-large / 3-large (unverified) |

## Caveats
1. WebFetch summarised pages with a small model; numbers were cross-read but not screenshot-checked. Pages with JS tables (BytePlus, Kling, HeyGen app, D-ID, Hedra) were not readable - rows are marked U.
2. GCP TTS pricing page was truncated on fetch; Chirp 3 HD $30/1M comes from a search-result extract of the official page. Studio/Neural2/WaveNet figures a fetch returned were model recall, not read - **ignored**.
3. Token prices are standard tier, short context. Batch (50% Claude/Gemini), caching, priority/fast tiers change cost. GPT-6 family prices above 272k ctx not captured.
4. Quality statements are vendor positioning only. No independent benchmarks for Vietnamese/Thai/Japanese were retrieved except ElevenLabs' own Scribe tiers.
5. Derived values (per-clip cost, TTS per-minute, self-host Whisper, avatar per-minute from plans) are my arithmetic with stated assumptions.
6. ElevenLabs numbers: model_id strings for v4 not seen; Flash v2.5 mapping to "Flash/Turbo" row inferred; SFX $0.12/min conflicts with docs' 40 credits/s; Music 5 vs 10 min limit conflict.
7. fal.ai / Runway are resellers; first-party BytePlus/Kling pricing may differ and may need enterprise contracts (one source says BytePlus Seedance 2 is enterprise-only).
8. Sora status rests on OpenAI's deprecations page (V) plus news (secondary).

## Unresolved questions
- Real VI/TH/JA accuracy: LLM tagging/scripting, Scribe v2 vs whisper-1, TTS naturalness (v4 vs Gemini TTS vs MiniMax vs Chirp 3 HD). Needs a small blind test.
- Does ElevenLabs PVC work with Vietnamese on v3/v4, and what is the PVC fee/process?
- HeyGen: PAYG vs Enterprise rate ($4.83 vs $3.00/min) and PAYG video-translation rate; VI/TH/JA lip-sync support.
- BytePlus direct Seedance 1.0 Pro/2.0 prices and Kling official rate card (kling-v2-6).
- Runway gen4.5/gen4_turbo max duration and 9:16 support.
- Gemini TTS/Veo output licensing and SynthID watermark implications for commercial use (not checked).
- Does gemini-3.5-transcribe return word timestamps?
