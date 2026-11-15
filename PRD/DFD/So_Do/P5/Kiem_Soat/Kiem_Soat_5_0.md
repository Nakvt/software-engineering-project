# KIỂM SOÁT XỬ LÝ 5.0 – Ghi nhận lịch sử nghe

**Nguồn:** DFD mức 1; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 5.0.

**Chức năng:** Nhận sự kiện nghe/phiên và ngữ cảnh trigger. Kiểm tra, ghi play_history khi đủ sự kiện nghe.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I06** | I06 · Ngữ cảnh trigger (không phải lượt nghe) | từ P3 |
| **I10** | I10 | từ 4.0 – Quản lý phiên tham quan |
| **I11** | I11 · Sự kiện nghe thực tế / thời lượng | từ P2 |

**Nhóm luồng vào trên hình kiểm soát:** Tiến trình khác (I06, I10, I11).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **I12** | I12 | đến Kho lịch sử nghe |

**Nhóm luồng ra trên hình kiểm soát:** Kho dữ liệu (I12).

## Thuật toán B1–B3 theo source mới

### B1

Nhận listen event từ client sau khi audio hoàn tất.

### B2

Kiểm tra session/POI và chuẩn hóa trigger; caller chưa phân biệt đúng triggerType.

### B3

Ghi play_history với thời lượng và trạng thái hoàn tất.

## Đối chiếu code của xử lý 5.0

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/domain/services/poiService.ts` | `logListenEvent` | 101–121 | Gửi sự kiện nghe |
| `backend/src/controllers/mobilePoiController.js` | `logListenEvent` | 154–214 | Tiếp nhận/kiểm tra sự kiện |
| `backend/src/services/mobilePoiService.js` | `recordListenEvent` | 243–303 | Ghi play_history |
| `mobile-gps/src/domain/services/AudioQueueService.ts` | `onAudioFinished` | 151–158 | Đang gửi triggerType geofence cho mọi trường hợp |

**Điểm cần lưu ý:** Caller AudioQueue hiện gửi triggerType = geofence kể cả khi phát từ QR/manual; cần phân biệt tình trạng triển khai với thiết kế logic.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
