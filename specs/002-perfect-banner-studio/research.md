# Research & Architecture Decisions: Perfect Banner Studio

## 1. Canvas Engine & Responsive Viewport

- **Decision**: Sử dụng Fabric.js (v6) với kiến trúc Virtual High-DPI Coordinate System và Dynamic Viewport Scaling qua `ResizeObserver`.
- **Rationale**:
  - Khi người dùng tải ảnh 4K hoặc ảnh tỉ lệ bất kỳ, nếu set trực tiếp kích thước màn hình sẽ bị vỡ ảnh hoặc tràn khung.
  - Virtual Coordinate giữ nguyên tọa độ gốc của ảnh hoặc chuẩn hóa (1920px base width). Canvas element sẽ được zoom `setZoom(scale)` theo viewport hiển thị.
  - Nhờ vậy, khi xuất ảnh (export PNG), độ nét đạt 100% gốc không bị suy giảm (pixel-perfect), đồng thời chuột kéo thả và hộp chọn hitbox không bị lệch pixel.
- **Alternatives considered**:
  - *HTML5 Canvas thuần*: Quá phức tạp khi xử lý tương tác kéo thả nhiều layer chữ, xoay góc, đổi font inline, và snap guide.
  - *DOM Overlay trên ảnh (CSS absolute)*: Xuất ra file ảnh (html2canvas) thường xuyên bị lỗi font tiếng Việt, mất hiệu ứng đổ bóng, và sai lệch màu sắc.

## 2. Photoshop-grade Typography & Vietnamese Font Handling

- **Decision**:
  - Tuyển chọn 6 bộ font Google Fonts Việt hóa 100% chuẩn Unicode không bao giờ lỗi dấu: `Montserrat`, `Be Vietnam Pro`, `Playfair Display`, `Oswald`, `Merriweather`, `Comfortaa`.
  - Phân loại font theo "Cảm xúc" (Emotional Presets) thay vì thuật ngữ kỹ thuật khó hiểu:
    - **Trang trọng**: Playfair Display (Serif cổ điển, uy nghiêm)
    - **Mạnh mẽ**: Oswald (Condensed sans, dứt khoát, khẩu hiệu)
    - **Hiện đại**: Montserrat (Geometric sans, tiêu chuẩn quốc tế)
    - **Thanh lịch**: Be Vietnam Pro (Tối ưu cho văn bản tiếng Việt)
    - **Mềm mại**: Comfortaa (Bo tròn, thân thiện, nhẹ nhàng)
    - **Cổ điển**: Merriweather (Serif ấm áp, tin cậy)
  - Hiệu ứng Text Stroke: Sử dụng `paintFirst: 'stroke'` trong Fabric.js để lớp viền luôn nằm dưới lớp màu chữ, tránh tình trạng viền dày đè bẹp các nét chữ tiếng Việt.
  - Hiệu ứng Shadow: Tích hợp 4 preset bóng đổ 1-chạm:
    - Không bóng (Phẳng)
    - Đổ bóng mềm (Soft Drop Shadow)
    - Đổ bóng khối 3D (Hard Offset Shadow)
    - Viền phát sáng nổi bật (Outer Glow / High Contrast)

## 3. PowerPoint-style Layout Master System

- **Decision**: Tách rời hoàn toàn cấu trúc bố cục (Layout Master) khỏi ảnh nền tĩnh.
- **Rationale**:
  - Người dùng không muốn các mẫu ảnh tĩnh cứng nhắc của bên thứ ba. Họ muốn dùng ảnh chụp của cơ quan/cá nhân họ.
  - Khuôn bố cục lưu trữ vị trí tương đối (`ratioX`, `ratioY`), kích thước tỷ lệ, kiểu font và hiệu ứng.
  - Khi người dùng tải ảnh có tỷ lệ bất kỳ (vuông 1:1, ngang 16:9, dọc 9:16), hệ thống tự động scale tọa độ để chữ nằm đúng vị trí thẩm mỹ.
  - Cho phép người dùng lưu lại thiết lập chữ hiện tại thành "Khuôn mẫu cá nhân" (Custom Layout Master) vào `localStorage`.
  - Hỗ trợ nút "Đổi ảnh nền" 1-chạm: Giữ nguyên 100% nội dung chữ, kiểu dáng, và vị trí, chỉ thay backdrop bên dưới.

## 4. Dự án & Khôi phục trạng thái (State Persistence)

- **Decision**:
  - Cơ chế Auto-save tự động lưu toàn bộ trạng thái vào `localStorage` sau mỗi thao tác.
  - Hỗ trợ lưu ra tệp `.json` (Project File) chứa ảnh nền (base64 data URL) và toàn bộ mảng `TextBlock` để người dùng có thể lưu trữ vào ổ cứng hoặc mở lại trên máy khác.
  - Không yêu cầu kết nối mạng hay máy chủ backend, 100% an toàn bảo mật dữ liệu người dùng.
