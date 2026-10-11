# Phụ lục B — Kiểm kê kỹ thuật video mẫu (ffprobe)

> 38 file trong `Tài Nguyên VCB Real Sample` (trừ project CapCut). Dùng làm fixtures test chuẩn hóa (xoay, HLG, fps, không audio).


Source root: `/Users/brianle/Documents/Code/Vidtory/VienChiBao-TrangSuc/Tài Nguyên VCB Real Sample` (excluded: `3.7 Project Capcut`). Read-only ffprobe scan.

Notes: `size MB` = bytes / 1024^2. `VFR` = r_frame_rate differs from avg_frame_rate. `orientation` uses display dims after rotation tag. Filename column is path below the folder code.

## Table

| folder | filename | duration_s | width x height | rotation | r_fps | avg_fps | VFR | video codec | pix_fmt | bit depth | color transfer | HDR | has_audio | audio codec | sample rate | channels | size MB | flags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| N2 | N2. Kịch bản video/Video tham khảo/A2 .mp4 | 154.30 | 1080x1920 | 0° | 30 | 30 | no | hevc | yuv420p | 8 | bt709 | no | no | - | - | - | 18.24 | PORTRAIT, >15s, NO_AUDIO |
| N2 | N2. Kịch bản video/Video tham khảo/A3.mp4 | 71.73 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 10.90 | PORTRAIT, >15s |
| N2 | N2. Kịch bản video/Video tham khảo/Dây chuyền bó hoa.mp4 | 73.03 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 13.19 | PORTRAIT, >15s |
| N2 | N2. Kịch bản video/Video tham khảo/Nhẫn tàng hình.mp4 | 44.56 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 6.14 | PORTRAIT, >15s |
| N2 | N2. Kịch bản video/Video tham khảo/xoay bánh răng.mp4 | 154.30 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | no | - | - | - | 53.53 | PORTRAIT, >15s, NO_AUDIO |
| T1 | T1. Video hiệu quả tốt/Nhật Bản/Nhẫn tàng hình.mp4 | 60.39 | 720x1280 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 7.79 | PORTRAIT, >15s |
| T1 | T1. Video hiệu quả tốt/Thái Lan/FSave.com_Reels_Media_997639816466076_001_1080p.mp4 | 107.49 | 1080x1920 | 0° | 60 | 60 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 178.75 | PORTRAIT, >15s |
| T1 | T1. Video hiệu quả tốt/Việt Nam/Nhẫn tàng hình (1).mp4 | 46.42 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 7.11 | PORTRAIT, >15s |
| T2 | T2. Video hiệu quả kém/Khách đã phải chờ khá lâu cho chiếc dây này.mp4 | 44.84 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 6.99 | PORTRAIT, >15s |
| T2 | T2. Video hiệu quả kém/Không tặng gì mới chia tay.mp4 | 38.99 | 1080x1920 | 0° | 60 | 60 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 5.61 | PORTRAIT, >15s |
| V1 | V1. Cảnh mở đầu/1.mp4 | 8.87 | 576x1024 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | no | - | - | - | 1.67 | PORTRAIT, NO_AUDIO |
| V1 | V1. Cảnh mở đầu/260526_CT_HK_N0002-S-WH_Nhan-kim-vu_Tha-bac-vao-bat_MDA04_05.mov | 5.61 | 2160x3840 | 0° | 29.97 | 29.97 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 48000 | 2 | 162.55 | PORTRAIT |
| V1 | V1. Cảnh mở đầu/demo 321.mp4 | 12.80 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 18.54 | PORTRAIT |
| V2 | V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Dap-thanh-bac_DTA01_2.mp4 | 15.26 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 23.54 | PORTRAIT, >15s |
| V2 | V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Dua-hoc-da_DTA01_5.mp4 | 19.64 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 29.33 | PORTRAIT, >15s |
| V2 | V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_2.mp4 | 26.82 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 41.31 | PORTRAIT, >15s |
| V2 | V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_6.mp4 | 6.50 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 10.33 | PORTRAIT |
| V3 | V3. Cảnh nhâc vật Huyk/260718_KB_HK_3-dieu-ve-vang-anh-chi-em-biet-som-se-do-mat-tien-oan_DTA01.mp4 | 58.07 | 1440x2560 | 0° | 30 | 30 | no | hevc | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 76.67 | PORTRAIT, >15s |
| V3 | V3. Cảnh nhâc vật Huyk/260826_ST_HK_Bua-sao-su_DTA01_2.mp4 | 24.17 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 36.33 | PORTRAIT, >15s |
| V3 | V3. Cảnh nhâc vật Huyk/260826_ST_HK_Thiet-ke_DTA01_3.mp4 | 23.00 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 34.70 | PORTRAIT, >15s |
| V4 | V4. Cảnh POV góc máy/260601_CT_HK_N101220_Nhan-Xoay-Rang-Cua_Do-khuon_DTA01_1.mp4 | 12.35 | 2160x3840 | 0° | 60 | 60 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 70.43 | PORTRAIT |
| V4 | V4. Cảnh POV góc máy/260601_CT_HK_N101220_Nhan-Xoay-Rang-Cua_Do-khuon_DTA01_2.mp4 | 12.91 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 43.23 | PORTRAIT |
| V5 | V5. Source sưu tầm và tự quay/Sưu tầm/1.mp4 | 24.00 | 720x1280 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 6.70 | PORTRAIT, >15s |
| V5 | V5. Source sưu tầm và tự quay/Sưu tầm/2.mp4 | 10.60 | 720x1280 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 1.87 | PORTRAIT |
| V5 | V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_04.MOV | 19.04 | 1920x1080 | 270° | 59.94 | 59.937 | no | hevc | yuv420p10le | 10 | arib-std-b67 | HLG | yes | aac | 48000 | 2 | 34.91 | HLG, PORTRAIT, >15s |
| V5 | V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_07.MOV | 17.75 | 1920x1080 | 270° | 59.94 | 59.938 | no | hevc | yuv420p10le | 10 | arib-std-b67 | HLG | yes | aac | 48000 | 2 | 28.21 | HLG, PORTRAIT, >15s |
| V5 | V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_5.MOV | 25.18 | 1920x1080 | 270° | 59.94 | 59.936 | no | hevc | yuv420p10le | 10 | arib-std-b67 | HLG | yes | aac | 48000 | 2 | 39.77 | HLG, PORTRAIT, >15s |
| V5 | V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_6.MOV | 22.37 | 1920x1080 | 270° | 59.94 | 59.937 | no | hevc | yuv420p10le | 10 | arib-std-b67 | HLG | yes | aac | 48000 | 2 | 35.45 | HLG, PORTRAIT, >15s |
| V6 | V6. Cảnh sản phẩm hoàn thiện/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_05.mp4 | 22.94 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 35.20 | PORTRAIT, >15s |
| V6 | V6. Cảnh sản phẩm hoàn thiện/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_15.mp4 | 5.20 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 8.58 | PORTRAIT |
| V6 | V6. Cảnh sản phẩm hoàn thiện/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_25.mp4 | 14.51 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 22.03 | PORTRAIT |
| V6 | V6. Cảnh sản phẩm hoàn thiện/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_26.mp4 | 4.55 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 7.03 | PORTRAIT |
| V7 | V7. Outro Huyk và cảnh có gắn tag/0930(1).mp4 | 4.07 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 5.97 | PORTRAIT |
| V7 | V7. Outro Huyk và cảnh có gắn tag/0930(2).mp4 | 7.60 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 11.32 | PORTRAIT |
| V7 | V7. Outro Huyk và cảnh có gắn tag/0930.mp4 | 3.53 | 1080x1920 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 5.75 | PORTRAIT |
| V8 | V8. Footahe gốc chưa cắt ( đều đã đc xử lý max 15s trước khi tải lên NAS)/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Gan-da-to_02.mp4 | 15.14 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 24.38 | PORTRAIT, >15s |
| V8 | V8. Footahe gốc chưa cắt ( đều đã đc xử lý max 15s trước khi tải lên NAS)/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Gan-da-to_16.mp4 | 15.00 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 22.82 | PORTRAIT |
| V8 | V8. Footahe gốc chưa cắt ( đều đã đc xử lý max 15s trước khi tải lên NAS)/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Han-noi_05.mp4 | 17.11 | 2160x3840 | 0° | 30 | 30 | no | h264 | yuv420p | 8 | bt709 | no | yes | aac | 44100 | 2 | 25.82 | PORTRAIT, >15s |

