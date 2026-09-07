# Feature Specification: 001-custom-text-editor

**Feature Branch**: `001-custom-text-editor`

**Created**: 2026-09-05

**Status**: Draft

**Input**: User description: "bạn dùng bộ speckit thực hiện lên kế hoặc xây lại giúp tôi hoản thiện tôi muốn chỉnh thêm thiêu đề nội dung cho hình ảnh tùy chỉnh và có bộ font chữ đẹp dễ cho người dùng không rành công nghệ có thể dùng cấu hình cũ có thể điều chỉnh vị trí các tiêu đề áp dụng các skill hoặc tìm skill xây dựng như các phần mềm chỉnh sửa ảnh nhưng đơn giản là chỉnh chữ trên hình"

## Summary

Nâng cấp công cụ tạo ảnh và chèn chữ (banner/poster) dành cho **người dùng không rành công nghệ** với các năng lực cốt lõi:
1. **Nhiều lớp chữ tùy chỉnh (Multiple Text Blocks)**: Người dùng có thể thêm/bớt và chỉnh sửa linh hoạt: Tiêu đề chính, Tiêu đề phụ, Nội dung/Khẩu hiệu/Chân trang.
2. **Bộ Font chữ tiếng Việt tuyển chọn đẹp mắt**: Mở rộng từ 3 font lên 6-8 font chữ hoàn toàn hỗ trợ tiếng Việt đầy đủ dấu (Unicode), hiển thị bằng tên thuần Việt dễ hiểu (Trang trọng, Hào hùng, Hiện đại, Mềm mại, Cổ điển, Nổi bật...). Không dùng thuật ngữ font phức tạp.
3. **Điều chỉnh vị trí & kích thước trực quan**: Kéo thả trực quan trên hình, thanh trượt chỉnh kích thước to/nhỏ đơn giản, nút căn giữa 1 chạm, nút "Khôi phục vị trí mặc định" cho từng block hoặc toàn bộ.
4. **Lưu & Mở lại cấu hình cũ (Project Save / Load)**: Cho phép lưu bản thảo hiện tại thành file cấu hình (.json) hoặc tự động ghi nhớ phiên làm việc gần nhất để mở lại chỉnh sửa tiếp mà không phải làm lại từ đầu.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thêm và chỉnh sửa nhiều lớp tiêu đề/nội dung trên ảnh (Priority: P1)

Người dùng không rành công nghệ muốn trên một bức ảnh có thể đặt cả **Tiêu đề chính** (to, nổi bật) và **Tiêu đề phụ / Khẩu hiệu chi tiết** (nhỏ hơn bên dưới), đồng thời có thể dễ dàng xóa hoặc thêm dòng chữ mới chỉ bằng 1 nút bấm.

**Why this priority**: Hiện tại ứng dụng chỉ có duy nhất 1 ô chữ duy nhất, không thể tạo ra các poster/banner hoàn chỉnh có cả tiêu đề và nội dung thuyết minh.

**Independent Test**:
- Thêm ảnh nền -> Thêm Tiêu đề chính -> Thêm Tiêu đề phụ.
- Đổi nội dung của từng dòng chữ độc lập trên khung hình.
- Xuất ảnh kiểm tra xem cả 2 dòng chữ đều hiển thị rõ ràng và đẹp mắt.

**Acceptance Scenarios**:
1. **Given** người dùng đang ở màn hình chỉnh sửa với ảnh nền đã tải lên, **When** người dùng bấm "Thêm tiêu đề phụ", **Then** một ô chữ phụ xuất hiện bên dưới tiêu đề chính với cỡ chữ nhỏ hơn và định dạng hài hòa.
2. **Given** có 2 khối chữ trên canvas, **When** người dùng click chuột vào khối chữ nào trên ảnh hoặc click chọn ô nhập tương ứng bên bảng điều khiển, **Then** khối chữ đó được kích hoạt để chỉnh sửa nội dung/vị trí.
3. **Given** một khối chữ phụ không cần thiết, **When** người dùng bấm nút xóa (biểu tượng thùng rác) bên cạnh khối chữ đó, **Then** khối chữ biến mất khỏi ảnh và bảng điều khiển.

---

### User Story 2 - Bộ Font chữ Việt hóa đẹp, phân loại cảm xúc dễ hiểu (Priority: P1)

