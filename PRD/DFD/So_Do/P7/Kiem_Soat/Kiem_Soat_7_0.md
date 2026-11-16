# KIỂM SOÁT XỬ LÝ 7.0 – Quản lý tour

**Nguồn:** DFD mức 1; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 7.0.

**Chức năng:** Nhận yêu cầu tạo, xem, sắp xếp tour/POI. Truy xuất D2/D1, lưu tours/tour_pois, trả kết quả.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F13** | F13 · Dữ liệu tour/POI | từ Quản trị viên |
| **I18** | I18 | từ Kho tour và tour_pois |
| **I19** | I19 | từ Kho POI/danh mục/nội dung |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F13) ; Kho dữ liệu (I18, I19).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F14** | F14 · Thông tin/kết quả tour | đến Quản trị viên |
| **I17** | I17 | đến Kho tour và tour_pois |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F14) ; Kho dữ liệu (I17).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu xem/tạo/sửa/xóa tour từ CMS.

### B2

Đọc, kiểm tra liên kết tour_pois và thực hiện CRUD qua route được bảo vệ.

### B3

Lưu tours/tour_pois và trả dữ liệu/kết quả cho CMS.

## Đối chiếu code của xử lý 7.0

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/tour.route.js` | `GET/POST/PUT/DELETE` | 7–76; 78–136; 138–229; 232–244 | Có xem, tạo, sửa và xóa tour |
| `backend/src/app.js` | `middleware mount` | 27–29 | Route admin tour đi qua authMiddleware và requireAdmin |
| `web-cms/src/data/api/tourApi.ts` | `tour client API` | 36–74 | CMS gọi API tour |

**Điểm cần lưu ý:** Đã có DELETE tour và route admin tours đi qua middleware auth/requireAdmin ở commit mới.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
