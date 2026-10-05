# Data Model: Desktop Image Studio

**Feature Branch**: `003-desktop-image-studio-redesign` | **Date**: 2026-10-05

Tài liệu này đặc tả toàn bộ mô hình dữ liệu (TypeScript Interfaces & JSON Schemas) cho ứng dụng Desktop Image Studio, đảm bảo tính nhất quán giữa Canvas Engine, UI Components, Undo/Redo History, và định dạng tệp lưu trữ `.tiproj`.

---

## 1. Mô hình Dự án tổng thể (Project Document Model)

```typescript
export interface ProjectDocument {
  version: '2.0.0';
  id: string; // UUID v4
  title: string; // Tên dự án (ví dụ: "Banner Co Dong 2026")
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  canvas: CanvasConfig; // Cấu hình khung vẽ
  background: BackgroundConfig | null; // Cấu hình ảnh nền
  layers: CanvasLayer[]; // Danh sách các lớp (Text, Shape, Decoration)
  meta: ProjectMeta; // Thông tin bổ trợ (tác giả, từ khóa...)
}

export interface ProjectMeta {
  appName: 'ToolImage Studio';
  appVersion: string;
  sourceTemplateId?: string;
  tags?: string[];
}
```

---

## 2. Cấu hình Khung vẽ & Tỷ lệ hiển thị (Canvas & Aspect Ratio Model)

```typescript
export type AspectRatioType =
  | 'original' // Giữ nguyên tỷ lệ ảnh gốc
  | '1:1' // Vuông (Social Feed, Avatar)
  | '16:9' // Màn hình ngang, Banner Web, Video
  | '9:16' // Dọc Story, Reels, TikTok
  | '4:5' // Dọc Poster, Instagram Portrait
  | '3:2' // Tỷ lệ máy ảnh tiêu chuẩn
  | 'custom'; // Kích thước tự nhập

export interface CanvasConfig {
  width: number; // Chiều rộng pixel thực (ví dụ: 1920)
  height: number; // Chiều cao pixel thực (ví dụ: 1080)
  aspectRatio: AspectRatioType; // Loại tỷ lệ đang chọn
  backgroundColor: string; // Màu nền canvas khi không có ảnh (mặc định: "#18181b")
}

export interface ViewportTransform {
  zoom: number; // Hệ số thu phóng hiển thị (0.1 - 4.0)
  panX: number; // Tọa độ dịch chuyển ngang của viewport
  panY: number; // Tọa độ dịch chuyển dọc của viewport
  fitZoom: number; // Hệ số zoom tính toán để canvas vừa vặn viewport
}
```

---

## 3. Ảnh nền & Xử lý hình ảnh phi hủy diệt (Background & Image Processing Model)

```typescript
export interface BackgroundConfig {
  id: string; // UUID
  fileName: string; // Tên file gốc (ví dụ: "anh-hoi-nghi.jpg")
  sourceDataUrl: string; // Dữ liệu ảnh gốc (Data URL / base64)
  originalWidth: number; // Kích thước gốc
  originalHeight: number;
  fitMode: 'fit' | 'cover'; // Khớp vừa khung hay lấp đầy khung
  transform: ImageTransform; // Tọa độ, tỷ lệ co giãn, góc xoay
  cropRect?: CropRect; // Vùng cắt ảnh (nếu có áp dụng crop)
  adjustments: ImageAdjustments; // Các bộ lọc quang học phi hủy diệt
  dimmerOverlay: DimmerOverlayConfig; // Lớp phủ làm tối/sáng nền
}

export interface ImageTransform {
  x: number; // Tọa độ tâm X
  y: number; // Tọa độ tâm Y
  scaleX: number; // Tỷ lệ scale X
  scaleY: number; // Tỷ lệ scale Y
  rotation: number; // Góc xoay độ (0, 90, 180, 270)
  flipX: boolean; // Lật ngang
  flipY: boolean; // Lật dọc
}

export interface CropRect {
  x: number; // Tọa độ góc trên trái vùng crop
  y: number;
  width: number; // Chiều rộng vùng crop
  height: number; // Chiều cao vùng crop
}

export interface ImageAdjustments {
  brightness: number; // -100 đến +100 (mặc định: 0)
  contrast: number; // -100 đến +100 (mặc định: 0)
  saturation: number; // -100 đến +100 (mặc định: 0)
  blur: number; // 0 đến 50 px (mặc định: 0)
  vignette: number; // 0 đến 100 % (mặc định: 0)
}

export type DimmerGradientType =
  | 'none'
  | 'bottom-to-top' // Tối dần từ đáy lên (cho đặt tiêu đề dưới)
  | 'top-to-bottom' // Tối dần từ đỉnh xuống
  | 'two-sided' // Tối dần ở cả 2 đầu trên dưới
  | 'solid'; // Phủ đều toàn ảnh

export interface DimmerOverlayConfig {
  enabled: boolean;
  type: DimmerGradientType;
  color: string; // Mã màu Hex (ví dụ: "#000000", "#0b192c")
  opacity: number; // 0 đến 100 % (mặc định: 40%)
  heightRatio: number; // Chiều cao vùng phủ (0.2 đến 1.0)
}
```

---

## 4. Mô hình Hộp chữ & Định dạng Typography (Text Layer Model)