Người dùng muốn chọn kiểu chữ đẹp mắt mà không cần biết font Serif, Sans-serif hay Typography là gì; chỉ cần nhìn nút bấm gợi ý cảm xúc (như "Trang trọng", "Mạnh mẽ", "Mềm mại", "Truyền thống") là áp dụng được ngay font chữ chuẩn không bị lỗi font tiếng Việt.

**Why this priority**: Font chữ là linh hồn của poster/ảnh tuyên truyền. Font lỗi dấu hoặc khó đọc sẽ phá hỏng toàn bộ thẩm mỹ của ảnh.

**Independent Test**:
- Nhập đoạn chữ tiếng Việt có đầy đủ dấu ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM - ĐỘC LẬP TỰ DO HẠNH PHÚC").
- Bấm lần lượt qua các kiểu font được tuyển chọn sẵn.
- Kiểm tra toàn bộ các ký tự tiếng Việt (ă, â, đ, ê, ô, ơ, ư, ỹ, ỵ...) không bị lệch glyph hoặc bể font.

**Acceptance Scenarios**:
1. **Given** người dùng đang chọn 1 khối chữ, **When** bấm vào nút kiểu chữ "Trang trọng", **Then** khối chữ lập tức đổi sang font tương ứng và tự động canh chỉnh khoảng cách dòng cho đẹp.
2. **Given** app chạy hoàn toàn offline không có internet, **When** mở ứng dụng và đổi font, **Then** toàn bộ các font chữ đều tải tức thì từ bộ font nhúng nội bộ.

---

### User Story 3 - Điều chỉnh vị trí, kích thước và căn gióng linh hoạt (Priority: P2)

Người dùng có thể kéo khối chữ tới bất kỳ vị trí mong muốn trên ảnh, phóng to/thu nhỏ bằng thanh trượt trực quan (thay vì nhập số pt/px), có hỗ trợ hít vào giữa (snap to center) và nút khôi phục vị trí mặc định nếu lỡ kéo lệch.

**Why this priority**: Đem lại trải nghiệm như phần mềm chỉnh sửa ảnh mini (Canva rút gọn) nhưng siêu đơn giản, không làm người già hay người không rành IT bị bối rối.

**Independent Test**:
- Dùng chuột kéo khối chữ sang góc phải, kích thước tự giữ nguyên.
- Kéo lại gần giữa -> xuất hiện đường kẻ dẫn hướng màu xanh và hít vào tâm.
- Bấm nút "Về vị trí mẫu" -> khối chữ quay về đúng vị trí định sẵn của template.

**Acceptance Scenarios**:
1. **Given** một khối chữ trên ảnh, **When** người dùng kéo thanh trượt "Cỡ chữ", **Then** kích thước chữ tăng/giảm mượt mà và không vượt quá mép khung ảnh.
2. **Given** người dùng kéo thả chữ gần trục giữa ngang hoặc dọc (trong khoảng 12px), **When** chuột di chuyển, **Then** đường kẻ gióng snap-guide xuất hiện và chữ tự động hít vào tâm.

---

### User Story 4 - Lưu & Mở lại phiên làm việc (Project Save & Load) (Priority: P2)

Người dùng muốn lưu lại bố cục, ảnh và nội dung đang làm dở thành một file dự án (.json) trên máy tính, hoặc khi tắt app mở lại thì tự động nhớ lại mẫu cũ đã chỉnh sửa gần nhất để không mất công làm lại từ đầu.

**Why this priority**: Đáp ứng yêu cầu trực tiếp từ người dùng: "có thể dùng cấu hình cũ".

**Independent Test**:
- Tạo một banner hoàn chỉnh gồm ảnh + 2 khối chữ + đổi font.
- Bấm "Lưu bản thảo", đóng ứng dụng.
- Mở lại ứng dụng, bấm "Mở bản thảo cũ" -> Toàn bộ ảnh nền, các lớp chữ, font chữ và vị trí khôi phục chính xác 100%.

**Acceptance Scenarios**:
1. **Given** người dùng đang có bản thiết kế dở dang, **When** bấm "Lưu dự án", **Then** hệ thống mở hộp thoại lưu file `.bannerproj` hoặc `.json` trên máy tính và lưu trữ cả cấu hình ảnh + text.
2. **Given** file dự án đã lưu trước đó, **When** người dùng bấm "Mở dự án cũ" tại Bước 1, **Then** ứng dụng nạp lại toàn bộ dữ liệu và chuyển thẳng vào màn hình chỉnh sửa với đúng trạng thái trước đó.

