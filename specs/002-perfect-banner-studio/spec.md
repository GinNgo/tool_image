# Feature Specification: Perfect Banner Studio

**Feature Branch**: `002-perfect-banner-studio`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "clear du an va dung bo peckit len ke hoach thuc hien xay dung laij hoan hao hon research các tính năng và cách thực hiên sao đó tổng hợp và xây dụng. chỉnh thêm thiêu đề nội dung cho hình ảnh tùy chỉnh và có bộ font chữ đẹp dễ cho người dùng không rành công nghẹ có thể dùng cấu hình cũ có thể điều chỉnh vị trí các tiêu đề áp dụng các skill hoặc tìm skill xây dựng như các phần mềm chỉnh sửa anh nhưng đơn giản là chỉnh chữ trên hình"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tải ảnh nền và chỉnh sửa chữ (Priority: P1)

Người dùng tải lên một bức ảnh tùy chọn từ máy tính, sau đó nhấp vào các hộp chữ (tiêu đề, nội dung) để thay đổi nội dung văn bản.

**Why this priority**: Đây là giá trị cốt lõi nhất của ứng dụng: cho phép người dùng ghép chữ vào hình ảnh của riêng họ.

**Independent Test**: Có thể tải 1 bức ảnh bất kỳ từ máy tính, sau đó thay đổi dòng chữ "Tiêu đề" thành nội dung khác và xem chữ hiển thị ngay trên ảnh.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở giao diện chính, **When** họ bấm nút "Tải ảnh nền" và chọn một tệp hình ảnh, **Then** hình ảnh hiển thị trong khung vẽ và giữ đúng tỷ lệ.
2. **Given** một bức ảnh đã được tải lên, **When** người dùng nhấp đúp vào hộp chữ hoặc gõ vào ô nhập liệu bên ngoài, **Then** chữ trên ảnh thay đổi tương ứng theo thời gian thực.

---

### User Story 2 - Di chuyển và tùy biến phông chữ đơn giản (Priority: P1)

Người dùng (kể cả không rành công nghệ) có thể dùng chuột kéo thả các tiêu đề đến vị trí mong muốn trên ảnh, đồng thời chọn các phong cách chữ (font chữ đẹp) được phân loại sẵn bằng tên gọi dễ hiểu (vd: "Trang trọng", "Mềm mại", "Hiện đại") thay vì tên tiếng Anh kỹ thuật.

**Why this priority**: Mang lại khả năng cá nhân hóa trải nghiệm với thao tác kéo thả và bộ chọn font chữ trực quan.

**Independent Test**: Kéo thả hộp chữ đến một góc khác của ảnh, đổi phong cách chữ sang "Mềm mại" và thấy chữ thay đổi ngay lập tức mà không bị lỗi font tiếng Việt.

**Acceptance Scenarios**:

1. **Given** một hộp chữ đang hiện trên ảnh, **When** người dùng bấm giữ và kéo chuột, **Then** hộp chữ di chuyển mượt mà tới vị trí mới.
2. **Given** một hộp chữ đang được chọn, **When** người dùng bấm vào nút phong cách "Hiện đại", **Then** font chữ thay đổi lập tức sang kiểu chữ tương ứng và hiển thị tốt tiếng Việt có dấu.

---

### User Story 3 - Áp dụng Khuôn bố cục và Hiệu ứng Chữ chuẩn (Priority: P2)

Người dùng áp dụng các "Khuôn bố cục" (Layout Masters) được thiết kế sẵn (vd: Chữ ở giữa, Chữ dưới chân trang) và các hiệu ứng chữ cơ bản nhưng chuyên nghiệp như viền chữ (stroke) và đổ bóng (shadow) để chữ luôn nổi bật trên mọi nền ảnh.

**Why this priority**: Giúp người dùng không có khiếu thẩm mỹ vẫn tạo ra được hình ảnh đẹp như phần mềm chuyên nghiệp.

**Independent Test**: Đổi một bức ảnh nền phức tạp (nhiều màu), sau đó chọn khuôn "Tiêu đề chân trang" có viền đen/bóng đổ, và nhận thấy chữ vẫn đọc được rõ ràng.

**Acceptance Scenarios**:

1. **Given** một hình ảnh có nhiều chi tiết, **When** áp dụng hiệu ứng "Đổ bóng và viền", **Then** chữ trở nên rõ nét và nổi bật khỏi nền ảnh.
2. **Given** người dùng đang có chữ ở vị trí tùy ý, **When** họ bấm chọn một "Khuôn bố cục chân trang", **Then** chữ tự động căn chỉnh xuống dưới cùng một cách chuyên nghiệp.

---

