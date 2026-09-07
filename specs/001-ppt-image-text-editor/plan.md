# Implementation Plan: PPT-Style Image & Text Editor

**Branch**: `001-ppt-image-text-editor` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ppt-image-text-editor/spec.md`

## Summary

Build a client-side Angular 18 application integrating Fabric.js to allow users to load background images and overlay editable, draggable text boxes with rich formatting. The UI will mimic PowerPoint, allowing intuitive text resizing, snapping, custom font selection (specifically Vietnamese fonts), and exporting the composition to PNG.

## Technical Context

**Language/Version**: TypeScript 5.4, HTML5, SCSS

**Primary Dependencies**: Angular 18 (Standalone Components), Fabric.js (canvas manipulation)

**Storage**: LocalStorage (for saving project states) and File System API (for saving/loading .json project files locally)

**Testing**: Karma/Jasmine (Angular default testing framework)

**Target Platform**: Web Browsers (Chrome, Edge, Firefox, Safari) and Electron Desktop wrapper

**Project Type**: Web Application / Desktop App

**Performance Goals**: 60fps for dragging/resizing text boxes on canvas.

**Constraints**: Processing must be 100% client-side to ensure privacy and offline capability once loaded. No backend server is required.

**Scale/Scope**: Focus on single-image editing per project, supporting up to 20 text boxes smoothly without performance degradation.

## Constitution Check

*Not applicable (Constitution not strictly defined for this project)*

## Project Structure

### Documentation (this feature)

```text
specs/001-ppt-image-text-editor/
  ├── spec.md            # Requirements & user stories
  ├── plan.md            # Technical plan (this file)
  ├── data-model.md      # State structures and canvas object configurations
  ├── quickstart.md      # Testing and validation scenarios
  └── checklists/
       └── requirements.md # Quality validation checklist
```

### Source Code

```text
src/app/
  ├── components/
  │    ├── studio/
  │    │    ├── studio.component.ts         # Main Editor Layout Container
  │    │    ├── top-toolbar.component.ts    # Formatting tools (Font, Color, Size, Align)
  │    │    └── sidebar-drawer.component.ts # Saved Projects, Font Picker, Background Image Upload
  ├── services/
  │    ├── canvas.service.ts          # Fabric.js wrapper & canvas state management
  │    ├── font.service.ts            # Loading and providing Vietnamese Google Fonts
  │    ├── file.service.ts            # File input/output and PNG export
  │    ├── editor-state.service.ts    # Global state (selected objects, project config)
  │    └── template.service.ts        # Built-in Layout Templates (PowerPoint style)
  └── models/
       ├── project.model.ts           # Interfaces for Project and TextBlock objects
       └── font.model.ts              # Interfaces for Font metadata
```

## MVP Scope (Minimum Viable Product)

**Target**: User Story 1 & 2
- Core layout (Studio, Top Toolbar, Sidebar).
- Fabric.js canvas initialization.
- Ability to load a local image as canvas background.
- Ability to add, select, drag, and double-click to edit text boxes.
- Top toolbar controls for basic formatting: Font Family, Size, Color, Alignment, Bold, Italic.
- Export to PNG functionality.

## Testing Strategy

- **Unit Testing**: Services (e.g., `editor-state.service`, `font.service`) handling logic independent of DOM/Canvas.
- **Visual/Manual Testing**: Validating Fabric.js interactions (dragging, resizing bounding boxes, inline text editing).
- **Export Validation**: Verify output PNG dimensions match original image dimensions exactly.
