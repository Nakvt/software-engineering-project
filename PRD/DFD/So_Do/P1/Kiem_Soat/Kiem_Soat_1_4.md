# KIỂM SOÁT XỬ LÝ 1.4 – Cấp, làm mới hoặc thu hồi token

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 1.4.

**Chức năng:** Nhận kết quả xác thực hợp lệ. Phát hành access token; lưu/xóa refresh token theo loại yêu cầu.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T14** | T14 · Kết quả kiểm tra hợp lệ | từ 1.3 – Kiểm tra mật khẩu hoặc token |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T14).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **I13** | I13 · Dữ liệu lưu / thu hồi refresh token | đến Kho admin/refresh token |
| **T16** | T16 · Access token / trạng thái phiên | đến 1.5 – Tổng hợp và trả kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Kho dữ liệu (I13) ; Luồng trung gian (T16).

## Thuật toán B1–B3 theo source mới

### B1

Nhận kết quả xác thực hợp lệ.

### B2

Login cấp access + refresh; refresh chỉ cấp access; logout xóa refresh token.

### B3

Ghi hoặc xóa refresh token và chuyển trạng thái/token cho controller.

## Đối chiếu code của xử lý 1.4

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/authService.js` | `login/refreshToken/logout` | 32–42; 75–89 | Cấp access/refresh khi login, refresh chỉ cấp access mới, logout xóa refresh |
| `backend/src/repositories/refreshTokenRepository.js` | `token repository` | 4–22 | Ghi/tra cứu/xóa token |

**Điểm cần lưu ý:** Refresh token hiện chưa rotate: refresh chỉ cấp access token mới, không phát hành refresh token mới.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
