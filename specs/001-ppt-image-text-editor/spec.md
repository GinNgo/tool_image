# Feature Specification: PPT-Style Image & Text Editor (Công cụ chỉnh sửa chữ trên ảnh kiểu PowerPoint)

**Feature Branch**: `001-ppt-image-text-editor`

**Created**: 2026-09-08

**Status**: Draft

**Input**: Xây dựng công cụ chỉnh sửa hình ảnh tập trung vào việc chèn chữ và thêm các hộp text (text box) lên ảnh một cách dễ dàng, trực quan như Microsoft PowerPoint (PPT).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tải ảnh nền & Thêm hộp chữ tự do phong cách PowerPoint (Priority: P1 - MVP)

Người dùng tải lên một hình ảnh bất kỳ từ máy tính làm hình nền. Sau đó, họ có thể nhấp vào nút "Thêm hộp chữ" để tạo các hộp văn bản tự do nổi lên trên ảnh, nhấp đúp để gõ nội dung tiếng Việt và kéo di chuyển hộp chữ đến bất kỳ vị trí nào trên ảnh.

**Why this priority**: Đây là giá trị cốt lõi nhất của ứng dụng: cho phép chèn chữ trực tiếp lên ảnh của người dùng mà không cần kỹ năng đồ họa phức tạp.

**Independent Test**: Người dùng tải một ảnh JPG/PNG lên, bấm "Thêm hộp chữ", gõ dòng chữ "Khuyến mãi mùa hè", di chuyển chữ và nhìn thấy chữ hiển thị rõ nét trên ảnh.

**Acceptance Scenarios**:
1. **Given** Người dùng chưa có ảnh nền, **When** Người dùng chọn một file ảnh từ máy tính hoặc kéo thả vào khung vẽ, **Then** Ứng dụng hiển thị ảnh trọn vẹn trong vùng làm việc với tỷ lệ chuẩn.
2. **Given** Ảnh nền đã hiển thị, **When** Người dùng bấm nút "+ Thêm hộp chữ", **Then** Một hộp văn bản mới xuất hiện trên ảnh với viền chọn (bounding box) tương tự PowerPoint.
3. **Given** Hộp chữ đang được chọn, **When** Người dùng nhấp đúp chuột, **Then** Hộp chữ chuyển sang chế độ gõ văn bản trực tiếp (inline editing) cho phép nhập tiếng Việt có dấu hoàn chỉnh.

---

### User Story 2 - Định dạng chữ & Tuyển tập phông chữ tiếng Việt (Priority: P2)

Người dùng có thể dễ dàng thay đổi kiểu dáng chữ bao gồm: cỡ chữ (tăng/giảm nhanh), màu sắc, in đậm (Bold), in nghiêng (Italic), căn lề (Trái/Giữa/Phải) và chọn từ danh sách phông chữ tiếng Việt đẹp được tuyển chọn sẵn.

**Why this priority**: Giúp văn bản trên ảnh trở nên thẩm mỹ, dễ đọc, phù hợp với các phong cách ảnh khác nhau (tiêu đề nổi bật, mô tả trang nhã, hoặc chữ nghệ thuật).

**Independent Test**: Chọn một hộp chữ bất kỳ, đổi font sang "Montserrat" hoặc "Playfair Display", đổi màu chữ sang vàng và bật in đậm. Toàn bộ chữ cập nhật tức thì.

**Acceptance Scenarios**:
1. **Given** Một hộp chữ đang được chọn, **When** Người dùng chọn một phông từ danh sách font tiếng Việt, **Then** Toàn bộ văn bản trong hộp đổi sang font mới và hiển thị đúng dấu tiếng Việt không bị lỗi font fallback.
2. **Given** Một hộp chữ đang được chọn, **When** Người dùng đổi cỡ chữ hoặc bấm nút tăng/giảm cỡ, **Then** Kích thước chữ tăng/giảm mượt mà và khung chứa tự co giãn tương ứng.
3. **Given** Một hộp chữ, **When** Người dùng bật hiệu ứng Đổ bóng (Shadow) hoặc Viền chữ (Stroke), **Then** Chữ có độ tương phản nổi bật trên nền ảnh dù nền ảnh sáng hay tối.

---

### User Story 3 - Kéo viền thay đổi kích thước hộp chữ & Căn chỉnh thông minh (Priority: P3)