## Stats

Total files: 38 (probed OK: 38, errors: 0)

### Per folder

| folder | count | dur min s | dur max s | dur avg s | total MB |
|---|---|---|---|---|---|
| N2 | 5 | 44.56 | 154.30 | 99.58 | 102.00 |
| T1 | 3 | 46.42 | 107.49 | 71.43 | 193.64 |
| T2 | 2 | 38.99 | 44.84 | 41.91 | 12.61 |
| V1 | 3 | 5.61 | 12.80 | 9.09 | 182.76 |
| V2 | 4 | 6.50 | 26.82 | 17.05 | 104.51 |
| V3 | 3 | 23.00 | 58.07 | 35.08 | 147.70 |
| V4 | 2 | 12.35 | 12.91 | 12.63 | 113.66 |
| V5 | 6 | 10.60 | 25.18 | 19.82 | 146.92 |
| V6 | 4 | 4.55 | 22.94 | 11.80 | 72.83 |
| V7 | 3 | 3.53 | 7.60 | 5.07 | 23.03 |
| V8 | 3 | 15.00 | 17.11 | 15.75 | 73.03 |
| ALL | 38 | 3.53 | 154.30 | 32.91 | 1172.69 |

### Distinct values

- Resolutions (stored w x h): 1080x1920 (19), 2160x3840 (10), 1920x1080 (4), 720x1280 (3), 576x1024 (1), 1440x2560 (1)
- r_frame_rate: 30 (25), 60 (8), 59.94 (4), 29.97 (1)
- Video codecs: h264 (26), hevc (12)
- pix_fmt: yuv420p (34), yuv420p10le (4)
- Rotation tags: 0° (34), 270° (4)
- Audio codecs: aac (35), none (3)

