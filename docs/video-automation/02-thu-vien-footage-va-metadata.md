# 02 — Thư viện footage, thư viện viral & data model

## 1. Kho footage trên NAS (hiện trạng)

Synology `mediaVCB` — `/volume1/MEDIA VCB folder/`:

| Nhánh | Dung lượng / số file | Dùng cho video? |
|---|---|---|
| `THƯƠNG HIỆU/1. KIM HOÀN` | ~40.2k file (38.3k .mp4, 1.4k .mov) | **Nguồn chính** |
| `THƯƠNG HIỆU/2. ĐỒ DA`, `3. ĐÁ QUÝ` | ~7.2k file | Ngoài MVP (cùng cơ chế, KOC khác) |
| `KHO SP THƯƠNG MẠI/KIM HOÀN` | ~4.7k file (video visual/web, ảnh) | Cảnh sản phẩm hoàn thiện |

Chi tiết `1. KIM HOÀN` (số file):

| Folder cấp 2 | File | Vai trò mặc định trong video |
|---|---|---|
| `1. KỊCH BẢN CONTENT HUYK` (KB CHUNG A1–A5, ORDER THÁNG) | 1.320 | HuyK nói tại hình (talking head) theo kịch bản cũ |
| `2. DỰ ÁN HUYK CHẾ TÁC SP` (Nhẫn 5.269, Lắc 1.697, Dây chuyền 664, Bông tai 146) | 7.776 | Chế tác có HuyK, theo SKU |
| `3. CHẾ TÁC XƯỞNG SẢN XUẤT` (theo thợ) | 26.995 | Chế tác xưởng (CTX), theo SKU |
| `4. STOCK HÀNH ĐỘNG` | 1.903 | B-roll hành động chung (cưa, khò, hàn…) không gắn SKU |
| `5. SOURCE LIVE` | 844 | Clip live (ít dùng, cần duyệt) |
| `6. DAILY HUYK` (31 chủ đề: giao hàng, đọc content, chế tác, nghe điện thoại…) | 1.153 | HuyK không nói / đời thường → lồng VO |
| `7. SOURCE OUTRO` | 102 | Outro |
| `8. INTRO` (50 folder theo SKU) | 102 | Hook sản phẩm / mở đầu |

Bộ mẫu `Tài Nguyên VCB Real Sample/3.2 Video input` ánh xạ:

| Folder mẫu | Vai trò | Ví dụ file |
|---|---|---|
| V1 Cảnh mở đầu | `hook` | `260526_CT_HK_N0002-S-WH_Nhan-kim-vu_Tha-bac-vao-bat_MDA04_05.mov` |
| V2 Cảnh chế tác các công đoạn | `craft` | `260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_2.mp4` |
| V3 Cảnh nhân vật HuyK | `huyk_talk` / `huyk_silent` | `260718_KB_HK_3-dieu-ve-vang..._DTA01.mp4`, `260826_ST_HK_Thiet-ke_DTA01_3.mp4` |
| V4 Cảnh POV góc máy | `craft_pov` | `260601_CT_HK_N101220_Nhan-Xoay-Rang-Cua_Do-khuon_DTA01_1.mp4` |
| V5 Sưu tầm / tự quay | `hook_visual`, `stock_action`, `content_illustration` (nguồn `collected`, được khai thác) / `craft` | `Sưu tầm/1.mp4`, `Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_04.MOV` |
| V6 Sản phẩm hoàn thiện | `product_final` | `260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_15.mp4` |
| V7 Outro HuyK & cảnh có tag | `outro` | `0930(1).mp4` |
| V8 Footage gốc chưa cắt (≤15s) | `craft` (raw) | `260914_CTX_N0006-Nhan-tang-hinh_DTA06_Gan-da-to_02.mp4` |

## 2. Quy chuẩn tên file NAS → parser

Quy chuẩn chính thức (Kim hoàn):

