# Feature Specification: Desktop Image Studio (Tái Thiết Toàn Diện Ứng Dụng Chỉnh Sửa Ảnh & Chèn Chữ Desktop)

**Feature Branch**: `003-desktop-image-studio-redesign`
**Created**: 2026-10-05
**Status**: Ready for Implementation (Drafted for Engineering Agent)
**Input**: Tái thiết kế toàn diện ứng dụng từ giao diện máy tính để bàn (Desktop Studio) đến các chức năng xử lý hình ảnh và soạn thảo văn bản tự do, thay thế hoàn toàn phiên bản wizard 3 bước thất bại.

---

## 1. Bối cảnh & Đánh giá nguyên nhân thất bại của phiên bản cũ (Root Cause Evaluation)

### 1.1. Những điểm thất bại chí mạng của phiên bản hiện tại

1. **Mô hình Wizard 3 bước bị ép gượng & cô lập tác vụ**:
   - Ép người dùng đi qua 3 màn hình tuần tự: Chọn mẫu -> Nhập 1 ô chữ -> Xuất ảnh. Không có không gian làm việc liên tục (Studio Workspace).
   - Khi muốn thử mẫu khác hoặc đổi ảnh, toàn bộ văn bản hoặc vị trí tùy chỉnh bị đè lại; không thể so sánh hay linh hoạt sáng tạo.
2. **Cưỡng ép kích thước và tỷ lệ canvas (1080x1350 - Tỷ lệ dọc 4:5)**:
   - Toàn bộ ảnh người dùng đưa vào (dù là ảnh phong cảnh 16:9, ảnh chụp camera 4:3, hay ảnh vuông 1:1) đều bị tự động kéo dãn và cắt xén (cover crop) vào khung dọc 1080x1350. Điều này làm mất hơn 50% thông tin ảnh của người dùng mà không có tùy chọn thay đổi.
3. **Lỗi hiển thị màn hình & điều khiển Canvas bị vỡ (Broken Canvas Viewport)**:
   - Canvas Fabric 1080x1350px cố định không có hệ thống Viewport Scaling thông minh. Trên màn hình máy tính phổ thông (laptop 1366x768 hoặc 1280x800), vùng vẽ bị phình to vượt quá khung nhìn, bị thanh cuộn cắt mất một phần lớn, thao tác kéo thả bị giật và khó quan sát toàn cục.
4. **Giới hạn chỉ 01 hộp chữ duy nhất & thiếu định dạng phong phú**:
   - Chỉ cho phép gõ 1 textarea đơn độc. Không thể tạo tiêu đề chính + tiêu đề phụ + ngày tháng + trích dẫn + dải băng rôn + chữ ký/logo.
5. **Thuật toán Auto-Contrast thô sơ và gây phản cảm thị giác**:
   - Đo luminance trung bình rồi áp cứng chữ trắng viền đen hoặc đen viền trắng. Khi nền ảnh có nhiều chi tiết loang lổ sáng-tối đan xen, chữ bị chìm, khó đọc và thiếu thẩm mỹ trang trọng.
6. **Hoàn toàn thiếu vắng các công cụ chỉnh sửa hình ảnh (Zero Image Processing)**:
   - Không có công cụ Cắt ảnh (Crop), Xoay (Rotate), Lật (Flip).
   - Không có bộ điều chỉnh ánh sáng: Độ sáng (Brightness), Độ tương phản (Contrast), Độ bão hòa (Saturation), Độ mờ (Blur), và đặc biệt là dải phủ tối/sáng (Dimmer Overlay) để làm nền êm dịu giúp chữ luôn đọc rõ.
7. **Không có Undo/Redo & Không thể lưu tệp dự án**:
   - Sai một thao tác là không thể quay lại (`Ctrl+Z` không hoạt động). Đóng ứng dụng là mất trắng dữ liệu, không thể lưu file dự án để làm việc tiếp.

### 1.2. Mục tiêu của bản thiết kế lại (Redesign Vision)

Chuyển đổi hoàn toàn sang **Desktop Studio Workspace** trực quan, mạnh mẽ tương tự PowerPoint kết hợp Canva thu nhỏ, chạy 100% offline trên Windows, tối ưu cho người dùng phổ thông lẫn bán chuyên:

- Không gian làm việc màn hình đơn (Single-window Studio) với khung vẽ trung tâm tự động co giãn vừa màn hình (Auto-Fit Viewport).
- Giữ nguyên tỷ lệ gốc của ảnh người dùng hoặc cho phép chuyển đổi nhanh các tỷ lệ khung hình chuẩn (Gốc, 16:9, 1:1, 9:16, 4:5, 3:2, A4).
- Bộ công cụ xử lý hình ảnh phi hủy diệt (Non-destructive Image Adjustments): Crop, Rotate, Brightness, Contrast, Saturation, Blur, Dimmer Gradient Overlay.
- Soạn thảo đa hộp chữ tự do (Unlimited Text Layers) với bộ phông tiếng Việt tuyển chọn, màu sắc, nền chữ (Ribbon/Badge), viền (Stroke), bóng đổ (Shadow), giãn dòng, giãn chữ.
- Thao tác kéo thả chuẩn desktop: Snap to center/edges, phím mũi tên nudge từng pixel, Undo/Redo (`Ctrl+Z`/`Ctrl+Y`), nhân bản (`Ctrl+D`), xóa (`Delete`).
- Lưu/mở file dự án (`.tiproj`) và xuất ảnh đa định dạng (PNG, JPG, WebP) với độ phân giải siêu nét (1x, 2x, 3x).

---

## 2. Đối tượng người dùng & Hành vi thao tác (Personas & Mental Model)

