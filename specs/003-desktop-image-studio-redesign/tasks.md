---
description: 'Danh sách công việc triển khai chi tiết cho Agent tiếp theo: Desktop Image Studio Redesign'
---

# Tasks: Desktop Image Studio (Tái Thiết Toàn Diện Ứng Dụng Chỉnh Sửa Ảnh & Chèn Chữ Desktop)

**Input**: Thiết kế từ `/specs/003-desktop-image-studio-redesign/spec.md`, `plan.md`, `data-model.md`
**Target Branch**: `003-desktop-image-studio-redesign`
**Role**: Hướng dẫn thi công độc lập cho Agent lập trình. Mọi task đều có đường dẫn tệp cụ thể và tiêu chí nghiệm thu.

## Quy ước định dạng: `[ID] [P?] [Story] Mô tả công việc`

- **[P]**: Có thể thực hiện song song (khác tệp, không phụ thuộc task khác cùng phase)
- **[Story]**: Thuộc User Story nào trong spec (US1 -> US7)

---

## Phase 1: Nền tảng Mô hình Dữ liệu (Data Models & Core Types)

**Mục tiêu**: Xây dựng toàn bộ các interface và kiểu dữ liệu chuẩn mực để toàn hệ thống sử dụng chung.

- [x] T001 [P] [US1] Tạo file `src/app/models/canvas.model.ts`: Định nghĩa `CanvasConfig`, `AspectRatioType`, `ViewportTransform`, và hằng số tỷ lệ khung hình chuẩn (`ASPECT_RATIO_PRESETS`).
- [x] T002 [P] [US2] Tạo file `src/app/models/typography.model.ts`: Định nghĩa `TypographyConfig`, `TextRibbonConfig`, `TextStrokeConfig`, `TextShadowConfig`, và danh sách phông chữ tuyển chọn (`OFFLINE_FONTS`).
- [x] T003 [P] [US4] Tạo file `src/app/models/image-processing.model.ts`: Định nghĩa `BackgroundConfig`, `ImageAdjustments`, `DimmerOverlayConfig`, `CropRect`, và `ImageTransform`.
- [x] T004 [P] [US1] Tạo file `src/app/models/project.model.ts`: Định nghĩa `ProjectDocument`, `CanvasLayer`, `TextLayer`, `ShapeLayer`, `ProjectMeta`.
- [x] T005 [P] [US5] Tạo file `src/app/models/template.model.ts`: Định nghĩa `TemplatePreset`, `TemplateCategory`, `TemplateLayerDefinition`.
- [x] T006 [P] [US6] Tạo file `src/app/models/history.model.ts`: Định nghĩa `HistoryCommand`, `HistoryState`.
- [x] T007 [P] [US7] Tạo file `src/app/models/export.model.ts`: Định nghĩa `ExportOptions`, `ExportFormat`, `ExportResolutionMultiplier`.

---

## Phase 2: Động cơ Canvas & Viewport Thông Minh (Foundational Canvas & Viewport)

**Mục tiêu**: Thay thế toàn bộ logic canvas cứng nhắc bằng Fabric.js v7 Core Engine hỗ trợ Viewport Responsive và Snapping Guides.

- [x] T008 [US1] Tạo file `src/app/services/viewport.service.ts`:
  - Hàm `calculateAutoFit(stageWidth, stageHeight, canvasWidth, canvasHeight, padding)`: Tính toán hệ số `scale` (0.1 - 4.0) và toạ độ tâm để canvas luôn hiển thị trọn vẹn trong vùng stage mà không bao giờ bị tràn cửa sổ hay xuất hiện thanh cuộn ngoài.
  - Quản lý mức zoom: `zoomIn()`, `zoomOut()`, `fitScreen()`, `setZoom(scale)`.
- [x] T009 [US1] Tạo file `src/app/services/snapping.service.ts`:
  - Lắng nghe sự kiện di chuyển đối tượng (`object:moving`).
  - Kiểm tra khoảng cách toạ độ tâm đối tượng với tâm ngang/dọc của canvas (threshold: 10px).
  - Tự động hút nam châm (snap) vào tâm và hiển thị đường gióng xanh neon rực rỡ (`snapLineV`, `snapLineH`); ẩn đường gióng khi nhả chuột (`object:modified`).