| Loại | Mẫu tên |
|---|---|
| Kịch bản | `YYMMDD_KB_<KOC>_<Tên kịch bản>_<Mã NV>_<STT>` |
| Chế tác KOC | `YYMMDD_CT_<KOC>_<Mã SP?>_<Tên SP>_<Hành động>_<Mã NV>_<STT>` |
| Chế tác xưởng | `YYMMDD_CTX_<Mã SP?>_<Tên SP>_<Hành động>_<Mã NV>_<STT>` |
| Stock hành động | `YYMMDD_ST_<Hành động>_<Mã NV>` (có thể có `<KOC>`: `260826_ST_HK_Thiet-ke_DTA01_3`) |
| Source Live | `YYMMDD_Live_<KOC>_<Mã SP?>_<Tên SP>_<Mã NV>_<STT>` |
| Daily KOC | `YYMMDD_<KOC>_<Hành động>_<Mã NV>_<STT>` |
| Outro / Intro | `YYMMDD_OT_<KOC>_<Mã NV>_<STT>` / `YYMMDD_IT_<KOC>_<Mã SP?>_<Tên SP>_<Mã NV>_<STT>` |
| Kho SP thương mại | `YYMMDD_<Mã SP?>_<Tên SP>_<Mã NV>_<STT>` |

Từ điển: `KB` kịch bản · `CT` chế tác · `CTX` chế tác xưởng · `ST` stock · `IT/OT` intro/outro · `HK` HuyK · `NN` Nhạn Nhạn · `NB` NamBling · `CB` Chung Bùi · `HC` HuyC. Mã NV dạng `DTA01`, `MDA04`, `DTA06`.

### Thuật toán parse (code, không dùng AI)

```python
# config/naming/nas_naming_rules.yaml → được nạp vào parser
TYPE_CODES = {"KB","CT","CTX","ST","Live","OT","IT"}
KOC_CODES  = {"HK","NN","NB","CB","HC"}
SKU_RE     = r"^[A-Z]{1,2}\d{3,6}([A-Z0-9\-]*)$"     # N0017, N620144, N0002-S-WH, N610006-8, B0012-50-S-WH
STAFF_RE   = r"^[A-Z]{2,4}\d{2}$"                    # DTA01, MDA04
DATE_RE    = r"^\d{6}$"                               # YYMMDD

def parse(filename, folder_path) -> ParsedName:
    stem = unicodedata.normalize("NFC", Path(filename).stem)   # tên có dấu: NFC (macOS hay ra NFD)
    tokens = stem.split("_")
    # 1. date: token đầu nếu khớp DATE_RE; nếu không, tìm token 6 số ở cuối (vd "..._DTA01_190326_ (7)")
    # 2. type: token kế nếu ∈ TYPE_CODES; nếu không và token ∈ KOC_CODES → type = DAILY
    # 3. koc: token ∈ KOC_CODES
    # 4. sku: token đầu tiên khớp SKU_RE (cho phép "N0006-Nhan-tang-hinh" → tách SKU khỏi slug ở dấu '-' đầu)
    # 5. staff: token khớp STAFF_RE (thường áp chót); stt: token số cuối cùng
    # 6. phần còn lại giữa sku và staff: [product_slug, action_slug] — action là token ngay trước staff
    #    (CTX mẫu thật đôi khi đảo: "..._DTA06_Hoan-thien_15" → action sau staff; parser thử cả 2 vị trí)
    # 7. action_slug → craft_step qua bảng alias (mục 3)
    # 8. folder_path → role_hint (mục 1), market_hint (VN/EU/JP), product_category (Nhẫn/Lắc/…)
    #    SKU ưu tiên lấy từ thư mục sản phẩm "[Mã SP + Tên SP]" (mỗi SP 1 bộ footage riêng), tên file là nguồn thứ 2;
    #    nếu 2 nguồn lệch nhau → needs_review. Không map chéo giữa các mã SP.
    # 9. parse_confidence = số trường bắt buộc parse được / số trường kỳ vọng theo type
```

Ví dụ đầu ra:

```json
{
  "file": "260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_2.mp4",
  "shot_date": "2026-08-18", "type": "CT", "koc": "HK", "sku": "N0017",
  "product_slug": "Nhan-mat-than-Horus-da-xanh", "action_slug": "Gan-da-chu",
  "craft_step": "gan_da_chu", "staff": "DTA01", "stt": 2,
  "role_hint": "craft", "parse_confidence": 1.0
}
```

File lệch chuẩn (`1.mp4`, `0930(1).mp4`, `IMG_9380.MOV`, `银莫桑石戒指….mp4`): `parse_confidence < 0.5` → để AI tagger suy luận + **bắt buộc người duyệt** trước khi dùng. Có báo cáo định kỳ "file sai quy chuẩn theo Mã NV" gửi đội quay để sửa tận gốc.

