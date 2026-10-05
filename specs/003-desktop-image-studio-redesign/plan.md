# Implementation Plan: Desktop Image Studio Redesign

**Branch**: `003-desktop-image-studio-redesign` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-desktop-image-studio-redesign/spec.md`

## 1. Tóm tắt kỹ thuật & Phương án kiến trúc (Technical Summary)

Thay thế hoàn toàn cấu trúc wizard 3 bước cứng nhắc bằng một kiến trúc **Desktop Studio Workspace** phân tầng rõ ràng (Decoupled 5-Layer Architecture):

1. **Desktop Shell Layer (Electron)**: Quản lý cửa sổ, Native Menu, IPC Bridge, Save/Open Dialogs, và File System I/O.
2. **UI & Presentation Layer (Angular 22+)**: Giao diện Studio đơn màn hình, Reactive Signal Store, kiến trúc OnPush không gây re-render thừa.
3. **State & Command History Layer (Undo/Redo Engine)**: Áp dụng Command Pattern ghi nhận lịch sử 50 bước, hỗ trợ snapshot serialization/deserialization cho tệp dự án `.tiproj`.
4. **Canvas Engine Adapter (Fabric.js v7 Core)**: Quản lý Scene Graph, Layer Stack, Smart Snapping Guides, và Viewport Transform Auto-Fit (không phụ thuộc vào kích thước màn hình).
5. **Image Processing Pipeline**: Động cơ xử lý hình ảnh phi hủy diệt (Non-destructive Pipeline) bao gồm Crop Tool, Rotate/Flip, Optical Adjustments (Brightness, Contrast, Saturation, Blur), và Dimmer Gradient Overlay Engine.

---

## 2. Bối cảnh kỹ thuật (Technical Context)

| Tiêu chí                 | Đặc tả kỹ thuật                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **Framework UI**         | Angular 22+ (Standalone Components, Signals, OnPush Change Detection)                |
| **Canvas Engine**        | Fabric.js v7 (phiên bản mới nhất, tối ưu scene graph, tương tác handles mượt mà)     |
| **Desktop Wrapper**      | Electron 44+ (Context Isolation: true, Node Integration: false, Preload IPC Bridge)  |
| **Ngôn ngữ**             | TypeScript ~6.0.2 (Strict mode, No implicit any)                                     |
| **Quản lý trạng thái**   | Angular Signals (`signal`, `computed`, `effect`) + Command Pattern                   |
| **Xử lý ảnh**            | HTML5 Canvas 2D Context + WebGL Shader Filters (Non-destructive)                     |
| **Phông chữ tiếng Việt** | Bundle local qua `@font-face` (Montserrat, Be Vietnam Pro, Playfair Display, Oswald) |
| **Lưu trữ dữ liệu**      | Native JSON `.tiproj` file + LocalStorage auto-save cache                            |
| **Kiểm thử**             | Vitest (Unit & Component tests) + Mock Fabric Canvas                                 |
| **Mục tiêu hiệu năng**   | Kéo thả tương tác 60 FPS; Render bộ lọc ảnh < 50ms; Xuất ảnh 2x < 2s                 |
| **Nền tảng đích**        | Windows 10/11 x64 (Portable `.exe` qua `electron-builder`)                           |

---

## 3. Kiến trúc phân tầng chi tiết (5-Layer Decoupled Architecture)

```
+-------------------------------------------------------------------------------+
| 1. ELECTRON SHELL LAYER                                                       |
|    - main.js (Window lifecycle, Native menu, IPC dispatch)                   |
|    - preload.js (ContextBridge: showSaveDialog, showOpenDialog, readFile)     |
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ IPC Bridge
                                      ▼
+-------------------------------------------------------------------------------+
| 2. UI PRESENTATION LAYER (Angular Standalone Components)                     |
|    - StudioLayoutComponent (Header, ToolDock, CanvasStage, Inspector, Status)  |
|    - ToolDockComponent (Images, Text, Templates, Filters, Layers)             |
|    - CanvasStageComponent (Viewport zoom/pan, Auto-fit calculation)          |
|    - InspectorComponent (Contextual Text Inspector / Image Inspector)         |
|    - ExportModalComponent (Preview, format selection, resolution multiplier)  |
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ Signals / Events
                                      ▼
+-------------------------------------------------------------------------------+
| 3. STATE & COMMAND HISTORY LAYER (Signals + Command Pattern)                 |
|    - StudioStateService (Current project, selection, zoom level, active tool)  |
|    - HistoryManagerService (UndoStack, RedoStack, ExecuteCommand, 50 levels)  |
|    - ProjectPersistenceService (Serialize to .tiproj JSON, Deserialize, Cache)|
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ Method Calls / State Subscriptions
                                      ▼