- [x] T010 [US1] Tạo file `src/app/services/canvas-engine.service.ts`:
  - Khởi tạo instance `fabric.Canvas` trên HTMLCanvasElement với cấu hình tối ưu: `preserveObjectStacking: true`, `selection: true`, nền màu xám tối chuẩn studio.
  - Tích hợp `ViewportService` và `SnappingService`.
  - Hỗ trợ đổi kích thước canvas động theo tỷ lệ ảnh gốc hoặc theo Aspect Ratio Preset đã chọn.
  - Quản lý sự kiện chọn đối tượng (`selection:created`, `selection:updated`, `selection:cleared`) bắn signal thông báo cho UI Inspector.

---

## Phase 3: Động cơ Xử lý Hình ảnh Phi Hủy Diệt (Non-Destructive Image Engine)

**Mục tiêu**: Cung cấp toàn bộ tính năng Crop, Rotate, Filter quang học, và Dimmer Overlay.

- [x] T011 [US4] Tạo file `src/app/services/image-processing.service.ts`:
  - **Tải ảnh nền**: Hàm `setBackgroundImage(file | dataUrl)`: đọc ảnh, ghi nhận kích thước gốc (width, height), tự căn tỷ lệ canvas theo ảnh nếu là ảnh đầu tiên.
  - **Bộ lọc quang học phi hủy diệt**: Hàm `applyAdjustments(adjustments: ImageAdjustments)`: áp dụng Fabric Filters (`filters.Brightness`, `filters.Contrast`, `filters.Saturation`, `filters.Blur`, `filters.Vignette`) trên ảnh nền trong thời gian thực.
  - **Lớp phủ làm tối (Dimmer Overlay)**: Hàm `setDimmerOverlay(config: DimmerOverlayConfig)`: tạo hoặc cập nhật một lớp `fabric.Rect` có dải màu Gradient (Bottom-to-Top hoặc Solid) nằm ngay trên ảnh nền và dưới tất cả các lớp chữ để chữ luôn nổi bật trên nền ảnh.
  - **Xoay & Lật ảnh**: Hàm `rotateBackground(deg: 90 | -90)` và `flipBackground(axis: 'x' | 'y')`.
  - **Cắt ảnh (Crop)**: Hàm `startCropMode(aspectRatio?)` và `applyCrop(cropRect: CropRect)`.
  - **Đặt lại**: Hàm `resetAdjustments()` khôi phục ảnh nguyên bản.

---

## Phase 4: Động cơ Đa Hộp Chữ Tự Do & Dải Nền Chữ (Multi-Textbox & Typography)

**Mục tiêu**: Cho phép tạo không giới hạn hộp chữ, gõ tiếng Việt Unicode có dấu, viền chữ, bóng đổ, và dải ribbon ôm sát chữ.

- [x] T012 [US2] Tạo file `src/app/services/typography.service.ts`:
  - Hàm `createTextbox(text: string, options: Partial<TextLayer>)`: khởi tạo `fabric.Textbox` với font Việt hóa mặc định (`Montserrat-Bold`), cỡ chữ 48px, tự động ngắt dòng theo chiều rộng (word wrap), bật các controls điểm neo cạnh và góc.
  - Bắt sự kiện chỉnh sửa chữ trực tiếp (`editing:entered`, `editing:exited`) đảm bảo bộ gõ tiếng Việt (Unikey/Telex) không bị rụng dấu.
- [x] T013 [US3] Nâng cấp `TypographyService` với tính năng **Dải nền chữ (Text Ribbon Highlight)**:
  - Hàm `applyRibbonHighlight(textbox: fabric.Textbox, ribbon: TextRibbonConfig)`: tính toán bounding box từng dòng chữ, vẽ khối nền có bo góc ôm sát văn bản với màu sắc và độ mờ tùy chỉnh, tự động co giãn khi thêm/bớt chữ.
- [x] T014 [US3] Hàm định dạng nâng cao trong `TypographyService`:
  - Cập nhật font chữ (`setFontFamily`), cỡ chữ (`setFontSize`), màu chữ (`setColor`), in đậm/nghiêng/gạch chân.
  - Viền chữ (`setStroke(color, width)`) và Đổ bóng (`setShadow(color, blur, offsetX, offsetY)`).
  - Giãn dòng (`lineHeight`) và Giãn chữ (`charSpacing`).
  - Hàm `suggestContrast(textbox)`: phân tích độ sáng trung bình vùng ảnh dưới hộp chữ và đề xuất màu sắc tối ưu chỉ bằng 1 click.