## 3. Taxonomy (file config, có version)

### 3.1 Vai trò segment — `config/taxonomy/roles.yaml`

| role | Mô tả | Nguồn thường gặp |
|---|---|---|
| `hook_visual` | Cảnh mở gây tò mò (macro sản phẩm, lửa, kim loại chảy) | INTRO, V1 |
| `product_hero` | Sản phẩm (chưa/đã hoàn thiện) cận cảnh, xoay, trên tay | INTRO, KHO SP, V6 |
| `product_final` | Sản phẩm hoàn thiện, reveal | V6, KHO SP |
| `huyk_talk` | HuyK nói tại hình, thấy miệng. Vai trò mặc định của slot "HuyK" | KB, V3, avatar AI (HeyGen) |
| `huyk_silent` | HuyK xuất hiện không nói (làm việc, nhìn, đọc, giao hàng) | DAILY, ST_HK |
| `craft` | Thao tác chế tác theo công đoạn | CT, CTX, V2, V8 |
| `craft_pov` | Góc POV tay thợ | V4 |
| `craft_macro` | Cận cực gần chi tiết (đá, chấu, vân) | CT, CTX |
| `stock_action` | Hành động chung không gắn SKU | ST |
| `content_illustration` | Hình minh họa chủ đề (A1–A3: huy chương, sự kiện) | Sưu tầm, AI |
| `outro` | Outro thương hiệu có logo | OUTRO, V7 |

Một segment có thể có **nhiều role** (đa trị), mỗi role có confidence.

### 3.2 Công đoạn chế tác — `config/taxonomy/craft_steps.yaml`

Thứ tự chuẩn (dùng để sắp xếp khi kể quá trình A4). Alias lấy từ slug thật trong kho:

| order | step_id | Alias slug thường gặp |
|---|---|---|
| 10 | `thiet_ke` | Thiet-ke, Ve-phac-thao, VE PHAC THAO |
| 20 | `chuan_bi_nguyen_lieu` | Do-nguyen-lieu, Can-bac |
| 30 | `nung_nau` | Danh-lua, Nung-bac, Tha-bac-vao-bat |
| 40 | `do_khuon` | Do-khuon |
| 50 | `dap_can` | Dap-thanh-bac, Dap-tron-thanh-bac, Bua-sao-su |
| 60 | `cua_cat` | Cua-bac-thua, CUA BAC THUA |
| 70 | `han` | Han-noi |
| 80 | `dua_mai` | Dua, Dua-hoc-da, Dua-mat-chau-da |
| 90 | `khoan` | Khoan-hoc-da, Khoan-chi-tiet |
| 100 | `gan_da_chu` | Gan-da-chu |
| 110 | `dinh_da` | Dinh-da, Dinh-da-vien, Gan-da-to, Nhin-da |
| 120 | `danh_bong` | Danh-bong, Lam-sang-bac |
| 130 | `hoan_thien` | Hoan-thien, Hoan-thanh |

Slug không có trong bảng → `craft_step = unknown` + đưa vào hàng "đề xuất alias mới" cho editor lead duyệt (agent gợi ý step gần nhất).

### 3.3 Nhãn hình ảnh (vision tagger điền) — enum cố định

`shot_size`: extreme_close / close / medium / wide · `camera`: static / handheld / pov / gimbal · `subject`: hands / huyk_face / product / tool / fire / metal / stone / workshop · `huyk_present`: bool · `mouth_visible_speaking`: bool · `product_visible`: bool · `metal`: bac / vang / vang_trang / unknown · `stone_color`: list · `lighting`: good / dark / overexposed / mixed · `text_or_watermark`: none / own_logo / third_party (Douyin, TikTok…) · `motion_level`: 0–3 · `aesthetic`: 1–5.

## 4. Data model (PostgreSQL)

