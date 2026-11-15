# KIỂM SOÁT XỬ LÝ 3.3 – Xác định POI trong bán kính

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 3.3.

**Chức năng:** Nhận GPS và bán kính POI. Tính Haversine và chọn POI ứng viên.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T02** | T02 · Danh sách POI và bán kính | từ 3.2 – Tra cứu thông số vùng POI |
| **T05** | T05 · Tọa độ đã chuẩn hóa | từ 3.1 – Tiếp nhận và chuẩn hóa GPS |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T02, T05).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T03** | T03 · POI ứng viên và khoảng cách | đến 3.4 – Kiểm tra cooldown |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T03).

## Thuật toán B1–B3 theo source mới

### B1

Nhận GPS và thông số các POI.

### B2

Tính Haversine và đối chiếu khoảng cách với radius.

### B3

Đưa ra danh sách POI nằm trong vùng.

## Đối chiếu code của xử lý 3.3

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `calculateDistanceMeters/processTrackingPing` | 7–21; 190–214 | Haversine, đối chiếu bán kính |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