- **Người dùng mục tiêu**: Cán bộ truyền thông đoàn thể, giáo viên, nhân viên văn phòng, người làm nội dung mạng xã hội không có kỹ năng Photoshop chuyên nghiệp.
- **Tâm lý thao tác**:
  - Muốn nhìn thấy bức ảnh của mình nguyên vẹn ngay khi tải lên, không bị tự ý cắt xén méo mó.
  - Muốn bấm chuột vào đâu thì chỉnh sửa ở đó (Direct manipulation).
  - Cần chữ gõ tiếng Việt đẹp, không lỗi font, nổi bật rõ ràng trên ảnh mà không cần biết phối màu phức tạp.
  - Cần sự an toàn: lỡ tay kéo lệch hoặc gõ sai có thể bấm nút Quay lại (Undo) ngay lập tức.
  - Cần các mẫu bố cục gợi ý sẵn (Template Presets) để áp dụng nhanh trong 10 giây khi đang vội.

---

## 3. Danh sách User Stories & Kịch bản kiểm thử độc lập (Prioritized User Stories)

### User Story 1 (P1 - Core MVP): Không gian làm việc Studio & Quản lý Canvas thông minh

**Mô tả**: Người dùng khởi động ứng dụng và thấy ngay một Studio Workspace hiện đại. Người dùng có thể kéo thả hoặc chọn một bức ảnh từ máy tính. Canvas tự động nhận diện tỷ lệ và độ phân giải gốc của ảnh, tự co giãn (fit to screen) nằm trọn trong vùng làm việc mà không bị tràn màn hình hay mờ vỡ. Người dùng có thể zoom in/out (10% - 400%) hoặc bấm nút "Vừa màn hình" (Fit Screen).

**Why this priority**: Khung vẽ (Canvas) và vùng nhìn (Viewport) là nền tảng sống còn của toàn bộ ứng dụng desktop. Nếu canvas bị vỡ tỷ lệ hoặc tràn màn hình, mọi tính năng khác đều vô nghĩa.

**Independent Test**: Tải một ảnh ngang 1920x1080 (16:9), một ảnh vuông 1200x1200 (1:1), và một ảnh dọc 1080x1920 (9:16). Canvas phải tự động căn chỉnh tỷ lệ tương ứng, hiển thị toàn bộ bức ảnh ở giữa màn hình mà không cần thanh cuộn ngoài của cửa sổ.

**Acceptance Scenarios**:

1. **Given** Ứng dụng vừa khởi chạy, **When** Người dùng kéo thả file ảnh bất kỳ vào vùng làm việc, **Then** Canvas khởi tạo với đúng kích thước và tỷ lệ gốc của ảnh, tự tính tỷ lệ hiển thị (display zoom) để nằm trọn trong viewport với viền cách mép tối thiểu 24px.
2. **Given** Ảnh nền đã hiển thị, **When** Người dùng thay đổi kích thước cửa sổ ứng dụng (Resize Window), **Then** Canvas tự động tính lại tỷ lệ zoom hiển thị mượt mà mà không làm thay đổi kích thước pixel thực tế của ảnh.
3. **Given** Ảnh nền đang hiển thị, **When** Người dùng chọn chuyển tỷ lệ canvas sang "1:1 Vuông" hoặc "16:9 Ngang", **Then** Canvas chuyển kích thước theo tỷ lệ đã chọn, cho phép người dùng kéo di chuyển vị trí ảnh nền bên trong khung hoặc chọn chế độ Fit/Fill.

---

### User Story 2 (P1 - Core MVP): Động cơ đa hộp chữ tự do (Freeform Multi-Textbox Engine)

**Mô tả**: Người dùng có thể nhấn nút "Thêm chữ" để tạo nhiều hộp văn bản độc lập trên ảnh (Tiêu đề, Phụ đề, Trích dẫn, Ghi chú). Nhấp đúp vào hộp chữ để gõ tiếng Việt có dấu. Di chuyển, co giãn chiều rộng bằng chuột, xoay tự do, hoặc dùng phím mũi tên để tinh chỉnh từng pixel.

**Why this priority**: Giải quyết dứt điểm hạn chế chỉ có 1 ô chữ của phiên bản cũ, mang lại trải nghiệm tự do sáng tạo chuẩn PowerPoint/Canva.

**Independent Test**: Thêm 3 hộp chữ khác nhau trên cùng một ảnh, gõ nội dung tiếng Việt có dấu, thay đổi kích thước và vị trí của từng hộp mà không làm ảnh hưởng đến các hộp khác.

**Acceptance Scenarios**:

1. **Given** Khung vẽ đang mở, **When** Người dùng bấm nút "+ Thêm tiêu đề", **Then** Một hộp chữ mới xuất hiện ngay giữa vùng nhìn với viền điều khiển 8 điểm neo (handles) và nút xoay.
2. **Given** Hộp chữ đang được chọn, **When** Người dùng gõ tiếng Việt bằng bộ gõ Unikey (Telex/VNI), **Then** Các ký tự hiển thị mượt mà, đầy đủ dấu tiếng Việt, không bị nuốt ký tự hay lỗi font.
3. **Given** Hộp chữ có nội dung dài, **When** Người dùng kéo handle cạnh bên để thu hẹp chiều rộng, **Then** Văn bản tự động bẻ dòng xuống hàng (word wrap) mượt mà mà không làm biến dạng tỷ lệ chữ.
4. **Given** Nhiều hộp chữ trên canvas, **When** Người dùng nhấp chuột vào hộp chữ nào, **Then** Hộp chữ đó trở thành đối tượng kích hoạt (active), hiển thị khung bao và thanh công cụ thuộc tính tương ứng ở thanh bên phải.

---

### User Story 3 (P2): Thanh công cụ định dạng chữ chuyên sâu & Dải nền chữ (Text Ribbon)