```typescript
export type LayerType = 'text' | 'shape' | 'image-overlay';

export interface BaseLayer {
  id: string; // UUID v4
  type: LayerType;
  name: string; // Tên hiển thị trong Layer Panel (ví dụ: "Tiêu đề chính")
  x: number; // Tọa độ X trên canvas
  y: number; // Tọa độ Y trên canvas
  width: number; // Chiều rộng bounding box
  height: number; // Chiều cao bounding box
  rotation: number; // Góc xoay (-180 đến 180)
  opacity: number; // Độ mờ đục (0.0 đến 1.0)
  visible: boolean; // Ẩn/Hiện lớp
  locked: boolean; // Khóa/Mở khóa chỉnh sửa
  zIndex: number; // Thứ tự hiển thị lớp
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string; // Nội dung văn bản tiếng Việt
  typography: TypographyConfig; // Thuộc tính font và chữ
  ribbon: TextRibbonConfig; // Dải nền chữ (Highlight/Ribbon)
  stroke: TextStrokeConfig; // Viền chữ
  shadow: TextShadowConfig; // Bóng đổ chữ
}

export interface TypographyConfig {
  fontFamily: string; // 'Montserrat-Bold' | 'BeVietnamPro-Bold' | 'Playfair Display'...
  fontSize: number; // 8 đến 400 px
  fontWeight: 'normal' | 'bold' | '600' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  uppercase: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number; // 0.8 đến 2.5 (mặc định: 1.2)
  letterSpacing: number; // -50 đến 300 (mặc định: 0)
  color: string; // Mã màu Hex (ví dụ: "#FFFFFF", "#FFD700")
}

export interface TextRibbonConfig {
  enabled: boolean; // Bật/tắt dải nền chữ
  backgroundColor: string; // Màu nền (ví dụ: "#DC2626" đỏ cờ, "#1E3A8A" xanh)
  opacity: number; // 0 đến 100 % (mặc định: 90%)
  paddingX: number; // Đệm ngang pixel (mặc định: 16)
  paddingY: number; // Đệm dọc pixel (mặc định: 8)
  borderRadius: number; // Bo góc px (0 đến 50, mặc định: 6)
  boxShadow?: string;
}

export interface TextStrokeConfig {
  enabled: boolean;
  color: string; // Màu viền chữ (ví dụ: "#000000")
  width: number; // Độ dày viền px (0 đến 20)
}

export interface TextShadowConfig {
  enabled: boolean;
  color: string; // Màu bóng (ví dụ: "rgba(0,0,0,0.7)")
  blur: number; // Độ nhòe (0 đến 40)
  offsetX: number; // Độ lệch X (-30 đến 30)
  offsetY: number; // Độ lệch Y (-30 đến 30)
}
```

---

## 5. Mô hình Lớp hình khối & Trang trí (Shape & Decoration Model)

```typescript
export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'line' | 'ribbon-banner';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
}

export type CanvasLayer = TextLayer | ShapeLayer;
```

---

## 6. Mô hình Mẫu thiết kế thông minh (Smart Template Preset Model)

```typescript
export interface TemplatePreset {
  id: string; // ví dụ: "tpl_propaganda_gold_red"
  name: string; // "Khẩu hiệu Cổ động Đỏ - Vàng"
  category: TemplateCategory;
  thumbnail: string; // Đường dẫn SVG/PNG thu nhỏ
  description: string;
  recommendedAspectRatios: AspectRatioType[];
  dimmerOverlay?: DimmerOverlayConfig;
  defaultLayers: TemplateLayerDefinition[];
}

export type TemplateCategory =
  | 'propaganda' // Cổ động, tuyên truyền
  | 'ceremony' // Lễ kỷ niệm, đại hội trang trọng
  | 'event' // Sự kiện thanh niên, phong trào
  | 'quote' // Trích dẫn nghệ thuật, danh ngôn
  | 'announcement'; // Thông báo, tin tức báo chí

export interface TemplateLayerDefinition {
  type: 'text' | 'shape';
  relativeX: number; // Tọa độ tính theo % canvas width (0.0 - 1.0)
  relativeY: number; // Tọa độ tính theo % canvas height (0.0 - 1.0)
  relativeWidth: number; // Độ rộng tính theo % canvas width (0.0 - 1.0)
  textConfig?: Partial<TextLayer>;
  shapeConfig?: Partial<ShapeLayer>;
}
```

---

## 7. Mô hình Lịch sử & Hoàn tác (Command Pattern & History Model)

```typescript
export interface HistoryCommand {
  id: string;
  name: string; // Tên hành động tiếng Việt (ví dụ: "Đổi màu chữ", "Di chuyển")
  timestamp: number;
  execute(): void;
  undo(): void;
}

export interface HistoryState {
  past: HistoryCommand[]; // Ngăn xếp hoàn tác (tối đa 50 bước)
  future: HistoryCommand[]; // Ngăn xếp làm lại
  canUndo: boolean;
  canRedo: boolean;
}
```

---

## 8. Mô hình Xuất ảnh thành phẩm (Export Options Model)

```typescript
export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type ExportResolutionMultiplier = 1 | 2 | 3;

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0.6 đến 1.0 (áp dụng cho JPEG/WebP)
  multiplier: ExportResolutionMultiplier; // 1x, 2x, 3x
  fileName: string; // Tên file xuất gợi ý (ví dụ: "banner-20261005_153000.png")
  targetWidth: number; // width * multiplier
  targetHeight: number; // height * multiplier
  estimatedSizeBytes?: number; // Ước lượng dung lượng file
}
```