---

## Phase 5: Quản lý Trạng Thái & Lịch Sử Thao Tác (History & State Management)

**Mục tiêu**: Đảm bảo Undo/Redo 50 bước (`Ctrl+Z`/`Ctrl+Y`), lưu file dự án `.tiproj`, và auto-save nháp.

- [x] T015 [US6] Tạo file `src/app/services/history.service.ts`:
  - Cài đặt Command Pattern với `HistoryCommand` interface (`execute()`, `undo()`).
  - Quản lý 2 ngăn xếp: `undoStack` (tối đa 50 bước) và `redoStack`.
  - Cung cấp tín hiệu phản ứng: `canUndo = computed(...)`, `canRedo = computed(...)`.
  - Hàm `undo()`, `redo()`, `push(command)`.
- [x] T016 [US1] Tạo file `src/app/services/studio-state.service.ts`:
  - Quản lý các signal trung tâm: `projectTitle`, `canvasConfig`, `selectedLayerId`, `selectedLayerType`, `activeToolTab`, `isExportModalOpen`, `isDirty`.
  - Đồng bộ giữa Canvas Selection và UI Inspector.
- [x] T017 [US6] Tạo file `src/app/services/project-persistence.service.ts`:
  - Hàm `exportProjectToJson(): ProjectDocument`: trích xuất toàn bộ cấu hình canvas, lớp chữ, bộ lọc ảnh nền thành JSON chuẩn.
  - Hàm `importProjectFromJson(doc: ProjectDocument)`: tái dựng nguyên vẹn canvas từ tệp JSON.
  - Hàm `saveToLocalDraft()` và `restoreFromLocalDraft()` qua LocalStorage.

---

## Phase 6: Thiết kế Giao diện Desktop Studio UI Components

**Mục tiêu**: Hiện thực hóa giao diện màn hình đơn hiện đại (Header, Tool Dock, Canvas Stage, Inspector, Status Bar).

- [x] T018 [US1] Tạo component `src/app/components/titlebar/titlebar.component.ts`:
  - Hiển thị logo ToolImage Studio, Tên dự án (cho phép sửa tên trực tiếp).
  - Nút Mở tệp (`Ctrl+O`), Lưu tệp (`Ctrl+S`).
  - Cặp nút Hoàn tác (Undo `Ctrl+Z`), Làm lại (Redo `Ctrl+Y`) tự động disable khi không có lịch sử.
  - Nút CTA chính màu xanh nổi bật: **"💾 Xuất ảnh"**.
- [x] T019 [US1] Tạo component `src/app/components/tool-dock/tool-dock.component.ts`:
  - Thanh công cụ bên trái rộng 72px với các tab chuyển đổi trực quan:
    - `🖼️ Ảnh nền` (Tải ảnh, Cắt, Xoay, Đặt lại)
    - `🔤 Thêm chữ` (Tiêu đề lớn, Phụ đề, Chữ thường, Khẩu hiệu viền)
    - `🎨 Mẫu sẵn` (Mở drawer xem mẫu thiết kế)
    - `✨ Bộ lọc` (Chỉnh sáng/tương phản/làm mờ/phủ tối)
    - `📑 Lớp ảnh` (Quản lý thứ tự layer, khóa, ẩn)
- [x] T020 [US1] Tạo component `src/app/components/canvas-stage/canvas-stage.component.ts`:
  - Vùng sân khấu trung tâm với phần tử `<canvas>` Fabric.
  - Tích hợp `ResizeObserver` để tự động kích hoạt `viewportService.calculateAutoFit()` mỗi khi cửa sổ thay đổi kích thước.
  - Thanh công cụ Viewport nổi trên cùng: Chọn nhanh tỷ lệ (`AspectRatioSelector`), Cụm nút Zoom (`-`, `%`, `+`, `Fit Screen`).
  - Hỗ trợ kéo thả file ảnh trực tiếp vào stage (Drag & Drop zone).
