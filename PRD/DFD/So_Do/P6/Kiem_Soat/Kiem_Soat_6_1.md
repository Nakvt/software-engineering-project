# KIỂM SOÁT XỬ LÝ 6.1 – Tiếp nhận, kiểm tra dữ liệu

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 6.1.

**Chức năng:** Nhận dữ liệu POI và nội dung admin gửi. Kiểm tra bắt buộc, tách thao tác và tiêu chí.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F11** | F11 · Dữ liệu POI / nội dung | từ Quản trị viên |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F11).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T61** | T61 · Tiêu chí tra cứu | đến 6.2 – Tra cứu POI hiện có |
| **T68** | T68 · Kết quả kiểm tra / lỗi đầu vào | đến 6.5 – Lưu và trả kết quả |
| **T62** | T62 · Dữ liệu hợp lệ / thao tác | đến 6.3 – Xử lý tạo/sửa/xóa POI |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T61, T68, T62).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu quản trị POI/nội dung.

### B2

Kiểm tra code, tên, tọa độ, radius, content.

### B3

Chuyển dữ liệu hợp lệ cho các xử lý tiếp.

## Đối chiếu code của xử lý 6.1

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-poi.routes.js` | `validator/POST` | 24–64; 91–136 | Kiểm tra dữ liệu POI nhận từ CMS |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
