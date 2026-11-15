# KIỂM SOÁT XỬ LÝ 2.2 – Tiếp nhận mã QR POI

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 2.2.

**Chức năng:** Nhận chuỗi QR từ mobile. Tách khóa POI và gửi yêu cầu tra cứu, lưu ý sai khác API.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F05** | F05 · Mã QR | từ Khách tham quan |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F05).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T02** | T02 · Khóa POI từ QR | đến 2.3 – Tra cứu POI và chọn ngôn ngữ |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T02).

## Thuật toán B1–B3 theo source mới

### B1

Nhận dữ liệu mã QR từ camera.

### B2

Mobile đang gọi getPOIById(data) chưa khớp backend by-code.

### B3

Chỉ thể hiện chuyển khóa POI ở mức logic; chưa xác nhận QR hoạt động đầu-cuối.

## Đối chiếu code của xử lý 2.2

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/presentation/screens/QRScannerScreen.tsx` | `handleBarCodeScanned` | 31–57 | Quét QR; client hiện gọi getPOIById(data) |
| `mobile-gps/src/domain/services/poiService.ts` | `getPOIById` | 34–61 | Gọi route /pois/:id chưa thấy ở backend |
| `backend/src/services/mobilePoiService.js` | `getPoiByCode` | 111–157 | Backend tra cứu theo code |

**Điểm cần lưu ý:** QR end-to-end chưa khớp: mobile gọi /pois/:id còn backend hỗ trợ /pois/by-code/:code; QR CMS có thể mang tiền tố poi://.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