---

### User Story 5 - Mẫu khuôn bố cục chuẩn PowerPoint & Thay đổi ảnh nền linh hoạt (Priority: P1)

Người dùng muốn loại bỏ các mẫu cố định tĩnh (cứng nhắc) và thay vào đó là hệ thống **Mẫu khuôn bố cục (Layout Masters / Frames)** tương tự PowerPoint:
- Người dùng có thể chọn các khuôn bố cục có sẵn (Khẩu hiệu trên-dưới, Băng rôn tiêu đề giữa, Chữ ký sự kiện, Trích dẫn tuyên truyền...).
- Khi người dùng tự tay căn chỉnh vị trí, phông chữ, hiệu ứng cho một bức ảnh ưng ý, họ có thể bấm **"Lưu thành khuôn mẫu mới"**.
- Khi mở bất kỳ bức ảnh mới nào (hoặc đổi ảnh nền khác), toàn bộ hệ thống hộp chữ, vị trí, kích cỡ, màu sắc, hiệu ứng đã căn chỉnh vẫn được **giữ nguyên 100%**, người dùng chỉ việc thay ảnh nền hoặc sửa lại nội dung chữ một cách cực kỳ nhanh chóng.

**Why this priority**: Giải quyết triệt để yêu cầu cốt lõi của người dùng: *"máy cái mẫu bỏ đi bạn mẫu là mẫu khuông có sẵn như kiểu của ppt mà sau khi mình thục hiện chỉnh và luu tấm hình đàu mở lên và thay đổi"*.

**Independent Test**:
- Tải ảnh 1 lên, tạo 2 hộp chữ và căn vị trí đẹp mắt -> Bấm "Lưu thành khuôn mẫu".
- Chọn đổi sang Ảnh 2 có kích thước/tỷ lệ khác -> Các hộp chữ giữ nguyên vị trí tỷ lệ tương đối và hiệu ứng chữ đẹp.
- Áp dụng một khuôn bố cục khác từ danh sách -> Các hộp chữ sắp xếp theo bố cục mới ngay lập tức.

**Acceptance Scenarios**:
1. **Given** người dùng đã thêm và căn chỉnh các hộp chữ trên canvas, **When** bấm "Lưu thành khuôn mẫu", **Then** hệ thống lưu cấu trúc hộp chữ (vị trí, cỡ chữ, font, hiệu ứng) vào danh mục Mẫu khuôn để dùng lại nhiều lần.
2. **Given** một bố cục đang hiển thị trên canvas, **When** người dùng bấm "Đổi ảnh nền" và chọn một bức ảnh khác từ máy tính, **Then** ảnh nền mới được cập nhật vừa vặn khung vẽ, trong khi toàn bộ các hộp chữ giữ nguyên vị trí và thuộc tính.
3. **Given** người dùng mở danh mục Mẫu khuôn, **When** click chọn một mẫu khuôn (ví dụ "Khẩu hiệu dưới chân", "Tiêu đề trang trọng trên đỉnh", "Bố cục đối xứng"), **Then** các hộp chữ trên ảnh hiện tại tự động chuyển dịch và định dạng theo khuôn mẫu đã chọn mà không làm mất ảnh nền.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hỗ trợ quản lý danh sách nhiều khối chữ (Text Blocks): tối thiểu gồm Tiêu đề chính (Title) và có thể thêm Tiêu đề phụ (Subtitle), Chân trang (Footer) hoặc Ghi chú.
- **FR-002**: Mỗi khối chữ PHẢI có các thuộc tính độc lập: nội dung text, kiểu chữ (fontFamily), kích thước (fontSize / sizeScale), màu sắc (tự động hoặc chọn màu tương phản), độ dày nét viền, và tọa độ (x, y).
- **FR-003**: Hệ thống PHẢI tích hợp sẵn bộ font tiếng Việt nội bộ (offline) với tối thiểu 6 kiểu dáng phân loại theo cảm xúc:
  - *Trang trọng* (Montserrat Bold)
  - *Nổi bật / Mạnh mẽ* (BeVietnamPro ExtraBold / Black)
  - *Hiện đại / Tinh tế* (BeVietnamPro Medium)
  - *Truyền thống / Cổ điển* (Merriweather hoặc Playfair Display Việt hóa)
  - *Năng động / Đậm đà* (Baloo 2 hoặc Oswald Việt hóa)
