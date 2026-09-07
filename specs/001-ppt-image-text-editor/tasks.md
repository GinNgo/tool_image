# Tasks: PPT-Style Image & Text Editor

**Input**: Design documents from `specs/001-ppt-image-text-editor/`

**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Clean app structure and verify Angular 18 standalone configuration in `src/app/app.ts` and `src/app/app.config.ts`
- [ ] T002 Install Fabric.js dependency (`npm install fabric`)
- [ ] T003 Create models definition file `src/app/models/project.model.ts` matching `data-model.md`
- [ ] T004 Create base structure for main components (Studio, Sidebar, Toolbar) in `src/app/components/studio/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement `CanvasService` wrapper `src/app/services/canvas.service.ts` to initialize Fabric.js canvas and handle viewport resizing (responsive scaling)
- [ ] T006 Implement `EditorStateService` in `src/app/services/editor-state.service.ts` to hold global state (active object, background image, project config)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Tải ảnh nền & Thêm hộp chữ tự do (Priority: P1) 🎯 MVP

**Goal**: Load a background image and add free-floating text boxes on the canvas.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Build `SidebarDrawerComponent` UI for "Tải ảnh nền" (Upload Image) button in `src/app/components/studio/sidebar-drawer.component.ts`
- [ ] T008 [P] [US1] Implement `FileService` image loading (File -> Base64 Data URL) in `src/app/services/file.service.ts`
- [ ] T009 [US1] Add setBackgroundImage method in `CanvasService` that adjusts canvas aspect ratio and sets Fabric background image
- [ ] T010 [US1] Build `TopToolbarComponent` with "+ Thêm hộp chữ" button in `src/app/components/studio/top-toolbar.component.ts`
- [ ] T011 [US1] Implement addTextBox method in `CanvasService` using `fabric.Textbox` and handle object selection events
- [ ] T012 [US1] Connect selection events from `CanvasService` to `EditorStateService` to update active object state
- [ ] T013 [US1] Assemble `StudioComponent` tying Toolbar, Sidebar, and Canvas wrapper together in `src/app/components/studio/studio.component.ts`

**Checkpoint**: At this point, User Story 1 MVP is fully functional (users can load an image and add/move default text boxes).

---

## Phase 4: User Story 2 - Định dạng chữ & Tuyển tập phông chữ tiếng Việt (Priority: P2)

**Goal**: Apply formatting (size, color, alignment, styling) and use Vietnamese fonts.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement `FontService` providing curated Vietnamese Google Fonts array and `@font-face` dynamic loading in `src/app/services/font.service.ts`
- [ ] T015 [P] [US2] Extend `TopToolbarComponent` with UI controls: Font Select, Size Stepper, Color Picker, Alignment buttons, Bold, Italic.
- [ ] T016 [US2] Implement formatting update methods in `CanvasService` (`updateActiveTextFormat`)
- [ ] T017 [US2] Bind TopToolbar controls to `EditorStateService` and `CanvasService` to apply styles instantly
- [ ] T018 [US2] Implement Stroke and Shadow toggle (layer effects) in `TopToolbarComponent` and `CanvasService`

**Checkpoint**: Text boxes can now be styled with rich formatting and beautiful Vietnamese fonts.

---

## Phase 5: User Story 3 - Kéo viền thay đổi kích thước & Căn chỉnh thông minh (Priority: P3)

**Goal**: PowerPoint-like resizing (word wrap) and keyboard nudging.

### Implementation for User Story 3

- [ ] T019 [US3] Configure Fabric `Textbox` controls in `CanvasService` to restrict scaling to width only (preventing stretched distortion) and enable word wrapping
- [ ] T020 [US3] Add `@HostListener('window:keydown')` in `StudioComponent` for Arrow keys (nudge 2px / 10px) and Delete/Backspace (remove active box)
- [ ] T021 [US3] Ensure keyboard shortcuts bypass typing when `isEditing` is true on the active Fabric textbox

**Checkpoint**: Users get a natural, PowerPoint-like object manipulation experience.

---

## Phase 6: User Story 4 - Lưu & Mở lại dự án, Đổi ảnh nền (Priority: P4)

**Goal**: Project persistence and replacing backgrounds without losing text layout.

### Implementation for User Story 4

- [ ] T022 [P] [US4] Implement `getProjectState` and `loadProjectState` serialization logic converting Fabric canvas JSON to `Project` model in `EditorStateService`
- [ ] T023 [US4] Implement "Lưu dự án" (download `.json`) and "Mở dự án" (upload `.json`) in `SidebarDrawerComponent` and `FileService`
- [ ] T024 [US4] Modify background upload logic to allow replacing the background while keeping the canvas aspect ratio and text positions intact

**Checkpoint**: Multi-session capability and text layout reusability achieved.

---

## Phase 7: User Story 5 - Xuất ảnh (Priority: P5)

**Goal**: High-quality PNG export.

### Implementation for User Story 5

- [ ] T025 [P] [US5] Implement `exportToPng` method in `CanvasService` handling multiplier scaling for high-res output matching original background dimensions
- [ ] T026 [US5] Add "Xuất ảnh" button to `TopToolbarComponent` or `SidebarDrawerComponent` linking to `FileService` download trigger

**Checkpoint**: The final artwork can be saved as a high-quality PNG.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Goal**: UI refinement and unit testing.

- [ ] T027 Add a clean, Canva-style dark mode SCSS styling in `src/styles.scss`
- [ ] T028 Fix any strict TypeScript nullability issues (`strict: true`)
- [ ] T029 Run Karma tests and verify clean build (`npm run build`)

---

## Execution Dependencies

- US1 (T007-T013) depends on Setup & Foundational phases
- US2 (T014-T018) depends on US1
- US3 (T019-T021) depends on US2
- US4 (T022-T024) depends on US3
- US5 (T025-T026) depends on US4

## Parallel execution examples
- T007 (Sidebar UI) and T008 (FileService) can be built simultaneously
- T014 (FontService) can be implemented independently before attaching to UI
- T022 (Project state serialization logic) can be built while UI is being refined