**Mô tả**: Khi chọn một hộp chữ, bảng thuộc tính bên phải cho phép tùy biến toàn diện: Chọn font chữ tiếng Việt tuyển chọn (không lỗi dấu), Cỡ chữ, Màu sắc, In đậm, In nghiêng, Căn lề, Giãn dòng, Giãn chữ, Viền chữ (Stroke), Đổ bóng (Shadow), và đặc biệt là dải nền chữ (Text Background / Ribbon) với màu nền, độ mờ và bo góc tùy chỉnh.

**Why this priority**: Chữ viết trên ảnh chụp thường bị chìm hoặc khó đọc do nền ảnh phức tạp. Dải nền chữ (Ribbon) và đổ bóng là chìa khóa để chữ luôn trang trọng, nổi bật và dễ đọc trong mọi tình huống.

**Independent Test**: Chọn một hộp chữ trên nền ảnh rực rỡ, bật dải nền chữ màu đỏ cờ, chỉnh bo góc 8px, đổi chữ sang màu vàng gold in đậm. Chữ lập tức nổi bật hoàn toàn và đọc rõ ràng từ khoảng cách xa.

**Acceptance Scenarios**:

1. **Given** Hộp chữ được chọn, **When** Người dùng chọn một font trong danh mục font Việt hóa (ví dụ: "Montserrat", "Be Vietnam Pro", "Playfair Display", "Oswald", "Roboto Slab"), **Then** Toàn bộ chữ cập nhật tức thì với font mới và hiển thị chuẩn xác mọi ký tự tiếng Việt.
2. **Given** Hộp chữ được chọn, **When** Người dùng bật công tắc "Nền chữ (Ribbon)", chọn màu nền và kéo thanh bo góc, **Then** Một khối màu nền bao quanh khối chữ với khoảng đệm (padding) cân đối, tự động co giãn theo số dòng chữ.
3. **Given** Hộp chữ được chọn, **When** Người dùng chỉnh hiệu ứng Viền chữ (Stroke Width + Color) hoặc Bóng đổ (Shadow Blur + Offset + Color), **Then** Hiệu ứng hiển thị sắc nét trong thời gian thực trên canvas.

---

### User Story 4 (P2): Bộ xử lý hình ảnh phi hủy diệt (Non-Destructive Image Processing)

**Mô tả**: Người dùng có thể chỉnh sửa bức ảnh nền trực tiếp trong ứng dụng: Cắt ảnh (Crop theo tỷ lệ hoặc tự do), Xoay ảnh 90 độ, Lật ảnh ngang/dọc, và điều chỉnh các thông số quang học: Độ sáng (Brightness), Độ tương phản (Contrast), Độ bão hòa (Saturation), Làm mờ nhẹ (Blur), và Phủ lớp mờ/tối dần (Dark Gradient Overlay).

**Why this priority**: Người dùng không cần phải mở phần mềm khác để cắt hoặc chỉnh màu ảnh trước khi chèn chữ. Lớp phủ tối dần (Dimmer Overlay) giúp mọi bức ảnh sáng chói trở nên êm dịu, làm nổi bật thông điệp tuyên truyền.

**Independent Test**: Tải một bức ảnh chụp điện thoại quá sáng, dùng thanh trượt Brightness giảm 15%, tăng Contrast 10%, và bật lớp phủ Dimmer Gradient đen ở 1/3 phía dưới ảnh. Chữ đặt ở phần dưới ảnh trở nên rõ ràng tuyệt đối.

**Acceptance Scenarios**:

1. **Given** Ảnh nền đang mở, **When** Người dùng nhấn công cụ "Cắt ảnh (Crop)", **Then** Khung cắt với lưới 1/3 (rule of thirds) xuất hiện cho phép kéo chọn vùng ảnh cần giữ lại, kèm các nút chọn nhanh tỷ lệ: Tự do, 1:1, 16:9, 4:5, 3:2. Bấm "Áp dụng" sẽ crop ảnh ngay tức thì.
2. **Given** Ảnh nền trên canvas, **When** Người dùng điều chỉnh thanh trượt Brightness, Contrast, Saturation, Blur, **Then** Bộ lọc cập nhật mượt mà trên canvas theo thời gian thực (60 FPS) thông qua bộ lọc tăng tốc phần cứng.
3. **Given** Ảnh nền trên canvas, **When** Người dùng bật "Lớp phủ làm tối (Overlay Dimmer)", chọn hướng phủ (Từ dưới lên, Từ trên xuống, Toàn bộ) và chỉnh độ mờ (Opacity 0 - 100%), **Then** Lớp gradient mềm mại xuất hiện giữa ảnh nền và các lớp chữ, giữ cho chữ luôn dễ đọc.
4. **Given** Đã áp dụng các bộ lọc ảnh, **When** Người dùng bấm nút "Đặt lại ảnh gốc (Reset Adjustments)", **Then** Ảnh nền quay về trạng thái gốc nguyên bản mà không làm mất các lớp chữ đã tạo.

---

### User Story 5 (P2): Thư viện mẫu thiết kế thông minh (Smart Adaptive Templates)

**Mô tả**: Người dùng có thể duyệt và áp dụng nhanh các mẫu bố cục có sẵn (Khẩu hiệu cổ động, Sự kiện trang trọng, Thông báo, Trích dẫn nghệ thuật, Bìa bài viết). Khi chọn một mẫu, hệ thống tự động thích ứng bố cục theo tỷ lệ canvas hiện tại mà không làm mất ảnh nền đã tải của người dùng.

**Why this priority**: Cung cấp giải pháp tức thì cho người dùng cần tạo sản phẩm đẹp trong vòng 10 giây mà không cần tự căn chỉnh từ đầu.