- **FR-004**: Tất cả các khối chữ PHẢI được giới hạn trong biên canvas (không cho phép người dùng kéo lọt ra ngoài mép ảnh dẫn đến mất chữ khi xuất file).
- **FR-005**: Hệ thống PHẢI có tính năng Auto-contrast thông minh cho từng khối chữ: phân tích nền ảnh ngay dưới khối chữ đó để chọn màu chữ trắng có viền đen hoặc chữ đen có viền trắng.
- **FR-006**: Giao diện PHẢI cung cấp thanh trượt kích thước to/nhỏ đơn giản (Cỡ chữ: Nhỏ - Vừa - Lớn - Rất lớn) hoặc slider trực quan, không bắt người dùng tính toán đơn vị pixel/point.
- **FR-007**: Hệ thống PHẢI cho phép lưu toàn bộ trạng thái thiết kế ra file `.json` (hoặc định dạng `.taproject`) và mở lại file này bất kỳ lúc nào.
- **FR-008**: Hệ thống PHẢI tự động lưu tạm (Auto-save) vào `localStorage` của app, để khi lỡ tắt app hoặc refresh thì dữ liệu gần nhất vẫn còn.
- **FR-009**: Hệ thống PHẢI xuất file ảnh chất lượng cao (PNG 2x/3x resolution) thông qua Electron native Save Dialog hoặc tải trình duyệt.

### Non-Functional Requirements

- **NFR-001 (Usability)**: Ngôn ngữ 100% tiếng Việt thân thiện, không dùng thuật ngữ kỹ thuật đồ họa phức tạp (như Layer, Canvas, Kerning, Bounding box...).
- **NFR-002 (Offline)**: Hoạt động hoàn toàn không cần kết nối mạng. Tất cả font chữ, icon, script đều bundle cục bộ trong ứng dụng.
- **NFR-003 (Performance)**: Phản hồi kéo thả mượt mà trên 60fps, thời gian auto-contrast và render lại dưới 50ms khi di chuyển chữ.

---

## Key Entities

- **TextBlock**:
  - `id`: Định danh duy nhất của khối chữ (e.g., `title`, `subtitle`, `block_123`)
  - `type`: Phân loại (`title` | `subtitle` | `body` | `custom`)
  - `label`: Tên hiển thị thân thiện trên UI (e.g., "Tiêu đề chính", "Tiêu đề phụ")
  - `content`: Nội dung chữ nhập vào
  - `fontFamily`: Tên font đang dùng
  - `fontSize`: Kích thước font
  - `x`, `y`: Tọa độ tâm khối chữ
  - `align`: Căn lề ('center' | 'left' | 'right')
  - `colorMode`: 'auto' (tự động tương phản) hoặc mã màu cố định
  - `strokeWidth`: Độ dày viền chữ chống chìm nền
  - `removable`: Có thể xóa được hay không (Tiêu đề chính mặc định không xóa được, chỉ xóa được các khối phụ)

- **ProjectConfig**:
  - `version`: Phiên bản cấu trúc file dự án (e.g., "2.0")
  - `templateId`: ID mẫu ban đầu được chọn
  - `canvas`: Kích thước khung hình (chiều rộng, chiều cao)
  - `backgroundImage`: Dữ liệu ảnh nền (base64 hoặc đường dẫn)
  - `textBlocks`: Danh sách các `TextBlock`
  - `updatedAt`: Thời gian lưu gần nhất

---

## Success Criteria *(mandatory)*

- **SC-001**: Người dùng không có kỹ năng đồ họa có thể tạo xong một bức ảnh có 2 dòng tiêu đề đẹp mắt trong vòng dưới 2 phút.
- **SC-002**: 100% các ký tự tiếng Việt có dấu hiển thị chính xác trên mọi font chữ được cung cấp, không có hiện tượng lỗi font hoặc sai khoảng cách dấu.
- **SC-003**: Khả năng mở lại dự án cũ (Project Load) thành công 100%, phục hồi chính xác vị trí chữ, font chữ và ảnh nền.
- **SC-004**: Tỷ lệ lưu ảnh thành công trên máy tính người dùng đạt 100% không bị vỡ bố cục hay mất chữ.
