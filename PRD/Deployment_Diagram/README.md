# UML Deployment Diagram – Tourism CMS / Linh Ung Pagoda

## Các file

- `Deployment_Diagram_Updated.svg`: **bản chính giữ template hình gốc**, bố cục và phong cách node 3D xanh, component vàng, artifact xanh lá. Đây là **script SVG chỉnh sửa trực tiếp** (mở bằng VS Code / Inkscape).
- `Deployment_Diagram_Updated.png`: hình 3600×2400 để nộp, chèn Word/slide.
- `Deployment_Diagram_Graphviz.dot`: **script DOT Graphviz** tương đương về thành phần/kết nối; Graphviz tự tính bố cục nên không giống template gốc 100%.
- `Deployment_Diagram_Graphviz.svg` và `.png`: bản xuất từ script Graphviz để kiểm tra.
- `Ban_Goc_Tham_Chieu.jpg`: template gốc giữ nguyên để đối chiếu.
- `Ghi_Chu_Doi_Chieu.md`: chứng cứ và điểm chưa xác minh.

## Dựng lại từ script DOT trên Windows

```powershell
dot -Tpng "Deployment_Diagram_Graphviz.dot" -o "Deployment_Diagram_Graphviz.png"
dot -Tsvg "Deployment_Diagram_Graphviz.dot" -o "Deployment_Diagram_Graphviz.svg"
```

**Muốn giữ đúng phong cách template gốc:** mở/sửa trực tiếp `Deployment_Diagram_Updated.svg` bằng Inkscape (miễn phí) hoặc trình soạn thảo SVG. DOT là một phiên bản sơ đồ khác do Graphviz tự bố trí, không thể đảm bảo giống mẫu từng pixel.

## Giới hạn chứng cứ

Bản cập nhật theo báo cáo Copilot tại commit `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`, không xác minh runtime thực tế các hosting Render / Vercel / Neon. `*` đánh dấu dịch vụ sản xuất / API chưa được kiểm thử trực tiếp. Không có file deploy thực tế chứng minh production hoạt động; chỉ có cấu hình/tham chiếu source.

Do ưu tiên giữ nguyên template, không đưa QR image service vào sơ đồ chính; có thể thêm nếu yêu cầu mô tả đầy đủ tất cả kết nối ở runtime.
