# KIỂM SOÁT XỬ LÝ 2.3 – Tra cứu POI và chọn ngôn ngữ

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 2.3.

**Chức năng:** Nhận tiêu chí, mã QR, lựa chọn ngôn ngữ. Đọc D1, chọn nội dung, trả thông tin POI và chuyển metadata.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T01** | T01 · Tiêu chí POI | từ 2.1 – Tiếp nhận tra cứu POI |
| **T02** | T02 · Khóa POI từ QR | từ 2.2 – Tiếp nhận mã QR POI |
| **F06** | F06 · Ngôn ngữ, giọng đọc | từ Khách tham quan |
| **I02** | I02 | từ Kho POI/danh mục/nội dung |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T01, T02) ; Tác nhân ngoài (F06) ; Kho dữ liệu (I02).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T03** | T03 · Nội dung/metadata đã chọn | đến 2.4 – Chuẩn bị nội dung thuyết minh |
| **F02** | F02 · Danh sách / chi tiết POI | đến Khách tham quan |
| **I01** | I01 | đến Kho POI/danh mục/nội dung |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T03) ; Tác nhân ngoài (F02) ; Kho dữ liệu (I01).

## Thuật toán B1–B3 theo source mới

### B1

Nhận tiêu chí tra cứu, khóa POI, ngôn ngữ và giọng.

### B2

Truy vấn POI/poi_contents; chọn ngôn ngữ, fallback tiếng Việt.

### B3

Trả danh sách/chi tiết POI, metadata cho bước chuẩn bị audio.

## Đối chiếu code của xử lý 2.3

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `getPois/getPoiByCode` | 25–109; 111–157 | Tra cứu POI và chọn nội dung theo ngôn ngữ, fallback tiếng Việt |

**Điểm cần lưu ý:** Tra cứu theo QR phụ thuộc việc khắc phục sai khác route; luồng T02 là luồng logic.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