**Independent Test**: Tải ảnh một hội nghị, bấm chọn mẫu "Khẩu hiệu đỏ chữ vàng trang trọng", hệ thống tự động sinh ra dải banner tiêu đề và khẩu hiệu chuẩn phong cách tuyên truyền ngay trên ảnh.

**Acceptance Scenarios**:

1. **Given** Người dùng đã tải ảnh nền, **When** Chọn một mẫu từ thanh thư viện "Mẫu thiết kế", **Then** Hệ thống áp dụng cấu trúc chữ, màu sắc, font, hiệu ứng của mẫu lên canvas mà vẫn bảo toàn ảnh nền gốc.
2. **Given** Một mẫu vừa được áp dụng, **When** Người dùng nhấp chuột vào bất kỳ khối chữ nào của mẫu, **Then** Người dùng có thể sửa lại nội dung văn bản, đổi vị trí hoặc tùy biến tiếp mà không bị khóa cứng.

---

### User Story 6 (P3): Lịch sử thao tác (Undo/Redo) & Quản lý tệp dự án (.tiproj)

**Mô tả**: Người dùng có thể hoàn tác (Undo - `Ctrl+Z`) và làm lại (Redo - `Ctrl+Y`) tối thiểu 50 bước thao tác. Người dùng có thể lưu dự án đang làm dở thành tệp `.tiproj` và mở lại bất kỳ lúc nào với đầy đủ các lớp chữ, định dạng và ảnh nền. Tự động lưu bản nháp dự phòng để tránh mất dữ liệu khi tắt máy đột ngột.

**Why this priority**: Đảm bảo an toàn dữ liệu và trải nghiệm thoải mái, tự tin cho người dùng khi khám phá các kiểu thiết kế.

**Independent Test**: Thực hiện thêm chữ, đổi màu, di chuyển, xóa chữ; sau đó bấm `Ctrl+Z` 4 lần để quay lại trạng thái ban đầu; bấm `Ctrl+Y` để làm lại; lưu file `.tiproj`, khởi động lại app và mở file, toàn bộ trạng thái khôi phục 100%.

**Acceptance Scenarios**:

1. **Given** Người dùng vừa thực hiện bất kỳ thao tác nào (di chuyển, đổi font, xóa lớp, chỉnh filter), **When** Bấm `Ctrl+Z` hoặc nút "Hoàn tác" trên thanh tiêu đề, **Then** Trạng thái canvas khôi phục lại bước liền trước ngay lập tức.
2. **Given** Dự án đang mở, **When** Người dùng bấm `Ctrl+S` hoặc chọn "Lưu dự án", **Then** Hộp thoại lưu file native xuất hiện cho phép lưu tệp `.tiproj` chứa toàn bộ cấu hình lớp và ảnh nền dạng nén.
3. **Given** Tệp `.tiproj` đã lưu trước đó, **When** Người dùng chọn "Mở dự án", **Then** Ứng dụng khôi phục đầy đủ ảnh nền, tất cả các hộp chữ, font, hiệu ứng và cho phép chỉnh sửa tiếp tục như bình thường.

---

### User Story 7 (P3): Xuất ảnh chuyên nghiệp đa định dạng & Siêu phân giải (Studio Export)

**Mô tả**: Người dùng có thể xuất tác phẩm hoàn thiện ra tệp hình ảnh định dạng PNG (hỗ trợ trong suốt hoặc đầy đủ), JPEG (với thanh trượt chất lượng 60% - 100%), hoặc WebP. Cho phép chọn hệ số xuất: 1x (Kích thước chuẩn), 2x (Độ nét cao Retina/4K), 3x (Chuẩn in ấn sắc nét). Cung cấp hộp thoại xem trước và thông báo dung lượng ước tính.

**Why this priority**: Đảm bảo sản phẩm đầu ra đạt chất lượng cao nhất, phục vụ tốt cho cả đăng tải mạng xã hội lẫn in pano, áp phích, băng rôn khổ lớn.

**Independent Test**: Xuất một ảnh 1920x1080 ở mức 2x, kiểm tra file PNG xuất ra có kích thước chính xác 3840x2160, chữ in đậm và dải ribbon sắc nét đến từng chi tiết pixel, không bị răng cưa hay vỡ hạt.

**Acceptance Scenarios**:

1. **Given** Tác phẩm hoàn chỉnh trên canvas, **When** Người dùng bấm nút "Xuất ảnh", **Then** Modal xuất hiện hiển thị bản xem trước thu nhỏ, cho phép chọn định dạng (PNG / JPG / WebP) và hệ số độ phân giải (1x / 2x / 3x).
2. **Given** Người dùng chọn hệ số 2x và định dạng PNG, bấm "Lưu vào máy tính", **Then** Hộp thoại native save dialog mở ra với tên file gợi ý theo ngày giờ; sau khi lưu thành công, hiển thị thông báo với nút "Mở thư mục chứa ảnh".

---

## 4. Yêu cầu chức năng chi tiết (Functional Requirements - FR)

### 4.1. Khung vẽ & Quản lý tỷ lệ (Canvas & Viewport Engine)

