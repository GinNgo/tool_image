# Quickstart Validation Guide: Perfect Banner Studio

Tài liệu hướng dẫn kiểm thử các kịch bản sử dụng độc lập (End-to-End Test Scenarios) cho Perfect Banner Studio.

## Kịch bản 1: Tải ảnh nền & Chỉnh sửa chữ trực tiếp

1. Mở ứng dụng trong trình duyệt (`npm run ng-serve`) hoặc trên Desktop (`npm start`).
2. Kéo thả một hình ảnh phong cảnh hoặc sự kiện vào khung vẽ (hoặc bấm nút "Tải ảnh nền").
3. Nhấp đúp chuột vào dòng chữ tiêu đề trên canvas và gõ: `"HỘI NGHỊ TỔNG KẾT NĂM 2026"`.
4. Quan sát: Chữ cập nhật trơn tru theo thời gian thực và đồng bộ với danh sách thuộc tính ở thanh bên.

## Kịch bản 2: Di chuyển và Đổi phong cách chữ

1. Dùng chuột nhấp giữ và kéo khối chữ tiêu đề di chuyển đến bất kỳ vị trí nào trên ảnh.
2. Tại thanh công cụ nhanh trên đầu (Top Toolbar), bấm vào bộ chọn Font:
   - Chọn kiểu "Trang trọng" (Playfair Display) -> Quan sát font chữ chuyển sang serif sang trọng, không lỗi dấu tiếng Việt.
   - Chọn kiểu "Mạnh mẽ" (Oswald) -> Quan sát font chữ chuyển sang dáng cao, dứt khoát.
3. Kéo thanh trượt kích cỡ chữ để phóng to hoặc thu nhỏ tiêu đề.

## Kịch bản 3: Áp dụng Khuôn bố cục & Giữ nguyên chữ khi đổi ảnh nền

1. Mở tab **"Khuôn mẫu"** ở thanh bên trái.
2. Chọn khuôn **"Băng rôn chân trang"**: Các hộp chữ tự động sắp xếp xuống đáy ảnh với hiệu ứng viền bóng nổi bật.
3. Bấm nút **"Đổi ảnh nền"** trên thanh Header và chọn một bức ảnh khác.
4. Xác nhận:
   - Ảnh nền mới được cập nhật hoàn hảo.
   - Toàn bộ nội dung chữ ("HỘI NGHỊ TỔNG KẾT NĂM 2026"), vị trí chân trang, kích thước và font chữ giữ nguyên 100%.

## Kịch bản 4: Lưu & Nạp dự án

1. Bấm nút **"Lưu bản thảo"** trên thanh Header -> Tệp JSON được lưu về máy.
2. Làm mới (F5) trang trình duyệt để xóa trạng thái.
3. Chuyển sang tab **"Dự án"** -> Bấm **"Mở tệp dự án"** và chọn tệp JSON vừa lưu.
4. Xác nhận: Toàn bộ ảnh nền và các hộp chữ được khôi phục chính xác 100%.
