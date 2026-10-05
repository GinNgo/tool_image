# Requirements Quality & Acceptance Checklist: Desktop Image Studio Redesign

Tài liệu kiểm định chất lượng dành cho Agent lập trình trước khi bàn giao hoàn thiện tính năng.

---

## 1. Kiểm định Kiến trúc & Giao diện (Studio Workspace)

- [x] **Loại bỏ hoàn toàn Wizard 3 bước**: Giao diện chỉ có một màn hình Studio duy nhất (Single-window), không còn các bước Bước 1, Bước 2, Bước 3 rời rạc.
- [x] **Canvas Viewport Auto-Fit**: Khi mở bất kỳ ảnh nào (ngang, dọc, vuông, panorama), toàn bộ bức ảnh phải hiển thị trọn vẹn trong vùng stage giữa màn hình. Không bao giờ xuất hiện thanh cuộn ngoài của cửa sổ ứng dụng.
- [x] **Cửa sổ ứng dụng co giãn linh hoạt**: Khi kéo giãn hoặc thu nhỏ cửa sổ Windows, canvas tự động co giãn tỷ lệ hiển thị mượt mà mà không làm thay đổi kích thước pixel thật của ảnh.
- [x] **Bộ điều khiển Viewport hoạt động chuẩn**: Các nút Zoom In (+), Zoom Out (-), và Vừa màn hình (Fit Screen) hoạt động chính xác.

---

## 2. Kiểm định Xử lý Hình ảnh (Image Processing Engine)

- [x] **Không cưỡng ép tỷ lệ ảnh**: Tải ảnh 16:9 thì canvas là 16:9; tải ảnh 1:1 thì canvas là 1:1; không bị ép thành 1080x1350 như bản cũ.
- [x] **Đổi tỷ lệ khung hình linh hoạt**: Cho phép đổi giữa Gốc, 1:1, 16:9, 9:16, 4:5, 3:2, A4 và chọn chế độ Fit hoặc Cover.
- [x] **Bộ lọc quang học phi hủy diệt**: Các thanh trượt Độ sáng (Brightness), Độ tương phản (Contrast), Độ bão hòa (Saturation), và Làm mờ (Blur) phản hồi tức thì dưới 50ms và có nút Đặt lại (Reset) về 0.
- [x] **Lớp phủ làm tối (Dimmer Overlay)**: Bật dải gradient làm tối từ đáy lên giúp chữ ở phía dưới ảnh luôn đọc rõ ràng trên mọi bức ảnh chụp.
- [x] **Cắt và Xoay ảnh**: Hoạt động mượt mà, không làm biến dạng tỷ lệ ảnh gốc.

---

## 3. Kiểm định Soạn thảo Văn bản (Typography & Multi-Textbox)

- [x] **Đa hộp chữ tự do**: Thêm được nhiều hộp chữ độc lập trên cùng một ảnh, kéo thả tự do như trong PowerPoint.
- [x] **Tiếng Việt Unicode chuẩn**: Gõ được toàn bộ các ký tự tiếng Việt có dấu (â, ă, đ, ê, ô, ơ, ư...) bằng Unikey/Telex/VNI không bị mất dấu hay lỗi font.
- [x] **Tự động ngắt dòng**: Khi kéo handle cạnh bên của hộp chữ, văn bản tự động bẻ dòng xuống hàng không bị tràn mất kiểm soát.
- [x] **Dải nền chữ (Text Ribbon Highlight)**: Bật được dải nền màu (đỏ, xanh, vàng, đen) ôm sát từng dòng chữ có bo góc, giúp chữ nổi bật ngay cả trên ảnh có nền phức tạp.
- [x] **Hiệu ứng chữ**: Viền chữ (Stroke) và Bóng đổ (Shadow) hiển thị sắc nét.

---

## 4. Kiểm định Tương tác & Phím tắt (Desktop Shortcuts & Snapping)

- [x] **Đường gióng nam châm (Smart Snapping)**: Khi kéo chữ đến tâm ngang hoặc tâm dọc của ảnh, xuất hiện đường kẻ xanh neon và tự động hút vào tâm.
- [x] **Phím mũi tên**: Dịch chuyển hộp chữ 1px mỗi lần nhấn, `Shift` + mũi tên dịch chuyển 10px.
- [x] **Undo / Redo 50 bước**: Nhấn `Ctrl+Z` hoàn tác được tối thiểu 50 thao tác; nhấn `Ctrl+Y` làm lại chính xác.
- [x] **Phím tắt chuẩn**: `Ctrl+S` (Lưu), `Ctrl+O` (Mở), `Ctrl+D` (Nhân bản), `Delete` (Xóa lớp).

---

## 5. Kiểm định Lưu trữ & Xuất tệp (File & Export Quality)

- [x] **Tệp dự án `.tiproj`**: Lưu và mở lại dự án giữ nguyên 100% tất cả các lớp chữ, ảnh nền và bộ lọc.
- [x] **Auto-save dự phòng**: Tự động lưu bản nháp mỗi 30 giây để khôi phục phiên làm việc khi cần.
- [x] **Xuất ảnh đa định dạng**: Xuất được PNG (trong suốt/sắc nét), JPG (chọn chất lượng), WebP.
- [x] **Độ phân giải siêu nét (Multiplier 1x, 2x, 3x)**: Ảnh xuất ra không có bất kỳ đường viền chọn hay handle điều khiển nào, chữ và hình ảnh giữ nguyên 100% độ sắc nét ở độ phân giải mục tiêu.
- [x] **Native Dialog**: Lưu file mở đúng hộp thoại Windows Explorer native và hiển thị thông báo "Mở thư mục chứa file" sau khi lưu thành công.

---

## 6. Tiêu chí Kiểm thử Mã nguồn (Automated Tests & Build)

- [x] `npm test`: Toàn bộ các bộ unit test và component test chạy thông qua 100%.
- [x] `npm run build`: Bản build Angular production biên dịch thành công 100% không có lỗi hoặc cảnh báo vượt ngân sách.
