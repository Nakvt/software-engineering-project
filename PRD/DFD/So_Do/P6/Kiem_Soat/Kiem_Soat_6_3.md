# KIỂM SOÁT XỬ LÝ 6.3 – Xử lý tạo/sửa/xóa POI

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 6.3.

**Chức năng:** Nhận dữ liệu hợp lệ và POI hiện có. Chuẩn bị thay đổi POI; phân nhánh cần/không cần dịch.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T62** | T62 · Dữ liệu hợp lệ / thao tác | từ 6.1 – Tiếp nhận, kiểm tra dữ liệu |
| **T63** | T63 · Dữ liệu POI hiện có | từ 6.2 – Tra cứu POI hiện có |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T62, T63).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T65** | T65 · Nội dung cần dịch | đến 6.4 – Chuẩn bị/dịch nội dung |
| **T66** | T66 · Thay đổi không cần dịch | đến 6.5 – Lưu và trả kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T65, T66).

## Thuật toán B1–B3 theo source mới

### B1

Nhận thao tác tạo/sửa/xóa POI.

### B2

Thực hiện route POST/PUT/DELETE và xử lý dữ liệu.

### B3

Chuyển kết quả biến đổi cho bước ghi/trả kết quả.

## Đối chiếu code của xử lý 6.3

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-poi.routes.js` | `POST/DELETE/PUT` | 91–229; 232–263; 266–423 | Tạo, xóa, sửa POI; file có hai route PUT trùng path |

**Điểm cần lưu ý:** GET/POST/PUT/DELETE POI có, nhưng có hai khai báo route PUT /:id trong source mới; cần rà soát xung đột.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