+-------------------------------------------------------------------------------+
| 4. CANVAS ENGINE ADAPTER (Fabric.js v7 Scene Graph)                           |
|    - CanvasEngineService (Init, Viewport matrix, Selection events)            |
|    - TextboxManager (Add textbox, typography, inline edit, ribbon background) |
|    - LayerManager (Reorder, bring to front, send to back, lock, visibility)  |
|    - SnappingGuideEngine (Center/Edge alignment magnetic guides)              |
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ Filter / Texture binding
                                      ▼
+-------------------------------------------------------------------------------+
| 5. IMAGE PROCESSING PIPELINE (Non-Destructive Filter Graph)                  |
|    - ImageAdjustmentEngine (Brightness, Contrast, Saturation, Blur, Vignette) |
|    - DimmerOverlayEngine (Bottom-to-top gradient, Solid color overlay)        |
|    - CropRotateEngine (Interactive crop box, Rotate 90 deg, Flip H/V)         |
|    - HighResExportPipeline (Full-resolution offscreen render at 1x, 2x, 3x)   |
+-------------------------------------------------------------------------------+
```

---

## 4. Cấu trúc thư mục mã nguồn mục tiêu (Concrete File Layout)

Dành cho Agent tiếp theo triển khai code:

```text
src/
├── app/
│   ├── app.ts                                 # Root component
│   ├── app.config.ts                          # App providers
│   ├── models/
│   │   ├── project.model.ts                   # ProjectDocument, Layer, Meta interfaces
│   │   ├── canvas.model.ts                    # CanvasSize, AspectRatio, ViewportTransform
│   │   ├── typography.model.ts                # FontOption, TextStyle, TextRibbonConfig
│   │   ├── image-processing.model.ts          # ImageAdjustments, DimmerConfig, CropRect
│   │   └── template.model.ts                  # TemplatePreset, TemplateCategory
│   ├── services/
│   │   ├── canvas-engine.service.ts           # Core Fabric.js v7 canvas wrapper
│   │   ├── viewport.service.ts                # Auto-fit zoom, pan matrix calculation
│   │   ├── layer-manager.service.ts           # Layer stack, ordering, lock, visibility
│   │   ├── snapping.service.ts                # Magnetic snapping guides engine
│   │   ├── image-processing.service.ts        # Filters, Dimmer overlay, Crop, Rotate
│   │   ├── typography.service.ts              # Textbox factory, formatting, ribbon badge
│   │   ├── history.service.ts                 # Command pattern Undo/Redo stack (50 steps)
│   │   ├── studio-state.service.ts            # Central reactive signal store
│   │   ├── project-file.service.ts            # .tiproj file open/save + auto-save cache
│   │   └── template-library.service.ts        # Built-in adaptive templates catalog
│   ├── components/
│   │   ├── studio/
│   │   │   ├── studio.component.ts            # Main desktop studio layout
│   │   │   ├── studio.component.html
│   │   │   └── studio.component.scss
│   │   ├── titlebar/
│   │   │   ├── titlebar.component.ts          # App header, project name, undo/redo, export CTA
│   │   │   └── titlebar.component.scss
│   │   ├── tool-dock/
│   │   │   ├── tool-dock.component.ts         # Left navigation bar (Image, Text, Templates, Filters, Layers)
│   │   │   └── tool-dock.component.scss
│   │   ├── canvas-stage/
│   │   │   ├── canvas-stage.component.ts      # Center stage, auto-fit viewport, fabric canvas host
│   │   │   └── canvas-stage.component.scss
│   │   ├── inspector/
│   │   │   ├── inspector.component.ts         # Right dynamic panel host
│   │   │   ├── text-inspector.component.ts    # Font, size, color, ribbon, stroke, shadow
│   │   │   ├── image-inspector.component.ts   # Crop, rotate, filters, dimmer overlay
│   │   │   └── canvas-inspector.component.ts  # Aspect ratios, canvas size, background
│   │   ├── layer-panel/
│   │   │   ├── layer-panel.component.ts       # Layer list, drag reorder, lock, hide
│   │   │   └── layer-panel.component.scss
│   │   ├── template-drawer/
│   │   │   ├── template-drawer.component.ts   # Preset template browser
│   │   │   └── template-drawer.component.scss
│   │   ├── export-modal/
│   │   │   ├── export-modal.component.ts      # High-res export preview dialog
│   │   │   └── export-modal.component.scss
│   │   └── status-bar/
│   │       ├── status-bar.component.ts        # Bottom bar: dimensions, cursor, zoom, shortcuts
│   │       └── status-bar.component.scss
│   └── shared/
│       ├── components/
│       │   ├── color-picker.component.ts      # Preset colors + hex input
│       │   └── slider.component.ts            # Reusable labeled slider with reset
│       └── directives/
│           └── keyboard-shortcuts.directive.ts# Global hotkeys (Ctrl+Z, Ctrl+S, Del...)
├── assets/
│   ├── fonts/                                 # Offline fonts (.ttf)
│   ├── templates/                             # Adaptive templates JSON definitions
│   └── icons/                                 # SVG UI icons
└── electron/
    ├── main.js                                # Native window, menu, save/open IPC
    └── preload.js                             # Secure IPC bridge