- **FR-001**: Hệ thống PHẢI hỗ trợ khởi tạo Canvas dựa trên kích thước thật của ảnh nền đầu vào hoặc theo kích thước tùy chọn của người dùng.
- **FR-002**: Hệ thống PHẢI có cơ chế Viewport Responsive Auto-Fit: tự động tính toán ma trận thu phóng (`viewportTransform`) để canvas luôn hiển thị trọn vẹn ở chính giữa vùng làm việc trên mọi kích thước màn hình máy tính (từ 1024x768 đến 4K).
- **FR-003**: Hệ thống PHẢI cung cấp công cụ thu phóng Viewport: Zoom In (`Ctrl + +`), Zoom Out (`Ctrl + -`), Fit to Screen (`Ctrl + 0`), và thanh trượt Zoom (10% - 400%).
- **FR-004**: Hệ thống PHẢI hỗ trợ chuyển đổi nhanh tỷ lệ khung vẽ Canvas theo các tiêu chuẩn:
  - Tỷ lệ gốc (Original Aspect Ratio)
  - 1:1 Vuông (Social Feed, Avatar)
  - 16:9 Ngang (Màn hình chiếu, Banner Web, Video Thumbnail)
  - 9:16 Dọc (Story, TikTok, Mobile Banner)
  - 4:5 Dọc (Poster truyền thông, Instagram Portrait)
  - 3:2 Ngang/Dọc (Ảnh máy ảnh tiêu chuẩn)
  - A4 Khổ chuẩn (Bản in tài liệu, thông báo)
- **FR-005**: Khi đổi tỷ lệ canvas, hệ thống PHẢI cho phép người dùng chọn chế độ căn ảnh nền: "Fit" (Hiện đủ ảnh, thêm viền lề) hoặc "Fill/Cover" (Phủ kín khung, cho phép kéo di chuyển vùng hiển thị của ảnh).

### 4.2. Xử lý & Chỉnh sửa hình ảnh (Image Processing Pipeline)

- **FR-006**: Hệ thống PHẢI hỗ trợ nhập ảnh nền từ các định dạng thông dụng: JPG, JPEG, PNG, WebP, BMP thông qua hộp thoại chọn file hoặc kéo thả (Drag & Drop).
- **FR-007**: Hệ thống PHẢI tự động tối ưu hóa bộ nhớ: với các ảnh có độ phân giải siêu lớn (> 6000px hoặc > 25MB), hệ thống tạo bản hiển thị viewport mượt mà và lưu ảnh gốc để render xuất file cuối cùng, tránh tràn RAM.
- **FR-008**: Hệ thống PHẢI cung cấp công cụ Cắt ảnh (Crop Tool) tương tác trực tiếp trên canvas với các điểm neo kéo viền, hỗ trợ khóa tỷ lệ khung hình hoặc cắt tự do.
- **FR-009**: Hệ thống PHẢI cung cấp công cụ Xoay ảnh (Rotate 90° ngược/thuận chiều kim đồng hồ) và Lật ảnh (Flip Horizontal, Flip Vertical).
- **FR-010**: Hệ thống PHẢI cung cấp bảng điều chỉnh quang học phi hủy diệt (Non-destructive Adjustments):
  - Độ sáng (Brightness: -100% đến +100%)
  - Độ tương phản (Contrast: -100% đến +100%)
  - Độ bão hòa màu (Saturation: -100% đến +100%)
  - Làm mờ hậu cảnh (Blur: 0px đến 50px)
  - Hiệu ứng tối góc (Vignette: 0% đến 100%)
- **FR-011**: Hệ thống PHẢI cung cấp tính năng "Lớp phủ làm tối/sáng (Dimmer Overlay)":
  - Dạng phủ: Gradient từ đáy lên (Bottom-to-Top), Gradient từ đỉnh xuống (Top-to-Bottom), Gradient hai đầu, hoặc Phủ đều toàn ảnh (Solid).
  - Tùy chỉnh màu lớp phủ (Mặc định: Đen `#000000`, Xanh đậm `#0b192c`, hoặc Đỏ cờ `#7a0b0b`).
  - Thanh trượt độ mờ lớp phủ (Opacity: 0% đến 100%).
- **FR-012**: Hệ thống PHẢI cung cấp nút "Đặt lại ảnh gốc (Reset Adjustments)" để xóa mọi hiệu ứng ảnh nền chỉ bằng một cú nhấp chuột.

### 4.3. Động cơ soạn thảo & Định dạng chữ (Typography Engine)

- **FR-013**: Hệ thống PHẢI cho phép tạo không giới hạn số lượng hộp chữ độc lập trên cùng một canvas.
- **FR-014**: Hộp chữ PHẢI hỗ trợ chỉnh sửa văn bản trực tiếp (Inline Text Editing) khi nhấp đúp chuột, hỗ trợ gõ tiếng Việt Unicode có dấu 100% (Telex, VNI).
- **FR-015**: Hệ thống PHẢI cung cấp sẵn bộ sưu tập phông chữ tiếng Việt offline nhúng kèm ứng dụng, phân loại rõ ràng theo phong cách:
  - Phong cách Trang trọng / Cổ động: `Montserrat-Bold`, `BeVietnamPro-Bold`, `Oswald`
  - Phong cách Tiêu đề Hiện đại: `BeVietnamPro-Regular`, `Roboto`, `Open Sans`
  - Phong cách Cổ điển / Báo chí: `Playfair Display`, `Merriweather`
- **FR-016**: Hệ thống PHẢI cho phép tùy chỉnh cỡ chữ linh hoạt từ 8px đến 400px, hỗ trợ gõ số trực tiếp hoặc dùng nút tăng/giảm nhanh (+ / -).
- **FR-017**: Hệ thống PHẢI hỗ trợ đầy đủ các thuộc tính định dạng chuẩn:
  - In đậm (Bold), In nghiêng (Italic), Gạch chân (Underline), Chữ in hoa toàn bộ (Uppercase All-Caps).
  - Căn lề: Căn trái (Left), Căn giữa (Center), Căn phải (Right), Căn đều (Justify).
  - Khoảng cách dòng (Line Height: 0.8 đến 2.5).
  - Khoảng cách ký tự (Letter Spacing: -50 đến +300).
