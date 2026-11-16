# KIỂM SOÁT XỬ LÝ 1.3 – Kiểm tra mật khẩu hoặc token

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 1.3.

**Chức năng:** Nhận thông tin đăng nhập/token và bản ghi D6. So khớp bcrypt/JWT, sinh kết quả hợp lệ hoặc lỗi.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T12** | T12 · Thông tin bí mật hoặc refresh token | từ 1.1 – Tiếp nhận yêu cầu xác thực |
| **T13** | T13 · Bản ghi tài khoản / token | từ 1.2 – Tra cứu tài khoản và token |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T12, T13).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T14** | T14 · Kết quả kiểm tra hợp lệ | đến 1.4 – Cấp, làm mới hoặc thu hồi token |
| **T15** | T15 · Thông báo xác thực thất bại | đến 1.5 – Tổng hợp và trả kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T14, T15).

## Thuật toán B1–B3 theo source mới

### B1

Nhận dữ liệu tài khoản/token và mật khẩu hoặc refresh token.

### B2

Dùng bcrypt.compare hay jwt.verify để kiểm tra.

### B3

Trả kết quả kiểm tra hoặc lỗi xác thực.

## Đối chiếu code của xử lý 1.3

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/authService.js` | `login/refreshToken` | 20–35; 55–70 | Đối chiếu bcrypt, xác minh JWT |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
