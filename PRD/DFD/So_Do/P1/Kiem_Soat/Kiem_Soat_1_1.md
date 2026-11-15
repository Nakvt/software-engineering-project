# KIỂM SOÁT XỬ LÝ 1.1 – Tiếp nhận yêu cầu xác thực

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 1.1.

**Chức năng:** Nhận đăng nhập, làm mới hoặc đăng xuất. Tách định danh và dữ liệu xác thực thành luồng nội bộ.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F09** | F09 · Đăng nhập / refresh / đăng xuất | từ Quản trị viên |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F09).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T11** | T11 · Định danh tài khoản / token cần kiểm tra | đến 1.2 – Tra cứu tài khoản và token |
| **T12** | T12 · Thông tin bí mật hoặc refresh token | đến 1.3 – Kiểm tra mật khẩu hoặc token |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T11, T12).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu login, refresh hoặc logout qua API.

### B2

Kiểm tra tham số request ở controller.

### B3

Chuyển dữ liệu sang service và trả phản hồi.

## Đối chiếu code của xử lý 1.1

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/authRoutes.js` | `router.post(login/refresh-token/logout)` | 13–15 | Tiếp nhận ba API xác thực |
| `backend/src/controllers/authController.js` | `login/refreshToken/logout` | 4–78 | Nhận request và trả kết quả |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
