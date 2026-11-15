# KIỂM SOÁT XỬ LÝ 6.5 – Lưu và trả kết quả

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 6.5.

**Chức năng:** Nhận các kết quả kiểm tra, chỉnh sửa, dịch. Ghi POI/content xuống D1 và trả kết quả cho admin.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T68** | T68 · Kết quả kiểm tra / lỗi đầu vào | từ 6.1 – Tiếp nhận, kiểm tra dữ liệu |
| **T64** | T64 · Danh sách / chi tiết tra cứu | từ 6.2 – Tra cứu POI hiện có |
| **T66** | T66 · Thay đổi không cần dịch | từ 6.3 – Xử lý tạo/sửa/xóa POI |
| **T67** | T67 · Nội dung đa ngôn ngữ | từ 6.4 – Chuẩn bị/dịch nội dung |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T68, T64, T66, T67).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F12** | F12 · Danh sách / kết quả POI | đến Quản trị viên |
| **I15** | I15 · Lưu / cập nhật POI, nội dung | đến Kho POI/danh mục/nội dung |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F12) ; Kho dữ liệu (I15).

## Thuật toán B1–B3 theo source mới

### B1

Nhận dữ liệu POI/content đã xử lý.

### B2

Ghi các bảng pois và poi_contents trong transaction thích hợp.

### B3

Trả JSON kết quả cho CMS.

## Đối chiếu code của xử lý 6.5

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-poi.routes.js` | `POST/PUT transaction` | 130–229; 337–423 | Ghi pois/poi_contents và trả kết quả |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