- [x] T021 [US3] Tạo component `src/app/components/inspector/text-inspector.component.ts`:
  - Bảng thuộc tính chữ bên phải: Dropdown chọn phông Việt hóa, Input số + nút tăng/giảm cỡ chữ, Palette màu chữ + Hex input.
  - Cụm nút căn lề (Trái, Giữa, Phải), In đậm, In nghiêng, In hoa.
  - Khu vực tùy biến **Dải nền chữ (Text Ribbon)**: Công tắc Bật/Tắt, Chọn màu nền, Độ mờ, Bo góc slider.
  - Khu vực **Viền chữ (Stroke)** và **Bóng đổ (Shadow)**.
  - Nút "Tự động tối ưu độ tương phản" (Smart Contrast Assist).
- [x] T022 [US4] Tạo component `src/app/components/inspector/image-inspector.component.ts`:
  - Bảng thuộc tính ảnh nền: Kích thước pixel gốc, Nút Cắt ảnh, Xoay 90°, Lật ảnh.
  - 4 thanh trượt quang học: Độ sáng (Brightness), Độ tương phản (Contrast), Độ bão hòa (Saturation), Làm mờ (Blur) kèm nút Reset từng thanh.
  - Khu vực **Lớp phủ làm tối (Dimmer Overlay)**: Chọn kiểu phủ (Từ dưới lên, Từ trên xuống, Toàn bộ), Chọn màu phủ, Thanh trượt độ mờ (0 - 100%).
- [x] T023 [US1] Tạo component `src/app/components/inspector/inspector.component.ts`:
  - Host component cho thanh bên phải, tự động hiển thị `text-inspector` khi đang chọn hộp chữ, `image-inspector` khi đang chọn ảnh hoặc tab bộ lọc, và `canvas-inspector` khi không chọn gì.
- [x] T024 [US1] Tạo component `src/app/components/status-bar/status-bar.component.ts`:
  - Thanh trạng thái chân trang: Kích thước canvas thực tế (ví dụ: `1920 × 1080 px`), Mức zoom hiện tại (`65%`), Số lượng lớp, và Nút mở modal phím tắt trợ giúp.
- [x] T025 [US1] Tạo directive `src/app/shared/directives/keyboard-shortcuts.directive.ts`:
  - Lắng nghe sự kiện bàn phím toàn cục: `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Ctrl+S` (Save), `Ctrl+O` (Open), `Ctrl+D` (Duplicate), `Delete`/`Backspace` (Xóa lớp đang chọn), Phím mũi tên (Nudge vị trí 1px, `Shift` + Mũi tên: 10px).
- [x] T026 [US1] Tạo component tổng thể `src/app/components/studio/studio.component.ts`:
  - Kết nối toàn bộ 5 khu vực giao diện trên một layout CSS Grid/Flexbox hoàn hảo, tràn viền màn hình không có thanh cuộn cửa sổ.

---

## Phase 7: Quản Lý Lớp & Thư Viện Mẫu Thiết Kế Thông Minh

**Mục tiêu**: Cung cấp khả năng sắp xếp lớp (Layer Management) và 6 bộ mẫu thiết kế cổ động/sự kiện thông minh.

- [x] T027 [US2] Tạo component `src/app/components/layer-panel/layer-panel.component.ts`:
  - Danh sách các lớp theo thứ tự z-index từ trên xuống dưới.
  - Cho phép nhấp chọn lớp, bấm nút Lên/Xuống một bậc, Lên trên cùng, Xuống dưới cùng.
  - Nút Khóa lớp (Lock) để tránh thao tác nhầm và Nút Ẩn/Hiện lớp (Visibility toggle).
  - Nút Xóa lớp.
- [x] T028 [US5] Tạo file `src/app/services/template-library.service.ts`:
  - Quản lý danh mục mẫu thiết kế được tải từ `assets/templates/`.
  - Hàm `applyTemplate(templateId: string)`: tính toán tọa độ tương đối theo kích thước thật của canvas hiện tại để sinh ra các lớp chữ, dải băng rôn và dải phủ tối phù hợp mà vẫn bảo toàn ảnh nền của người dùng.