```

---

## 5. Kế hoạch triển khai theo từng giai đoạn (Phased Execution Strategy)

### Giai đoạn 1: Nền tảng Dữ liệu & Động cơ Canvas mới (Foundation Phase)

1. Xây dựng toàn bộ mô hình dữ liệu (`models/*.ts`) theo đúng chuẩn TypeScript strict.
2. Nâng cấp `CanvasEngineService` bọc Fabric.js v7:
   - Xóa bỏ việc fix cứng 1080x1350px.
   - Hỗ trợ khởi tạo canvas theo kích thước ảnh gốc.
   - Xây dựng thuật toán `ViewportService.computeAutoFit(stageWidth, stageHeight, canvasWidth, canvasHeight)` tính tỷ lệ scale và vị trí tâm để canvas luôn vừa vặn trong cửa sổ mà không tràn.
3. Cài đặt `HistoryService` theo Command Pattern:
   - Lưu trữ lệnh `execute()`, `undo()`, `redo()`.
   - Giới hạn 50 bước trong bộ nhớ, tối ưu RAM.

### Giai đoạn 2: Động cơ Đa hộp chữ & Typography chuyên sâu (Multi-Textbox Phase)

1. Xây dựng `TypographyService`:
   - Hàm `addTextbox(type: 'title' | 'subtitle' | 'body')` thêm hộp chữ Fabric.js với font Việt hóa có sẵn.
   - Hỗ trợ tính năng `applyRibbonBackground(textbox, config)`: vẽ dải màu nền có bo góc ôm sát các dòng chữ.
   - Thiết lập các handle điều khiển (Corner and side handles) để co giãn chiều rộng tự bẻ dòng chữ.
2. Hoàn thiện `SnappingService`:
   - Bắt sự kiện `object:moving` của Fabric.js để vẽ đường căn giữa ngang/dọc (X/Y axis) khi toạ độ nằm trong phạm vi sai số 10px.

### Giai đoạn 3: Động cơ Xử lý Ảnh phi hủy diệt (Image Processing Phase)

1. Xây dựng `ImageProcessingService`:
   - Tích hợp Fabric Image Filters: `filters.Brightness`, `filters.Contrast`, `filters.Saturation`, `filters.Blur`.
   - Tích hợp lớp phủ Dimmer Gradient: vẽ Rect với Gradient Fill đặt ngay trên ảnh nền và dưới các lớp chữ.
   - Xây dựng chế độ Crop Tool tương tác: cho phép kéo khung cắt và áp dụng cắt ảnh không suy giảm chất lượng.
   - Hỗ trợ Xoay 90° và Lật ảnh (Flip X/Y).

### Giai đoạn 4: Giao diện Studio Workspace (UI/UX Phase)

1. Xây dựng `StudioLayoutComponent` với bố cục 3 cột kinh điển:
   - Header (Titlebar với nút Undo/Redo, Tên dự án, Nút Xuất ảnh).
   - Left ToolDock (Ảnh, Chữ, Mẫu, Bộ lọc, Lớp).
   - Center CanvasStage (Khung vẽ với ResizeObserver tự động tính Auto-Fit Viewport).
   - Right Contextual Inspector (Tự động hiển thị bảng thuộc tính phù hợp khi chọn chữ hoặc chọn ảnh).
   - Bottom StatusBar (Kích thước ảnh, mức Zoom, phím tắt).
2. Tích hợp `KeyboardShortcutsDirective`:
   - `Ctrl+Z`, `Ctrl+Y`, `Ctrl+S`, `Ctrl+O`, `Ctrl+D`, `Delete`, `Arrows`.

### Giai đoạn 5: Mẫu thiết kế thông minh & Quản lý Dự án (Templates & Projects Phase)

1. Tạo 6 bộ mẫu adaptive template trong `assets/templates/` với toạ độ tương đối (percentage-based).
2. Xây dựng `ProjectFileService`:
   - Đóng gói toàn bộ canvas state, layer tree, image adjustments thành định dạng `.tiproj` (JSON).
   - Hỗ trợ mở tệp `.tiproj` và khôi phục nguyên vẹn 100%.
   - Lưu bản nháp vào LocalStorage mỗi 30 giây.

### Giai đoạn 6: Động cơ Xuất ảnh chất lượng cao & Đóng gói Electron (Export & Packaging Phase)

1. Xây dựng `ExportModalComponent`:
   - Cho phép chọn PNG (nét nhất), JPG (chọn chất lượng), WebP.
   - Chọn độ phân giải: 1x (gốc), 2x (siêu nét), 3x (in ấn).
   - Xóa toàn bộ viền chọn trước khi chụp ảnh, kết xuất offscreen ở độ phân giải mục tiêu.
2. Tích hợp Native Save Dialog qua Electron IPC.
3. Kiểm thử toàn diện và đóng gói Windows Portable `.exe`.
