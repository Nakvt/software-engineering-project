# KIỂM SOÁT XỬ LÝ 1.5 – Tổng hợp và trả kết quả

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 1.5.

**Chức năng:** Nhận token hoặc lỗi từ các nhánh xử lý. Trả JSON xác thực cho quản trị viên.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T15** | T15 · Thông báo xác thực thất bại | từ 1.3 – Kiểm tra mật khẩu hoặc token |
| **T16** | T16 · Access token / trạng thái phiên | từ 1.4 – Cấp, làm mới hoặc thu hồi token |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T15, T16).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F10** | F10 · Token / trạng thái xác thực | đến Quản trị viên |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F10).

## Thuật toán B1–B3 theo source mới

### B1

Nhận kết quả xử lý hoặc lỗi.

### B2

Chuẩn hóa envelope JSON.

### B3

Trả token hoặc trạng thái về quản trị viên.

## Đối chiếu code của xử lý 1.5

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/controllers/authController.js` | `login/refreshToken/logout` | 4–78 | Tạo phản hồi JSON kết quả xác thực |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
