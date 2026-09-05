# Tasks: 001-custom-text-editor

**Input**: Design documents from `specs/001-custom-text-editor/` (spec.md, plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md

**Organization**: Tasks are grouped strictly by user story to enable independent implementation and testing.

## Format: `[TaskID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (independent files)
- **[Story]**: [US1], [US2], [US3], [US4]

---

## Phase 1: Setup & Data Models (Foundational)

**Purpose**: Nâng cấp kiểu dữ liệu `TextBlock`, `FontPreset`, `ProjectData` và chuẩn bị font chữ, icon.

- [ ] T001 Mở rộng định nghĩa kiểu `TextBlock`, `FontPreset`, `ProjectData` trong `src/app/models/template.model.ts`
- [ ] T002 [P] Khai báo bổ sung các font chữ tiếng Việt (`Merriweather`, `Oswald`, `Comfortaa`) trong `src/styles.scss` và copy font files vào `src/assets/fonts/`
- [ ] T003 Tạo `FontService` quản lý danh mục 6 font cảm xúc tiếng Việt (Trang trọng, Mạnh mẽ, Hiện đại, Cổ điển, Năng động, Mềm mại) trong `src/app/services/font.service.ts`

---

## Phase 2: User Story 1 - Thêm & Quản lý nhiều khối chữ (Priority: P1) 🎯 MVP Core

**Goal**: Cho phép người dùng thêm Tiêu đề phụ/khẩu hiệu, chọn khối chữ để sửa, xóa khối chữ phụ.

**Independent Test**: Thêm ảnh nền -> Bấm "+ Thêm tiêu đề phụ" -> Nhập nội dung riêng cho từng khối chữ -> Cả 2 hiển thị rõ trên Canvas.

- [ ] T004 [US1] Nâng cấp `EditorStateService` trong `src/app/services/editor-state.service.ts` hỗ trợ danh sách tín hiệu reactive `textBlocks`, `activeBlockId`, các hàm `addTextBlock()`, `removeTextBlock()`, `updateTextBlockContent()`
- [ ] T005 [US1] Nâng cấp `CanvasService` trong `src/app/services/canvas.service.ts` quản lý Map các `fabric.Textbox`, tự động thêm/xóa/cập nhật đối tượng Textbox tương ứng với danh sách `TextBlock`
- [ ] T006 [US1] Tích hợp sự kiện click chọn trên Canvas (`selection:created`, `selection:updated`) trong `src/app/services/canvas.service.ts` để đồng bộ `activeBlockId` về `EditorStateService`
- [ ] T007 [US1] Nâng cấp giao diện `StepEditorComponent` trong `src/app/components/step-editor/step-editor.component.ts`: hiển thị danh sách ô nhập cho từng khối chữ, nút "+ Thêm tiêu đề phụ" và nút xóa "🗑️" cho khối phụ
- [ ] T008 [P] [US1] Cập nhật Unit Tests cho `EditorStateService` và `CanvasService` trong `src/app/services/editor-state.service.spec.ts` và `src/app/services/canvas.service.spec.ts`

**Checkpoint US1**: Người dùng có thể thêm/sửa/xóa nhiều khối chữ độc lập và xem kết quả trực tiếp trên ảnh.

---

## Phase 3: User Story 2 - Bộ Font chữ Việt hóa đẹp theo cảm xúc (Priority: P1)

**Goal**: Cho phép đổi kiểu chữ cho khối đang chọn bằng các nút bấm cảm xúc trực quan, không lỗi dấu tiếng Việt.

**Independent Test**: Nhập câu khẩu hiệu tiếng Việt có dấu -> Bấm các nút kiểu chữ ("Trang trọng", "Mạnh mẽ", "Hiện đại", "Cổ điển") -> Chữ đổi font mượt mà và không lỗi dấu.

- [ ] T009 [US2] Thêm hàm `updateTextBlockFont(blockId, fontFamily)` trong `src/app/services/editor-state.service.ts` và `CanvasService.setTextboxFont()` trong `src/app/services/canvas.service.ts`
- [ ] T010 [US2] Thiết kế bộ nút chọn kiểu chữ dạng lưới trực quan với biểu tượng cảm xúc trong `src/app/components/step-editor/step-editor.component.ts`
- [ ] T011 [P] [US2] Viết test xác nhận chuyển đổi font chữ trên từng khối chữ trong `src/app/components/step-editor/step-editor.component.spec.ts`

**Checkpoint US2**: Đổi kiểu chữ cho từng dòng độc lập, giao diện dễ hiểu không thuật ngữ khó.

---

## Phase 4: User Story 3 - Điều chỉnh vị trí, kích thước & Căn giữa 1 chạm (Priority: P2)

**Goal**: Kéo thả khối chữ mượt mà, thanh trượt chỉnh cỡ chữ, snap guide canh tâm, nút 1 chạm "Căn giữa" và nút "Về vị trí mẫu".

**Independent Test**: Kéo chữ sang bên -> Bấm "Căn giữa ảnh" -> Chữ vào chính giữa canvas; Kéo thanh slider cỡ chữ -> Chữ to/nhỏ theo ý muốn; Bấm "Về vị trí mẫu" -> Khối chữ về vị trí mặc định.

- [ ] T012 [US3] Bổ sung logic giới hạn biên an toàn (Boundary Constrain) cho từng khối chữ trong `src/app/services/canvas.service.ts`
- [ ] T013 [US3] Mở rộng snap-guide trong `CanvasService` hỗ trợ tất cả các Textbox khi di chuyển gần tâm dọc/ngang của canvas
- [ ] T014 [US3] Cung cấp hàm `centerHorizontally(blockId)` và `resetBlockPosition(blockId)` trong `src/app/services/canvas.service.ts`
- [ ] T015 [US3] Thêm thanh slider điều chỉnh cỡ chữ trực quan và các nút thao tác nhanh ("↔️ Căn giữa", "↩️ Về vị trí mẫu") vào `src/app/components/step-editor/step-editor.component.ts`
- [ ] T016 [P] [US3] Cập nhật unit test kiểm tra căn giữa và khôi phục vị trí trong `src/app/services/canvas.service.spec.ts`

**Checkpoint US3**: Thao tác căn chỉnh vị trí và kích thước chữ mượt mà, không thể làm hỏng bố cục.

---

## Phase 5: User Story 4 - Lưu & Mở lại cấu hình cũ (Project Save / Load) (Priority: P2)

**Goal**: Cho phép lưu bản thảo ra file `.json` hoặc tự động ghi nhớ phiên làm việc dở dang để mở lại chỉnh sửa tiếp.

**Independent Test**: Tạo ảnh + 2 khối chữ -> Bấm "Lưu dự án" -> Tắt ứng dụng -> Mở lại -> Bấm "Mở dự án cũ" -> Toàn bộ ảnh nền và vị trí chữ được phục hồi chính xác.

- [ ] T017 [US4] Cập nhật `electron/main.js` và `electron/preload.js`: bổ sung IPC handler `show-save-project-dialog`, `show-open-project-dialog`, `write-project-file`, `read-project-file`
- [ ] T018 [US4] Bổ sung các phương thức `saveProject()` và `loadProject()` trong `src/app/services/file.service.ts` (hỗ trợ cả Electron IPC và Browser fallback)
- [ ] T019 [US4] Tích hợp cơ chế tự động ghi nhớ (Auto-save) vào `localStorage` trong `EditorStateService`
- [ ] T020 [US4] Thêm nút "📂 Mở dự án cũ" tại `StepTemplateComponent` (`src/app/components/step-template/step-template.component.ts`) và nút "💾 Lưu bản thảo" tại `StepEditorComponent`
- [ ] T021 [P] [US4] Viết test kiểm tra serialize và deserialize `ProjectData` trong `src/app/services/file.service.spec.ts`

**Checkpoint US4**: Hoàn thiện toàn diện tính năng lưu/mở lại cấu hình cũ theo yêu cầu người dùng.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Đảm bảo xuất ảnh chất lượng cao và giao diện hoàn hảo không lỗi.

- [ ] T022 Cập nhật `StepExportComponent` trong `src/app/components/step-export/step-export.component.ts` để hiển thị ảnh xem trước sắc nét với đầy đủ các khối chữ
- [ ] T023 Chạy toàn bộ test suite `npx ng test --watch=false` và kiểm tra 100% passed
- [ ] T024 Chạy build production `npm run build` và kiểm tra ứng dụng chạy ổn định