### User Story 4 - Lưu và Nạp lại cấu hình (Priority: P2)

Người dùng có thể lưu lại "Cấu hình cũ" (Bản thảo/Dự án) đang thiết kế dang dở xuống máy tính, và sau đó mở lại để chỉnh sửa tiếp vị trí, nội dung, font chữ mà không phải làm lại từ đầu.

**Why this priority**: Tiết kiệm thời gian cho người dùng thường xuyên phải tạo các banner có chung một motif cấu trúc.

**Independent Test**: Lưu bản thiết kế hiện tại thành tệp dự án, tắt ứng dụng, sau đó mở lại tệp và kiểm tra thấy 100% hình nền, font chữ, nội dung và tọa độ chữ được giữ nguyên.

**Acceptance Scenarios**:

1. **Given** một bản thiết kế đang làm dở, **When** bấm "Lưu dự án", **Then** một tệp cấu hình được tải về máy tính.
2. **Given** một ứng dụng mới mở, **When** bấm "Mở dự án" và chọn tệp cấu hình đã lưu, **Then** toàn bộ ảnh nền, nội dung chữ và vị trí được phục hồi chính xác.

### Edge Cases

- What happens when người dùng tải lên một ảnh nền quá lớn (ví dụ: > 20MB hoặc 8K resolution)?
- How does system handle việc người dùng nhập quá nhiều chữ vượt ra ngoài kích thước bức ảnh?
- What happens when cửa sổ trình duyệt bị thay đổi kích thước liên tục (responsive resize)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phép tải lên hình ảnh định dạng phổ biến (JPG, PNG) để làm nền.
- **FR-002**: System MUST cung cấp khả năng thêm, sửa, xóa các hộp chữ độc lập trên ảnh.
- **FR-003**: System MUST hỗ trợ kéo thả (drag and drop) để di chuyển các hộp chữ trực tiếp trên khung vẽ.
- **FR-004**: System MUST cung cấp ít nhất 5 font chữ tiếng Việt chất lượng cao được đặt tên theo cảm xúc (Trang trọng, Hiện đại, v.v.).
- **FR-005**: System MUST hỗ trợ xuất bản vẽ hoàn thiện thành file ảnh PNG chất lượng cao.
- **FR-006**: System MUST cho phép lưu cấu trúc thiết kế thành file (JSON) và nạp lại để tiếp tục chỉnh sửa.
- **FR-007**: System MUST cung cấp các bộ "Khuôn bố cục" (Templates/Layouts) dựng sẵn để người dùng nhấp 1 chạm là áp dụng.

### Key Entities

- **Canvas/Workspace**: Không gian vẽ tổng thể chứa ảnh nền và danh sách các hộp chữ, có khả năng co giãn responsive.
- **TextBlock (Hộp chữ)**: Lưu trữ nội dung, tọa độ (X, Y), font chữ, kích cỡ, màu sắc, và hiệu ứng của từng đối tượng chữ.
- **LayoutMaster (Khuôn bố cục)**: Định nghĩa cấu trúc sắp xếp sẵn (vd: tiêu đề ở trên, nội dung ở dưới).
- **ProjectConfig (Bản thảo/Dự án)**: Gói toàn bộ dữ liệu gồm ảnh nền (base64) và các TextBlock để lưu trữ/nạp lại.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng chưa từng dùng phần mềm chỉnh sửa ảnh có thể tạo và tải xuống 1 banner thành công trong vòng dưới 2 phút.
- **SC-002**: Tỷ lệ chữ bị lỗi font tiếng Việt là 0% đối với toàn bộ các font chữ được cung cấp sẵn.
- **SC-003**: File ảnh kết xuất (PNG) giữ đúng độ sắc nét và vị trí chữ trùng khớp 100% so với những gì nhìn thấy trên màn hình (WYSIWYG).
- **SC-004**: Hỗ trợ xử lý mượt mà (không giật lag) thao tác kéo thả chữ trên các trình duyệt Chrome/Edge hiện đại.

## Assumptions

- Người dùng sử dụng ứng dụng trên trình duyệt web máy tính (Desktop/Laptop), không ưu tiên tối ưu giao diện thao tác cho thiết bị di động (Mobile/Touch) trong phiên bản này.
- Hình ảnh xuất ra sẽ được dùng cho mục đích đăng mạng xã hội, trình chiếu (độ phân giải Full HD hoặc tương đương), không phải cho in ấn khổ lớn công nghiệp.
- Mọi dữ liệu (ảnh nền, dự án) được lưu trữ và xử lý trực tiếp tại trình duyệt (Client-side) của người dùng để đảm bảo nhanh gọn và không cần backend server.