- [x] T029 [US5] Tạo và định nghĩa 6 mẫu thiết kế JSON trong `src/assets/templates/`:
  - `tpl_propaganda_red_gold.json`: Khẩu hiệu cổ động Đỏ chữ Vàng viền đậm.
  - `tpl_youth_volunteer_blue.json`: Sự kiện Đoàn thanh niên Xanh dương năng động.
  - `tpl_ceremony_formal_gold.json`: Đại hội trang trọng Chữ Serif có chân, viền vàng kim.
  - `tpl_quote_artistic.json`: Trích dẫn nghệ thuật chữ thanh lịch.
  - `tpl_breaking_news.json`: Khung tin tức / Thông báo báo chí.
  - `tpl_welcome_banner.json`: Khung chào mừng hội nghị/kỷ niệm.
- [x] T030 [US5] Tạo component `src/app/components/template-drawer/template-drawer.component.ts`:
  - Ngăn kéo duyệt mẫu thiết kế hiển thị thumbnail SVG/PNG, phân loại theo chủ đề, xem trước mô tả, nhấp để áp dụng ngay.

---

## Phase 8: Động Cơ Xuất Ảnh Chất Lượng Cao, Tích Hợp Desktop & Kiểm Thử

**Mục tiêu**: Hoàn thiện modal xuất ảnh, tích hợp Native Save Dialog qua Electron IPC, và viết bộ kiểm thử tự động toàn diện.

- [x] T031 [US7] Tạo component `src/app/components/export-modal/export-modal.component.ts`:
  - Hộp thoại xuất ảnh với bản xem trước thu nhỏ.
  - Tùy chọn định dạng: PNG (24-bit sắc nét), JPEG (thanh trượt chất lượng 70 - 100%), WebP.
  - Tùy chọn độ phân giải xuất: `1x` (Kích thước chuẩn), `2x` (Độ nét cao Retina/4K), `3x` (Chuẩn in ấn khổ lớn).
  - Hiển thị kích thước pixel đầu ra và dung lượng tệp ước tính.
- [x] T032 [US7] Cài đặt `exportToImage(options: ExportOptions)` trong `CanvasEngineService`:
  - Bỏ chọn toàn bộ đối tượng, ẩn tạm thời các đường gióng trước khi chụp.
  - Tạo canvas offscreen với multiplier tương ứng (`1x`, `2x`, `3x`), render toàn bộ cảnh ở độ nét tối đa.
  - Trả về Data URL hoặc Blob nhị phân.
- [x] T033 [US7] Cập nhật `electron/main.js` và `electron/preload.js`:
  - Bổ sung IPC handler `show-save-dialog`: bộ lọc mở rộng cho PNG, JPG, WebP, và `.tiproj`.
  - Bổ sung IPC handler `open-file-in-folder`: mở thư mục chứa file đã lưu trong Windows Explorer khi người dùng bấm nút sau khi xuất ảnh.
- [x] T034 [P] [US1] Viết unit tests cho `src/app/services/viewport.service.spec.ts`:
  - Kiểm tra tính toán auto-fit trên nhiều tỷ lệ màn hình (16:9, 4:3, 1:1, dọc, ngang).
- [x] T035 [P] [US1] Viết unit tests cho `src/app/services/snapping.service.spec.ts`:
  - Kiểm tra kích hoạt đường gióng khi đối tượng nằm trong phạm vi 10px so với tâm.
- [x] T036 [P] [US2] Viết unit tests cho `src/app/services/typography.service.spec.ts`:
  - Kiểm tra tạo hộp chữ, định dạng font chữ Việt hóa, áp dụng dải nền ribbon.
- [x] T037 [P] [US4] Viết unit tests cho `src/app/services/image-processing.service.spec.ts`:
  - Kiểm tra áp dụng bộ lọc quang học và dải phủ dimmer gradient.
- [x] T038 [P] [US6] Viết unit tests cho `src/app/services/history.service.spec.ts`:
  - Kiểm tra ngăn xếp Undo/Redo 50 bước, đảm bảo hoạt động chính xác với Command Pattern.
- [x] T039 [P] [US6] Viết unit tests cho `src/app/services/project-persistence.service.spec.ts`:
  - Kiểm tra đóng gói và khôi phục tệp JSON `.tiproj`.
- [x] T040 Cập nhật `src/app/app.ts` để kết nối `StudioComponent` làm giao diện gốc duy nhất.
- [x] T041 Chạy kiểm thử tự động `npm test` và chạy build kiểm tra lỗi biên dịch `npm run build`.