- **FR-018**: Hệ thống PHẢI cung cấp bảng chọn màu chữ chuyên nghiệp gồm: Bảng màu thương hiệu/cổ động gợi ý sẵn (Đỏ cờ, Vàng sao, Trắng ngọc, Đen than, Xanh thanh niên), Bảng mã màu Hex/RGB, và công cụ hút màu trên ảnh (Color Eyedropper).
- **FR-019**: Hệ thống PHẢI hỗ trợ tính năng "Dải nền chữ (Text Ribbon / Highlight Badge)":
  - Tự động tạo khối màu nền ôm sát từng dòng chữ hoặc toàn bộ khung chữ.
  - Cho phép chọn màu nền, độ trong suốt (Alpha), độ đệm lề (Padding X/Y), và bán kính bo góc (Border Radius 0px - 50px).
- **FR-020**: Hệ thống PHẢI hỗ trợ hiệu ứng Viền chữ (Text Stroke): độ dày viền (0px đến 20px) và màu viền tùy chọn.
- **FR-021**: Hệ thống PHẢI hỗ trợ hiệu ứng Bóng đổ chữ (Text Shadow): màu bóng, độ nhòe (Blur), độ lệch trục X, Y.
- **FR-022**: Hệ thống PHẢI hỗ trợ tính năng "Gợi ý tương phản thông minh (Smart Contrast Assist)" dạng nút bấm: khi bấm, hệ thống phân tích độ sáng vùng ảnh phía sau hộp chữ và tự động tối ưu hóa màu chữ + viền + bóng mà không cưỡng ép người dùng.

### 4.4. Thao tác tương tác & Quản lý lớp (Canvas Interaction & Layer Management)

- **FR-023**: Mọi đối tượng trên canvas (chữ, hình khối, ảnh) PHẢI cho phép kéo thả di chuyển vị trí mượt mà và co giãn kích thước bằng các điểm neo viền.
- **FR-024**: Hệ thống PHẢI cung cấp hệ thống đường gióng thông minh (Smart Snapping Guides): tự động hiển thị đường kẻ nam châm (màu xanh neon) khi đối tượng di chuyển gần tâm ngang, tâm dọc hoặc thẳng hàng với các đối tượng khác (ngưỡng snap: 10px).
- **FR-025**: Hệ thống PHẢI hỗ trợ phím mũi tên bàn phím: bấm phím mũi tên để dịch chuyển đối tượng 1px (nudge), giữ `Shift` + mũi tên để dịch chuyển 10px.
- **FR-026**: Hệ thống PHẢI hỗ trợ phím tắt chuẩn Desktop:
  - `Ctrl + Z`: Hoàn tác (Undo)
  - `Ctrl + Y` hoặc `Ctrl + Shift + Z`: Làm lại (Redo)
  - `Ctrl + C` / `Ctrl + V`: Sao chép và dán đối tượng
  - `Ctrl + D`: Nhân bản nhanh đối tượng (Duplicate)
  - `Delete` hoặc `Backspace`: Xóa đối tượng đang chọn
  - `Escape`: Bỏ chọn đối tượng
  - `Ctrl + A`: Chọn toàn bộ đối tượng
- **FR-027**: Hệ thống PHẢI cung cấp Bảng điều khiển lớp (Layer Stack):
  - Hiển thị danh sách thứ tự các lớp từ trên xuống dưới.
  - Cho phép kéo thả đổi thứ tự lớp hoặc dùng nút: Lên trên cùng (Bring to Front), Xuống dưới cùng (Send to Back), Lên một bậc (Bring Forward), Xuống một bậc (Send Backward).
  - Cho phép Khóa lớp (Lock Layer) để tránh vô tình bấm trúng khi đang sửa lớp khác.
  - Cho phép Ẩn/Hiện lớp (Toggle Visibility).
  - Cho phép Xóa lớp hoặc Đổi tên lớp.

### 4.5. Mẫu thiết kế có sẵn (Smart Design Templates)

- **FR-028**: Hệ thống PHẢI tích hợp sẵn tối thiểu 6 bộ mẫu thiết kế thuộc các chủ đề thông dụng:
  1. _Khẩu hiệu cổ động Đỏ - Vàng (Propaganda Slogan)_: Tiêu đề in hoa chữ vàng viền đỏ, dải ruy băng chân trang.
  2. _Thông báo sự kiện Xanh dương (Corporate/Youth Event)_: Thanh nhã, hiện đại, dải nền xanh thanh niên.
  3. _Trang trọng Lễ kỷ niệm (Ceremony Gold & Crimson)_: Chữ có chân sang trọng, viền vàng kim, hoa văn góc.
  4. _Trích dẫn / Danh ngôn nghệ thuật (Inspirational Quote)_: Font chữ thanh mảnh, dấu ngoặc kép lớn, nền mờ nhẹ.
  5. _Bìa tin tức / Tin nhanh (Breaking News / Cover)_: Tiêu đề khối hộp nổi bật, badge phân loại tin tức màu đỏ.
  6. _Khung ảnh chào mừng (Welcome Banner)_: Bố cục cân đối 2 phần trên dưới, tối ưu cho ảnh kỷ yếu/tập thể.
- **FR-029**: Khi áp dụng mẫu, hệ thống PHẢI tính toán tọa độ tương đối theo phần trăm chiều rộng/chiều cao canvas để bố cục luôn cân đối trên mọi tỷ lệ ảnh (16:9, 1:1, 4:5...).

### 4.6. Lưu tệp dự án & Lịch sử phiên làm việc (Project File Management)

- **FR-030**: Hệ thống PHẢI cho phép lưu toàn bộ trạng thái làm việc thành tệp tin dự án định dạng `.tiproj` (JSON cấu trúc đóng gói kèm ảnh base64 hoặc đường dẫn tương đối).
- **FR-031**: Hệ thống PHẢI cho phép mở tệp `.tiproj` đã lưu để phục hồi nguyên vẹn 100% các lớp, ảnh nền, bộ lọc và vị trí.
- **FR-032**: Hệ thống PHẢI có cơ chế Auto-Save dự phòng vào IndexedDB/LocalStorage: tự động lưu mỗi 30 giây để khôi phục phiên làm việc gần nhất nếu ứng dụng bị đóng đột ngột.

