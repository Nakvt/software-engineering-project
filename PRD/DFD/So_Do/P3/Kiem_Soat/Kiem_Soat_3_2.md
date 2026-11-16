# KIỂM SOÁT XỬ LÝ 3.2 – Tra cứu thông số vùng POI

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 3.2.

**Chức năng:** Nhận tọa độ để chọn vùng. Đọc thông số POI/bán kính trong D1.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T01** | T01 · Tọa độ để tra cứu vùng | từ 3.1 – Tiếp nhận và chuẩn hóa GPS |
| **I04** | I04 · Thông số POI | từ Kho POI/danh mục/nội dung |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T01) ; Kho dữ liệu (I04).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T02** | T02 · Danh sách POI và bán kính | đến 3.3 – Xác định POI trong bán kính |
| **I03** | I03 · Tiêu chí tra cứu vùng POI | đến Kho POI/danh mục/nội dung |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T02) ; Kho dữ liệu (I03).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu xác định POI gần vị trí.

### B2

Đọc tọa độ, radius và cấu hình POI.

### B3

Trả thông số vùng POI cho tính khoảng cách.

## Đối chiếu code của xử lý 3.2

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `getPois` | 25–109 | Đọc thông số vùng POI |
| `database-schema.sql` | `pois` | 34–49 | Định nghĩa vị trí/bán kính POI |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
