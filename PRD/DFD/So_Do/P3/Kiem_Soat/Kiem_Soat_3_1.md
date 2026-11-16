# KIỂM SOÁT XỬ LÝ 3.1 – Tiếp nhận và chuẩn hóa GPS

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 3.1.

**Chức năng:** Nhận tọa độ khách và thời điểm. Chuẩn hóa GPS, chuyển tọa độ tới các bước sau.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F03** | F03 · Tọa độ GPS | từ Khách tham quan |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F03).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T01** | T01 · Tọa độ để tra cứu vùng | đến 3.2 – Tra cứu thông số vùng POI |
| **T05** | T05 · Tọa độ đã chuẩn hóa | đến 3.3 – Xác định POI trong bán kính |
| **T06** | T06 · Bản ghi tọa độ / thời điểm | đến 3.5 – Ghi GPS và phát hành kết quả |
| **I07** | I07 · Hoạt động GPS/phiên | đến 4.0 – Quản lý phiên tham quan |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T01, T05, T06) ; Tiến trình khác (I07).

## Thuật toán B1–B3 theo source mới

### B1

Nhận vị trí GPS từ mobile.

### B2

Gửi tracking ping, kiểm tra dữ liệu tọa độ; chưa có debounce ổn định.

### B3

Truyền dữ liệu tọa độ/session tới kiểm tra vùng.

## Đối chiếu code của xử lý 3.1

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/presentation/hooks/useGeofencing.ts` | `checkAndTriggerPOI` | 40–78 | Đọc GPS và gửi tracking ping; chưa có debounce ổn định |
| `backend/src/controllers/mobilePoiController.js` | `pingGeofence` | 114–152 | Kiểm tra dữ liệu tọa độ |

**Điểm cần lưu ý:** Không thấy debounce GPS dựa trên vị trí ổn định; isPingingRef chỉ tránh request đồng thời.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
