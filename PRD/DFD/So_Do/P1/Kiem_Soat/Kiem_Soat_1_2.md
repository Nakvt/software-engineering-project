# KIỂM SOÁT XỬ LÝ 1.2 – Tra cứu tài khoản và token

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 1.2.

**Chức năng:** Tách thông tin tra cứu được gửi đến kho D6. Nhận dữ liệu admin/token từ D6 để chuyển kiểm tra.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I14** | I14 · Dữ liệu tài khoản/token | từ Kho admin/refresh token |
| **T11** | T11 · Định danh tài khoản / token cần kiểm tra | từ 1.1 – Tiếp nhận yêu cầu xác thực |

**Nhóm luồng vào trên hình kiểm soát:** Kho dữ liệu (I14) ; Luồng trung gian (T11).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **I24** | I24 · Tiêu chí tra cứu tài khoản/token | đến Kho admin/refresh token |
| **T13** | T13 · Bản ghi tài khoản / token | đến 1.3 – Kiểm tra mật khẩu hoặc token |

**Nhóm luồng ra trên hình kiểm soát:** Kho dữ liệu (I24) ; Luồng trung gian (T13).

## Thuật toán B1–B3 theo source mới

### B1

Nhận định danh tài khoản hoặc refresh token.

### B2

Tra cứu admins và admin_refresh_tokens qua repository.

### B3

Trả bản ghi liên quan cho bước kiểm tra xác thực.

## Đối chiếu code của xử lý 1.2

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/authService.js` | `login/refreshToken` | 20–67 | Điều phối tra cứu admin và refresh token |
| `backend/src/repositories/adminRepository.js` | `repository query` | 4–15 | Tra cứu tài khoản |
| `backend/src/repositories/refreshTokenRepository.js` | `repository query` | 4–22 | Tra cứu token |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