```sql
-- File vật lý
CREATE TABLE assets (
  id            uuid PRIMARY KEY,
  sha256        text UNIQUE NOT NULL,
  nas_path      text NOT NULL,              -- đường dẫn hiện tại (có thể đổi), lịch sử ở asset_paths
  kind          text NOT NULL,              -- video | audio | image
  duration_ms   int, width int, height int, rotation int,
  fps_num int, fps_den int, is_vfr bool, is_hdr bool, color_transfer text,
  has_audio bool, audio_sr int,
  proxy_uri     text, thumb_uri text, contact_sheet_uri text,
  parsed        jsonb,                      -- kết quả filename-parser (mục 2)
  sku           text REFERENCES products(sku),
  koc           text, source_type text,     -- CT | CTX | ST | KB | DAILY | OT | IT | LIVE | EXTERNAL
  rights_status text NOT NULL DEFAULT 'unknown', -- owned | licensed | collected (sưu tầm, VCB cho phép khai thác) | unknown | blocked
  rights_note   text,
  status        text NOT NULL DEFAULT 'new',     -- new | processing | needs_review | approved | rejected | revoked
  phash         bytea,                      -- perceptual hash để phát hiện gần trùng
  created_at timestamptz, updated_at timestamptz
);

-- Đoạn dùng được trong asset (đơn vị chọn của pipeline)
CREATE TABLE segments (
  id            uuid PRIMARY KEY,
  asset_id      uuid REFERENCES assets(id),
  src_in_ms     int NOT NULL, src_out_ms int NOT NULL,
  best_in_ms    int, best_out_ms int,       -- khoảng "đẹp nhất" (động tác rõ, nét)
  split_method  text,                       -- whole | hard_cut | soft | sentence (clip dài, xem 03 §3.1)
  crop_x        real DEFAULT 0.5,           -- tâm khung dọc 9:16 khi nguồn quay ngang (0..1)
  scores        jsonb,                      -- {"q_cpu":..,"p_usable":..,"p_role":{..},"p_step":{..},"premium":..} (03 §3.2)
  roles         jsonb NOT NULL,             -- [{"role":"craft","conf":0.93,"by":"filename"}, ...]
  craft_step    text, craft_order int,
  tags          jsonb,                      -- nhãn mục 3.3
  description_vi text,                      -- mô tả ngắn cho tìm kiếm & LLM
  transcript    text, words jsonb,          -- nếu có lời
  quality       jsonb,                      -- {"blur":..,"exposure":..,"shake":..,"motion":..,"score":0..1}
  embedding     vector(1536),
  label_source  text,                       -- filename | ai | human
  human_verified bool DEFAULT false,
  status        text DEFAULT 'needs_review',-- approved mới được pipeline dùng
  usage_count   int DEFAULT 0, last_used_at timestamptz
);
CREATE INDEX ON segments USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON segments ((roles), craft_step);

CREATE TABLE products (                 -- snapshot có version của Product Master (mục 6)
  sku text PRIMARY KEY, name text, category text,       -- nhan | lac_tay | day_chuyen | bong_tai | kieng
  attrs jsonb,                                         -- toàn bộ cột tab san_pham
  facts jsonb,                                         -- [{"fact_id":"F-N0017-chat_lieu_kim_loai","text":"Bạc S925"}, ...]
  stories jsonb,                                       -- tab cau_chuyen_that (duoc_phep_ke = TRUE)
  status text, version int, updated_at timestamptz
);

CREATE TABLE fx_items ( ... );           -- kho nhạc/SFX/transition/effect — xem 07
CREATE TABLE viral_items ( ... );        -- mục 5
CREATE TABLE jobs ( ... ); CREATE TABLE job_revisions ( ... );  -- xem 04, 06
CREATE TABLE segment_usage (             -- chống lặp giữa các video
  segment_id uuid, job_id uuid, revision int, channel text, market text,
  used_in_ms int, used_out_ms int, published_at timestamptz
);
CREATE TABLE review_tasks (              -- hàng duyệt chung (tag, G1, G2)
  id uuid PRIMARY KEY, kind text, ref_id uuid, priority int, payload jsonb,
  status text, assignee text, decision jsonb, created_at timestamptz, decided_at timestamptz
);
```

**Quy tắc vàng:** pipeline chỉ đọc `segments.status = 'approved' AND assets.rights_status IN ('owned','licensed','collected') AND assets.status = 'approved'`. Footage `collected` không bao giờ lấp các role thuộc bộ footage sản phẩm (`product_hero`, `craft`, `product_final`).