Người dùng có thể thao tác với hộp chữ hệt như trong PowerPoint: kéo các điểm neo (handles) ở góc hoặc cạnh để co giãn độ rộng hộp chữ (khiến chữ tự động xuống dòng), di chuyển vị trí tự do hoặc sử dụng các phím mũi tên để tinh chỉnh từng pixel.

**Why this priority**: Mang lại trải nghiệm quen thuộc, trực quan, không cần phải căn chỉnh phức tạp bằng các thanh nhập số toạ độ.

**Independent Test**: Kéo điểm neo bên phải của hộp chữ hẹp lại, quan sát thấy các từ tự động ngắt dòng hợp lý. Dùng phím mũi tên trên bàn phím di chuyển chữ nhích từng pixel.

**Acceptance Scenarios**:
1. **Given** Hộp chữ đang được chọn, **When** Người dùng kéo handle cạnh trái hoặc cạnh phải, **Then** Chiều rộng hộp chữ thay đổi và các dòng chữ tự động bẻ dòng (word wrap).
2. **Given** Hộp chữ đang được chọn, **When** Người dùng bấm phím mũi tên (Arrow keys), **Then** Hộp chữ di chuyển chính xác 2px (hoặc 10px khi giữ Shift).
3. **Given** Có nhiều hộp chữ trên ảnh, **When** Người dùng nhấp vào hộp chữ nào, **Then** Hộp chữ đó lập tức được kích hoạt và thanh công cụ hiển thị định dạng tương ứng của hộp chữ đó.

---

### User Story 4 - Lưu & Mở lại dự án, Đổi ảnh nền giữ nguyên bố cục chữ (Priority: P4)

Người dùng có thể lưu dự án hiện tại (dưới dạng file dự án hoặc lưu tự động vào trình duyệt). Lần sau mở lại dự án, tất cả các hộp chữ, vị trí, font chữ và màu sắc vẫn giữ nguyên. Người dùng cũng có thể đổi một ảnh nền khác vào dự án mà không làm mất vị trí các hộp chữ đã bố trí.

**Why this priority**: Giúp tiết kiệm thời gian tái sử dụng bố cục khi cần tạo hàng loạt ảnh cùng một phong cách nhưng khác ảnh nền.

**Independent Test**: Bố trí 2 hộp chữ lên ảnh, bấm "Lưu bản thảo", sau đó bấm "Đổi ảnh nền" chọn một ảnh khác; 2 hộp chữ vẫn giữ nguyên toạ độ và nội dung trên nền ảnh mới.

**Acceptance Scenarios**:
1. **Given** Người dùng đã bố trí các hộp chữ, **When** Người dùng bấm "Lưu dự án", **Then** File cấu hình dự án (.json) được tải về máy hoặc lưu vào bộ nhớ trình duyệt.
2. **Given** File dự án đã lưu, **When** Người dùng mở file dự án, **Then** Toàn bộ ảnh nền và các hộp chữ được phục hồi chính xác 100%.
3. **Given** Dự án đang có các hộp chữ, **When** Người dùng bấm "Đổi ảnh nền" và tải ảnh mới lên, **Then** Ảnh nền mới thay thế ảnh cũ, các hộp chữ giữ nguyên vị trí, kiểu dáng và nội dung.

---

### User Story 5 - Xuất ảnh chất lượng cao (Priority: P5)

Người dùng có thể xuất tác phẩm hoàn thiện ra tệp hình ảnh định dạng PNG hoặc JPG với độ phân giải gốc sắc nét của ảnh nền.

**Why this priority**: Là bước cuối cùng để người dùng lấy được thành phẩm sử dụng đăng mạng xã hội, in ấn hoặc gửi cho người khác.

**Independent Test**: Bấm nút "Xuất ảnh", kiểm tra file ảnh tải về có đầy đủ ảnh nền và các dòng chữ sắc nét, đúng tỷ lệ.

**Acceptance Scenarios**:
1. **Given** Bố cục hoàn chỉnh trên khung vẽ, **When** Người dùng bấm "Xuất ảnh PNG", **Then** Tệp ảnh PNG chất lượng cao được tạo và tải về máy tính trong vòng 2 giây.

---

### Edge Cases

