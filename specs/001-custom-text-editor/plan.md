# Implementation Plan: 001-custom-text-editor

**Branch**: `001-custom-text-editor` | **Date**: 2026-09-05 | **Spec**: [specs/001-custom-text-editor/spec.md](specs/001-custom-text-editor/spec.md)

**Input**: Feature specification from `specs/001-custom-text-editor/spec.md`

## Summary

Nâng cấp bộ công cụ tạo ảnh và chèn chữ dành cho người dùng không chuyên với:
1. **Hệ thống nhiều khối chữ (Multi-Layer Text Blocks)**: Thêm/sửa/xóa Tiêu đề chính, Tiêu đề phụ, Khẩu hiệu linh hoạt.
2. **Bộ Font chữ tiếng Việt tuyển chọn (Curated Font Suite)**: Bổ sung các kiểu chữ Việt hóa đẹp, đặt tên theo cảm xúc ("Trang trọng", "Mạnh mẽ", "Hiện đại", "Cổ điển", "Năng động"), hoạt động offline 100%.
3. **Thanh điều khiển trực quan**: Kéo thả trên ảnh, slider chỉnh cỡ chữ, nút căn giữa 1 chạm, snap guide và khôi phục vị trí mặc định.
4. **Lưu & Mở lại dự án cũ (Project Save / Load & Auto-recover)**: Xuất/nhập file cấu hình `.json` và tự động ghi nhớ bản thảo dở dang.

---

## Technical Context

**Language/Version**: TypeScript ~6.0.2, Node.js 20+, HTML5 / SCSS

**Primary Dependencies**:
- Angular 22 (Standalone Components, Signals, Reactive state)
- Fabric.js ^7.4.0 (Canvas rendering, object manipulation, snap-to-grid)
- Electron ^44.1.1 (Desktop windowing, native file system IPC)
- Electron-Builder ^26.15.3 (Windows portable packaging)

**Storage**: Local file system (via Electron `fs.promises` / Save Dialog) & Browser `localStorage` (auto-save session)

**Testing**: Vitest 4.1 + Angular Testing Library (`npx ng test --watch=false`)

**Target Platform**: Windows Desktop (Offline native app, portable .exe) & Web Browser fallback

**Project Type**: Desktop application (Electron + Angular)

**Performance Goals**:
- Phản hồi kéo thả đối tượng mượt mà 60 fps
- Thời gian tính toán auto-contrast màu chữ < 30ms
- Xuất file PNG chất lượng cao (2x resolution) trong dưới 1.5s

**Constraints**:
- Chạy 100% offline (tuyệt đối không phụ thuộc vào CDN mạng ngoài)
- Giao diện thân thiện tối đa với người dùng phổ thông (zero technical jargon)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Offline first**: Mọi font chữ, icon và thư viện đều được đóng gói local trong thư mục assets.
- [x] **Simplicity & Anti-error**: Người dùng luôn có nút khôi phục vị trí mặc định ("↩ Về vị trí mẫu"), không thể làm hỏng layout.
- [x] **Zero complex terms**: Toàn bộ nhãn trên giao diện đều dùng tiếng Việt thông dụng (không dùng từ "Layer", "Opacity", "Kerning", "Bounding Box").
- [x] **Data compatibility**: Cấu trúc file cấu hình dự án mở rộng từ template hiện tại, tương thích ngược với các template cũ.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-custom-text-editor/
├── plan.md              # Kế hoạch triển khai tổng thể
├── spec.md              # Đặc tả yêu cầu người dùng và tính năng
├── research.md          # Kết quả nghiên cứu kỹ thuật Fabric.js & Font tiếng Việt
├── data-model.md        # Cấu trúc thực thể TextBlock & ProjectData
├── quickstart.md        # Kịch bản kiểm thử hành trình người dùng
└── contracts/
    └── api-contracts.md # Định nghĩa API IPC Electron & CanvasService
