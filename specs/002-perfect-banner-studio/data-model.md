# Data Model: Perfect Banner Studio

## 1. TextBlock (Thực thể chữ đa lớp)

Mỗi đoạn chữ trên Canvas được biểu diễn bằng một thực thể `TextBlock`.

```typescript
export interface TextBlock {
  id: string;              // UUID để theo dõi
  content: string;         // Nội dung văn bản
  x: number;               // Tọa độ X (pixel hoặc ratio)
  y: number;               // Tọa độ Y (pixel hoặc ratio)
  width?: number;          // Chiều rộng khối (wrap text)
  fontFamily: string;      // Tên Font chữ Google (vd: Montserrat)
  fontSize: number;        // Kích cỡ chữ
  color: string;           // Màu chữ (mặc định #ffffff hoặc #000000)
  textAlign: 'left' | 'center' | 'right'; // Căn lề
  
  // Hiệu ứng Photoshop-grade
  strokeColor?: string;    // Màu viền ngoài (nếu có)
  strokeWidth?: number;    // Độ dày viền
  shadowColor?: string;    // Màu bóng đổ
  shadowBlur?: number;     // Độ nhòe bóng
  shadowOffsetX?: number;  // Tọa độ bóng ngang
  shadowOffsetY?: number;  // Tọa độ bóng dọc
  
  // Layering
  zIndex?: number;         // Thứ tự lớp (Z-index)
}
```

## 2. LayoutMaster (Khuôn bố cục chuẩn)

Đại diện cho một khung mẫu (PowerPoint-style layout), không chứa hình ảnh tĩnh, chỉ chứa bố cục chữ.

```typescript
export interface LayoutMaster {
  id: string;              // Định danh khuôn
  name: string;            // Tên hiển thị (vd: "Tiêu đề chân trang")
  description: string;     // Mô tả ngắn
  category: 'standard' | 'custom'; // Khuôn hệ thống hay khuôn người dùng tự lưu
  isCustom?: boolean;      // Đánh dấu khuôn của người dùng
  
  // Reference resolution để scale tọa độ khi ảnh thay đổi tỉ lệ
  canvas: {
    width: number;         // Kích thước chuẩn khi tạo khuôn
    height: number;
  };
  
  blocks: Omit<TextBlock, 'id'>[]; // Danh sách các khối chữ đi kèm hiệu ứng và tỷ lệ
}
```

## 3. ProjectConfig (Dự án lưu trữ)

Gói toàn vẹn trạng thái dự án để lưu về file `json` hoặc `localStorage`.

```typescript
export interface ProjectConfig {
  version: string;         // Phiên bản dữ liệu (vd: "2.0.0")
  projectName: string;     // Tên bản thiết kế
  lastModified: number;    // Unix timestamp
  
  // Dữ liệu hình ảnh
  backgroundImageUrl: string | null; // Chuỗi base64 của ảnh gốc tải lên
  imageName?: string;                // Tên file gốc
  
  // Cấu hình chữ
  blocks: TextBlock[];               // Toàn bộ các hộp chữ
  
  // Lịch sử / Meta (cho tương lai)
  layoutMasterId?: string;           // ID khuôn đang dùng
}
```

## State Management Architecture (Angular Signals)

Trạng thái toàn cục được quản lý qua `EditorStateService` sử dụng Signals:
- `textBlocks = signal<TextBlock[]>([]);`
- `activeBlockId = signal<string | null>(null);`
- `userImageDataUrl = signal<string | null>(null);`
- `selectedLayoutMaster = signal<LayoutMaster | null>(null);`
