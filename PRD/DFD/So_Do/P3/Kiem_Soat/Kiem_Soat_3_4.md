# KIỂM SOÁT XỬ LÝ 3.4 – Kiểm tra cooldown

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 3.4.

**Chức năng:** Nhận POI ứng viên và khoảng cách. Đối chiếu play_history để quyết định trigger.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T03** | T03 · POI ứng viên và khoảng cách | từ 3.3 – Xác định POI trong bán kính |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T03).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T04** | T04 · Kết quả kiểm tra trigger | đến 3.5 – Ghi GPS và phát hành kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T04).

## Thuật toán B1–B3 theo source mới

### B1

Nhận POI trong phạm vi kích hoạt.

### B2

Kiểm tra play_history.played_at theo session+POI; chưa có khóa chống lặp trước khi ghi lịch sử.

### B3

Chuyển kết quả có/không nên trigger.

## Đối chiếu code của xử lý 3.4

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `processTrackingPing` | 209–224 | Cooldown dựa play_history.played_at, chưa ngăn lặp trước khi ghi lịch sử |

**Điểm cần lưu ý:** Cooldown đọc play_history.played_at và có thể phát lại trước khi listen event hoàn tất được ghi.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