### 4.7. Xuất ảnh thành phẩm (Professional Export Engine)

- **FR-033**: Hệ thống PHẢI hỗ trợ xuất ảnh ra định dạng PNG (24-bit sắc nét).
- **FR-034**: Hệ thống PHẢI hỗ trợ xuất ảnh ra định dạng JPEG với tùy chọn chất lượng (70% đến 100%).
- **FR-035**: Hệ thống PHẢI hỗ trợ xuất ảnh ra định dạng WebP hiện đại với dung lượng siêu nhẹ.
- **FR-036**: Hệ thống PHẢI cho phép người dùng lựa chọn tỷ lệ độ phân giải xuất:
  - `1x`: Độ phân giải gốc của canvas.
  - `2x`: Nhân đôi độ phân giải (Khuyên dùng cho màn hình sắc nét 2K/4K).
  - `3x`: Nhân ba độ phân giải (Dành cho in ấn áp phích, pano khổ lớn).
- **FR-037**: Quá trình xuất ảnh PHẢI tự động loại bỏ toàn bộ các đường viền chọn (bounding box), điểm neo (handles), và đường gióng (snap lines) để ảnh xuất hoàn toàn trong sạch.
- **FR-038**: Khi chạy trong môi trường Desktop Electron, hệ thống PHẢI sử dụng Native File Save Dialog (`dialog.showSaveDialog`) để người dùng tự chọn thư mục lưu và tên file.
- **FR-039**: Sau khi lưu ảnh thành công, hệ thống PHẢI hiển thị thông báo với nút "Mở ảnh" và "Mở thư mục chứa ảnh (Show in folder)".

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

- **NFR-001 (Hiệu năng phản hồi)**: Mọi thao tác kéo thả di chuyển hộp chữ và điều chỉnh kích thước trên canvas phải duy trì tốc độ khung hình mượt mà 60 FPS trên máy tính cấu hình văn phòng cơ bản (Intel Core i3, 8GB RAM).
- **NFR-002 (Thời gian xử lý ảnh)**: Thao tác áp dụng bộ lọc (Brightness, Contrast, Saturation) và dải phủ Dimmer Overlay phải hoàn tất dưới 50ms nhờ kỹ thuật Canvas 2D/WebGL acceleration.
- **NFR-003 (Thời gian xuất file)**: Xuất ảnh độ phân giải Full HD (1080p) ở mức 2x phải hoàn thành trong vòng dưới 2 giây.
- **NFR-004 (Hoạt động hoàn toàn Offline)**: Ứng dụng phải hoạt động 100% không cần kết nối mạng internet. Tất cả phông chữ, biểu tượng (SVG icons), mẫu thiết kế phải được đóng gói cục bộ bên trong bản cài đặt.
- **NFR-005 (Bảo mật & Quyền riêng tư)**: Toàn bộ quá trình xử lý ảnh diễn ra tại bộ nhớ máy tính cục bộ của người dùng. Không có bất kỳ dữ liệu hình ảnh hoặc văn bản nào được gửi lên internet.
- **NFR-006 (Giao diện chuẩn tiếng Việt)**: 100% văn bản giao diện, nút bấm, nhãn thuộc tính, thông báo lỗi và gợi ý mẹo sử dụng phải bằng tiếng Việt trong sáng, dễ hiểu, tránh thuật ngữ kỹ thuật phức tạp.
- **NFR-007 (Tính độc lập nền tảng Desktop)**: Ứng dụng được đóng gói thành tệp Portable `.exe` cho Windows 10/11 x64, người dùng chỉ cần nhấp đúp là chạy ngay, không cần cài đặt Node.js hay môi trường phụ trợ.

---

## 6. Thiết kế giao diện máy tính để bàn (UI/UX Desktop Studio Layout)

### 6.1. Bố cục tổng thể 4 khu vực (Classic Creative Studio Architecture)

```
+-----------------------------------------------------------------------------------------------+
| [App Icon] ToolImage Studio  |  [File Name: Dự án chưa lưu.tiproj]  | [Undo] [Redo] | [Xuất ảnh] |
+---------------+---------------------------------------------------------------+---------------+
| TOOL DOCK     | CANVAS STAGE & VIEWPORT                                       | INSPECTOR     |
| ------------- | ------------------------------------------------------------- | ------------- |
| [🖼️ Ảnh nền]  |  [Tỷ lệ: Gốc v]  [Zoom: 100% v]  [Fit to Screen]              | THUỘC TÍNH    |
| [🔤 Thêm chữ] |                                                               | (Contextual)  |
| [🎨 Mẫu sẵn]  |      +-------------------------------------------------+      | ------------- |
| [✨ Bộ lọc]   |      |                                                 |      | • Phông chữ   |
| [📑 Lớp ảnh]  |      |               CANVAS LÀM VIỆC                   |      | • Cỡ chữ      |
|               |      |                                                 |      | • Màu sắc     |
|               |      |           [TIÊU ĐỀ TUYÊN TRUYỀN]               |      | • Nền chữ     |
|               |      |                                                 |      | • Viền & Bóng |
|               |      |                                                 |      | • Căn gióng   |
|               |      +-------------------------------------------------+      |               |
|               |                                                               |               |
+---------------+---------------------------------------------------------------+---------------+
| TRẠNG THÁI: Kích thước: 1920 x 1080 px | Zoom: 65% | 1 đối tượng được chọn    | [?] Phím tắt  |
+-----------------------------------------------------------------------------------------------+
```

