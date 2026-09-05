# Phase 0 Research: Multi-Layer Text, Curated Fonts, and Project Persistence

## Decision 1: Architecture for Managing Multiple Text Blocks on Fabric.js

### Decision
Quản lý các khối chữ thông qua danh sách định danh `TextBlockModel[]` trong `EditorStateService`, đồng bộ 1-1 với các đối tượng `fabric.Textbox` trên `CanvasService` bằng một Map tham chiếu `Map<string, Textbox>`.

### Rationale
- Fabric.js hỗ trợ quản lý nhiều đối tượng trên cùng 1 Canvas rất mạnh mẽ.
- Việc gán mỗi Textbox một thuộc tính `id: string` tương ứng với `TextBlockModel.id` giúp khi người dùng click vào chữ trên Canvas (sự kiện `selection:created`, `selection:updated`), bảng điều khiển bên phải tự động chuyển focus vào ô nhập của khối chữ đó (2-way selection sync).
- Khi người dùng thay đổi nội dung ở textarea hoặc kéo slider cỡ chữ, `CanvasService` tìm đúng Textbox qua Map và cập nhật ngay lập tức mà không cần render lại toàn bộ canvas.

### Alternatives Considered
- **Chỉ dùng 1 Textbox đa dòng có phân cách**: Kém linh hoạt vì không thể cho người dùng kéo riêng Tiêu đề chính lên đầu và kéo Tiêu đề phụ xuống cuối ảnh.
- **Hợp nhất ảnh và chữ thành bitmap phẳng**: Mất khả năng hoàn tác và không thể khôi phục vị trí mặc định khi người dùng cần reset.

---

## Decision 2: Curated Vietnamese Font Suite (Hoàn toàn Offline & Không Lỗi Dấu)

### Decision
Bổ sung và chuẩn hóa bộ 6 font chữ TTF/WOFF2 địa phương (offline), phân loại rõ ràng theo mục đích sử dụng và phong cách cảm xúc:

| Mã Font | Tên hiển thị UI (Tiếng Việt) | Tên Font gốc | Đặc trưng thẩm mỹ |
|---|---|---|---|
| `solemn` | **Trang trọng** (Mặc định) | Montserrat-Bold | Nét chữ hình học hiện đại, uy nghiêm, chuẩn phong cách pano/áp phích chính quy |
| `strong` | **Mạnh mẽ / Nổi bật** | BeVietnamPro-Bold | Tối ưu hóa cho tiếng Việt, nét dày dặn, đọc rõ ràng từ xa |
| `modern` | **Hiện đại / Tinh tế** | BeVietnamPro-Regular | Nét thanh thoát, phù hợp với dòng chú thích hoặc khẩu hiệu phụ |
| `classic` | **Cổ điển / Truyền thống** | Merriweather-Bold / Serif | Có chân (serif), đem lại cảm giác lịch sử, trang nghiêm, văn bản chỉ thị |
| `dynamic` | **Năng động / Đậm đà** | Oswald-Bold / Condensed | Chữ cao, gọn gàng, phù hợp tiêu đề dài không bị chiếm nhiều diện tích |
| `friendly` | **Thân thiện / Mềm mại** | Comfortaa / BeVietnam SemiBold | Bo góc nhẹ, gần gũi, phù hợp thông điệp tuyên truyền cộng đồng |

### Rationale
- Người dùng không rành công nghệ chỉ cần bấm vào các nút có nhãn cảm xúc ("Trang trọng", "Mạnh mẽ", "Hiện đại", "Cổ điển") mà không cần phải nhớ tên font kỹ thuật.
- 100% font được nhúng trực tiếp vào thư mục `src/assets/fonts/` và khai báo trong `@font-face` của `src/styles.scss`, đảm bảo offline tuyệt đối và không phụ thuộc vào internet.

### Alternatives Considered
- **Gọi Google Fonts CDN**: Bị loại bỏ vì yêu cầu cốt lõi của ứng dụng là chạy offline trên máy tính cơ quan, máy tính không có internet.
- **Dùng font hệ thống của Windows (Arial, Times New Roman, Tahoma)**: Quá đơn điệu, không tạo được nét thẩm mỹ chuyên nghiệp cho các ấn phẩm tuyên truyền và banner.

---

## Decision 3: Snap-to-Guides & Multi-Object Boundary Constrain

### Decision
1. Mở rộng `snap-guide` của Fabric.js: khi kéo bất kỳ `Textbox` nào gần trục tọa độ giữa canvas (`width / 2` hoặc `height / 2`), đường gióng màu xanh sẽ xuất hiện và hít đối tượng vào tâm.
2. Đồng thời hỗ trợ phím tắt / nút bấm 1 chạm: **"Căn giữa ảnh"** (Center Horizontally) cho khối chữ đang chọn.
3. Ràng buộc biên (Boundary Constrain) cho từng khối chữ: đảm bảo tọa độ `left` và `top` của chữ luôn nằm trong giới hạn an toàn cách viền canvas tối thiểu 20px.

### Rationale
- Người dùng không chuyên nghiệp thường gặp khó khăn khi kéo tay để chữ nằm ngay ngắn chính giữa. Nút bấm 1 chạm "Căn giữa" và tính năng snap tự động giải quyết triệt để vấn đề này.

---

## Decision 4: Project Save / Load Format & Storage Strategy

### Decision
1. **File định dạng dự án (`.json` hoặc `.bannerproj`)**:
   - Chứa: Kích thước canvas, DataURL của ảnh nền, mảng các `textBlocks`, font, màu sắc, vị trí.
   - Thao tác: Dùng `dialog.showSaveDialog` và `dialog.showOpenDialog` trong Electron (hoặc tải file / kéo thả file trong browser) để người dùng có thể cất file dự án vào ổ đĩa và mở lại bất cứ lúc nào.
2. **Tự động lưu phiên làm việc (Auto-recover / Session Restore)**:
   - Lưu trạng thái gần nhất vào `localStorage` hoặc file tạm của app.
   - Khi khởi động lại ứng dụng, nếu có dự án chưa hoàn tất, hiển thị thông báo nhẹ nhàng: *"Bạn có muốn tiếp tục chỉnh sửa bản thảo gần nhất không?"* kèm nút "Mở lại" và "Bỏ qua".

### Rationale
- Đáp ứng chính xác mong muốn "có thể dùng cấu hình cũ" của người dùng.
- Giúp người dùng yên tâm không bị mất công sức nếu vô tình tắt máy hoặc thoát ứng dụng.
