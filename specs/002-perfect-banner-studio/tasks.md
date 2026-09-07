# Tasks: Perfect Banner Studio

**Input**: Design documents from `specs/002-perfect-banner-studio/` (spec.md, plan.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped strictly by user story to enable independent implementation and testing.

## Format: `[TaskID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (independent files)
- **[Story]**: [US1], [US2], [US3], [US4]

---

## Phase 1: Setup (Shared Infrastructure & Data Models)

**Purpose**: Nâng cấp và đồng bộ các kiểu dữ liệu, hệ thống font chữ cảm xúc chuẩn tiếng Việt.

- [x] T001 Khởi tạo/cập nhật interface `TextBlock`, `LayoutMaster`, `ProjectConfig` trong `src/app/models/template.model.ts`
- [x] T002 [P] Chuẩn bị và khai báo danh mục font Google tiếng Việt chuẩn trong `src/styles.scss` và `src/assets/fonts/`
- [x] T003 Quản lý danh mục font cảm xúc (Emotional Font Presets) trong `src/app/services/font.service.ts`

---

## Phase 2: Foundational (Core Canvas & Viewport)

**Purpose**: Hạ tầng khung vẽ ảo (Virtual Artboard) với độ phân giải cao và tính năng Responsive Zoom tự động.

- [x] T004 Xây dựng Responsive Viewport Virtual Coordinate Canvas với Fabric.js trong `src/app/services/canvas.service.ts`
- [x] T005 [P] Thiết lập State Management Reactive Signals trong `src/app/services/editor-state.service.ts`

---

## Phase 3: User Story 1 - Tải ảnh nền & Chỉnh sửa chữ trực tiếp (Priority: P1) 🎯 MVP

**Goal**: Người dùng tải ảnh nền bất kỳ, tạo/sửa/xóa các khối chữ độc lập và gõ chữ trực tiếp trên ảnh.

**Independent Test**: Tải 1 ảnh tùy ý -> Gõ nội dung tiêu đề trực tiếp trên ảnh -> Chữ cập nhật ngay tức thì mà không giật lag.

- [x] T006 [US1] Tích hợp kéo thả & chọn file ảnh nền chất lượng cao trong `src/app/services/image.service.ts`
- [x] T007 [US1] Quản lý tạo/sửa/xóa nhiều layer Textbox độc lập trong `src/app/services/canvas.service.ts`
- [x] T008 [US1] Hỗ trợ gõ trực tiếp inline (double-click trên canvas) và binding ô nhập trong `src/app/components/studio/studio.component.ts`
- [x] T009 [P] [US1] Viết unit tests cho US1 trong `src/app/services/canvas.service.spec.ts`

---

## Phase 4: User Story 2 - Di chuyển & Tùy biến phông chữ đơn giản (Priority: P1)

**Goal**: Kéo thả di chuyển chữ mượt mà, thanh trượt chỉnh cỡ chữ và bộ chọn font cảm xúc không lỗi dấu tiếng Việt.

**Independent Test**: Kéo chữ đến góc khác -> Chọn font "Mạnh mẽ" -> Font đổi ngay lập tức và giữ trọn vẹn dấu tiếng Việt.

- [x] T010 [US2] Tích hợp thanh trượt kích cỡ chữ và căn lề trong `src/app/components/studio/top-toolbar.component.ts`
- [x] T011 [US2] Bộ chọn phong cách chữ cảm xúc (Trang trọng, Mạnh mẽ, Hiện đại...) trong `src/app/components/studio/top-toolbar.component.ts`
- [x] T012 [P] [US2] Viết unit tests cho font và formatting trong `src/app/services/editor-state.service.spec.ts`

---

## Phase 5: User Story 3 - Áp dụng Khuôn bố cục & Hiệu ứng Chữ chuẩn (Priority: P2)

**Goal**: Cung cấp các khuôn bố cục PowerPoint chuẩn, hiệu ứng chữ Photoshop (viền, bóng) và đổi ảnh nền giữ nguyên chữ.

**Independent Test**: Áp dụng khuôn "Băng rôn chân trang" -> Đổi ảnh nền mới -> Chữ và hiệu ứng giữ nguyên 100%.

- [x] T013 [US3] Thiết lập 5 Khuôn bố cục mẫu (Băng rôn chân trang, Đỉnh trang, Băng rôn giữa, Trích dẫn, Tối giản) trong `src/app/services/template.service.ts`
- [x] T014 [US3] Thiết lập hệ thống hiệu ứng chữ Photoshop (viền stroke, đổ bóng 3D, glow) trong `src/app/services/canvas.service.ts`
- [x] T015 [US3] Tính năng đổi ảnh nền giữ nguyên 100% chữ và vị trí trong `src/app/services/editor-state.service.ts` và `src/app/components/studio/sidebar-drawer.component.ts`

---

## Phase 6: User Story 4 - Lưu và Nạp lại cấu hình (Priority: P2)

**Goal**: Lưu dự án dang dở ra tệp JSON, tự động lưu vào localStorage và lưu khuôn mẫu bố cục cá nhân.

**Independent Test**: Lưu bản thiết kế ra tệp JSON -> Tải lại trang -> Mở lại tệp -> Toàn bộ ảnh nền và vị trí chữ được phục hồi.

- [x] T016 [US4] Tự động lưu tiến độ vào `localStorage` trong `src/app/services/editor-state.service.ts`
- [x] T017 [US4] Hỗ trợ lưu ra tệp `.json` và nạp lại dự án trong `src/app/services/file.service.ts`
- [x] T018 [US4] Lưu khuôn mẫu bố cục cá nhân người dùng trong `src/app/services/template.service.ts`

---

## Phase 7: Polish & Verification Loop

**Purpose**: Vòng lặp kiểm thử liên tục đảm bảo không có lỗi tồn đọng, build thành công và trải nghiệm mượt mà.

- [x] T019 Chạy toàn bộ test suite `npx ng test --watch=false` đảm bảo 100% tests passed
- [x] T020 Kiểm tra build production `npm run build`
- [x] T021 Hoàn thiện tài liệu và kiểm thử kịch bản quickstart
