# KIỂM SOÁT XỬ LÝ 6.4 – Chuẩn bị/dịch nội dung

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 6.4.

**Chức năng:** Nhận nội dung cần dịch. Gọi Google Translate, nhận bản dịch (nếu thành công).

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F18** | F18 · Nội dung đã dịch | từ Google Translate API |
| **T65** | T65 · Nội dung cần dịch | từ 6.3 – Xử lý tạo/sửa/xóa POI |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F18) ; Luồng trung gian (T65).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F17** | F17 · Văn bản gốc + ngôn ngữ đích | đến Google Translate API |
| **T67** | T67 · Nội dung đa ngôn ngữ | đến 6.5 – Lưu và trả kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F17) ; Luồng trung gian (T67).

## Thuật toán B1–B3 theo source mới

### B1

Nhận dữ liệu nội dung cần dịch.

### B2

Gọi dịch tự động best-effort; nếu lỗi thì không đảm bảo có bản dịch.

### B3

Chuyển nội dung có dịch (nếu có) cho bước lưu.

## Đối chiếu code của xử lý 6.4

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-poi.routes.js` | `translate` | 172–201 | Gọi dịch tự động best-effort; thất bại không chặn nghiệp vụ |

**Điểm cần lưu ý:** Google Translate best-effort; thất bại dịch chỉ warning. Audio URL mặc định chưa có pipeline thực.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