## 5. Thư viện content viral

Nguồn: kịch bản trong `KỊCH BẢN CONTENT HUYK` + video tham khảo (`N2`) + video đã đăng có số liệu (`T1` tốt / `T2` kém), bổ sung định kỳ.

```sql
CREATE TABLE viral_items (
  id uuid PRIMARY KEY,
  origin        text,       -- internal_published | internal_script | external_reference
  platform text, url text, market text, language text,
  views bigint, likes bigint, shares bigint, completion_rate real, measured_at timestamptz,
  perf_tier     text,       -- top | good | weak  (tính theo percentile trong cùng thị trường/kênh)
  template_id   text,       -- A1..A4 (gán bởi viral-analyzer, người xác nhận)
  script_text   text,       -- kịch bản / transcript
  hook_text     text,       -- 1–2 câu đầu
  beats         jsonb,      -- [{"t":0,"beat":"hook_question"},{"t":5,"beat":"customer_story"},...]
  angle         text,       -- customer_story | craft_difficulty | knowledge | comparison | price_objection | gift
  emotion       text,       -- touching | proud | curious | funny
  cta_text      text,
  cut_stats     jsonb,      -- {"avg_shot_s":1.9,"n_shots":33,"speed_range":[1,2]}
  sku           text,       -- nếu gắn với sản phẩm
  is_true_story bool,       -- câu chuyện khách hàng thật → không được biến thành SKU khác
  approved_for_reuse bool,  -- editor lead duyệt mới dùng làm mẫu
  embedding vector(1536)
);
```

Dữ liệu mẫu thật đã có:

| Video | Thị trường | Nền tảng | View | Tier |
|---|---|---|---|---|
| Nhẫn tàng hình (1).mp4 | VN | TikTok | 2.9M | top |
| FSave…_Reels…mp4 | TH | Facebook | 2.6M | top |
| Nhẫn tàng hình.mp4 | JP | Instagram | 1.0M | top |
| Khách đã phải chờ khá lâu cho chiếc dây này.mp4 | VN | TikTok | 6k | weak |
| Không tặng gì mới chia tay.mp4 | VN | TikTok | 5k | weak |

**Viral Analyzer** (chạy mỗi khi kho viral có item mới): ASR (nếu là video) → LLM bóc `hook_text, beats, angle, emotion, cta, template_id` theo schema → code tính `cut_stats` bằng PySceneDetect → lưu, chờ editor lead tick `approved_for_reuse`. Item `weak` vẫn lưu để làm **ví dụ âm** (tránh lặp hook kém).

## 6. Mẫu dữ liệu sản phẩm (Product Master)

VCB **chưa có** nguồn dữ liệu sản phẩm, nên dùng mẫu dưới đây. Đây là Google Sheet `VCB_Product_Master` gồm 3 tab, xuất/nhập được dạng CSV. File mẫu có sẵn dòng ví dụ nằm ở [templates/](./templates/):

| Tab | File mẫu | 1 dòng = |
|---|---|---|
| `san_pham` | [vcb-product-master-san-pham.csv](./templates/vcb-product-master-san-pham.csv) | 1 sản phẩm (= 1 bộ footage) |
| `facts_bo_sung` | [vcb-product-master-facts-bo-sung.csv](./templates/vcb-product-master-facts-bo-sung.csv) | 1 thông tin thêm có thể nói trong video (khuyến mãi, kỹ thuật, chứng nhận…) |
| `cau_chuyen_that` | [vcb-product-master-cau-chuyen-that.csv](./templates/vcb-product-master-cau-chuyen-that.csv) | 1 câu chuyện khách hàng thật được phép kể |

### 6.1 Tab `san_pham`: các cột

