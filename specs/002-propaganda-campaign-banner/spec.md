# Feature Specification: Propaganda Campaign Banner

## 1. Feature Description

**Short Name**: `propaganda-campaign-banner`
**Goal**: Mở rộng khả năng của PhotoText Studio để tạo ra các ấn phẩm truyền thông, cổ động, sự kiện (Propaganda / Campaign Banners) với giao diện dễ sử dụng.
**Value Proposition**: Cho phép người dùng không chuyên tạo ra các băng rôn, khẩu hiệu, và hình ảnh cổ động bắt mắt, tuân thủ đúng phong cách thẩm mỹ của các chiến dịch truyền thông (màu sắc nổi bật, chữ khối sắc nét, khung viền trang trọng) chỉ bằng vài cú click chuột.

## 2. User Scenarios & Testing

### Scenario 1: Áp dụng Khuôn Bố Cục Tuyên Truyền

**Given** người dùng đã tải lên một bức ảnh sự kiện.
**When** họ chọn một Khuôn bố cục (Layout Master) từ nhóm "Cổ động / Sự kiện".
**Then** hệ thống tự động sắp xếp các dải băng rôn đỏ chữ vàng, khẩu hiệu trang trọng lên trên bức ảnh mà không làm thay đổi hay cắt xén ảnh gốc.

### Scenario 2: Tạo Khẩu Hiệu Nổi Bật với Nền Chữ (Text Ribbon)

**Given** người dùng đang chỉnh sửa một hộp chữ.
**When** họ bật tính năng "Nền chữ" (Text Background) và chọn màu sắc.
**Then** hộp chữ sẽ có một khối màu nền bao quanh (ví dụ nền Đỏ), giúp chữ bên trong nổi bật hoàn toàn so với bức ảnh phức tạp phía sau.

## 3. Functional Requirements

### 3.1. Layout Masters (Khuôn bố cục đặc thù)

- Hệ thống phải cung cấp thêm ít nhất 3 mẫu bố cục mới chuyên biệt cho truyền thông/sự kiện:
  1. **Băng rôn Khẩu hiệu (Slogan Banner)**: Chữ in hoa lớn, viền đậm, màu Vàng/Đỏ.
  2. **Thanh niên / Tình nguyện**: Màu Xanh dương đặc trưng, phông chữ năng động, dứt khoát.
  3. **Khung Sự kiện Trang trọng**: Chữ có chân (Serif), kết hợp dải nền (ribbon) tối màu ở dưới cùng.

### 3.2. Text Ribbon Background (Màu nền cho hộp chữ)

- Các hộp chữ phải hỗ trợ tô màu nền (Background Color) độc lập với màu chữ.
- Người dùng có thể bật/tắt màu nền cho bất kỳ hộp chữ nào.
- Các màu mặc định cần được gợi ý: Đỏ cờ, Vàng sao, Xanh thanh niên.

### 3.3. Hiệu ứng Chữ Tuyên Truyền (Text Effects)

- Cung cấp các hiệu ứng chữ mạnh mẽ để tăng độ tương phản:
  - Viền chữ kép (Stroke) dày.
  - Bóng đổ sâu (Deep Shadow) để chữ có cảm giác khối 3D nổi bật.

## 4. Non-Functional Requirements & Assumptions

- **Hiệu năng**: Việc áp dụng Layout Master mới phải diễn ra tức thì (< 0.5s).
- **Tính tương thích**: Bố cục tự động co giãn dựa trên độ phân giải của bức ảnh (kích thước Canvas hiện tại).
- **Assumptions**:
  - Đã có sẵn bộ Font tiếng Việt (Anton, Montserrat, Be Vietnam Pro) hỗ trợ tốt các kiểu chữ in hoa dày.
  - Định dạng màu sắc sử dụng mã HEX/RGBA tiêu chuẩn.

## 5. Success Criteria

- [ ] Người dùng hoàn thành việc tạo một ảnh cổ động với 2 dòng khẩu hiệu nổi bật trong chưa đầy 30 giây.
- [ ] Khảo sát độ thỏa mãn (Qualitative): Người dùng cảm thấy các mẫu bố cục có sẵn trông chuyên nghiệp và đúng tinh thần sự kiện.
- [ ] Ảnh xuất ra giữ nguyên độ sắc nét 100% của ảnh gốc, các dải ruy băng chữ (Ribbon) không bị lệch vị trí khi xuất file PNG.

## 6. Key Entities

- `LayoutMaster`: Mở rộng thuộc tính hoặc thêm dữ liệu các mẫu mới vào bộ sưu tập hiện có.
- `TextBlock`: Hỗ trợ đầy đủ thuộc tính `backgroundColor`, `effect: 'deep-shadow'`.