### Counts

- VFR (r_frame_rate != avg_frame_rate): 0
- HDR/HLG (color_transfer smpte2084 or arib-std-b67): 4 (HLG: 4)
- Portrait: 38 | Landscape: 0 | Square: 0 (orientation after rotation tag)
- No audio stream: 3
- Duration > 15 s: 24

### Anomaly lists

- **VFR** (0): none
- **HDR/HLG** (4): V5/V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_04.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_07.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_5.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_6.MOV
- **Landscape** (0): none
- **Duration > 15 s** (24): N2/N2. Kịch bản video/Video tham khảo/A2 .mp4; N2/N2. Kịch bản video/Video tham khảo/A3.mp4; N2/N2. Kịch bản video/Video tham khảo/Dây chuyền bó hoa.mp4; N2/N2. Kịch bản video/Video tham khảo/Nhẫn tàng hình.mp4; N2/N2. Kịch bản video/Video tham khảo/xoay bánh răng.mp4; T1/T1. Video hiệu quả tốt/Nhật Bản/Nhẫn tàng hình.mp4; T1/T1. Video hiệu quả tốt/Thái Lan/FSave.com_Reels_Media_997639816466076_001_1080p.mp4; T1/T1. Video hiệu quả tốt/Việt Nam/Nhẫn tàng hình (1).mp4; T2/T2. Video hiệu quả kém/Khách đã phải chờ khá lâu cho chiếc dây này.mp4; T2/T2. Video hiệu quả kém/Không tặng gì mới chia tay.mp4; V2/V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Dap-thanh-bac_DTA01_2.mp4; V2/V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Dua-hoc-da_DTA01_5.mp4; V2/V2. Cảnh chế tác các công đoạn/260818_CT_HK_N0017_Nhan-mat-than-Horus-da-xanh_Gan-da-chu_DTA01_2.mp4; V3/V3. Cảnh nhâc vật Huyk/260718_KB_HK_3-dieu-ve-vang-anh-chi-em-biet-som-se-do-mat-tien-oan_DTA01.mp4; V3/V3. Cảnh nhâc vật Huyk/260826_ST_HK_Bua-sao-su_DTA01_2.mp4; V3/V3. Cảnh nhâc vật Huyk/260826_ST_HK_Thiet-ke_DTA01_3.mp4; V5/V5. Source sưu tầm và tự quay/Sưu tầm/1.mp4; V5/V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_04.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260619_N610006-8_Nhan-kim-hoa_MDA07_07.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_5.MOV; V5/V5. Source sưu tầm và tự quay/Tự quay/260701_N610005T-6_Nhan-cong-chua_DTA01_6.MOV; V6/V6. Cảnh sản phẩm hoàn thiện/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Hoan-thien_05.mp4; V8/V8. Footahe gốc chưa cắt ( đều đã đc xử lý max 15s trước khi tải lên NAS)/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Gan-da-to_02.mp4; V8/V8. Footahe gốc chưa cắt ( đều đã đc xử lý max 15s trước khi tải lên NAS)/260914_CTX_N0006-Nhan-tang-hinh_DTA06_Han-noi_05.mp4
- **No audio** (3): N2/N2. Kịch bản video/Video tham khảo/A2 .mp4; N2/N2. Kịch bản video/Video tham khảo/xoay bánh răng.mp4; V1/V1. Cảnh mở đầu/1.mp4
- **Probe errors** (0): none