| Nhóm | Cột | Bắt buộc | Ví dụ | Hệ thống dùng để |
|---|---|---|---|---|
| Định danh | `sku` | ✔ | `N0017` | Khóa chính; trùng mã thư mục footage trên NAS |
| | `ten_sp` | ✔ | Nhẫn mắt thần Horus đá xanh | Kịch bản, phụ đề |
| | `danh_muc` | ✔ | `nhan` / `lac_tay` / `day_chuyen` / `bong_tai` / `kieng` | Chọn template, nhạc |
| | `thu_muc_footage` | ✔ | `.../1. NHẪN/N0017_Nhan-mat-than-Horus-da-xanh` | Nối với bộ footage ở Media Hub (Hub kiểm tra tồn tại) |
| Thông số | `chat_lieu_kim_loai`, `xi_ma`, `da_chu`, `kich_thuoc_da_chu`, `da_phu`, `trong_luong_g` | `chat_lieu_kim_loai` ✔ | Bạc S925 · Moissanite xanh lá · 6.5 li | Câu thông số trong VO; mỗi ô = 1 fact |
| Câu chuyện | `phong_cach_thiet_ke`, `y_nghia_bieu_tuong` | | Ai Cập cổ · bảo vệ, chữa lành | Góc kể "ý nghĩa" (như video JP mắt Horus) |
| | `cong_doan_noi_bat` | | `dap_can;gan_da_chu` (mã công đoạn 02 §3.2) | Template A4 ưu tiên các công đoạn này |
| | `thoi_gian_che_tac` | | ~3 ngày | Góc kể "độ khó" |
| Bán hàng | `usp_1..3` | `usp_1` ✔ | Mắt Horus chạm thủ công | Hook, câu chốt |
| | `doi_tuong_dip_tang` | | Quà sinh nhật, kỷ niệm | Góc kể "quà tặng" |
| | `gia_ban_vnd`, `cho_phep_noi_gia` | `cho_phep_noi_gia` ✔ | 2.450.000 · FALSE | Chặn giá trong video nếu FALSE |
| | `bao_hanh_chung_nhan` | | Bảo hành 12 tháng | Câu cam kết |
| Đa ngôn ngữ | `ten_en`, `ten_ja`, `ten_th`, `thi_truong_ban` | | Eye of Horus ring · `VN;TH;JP` | Tên đúng khi dịch; chỉ sản xuất cho thị trường đang bán |
| Kiểm soát | `tu_cam` | | "không nói công dụng chữa bệnh" | Validator chặn câu chứa ý này |
| | `trang_thai` | ✔ | `draft` / `approved` / `ngung_ban` | Chỉ `approved` mới được dùng |
| | `nguon_nhap`, `nguoi_duyet`, `ngay_duyet`, `ghi_chu` | khi duyệt | | Lưu vết |

Quy tắc hệ thống:
- Mỗi ô có giá trị của dòng `approved` tự thành 1 fact: `fact_id = F-<sku>-<tên cột>` (vd `F-N0017-chat_lieu_kim_loai`). Kịch bản phải dẫn `fact_id` khi nói thông số, giá hay cam kết.
- Sửa một ô sẽ tăng `version`. Job đang chạy dùng snapshot cũ sẽ bị gắn cờ "kiểm tra lại trước khi giao".
- Validator: `sku` phải có bộ footage trong Hub; enum đúng; giá là số; `cho_phep_noi_gia = FALSE` thì kịch bản không được có giá.
- Câu chuyện khách hàng (tab `cau_chuyen_that`) chỉ dùng khi `duoc_phep_ke = TRUE`, chỉ kể các chi tiết trong `chi_tiet_duoc_ke`, và **chỉ cho đúng `sku` đó** (để trống `sku` = câu chuyện chung của xưởng).

### 6.2 Ai điền, ai cập nhật

1. **Agent soạn nháp (khởi tạo):** với mỗi bộ footage sản phẩm trong Hub, agent điền sẵn dòng `draft`. Nguồn: tên thư mục (SKU, tên), slug công đoạn trong tên file, kịch bản cũ trong `KỊCH BẢN CONTENT HUYK` (vd "vàng 18K đính full đá Moissanite" của nhẫn xoay bánh răng), ảnh sản phẩm (vision: màu đá, màu kim loại). Mỗi ô ghi nguồn vào `nguon_nhap`.
2. **Product data owner** (1–2 người trong đội vận hành) kiểm tra, sửa và chuyển `approved`. Khoảng 2–3 phút/sản phẩm nhờ có nháp.
3. Sau đó chỉ cập nhật khi sản phẩm đổi (giá, khuyến mãi, ngừng bán). Agent đồng bộ Sheet mỗi 15 phút (hoặc upload CSV trên Studio) và hiện báo cáo lỗi.

Bảng `products` (mục 4) lưu snapshot có version của 3 tab này.