### 6.2. Chi tiết các thành phần giao diện

1. **Thanh tiêu đề (Studio Header / Titlebar)**:
   - Logo thương hiệu + Tên dự án đang mở (có dấu `*` khi có thay đổi chưa lưu).
   - Nút Mở tệp (`Ctrl+O`), Lưu tệp (`Ctrl+S`).
   - Cặp nút Hoàn tác (Undo `Ctrl+Z`) và Làm lại (Redo `Ctrl+Y`) có hiển thị số bước lịch sử.
   - Nút chính nổi bật (Primary Action CTA): **"💾 Xuất ảnh thành phẩm"** với màu xanh lá / xanh dương sang trọng.
2. **Thanh công cụ bên trái (Left Tool Dock - Rộng 72px)**:
   - Các nút bấm biểu tượng lớn kèm nhãn:
     - `🖼️ Ảnh`: Tải ảnh mới, Đổi ảnh nền, Cắt ảnh, Xoay/Lật.
     - `🔤 Chữ`: Thêm tiêu đề lớn, Thêm phụ đề, Thêm văn bản thường, Thêm dải khẩu hiệu.
     - `🎨 Mẫu`: Mở ngăn kéo duyệt danh sách mẫu thiết kế có sẵn theo danh mục.
     - `✨ Bộ lọc`: Chỉnh độ sáng, tương phản, bão hòa, làm mờ, phủ tối nền.
     - `📑 Lớp`: Bảng quản lý thứ tự các layer, khóa/mở khóa, ẩn/hiện, xóa lớp.
3. **Khu vực trung tâm (Canvas Stage & Viewport)**:
   - Thanh điều khiển Viewport trên cùng: Chọn nhanh tỷ lệ (Gốc, 1:1, 16:9, 4:5...), Nút Zoom (- / + / %), Nút Reset Viewport (Vừa màn hình).
   - Vùng sân khấu (Stage) màu xám trung tính dịu mắt (`#1e1e24` dark mode hoặc `#e5e7eb` light mode), có bóng đổ nổi bật viền canvas.
   - Canvas nằm chính giữa, tự động tính tỷ lệ scale để không bao giờ bị tràn cửa sổ.
   - Các đường gióng căn giữa (Center snap guides) màu xanh dương rực sáng khi kéo đối tượng vào vị trí thẳng hàng.
4. **Bảng thuộc tính bên phải (Right Contextual Inspector - Rộng 300px)**:
   - Tự động thay đổi nội dung tùy theo đối tượng đang được chọn:
     - **Khi chọn Hộp chữ (Text Inspector)**: Phông chữ, Cỡ chữ, Màu sắc, Bật/Tắt dải nền chữ (Ribbon) + Bo góc, Viền chữ, Đổ bóng, Khoảng cách chữ/dòng, Căn lề, Nút trợ lý tương phản tự động.
     - **Khi chọn Ảnh nền (Image Inspector)**: Kích thước pixel, Nút cắt ảnh (Crop), Nút xoay 90°, Các thanh trượt điều chỉnh (Brightness, Contrast, Saturation, Blur), Lớp phủ Dimmer (Hướng phủ, Màu, Độ mờ).
     - **Khi không chọn gì (Canvas Inspector)**: Tỷ lệ khung vẽ, Màu nền canvas, Thống kê tổng số lớp, Nút xóa toàn bộ làm lại từ đầu.
5. **Thanh trạng thái chân trang (Bottom Status Bar - Cao 28px)**:
   - Hiển thị kích thước pixel gốc của canvas (ví dụ: `1920 × 1080 px`).
   - Tọa độ con trỏ chuột (`X: 540, Y: 320`).
   - Mức zoom hiện tại (`Zoom: 58%`).
   - Nút mở bảng tra cứu phím tắt nhanh (`? Phím tắt`).

---

## 7. Xử lý các tình huống biên & Khả năng chịu lỗi (Edge Cases & Resilience)

1. **Người dùng mở file ảnh siêu lớn (Ví dụ: Ảnh máy ảnh cơ 6000x4000px, 35MB)**:
   - Canvas hiển thị sử dụng phiên bản thu nhỏ tối ưu bộ nhớ để đảm bảo thao tác kéo thả chữ đạt 60 FPS không bị đơ giật.
   - Khi bấm "Xuất ảnh", động cơ xuất kết xuất trực tiếp trên ma trận độ phân giải gốc để file ảnh đầu ra giữ nguyên độ chi tiết từng sợi tóc của ảnh gốc.
2. **Người dùng gõ văn bản tiếng Việt cực dài**:
   - Khung chữ tự động bẻ dòng theo chiều rộng đã thiết lập, tự động giới hạn không vượt quá chiều cao canvas hoặc hiển thị cảnh báo trực quan.
3. **Bộ gõ tiếng Việt Unikey gõ nhầm hoặc nhảy ký tự**:
   - Textbox Fabric được cấu hình chế độ IME composition chuẩn, bắt sự kiện `compositionstart`, `compositionupdate`, `compositionend` để dấu tiếng Việt không bị mất hoặc biến thành ký tự lạ.
4. **Tải ảnh có tỷ lệ quá dị biệt (Ví dụ: Ảnh Panorama cực dài 4000x800px)**:
   - Viewport tự động tính tỷ lệ zoom theo trục dài nhất để toàn bộ dải ảnh hiển thị cân đối ở giữa sân khấu, không bị méo tỷ lệ hay che khuất giao diện.
5. **Mất điện hoặc tắt ứng dụng đột ngột**:
   - Hệ thống tự động phục hồi phiên làm việc gần nhất từ LocalStorage khi khởi động lại, hỏi người dùng: "Bạn có muốn tiếp tục bản thiết kế chưa lưu trước đó không?".