```

### Source Code Architecture

```text
src/
├── app/
│   ├── models/
│   │   └── template.model.ts        # Mở rộng TextBlock, FontPreset, ProjectData
│   ├── services/
│   │   ├── canvas.service.ts        # Quản lý Fabric Canvas, đa Textbox, snap guide, contrast
│   │   ├── editor-state.service.ts  # Quản lý danh sách TextBlock, activeBlock, signals
│   │   ├── file.service.ts          # IPC lưu/mở file dự án .json và xuất ảnh
│   │   ├── font.service.ts          # Danh mục font tiếng Việt tuyển chọn (offline)
│   │   ├── image.service.ts         # Xử lý ảnh nền, resize & nén ảnh
│   │   └── template.service.ts      # Danh sách mẫu thiết kế có sẵn
│   └── components/
│       ├── step-template/           # Bước 1: Chọn mẫu & Mở lại dự án cũ
│       ├── step-editor/             # Bước 2: Kéo thả, sửa chữ, chỉnh cỡ, căn giữa
│       ├── step-export/             # Bước 3: Xem trước và xuất ảnh
│       └── wizard/                  # Điều hướng các bước
├── assets/
│   ├── fonts/                       # Thư viện font TTF/WOFF2 tiếng Việt
│   └── templates/                   # Các mẫu thiết kế chuẩn
└── styles.scss                      # Khai báo @font-face và design tokens
electron/
├── main.js                          # IPC handlers: showOpenProjectDialog, showSaveProjectDialog
└── preload.js                       # Expose API an toàn vào contextBridge
```

---

## Implementation Breakdown & Phasing

### Giai đoạn 1: Chuẩn bị Thư viện Font chữ & Mở rộng Mô hình Dữ liệu
- [ ] Bổ sung các font chữ tiếng Việt chuẩn đẹp vào `src/assets/fonts/` và khai báo `@font-face` trong `src/styles.scss`.
- [ ] Cập nhật `src/app/models/template.model.ts` để hỗ trợ kiểu `TextBlock` và `ProjectData`.
- [ ] Xây dựng danh mục font cảm xúc ("Trang trọng", "Mạnh mẽ", "Hiện đại", "Cổ điển", "Năng động").

### Giai đoạn 2: Nâng cấp Canvas Service & Quản lý Nhiều Khối Chữ
- [ ] Cập nhật `CanvasService`:
  - Quản lý đồng thời nhiều `fabric.Textbox` với ID riêng biệt.
  - Xử lý sự kiện click chọn chữ trên canvas đồng bộ với bảng điều khiển.
  - Khóa biên an toàn không cho chữ trôi ra ngoài mép ảnh.
  - Snap-guide tự động khi di chuyển bất kỳ khối chữ nào gần trục giữa.
  - Hàm "Căn giữa ảnh" (Center Horizontally) cho khối chữ đang chọn.
  - Auto-contrast độc lập cho từng khối chữ.

### Giai đoạn 3: Nâng cấp Giao diện Bước 2 (Step Editor)
- [ ] Thêm nút **"+ Thêm tiêu đề phụ"** và nút **"Xóa"** khối chữ phụ.
- [ ] Thêm slider chỉnh **"Cỡ chữ"** trực quan và nút **"Căn giữa ảnh"**.
- [ ] Bộ chọn font chữ dạng thẻ trực quan phân loại cảm xúc tiếng Việt.
- [ ] Nút **"Khôi phục vị trí mẫu"** cho từng khối chữ hoặc toàn bộ.

### Giai đoạn 4: Tính năng Lưu & Mở lại Dự án Cũ (Save / Load Project)
- [ ] Cập nhật `electron/main.js` và `electron/preload.js`: thêm handler đọc/ghi file dự án `.json`.
- [ ] Thêm nút **"💾 Lưu dự án làm việc"** trong Bước 2 và Bước 3.
- [ ] Thêm nút **"📂 Mở dự án cũ"** tại Bước 1 để người dùng nạp lại file cấu hình cũ bất cứ lúc nào.
- [ ] Tích hợp cơ chế tự động lưu tạm vào `localStorage` (Auto-recover) phòng khi tắt app đột ngột.

### Giai đoạn 5: Kiểm thử, Tối ưu & Đóng gói
- [ ] Cập nhật toàn bộ Unit Tests trong `src/app/**/*.spec.ts` tương ứng với các tính năng mới.
- [ ] Chạy kiểm thử tự động `npx ng test --watch=false`.
- [ ] Build production `npm run build` và kiểm tra bundle size.
- [ ] Đóng gói file chạy Windows `.exe` qua `npm run electron:build`.
