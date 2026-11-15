# DFD V10 — Đồng bộ theo source tại commit e75a63f7b916d0d90c2a608d1fc8af3d4907489b

Thư mục `So_Do/` được giữ cấu trúc theo từng tiến trình (P1–P8). Chỉ cập nhật DFD và phiếu kiểm soát, **không cập nhật Deployment Diagram** trong lần này.

## Đã làm

- Giữ 7 DFD chính: mức 0, mức 1 và mức 2 P1/P2/P3/P6/P8.
- Giữ 28 phiếu/sơ đồ kiểm soát từng xử lý: P1–P8; giữ nguyên hướng, mã và số lượng các mũi tên.
- Cập nhật nhãn ở DFD P2 và P8 để phân biệt QR/audio chưa hoàn tất và thống kê không có bộ lọc động.
- Cập nhật nội dung thuật toán B1–B3 của 28 phiếu và dẫn chứng mã nguồn theo commit mới (kèm đường dẫn tính từ gốc repository).
- Cập nhật trạng thái P7: đã có DELETE tour và bảo vệ route admin theo báo cáo mới.
- Xuất lại SVG/PNG từ 35 script `.dot` bằng Graphviz.

## Các điểm không được hiểu nhầm

- Chức năng QR mobile chưa khớp backend route; DFD là sơ đồ logic, không khẳng định luồng QR đã hoạt động end-to-end.
- Phát audio URL chưa có đường phát tệp thực tế; TTS là luồng đang được dùng.
- Cooldown dùng `play_history` nhưng chưa có debounce vị trí ổn định.
- `triggerType` trong lịch sử nghe chưa phân biệt đầy đủ các nguồn kích hoạt.
- Analytics hiện chưa có bộ lọc thời gian/POI/tour/ngôn ngữ động.
- Dịch tự động là best-effort.

## Nguồn và mức độ chắc chắn

Bằng chứng dựa trên báo cáo Copilot ở commit `e75a63f7b916d0d90c2a608d1fc8af3d4907489b` do nhóm cung cấp, **không kiểm tra trực tiếp source repository mới trong môi trường này**. Tài liệu có tham chiếu số dòng theo báo cáo; khi bảo vệ hãy mở đúng commit để xác nhận. Không sửa source code.

## Cách xem

- Các sơ đồ chính nằm trong `So_Do/00_DFD_Muc_0/`, `01_DFD_Muc_1/` và `So_Do/P*/So_Do_Muc_2/`.
- Mỗi phần kiểm soát nằm trong `So_Do/P*/Kiem_Soat/`: `.dot`, `.png`, `.svg`, `.md`.
- Bảng code tập trung: `So_Do/Doi_Chieu_Code/Bang_Doi_Chieu_28_Xu_Ly_Chi_Tiet.md`.
