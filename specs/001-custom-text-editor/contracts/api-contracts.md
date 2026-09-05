# Interface Contracts: 001-custom-text-editor

## 1. Electron IPC Contracts (`electron/preload.js` & `electron/main.js`)

Mở rộng các kênh IPC để hỗ trợ lưu và mở file dự án cấu hình cũ:

### `show-save-project-dialog`
- **Mục đích**: Mở hộp thoại chọn nơi lưu file cấu hình dự án (.json).
- **Tham số**:
  ```typescript
  options: {
    defaultPath?: string; // e.g. "du-an-banner-20260905.json"
    filters?: Array<{ name: string; extensions: string[] }>; // e.g. [{ name: 'File dự án', extensions: ['json', 'bannerproj'] }]
  }
  ```
- **Trả về**: `Promise<string | null>` (Đường dẫn file được chọn hoặc null nếu người dùng hủy).

### `show-open-project-dialog`
- **Mục đích**: Mở hộp thoại chọn file dự án cũ đã lưu.
- **Tham số**: Không
- **Trả về**: `Promise<string | null>` (Đường dẫn file được chọn hoặc null nếu hủy).

### `save-project-file`
- **Tham số**: `(filePath: string, projectJson: string)`
- **Trả về**: `Promise<boolean>`

### `read-project-file`
- **Tham số**: `(filePath: string)`
- **Trả về**: `Promise<string>` (Chuỗi JSON chứa dữ liệu `ProjectData`).

---

## 2. Canvas Engine Contracts (`CanvasService`)

Các hàm API mà `CanvasService` cung cấp cho các Component:

```typescript
export interface ICanvasService {
  // Khởi tạo Canvas với mẫu thiết kế và danh sách khối chữ
  initCanvas(canvasEl: HTMLCanvasElement, template: Template, blocks: TextBlock[]): void;

  // Cập nhật ảnh nền
  setBackgroundImage(dataUrl: string): Promise<void>;

  // Thao tác với TextBlock
  addTextBlock(block: TextBlock): void;
  updateTextBlock(blockId: string, changes: Partial<TextBlock>): void;
  removeTextBlock(blockId: string): void;
  selectTextBlock(blockId: string): void;

  // Căn gióng & Tinh chỉnh
  centerHorizontally(blockId: string): void;
  resetBlockPosition(blockId: string, template: Template): void;
  resetAllPositions(template: Template): void;

  // Render & Xuất ảnh
  exportToPng(multiplier?: number): string | null;
  dispose(): void;
}
```

---

## 3. UI Component Contracts

### Sự kiện chọn khối chữ (Selection Event)
- Khi người dùng click chuột vào chữ trên Fabric Canvas:
  - Fabric phát sinh sự kiện `selection:created` / `selection:updated` với đối tượng `target`.
  - `CanvasService` phát tín hiệu `blockSelected(blockId)`.
  - Bảng điều khiển cuộn tới ô nhập tương ứng và highlight khung nhập liệu của khối đó.