- **Ảnh nền kích thước quá lớn (> 20MB hoặc > 4000px)**: Ứng dụng tự động điều chỉnh tỷ lệ khung nhìn (viewport zoom) mượt mà, không gây tràn màn hình hoặc giật lag.
- **Văn bản gõ quá dài**: Hộp chữ tự động ngắt dòng theo chiều rộng đã thiết lập mà không tràn ra khỏi biên khung vẽ một cách không kiểm soát.
- **Tiếng Việt Unicode**: Hỗ trợ đầy đủ bộ gõ Unikey / Telex / VNI với các nguyên âm có dấu tiếng Việt (â, ă, đ, ê, ô, ơ, ư...), không bị lỗi rụng dấu hay biến thành ô vuông.
- **Xóa nhầm hộp chữ**: Hỗ trợ phím tắt Delete/Backspace khi chọn hộp chữ để xóa nhanh, với cơ chế xác nhận hoặc hoàn tác.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép tải ảnh nền định dạng JPG, PNG, WebP từ máy tính thông qua hộp thoại chọn file hoặc kéo thả (Drag & Drop).
- **FR-002**: Hệ thống PHẢI cho phép thêm không giới hạn các hộp văn bản (Text Boxes) tự do lên khung vẽ.
- **FR-003**: Hệ thống PHẢI hỗ trợ tương tác kiểu PowerPoint: nhấp chọn hộp chữ, kéo thả vị trí, kéo viền co giãn kích thước, nhấp đúp để chỉnh sửa chữ trực tiếp.
- **FR-004**: Hệ thống PHẢI cung cấp bộ chọn phông chữ tuyển chọn hỗ trợ đầy đủ dấu tiếng Việt không bị lỗi.
- **FR-005**: Hệ thống PHẢI cho phép định dạng kích thước chữ, màu chữ, căn lề (trái, giữa, phải), in đậm, in nghiêng.
- **FR-006**: Hệ thống PHẢI cung cấp các hiệu ứng tương phản như Đổ bóng (Shadow) và Viền chữ (Stroke) để chữ luôn nổi bật trên mọi nền ảnh.
- **FR-007**: Hệ thống PHẢI hỗ trợ phím tắt thông dụng: phím mũi tên để tinh chỉnh vị trí hộp chữ (nudge), phím Delete/Backspace để xóa hộp chữ được chọn.
- **FR-008**: Hệ thống PHẢI cho phép thay đổi ảnh nền mà vẫn bảo lưu toàn bộ vị trí, nội dung và định dạng của các hộp chữ hiện có.
- **FR-009**: Hệ thống PHẢI cho phép lưu và nạp lại dự án chỉnh sửa dưới dạng cấu hình dữ liệu.
- **FR-010**: Hệ thống PHẢI xuất ảnh thành phẩm với độ phân giải cao định dạng PNG.

### Key Entities

- **Project**: Đại diện cho một phiên làm việc, chứa thông tin kích thước khung vẽ, ảnh nền và danh sách các hộp chữ.
- **BackgroundImage**: Chứa dữ liệu ảnh nền (Data URL / Image Object), kích thước gốc và tỷ lệ hiển thị.
- **TextBoxLayer**: Đại diện cho một hộp chữ độc lập gồm: ID, nội dung, tọa độ (X, Y), chiều rộng, góc xoay, font chữ, cỡ chữ, màu sắc, căn lề, in đậm, in nghiêng, hiệu ứng viền/bóng.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng không có kỹ năng thiết kế có thể tạo và xuất một bức ảnh có chữ hoàn chỉnh trong vòng dưới 60 giây.
- **SC-002**: Thao tác kéo thả và co giãn hộp chữ phản hồi tức thì với tốc độ khung hình đạt chuẩn 60 FPS trên máy tính thông thường.
- **SC-003**: 100% các ký tự tiếng Việt có dấu hiển thị chính xác không bị lỗi font chữ trên toàn bộ danh mục phông tuyển chọn.
- **SC-004**: Khi thay đổi ảnh nền, 100% các hộp chữ đã được định dạng và căn chỉnh giữ nguyên vị trí toạ độ chính xác.

---

## Assumptions

- Ứng dụng chạy trên nền tảng Web hiện đại (Chrome, Edge, Firefox, Safari) và có thể đóng gói Desktop bằng Electron.
- Không yêu cầu kết nối mạng bắt buộc sau khi đã tải ứng dụng và tài nguyên phông chữ.
- Không yêu cầu tài khoản đăng nhập hay lưu trữ máy chủ (toàn bộ xử lý tại máy người dùng để bảo mật hình ảnh cá nhân).
