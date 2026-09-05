# Quickstart Validation Guide: 001-custom-text-editor

Hướng dẫn kiểm thử và xác nhận chất lượng (Quality Assurance) sau khi triển khai các tính năng mới.

---

## 1. Môi trường & Lệnh chạy

### Chạy ứng dụng chế độ phát triển (Desktop Electron):
```bash
cd C:\Projects\tool_image
npm run electron:dev
```

### Chạy ứng dụng chế độ Web (kiểm tra nhanh trên trình duyệt):
```bash
cd C:\Projects\tool_image
npm start
```

### Chạy kiểm thử tự động (Unit Tests):
```bash
cd C:\Projects\tool_image
npx ng test --watch=false
```

---

## 2. Kịch bản kiểm thử hành trình người dùng (User Journeys)

### Kịch bản 1: Thêm Tiêu đề chính + Tiêu đề phụ và đổi kiểu chữ
1. Tại **Bước 1**: Chọn mẫu thiết kế "Mẫu đỏ - vàng trang trọng". Bấm **Tiếp tục**.
2. Tại **Bước 2**:
   - Bấm **Tải ảnh nền lên** (hoặc kéo thả một file ảnh bất kỳ vào khung).
   - Ô nhập **Tiêu đề chính**: Nhập `"CHÀO MỪNG NĂM HỌC MỚI"`.
   - Bấm nút **"+ Thêm tiêu đề phụ"**. Một ô nhập mới xuất hiện.
   - Nhập nội dung: `"Năm học 2026 - 2027: Đoàn kết, Sáng tạo, Đổi mới"`.
   - Bấm nút kiểu chữ **"Trang trọng"** cho tiêu đề chính và **"Hiện đại"** cho tiêu đề phụ.
   - **Kỳ vọng:** Cả hai dòng chữ hiển thị ngay ngắn trên ảnh, chữ tự động co giãn vừa khung hình, không bị lỗi bất kỳ ký tự tiếng Việt nào (kể cả các chữ như `Đ`, `ề`, `ớ`, `ắ`...).

---

### Kịch bản 2: Kéo thả tinh chỉnh vị trí và Căn giữa 1 chạm
1. Dùng chuột bấm vào dòng chữ Tiêu đề phụ trên ảnh và kéo thả dịch xuống góc dưới bên phải.
2. Bấm nút **"Căn giữa ảnh"** bên bảng điều khiển.
   - **Kỳ vọng:** Khối chữ lập tức dịch chuyển về chính giữa theo trục dọc (`centerX = canvas.width / 2`).
3. Kéo dòng chữ tự do về gần trục giữa:
   - **Kỳ vọng:** Khi khoảng cách < 12px, xuất hiện đường gióng màu xanh (snap guide) và chữ hít nhẹ vào tâm.
4. Bấm nút **"↩ Về vị trí mẫu"**:
   - **Kỳ vọng:** Khối chữ lập tức quay về vị trí mặc định ban đầu của template.

---

### Kịch bản 3: Lưu dự án và Mở lại cấu hình cũ
1. Sau khi chỉnh sửa xong ảnh và chữ ở Bước 2, bấm nút **"💾 Lưu dự án làm việc"**.
2. Chọn lưu file thành `du-an-chao-mung.json`.
3. Tắt ứng dụng hoặc bấm "Tạo mới".
4. Bấm **"📂 Mở dự án cũ"** -> Chọn file `du-an-chao-mung.json`.
   - **Kỳ vọng:** Toàn bộ ảnh nền, các lớp chữ (tiêu đề chính, tiêu đề phụ), font chữ và vị trí đã tinh chỉnh được khôi phục chính xác 100%.

---

### Kịch bản 4: Hoàn thành & Xuất ảnh chất lượng cao
1. Bấm **"Tiếp theo: Xuất ảnh →"** để sang Bước 3.
2. Bấm **"💾 Tải và Lưu ảnh về máy"**.
3. Mở file ảnh PNG vừa lưu trên máy tính:
   - **Kỳ vọng:** Độ phân giải nét gấp đôi canvas preview (multiplier: 2), chữ sắc nét, màu viền tương phản rõ ràng, không bị dính đường gióng canh giữa hay viền khung chọn khi xuất.
