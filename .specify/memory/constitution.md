# ToolImage Studio Constitution

## Core Principles

### I. Studio Workspace Model (Non-Negotiable)
Khung làm việc studio liên tục (continuous workspace), loại bỏ hoàn toàn mô hình Wizard 3 bước rời rạc. Người dùng có toàn quyền xem canvas, công cụ, thuộc tính và kết quả xuất trên cùng một không gian làm việc nhất quán với độ trễ thấp.

### II. Non-Destructive Editing & Aspect Ratio Fidelity
Không bao giờ cưỡng ép tỷ lệ ảnh của người dùng vào một kích thước duy nhất. Mọi ảnh nền phải giữ nguyên độ phân giải và tỷ lệ gốc theo mặc định, hoặc người dùng được chủ động chọn tỷ lệ khung vẽ chuẩn (16:9, 1:1, 9:16, 4:5, 3:2, A4). Mọi hiệu ứng chỉnh sửa ảnh (Crop, Brightness, Contrast, Filter, Blur, Dimmer) phải là phi hủy diệt (non-destructive), có thể hoàn tác hoặc đặt lại bất kỳ lúc nào.

### III. Freeform Multi-Layer Canvas (PPT / Canva Standard)
Người dùng có quyền tạo không giới hạn số lượng hộp chữ (Text Boxes), lớp hình khối (Shapes), dải băng rôn (Ribbons), và hình ảnh phụ (Overlays/Logos). Mỗi lớp có thể chọn, kéo thả, xoay, đổi thứ tự hiển thị (Bring Forward / Send Backward), và căn gióng với smart snapping guides.

### IV. Typography & Vietnamese Unicode Perfection
Hệ thống phông chữ phải hoạt động 100% offline, tuyển chọn các font hỗ trợ đầy đủ tiếng Việt Unicode chuẩn không bao giờ rụng dấu hay fallback font lỗi. Hỗ trợ định dạng chuyên nghiệp: Phông chữ, Cỡ chữ, Màu sắc, Nền chữ (Text Ribbon Highlight), Đổ bóng (Shadow), Viền chữ (Stroke), Giãn dòng (Line Height), Giãn chữ (Letter Spacing).

### V. Undo/Redo & State Persistence Guarantee
Mọi thao tác chỉnh sửa canvas (thêm/xóa lớp, di chuyển, đổi màu, áp dụng filter) đều phải được ghi nhận vào Command History Stack (tối thiểu 50 bước) hỗ trợ `Ctrl+Z` / `Ctrl+Y`. Dự án phải có khả năng lưu thành tệp `.tiproj` (JSON format) và tự động lưu bản nháp phục hồi khi mở lại app.

### VI. Performance & Offline-First Integrity
Ứng dụng phải hoạt động 100% offline không phụ thuộc internet, không gọi CDN ngoài. Thao tác tương tác canvas đạt 60 FPS. Ảnh xuất ra giữ nguyên 100% độ sắc nét ở độ phân giải thực tế của ảnh gốc (hoặc nhân hệ số x2, x3 khi xuất chất lượng cao).

## Governance & Quality Gates
1. Mọi tính năng phải được đặc tả trong Spec Kit (`specs/`) trước khi viết code.
2. Code triển khai phải tuân thủ kiến trúc phân tầng (Decoupled Layer Architecture) giữa Electron Shell, Angular Reactive UI, Canvas Engine Adapter, và Image Processing Pipeline.
3. Không thực hiện phá vỡ trải nghiệm người dùng không rành công nghệ: giao diện bằng tiếng Việt thân thiện, rõ ràng, trực quan, có gợi ý phím tắt và tooltip đầy đủ.

**Version**: 2.0.0 | **Ratified**: 2026-10-05 | **Status**: Active
