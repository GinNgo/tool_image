# Data Model: 001-custom-text-editor

## 1. Core Entities

### TextBlock
Đại diện cho một khối chữ độc lập trên bức ảnh (ví dụ: Tiêu đề chính, Tiêu đề phụ, Ghi chú).

```typescript
export type TextBlockType = 'title' | 'subtitle' | 'caption' | 'custom';

export interface TextBlock {
  id: string;                      // Định danh duy nhất: e.g. 'title', 'subtitle_1', 'custom_169...'
  type: TextBlockType;             // Phân loại khối chữ
  label: string;                    // Tên hiển thị tiếng Việt trên giao diện: 'Tiêu đề chính', 'Tiêu đề phụ'
  content: string;                  // Nội dung chữ do người dùng nhập
  x: number;                        // Tọa độ X (tâm khối chữ) trên canvas gốc
  y: number;                        // Tọa độ Y (tâm khối chữ) trên canvas gốc
  align: 'center' | 'left' | 'right';
  fontFamily: string;               // Font áp dụng: 'Montserrat-Bold', 'BeVietnamPro-Bold', etc.
  fontSize: number;                 // Kích cỡ font hiện tại
  minFontSize: number;              // Kích cỡ nhỏ nhất khi auto-fit
  maxFontSize: number;              // Kích cỡ lớn nhất
  colorMode: 'auto' | 'custom';     // 'auto': hệ thống tự tính độ tương phản; 'custom': chọn màu cụ thể
  color: string;                    // Màu chữ (mặc định '#ffffff' hoặc '#111827')
  strokeColor: string;              // Màu viền chữ
  strokeWidth: number;              // Độ dày viền chữ
  removable: boolean;               // Có được xóa không (Tiêu đề chính: false; các khối phụ: true)
  isDefaultPosition?: boolean;      // Đang ở vị trí gốc của mẫu hay đã bị kéo
}
```

### FontPreset
Định nghĩa danh mục các kiểu chữ tuyển chọn hiển thị cho người dùng:

```typescript
export interface FontPreset {
  id: string;                       // e.g. 'solemn', 'strong', 'modern', 'classic'
  name: string;                     // Tên hiển thị trực quan: "Trang trọng", "Mạnh mẽ", "Hiện đại", "Cổ điển"
  fontFamily: string;               // Tên khai báo trong @font-face CSS
  description: string;              // Mô tả ngắn gọn: "Phù hợp tiêu đề lớn, khẩu hiệu chính"
  previewChar: string;              // Ký tự xem trước: e.g. "Aa"
}
```

### ProjectData (Cấu hình dự án lưu/mở lại)
Cấu trúc file `.json` hoặc lưu vào storage của máy tính:

```typescript
export interface ProjectData {
  version: '2.0';
  projectName: string;              // Tên dự án (mặc định theo ngày giờ)
  createdAt: string;                // ISO timestamp
  updatedAt: string;                // ISO timestamp
  templateId: string;               // ID mẫu được chọn
  canvas: {
    width: number;
    height: number;
  };
  backgroundImage: {
    dataUrl: string;                // Dữ liệu ảnh base64
    fileName: string;               // Tên file gốc
  } | null;
  textBlocks: TextBlock[];          // Danh sách các khối chữ hiện tại
  activeBlockId: string | null;     // Khối chữ đang được chọn
}
```

---

## 2. State Transitions

### Lifecycle của một TextBlock
1. **Khởi tạo**: Khi chọn Template, `EditorStateService` sinh ra `TextBlock` mặc định cho Tiêu đề chính (`id: 'title'`).
2. **Thêm khối chữ phụ**: Người dùng bấm "Thêm tiêu đề phụ", hệ thống tạo thêm một `TextBlock` mới (`type: 'subtitle'`, vị trí tự động tính toán cách khối trước một khoảng an toàn).
3. **Chỉnh sửa / Di chuyển**: Khi người dùng gõ nội dung, đổi font hoặc kéo thả trên Canvas, dữ liệu `TextBlock` cập nhật tức thời (reactive signal).
4. **Xóa**: Người dùng bấm nút xóa trên khối chữ phụ -> xóa khỏi mảng `textBlocks` và xóa đối tượng tương ứng trên Fabric Canvas.
5. **Khôi phục**: Bấm "Về vị trí mặc định" -> khôi phục lại tọa độ `(x, y)` ban đầu từ mẫu thiết kế.
