# Kế hoạch triển khai: App chỉnh sửa ảnh + thêm Text (Desktop, offline, 1 người dùng không rành công nghệ)

## 1. Mục tiêu

Xây dựng **desktop app chạy trên Windows** (đóng gói bằng Electron, chạy offline, không cần server) để **1 người dùng không rành công nghệ** có thể:

- Chọn 1 template có sẵn (bố cục ảnh + vị trí text đã set)
- Upload ảnh nền
- Nhập nội dung chữ (tiêu đề tuyên truyền)
- App **tự động** canh giữa, tự co giãn chữ vừa khung, tự chọn màu chữ/viền tương phản với ảnh nền
- Vẫn cho phép **kéo thả tinh chỉnh vị trí text** nếu muốn, có snap-guide canh giữa và nút "khôi phục vị trí mặc định"
- Xuất ảnh ra file (PNG) lưu vào máy

## 2. Nguyên tắc thiết kế (bắt buộc tuân theo)

- **Tối giản tuyệt đối**: không menu/panel rườm rà, không thuật ngữ kỹ thuật (font, layer, opacity...) hiển thị ra UI — thay bằng ngôn ngữ thường ("Kiểu chữ", "Màu sắc"...)
- **Wizard 3 bước**: Chọn mẫu → Nhập nội dung & ảnh → Xuất file. Không cho user thấy nhiều lựa chọn cùng lúc.
- **Khó làm hỏng**: mọi tuỳ chỉnh đều có nút reset về mặc định
- **Tự động là chính, thủ công là phụ**: mặc định app tự làm đẹp, kéo thả chỉ là tuỳ chọn thêm

## 3. Stack & Thư viện (đầy đủ cho agent cài đặt)

| Mục đích | Thư viện / công cụ | Ghi chú |
|---|---|---|
| Đóng gói desktop app, chạy offline | `electron` | Bắt buộc — không dùng web server |
| Build ra file .exe | `electron-builder` | Build installer hoặc portable .exe cho Windows |
| Framework UI | Angular (đã có sẵn, dùng Angular CLI) | Theo stack hiện tại của AN |
| Canvas engine (kéo thả, resize, render text/ảnh) | `fabric` (Fabric.js) | Core xử lý canvas |
| Font | Bundle font .ttf/.otf **local** trong app (không gọi Google Fonts online vì cần offline), khai báo qua `@font-face` | Chọn sẵn 2-3 font phù hợp phong cách trang trọng/tuyên truyền |
| Auto-contrast màu chữ | Tự viết hàm tính độ sáng (luminance) từ vùng ảnh nền → chọn màu chữ + viền tương phản | Không cần lib ngoài |
| Auto-fit chữ vừa khung | Custom logic: đo bounding box text, giảm dần fontSize cho tới khi vừa khung | Dựa trên Fabric.js Textbox |
| Snap-to-center guide khi kéo | Custom logic: so sánh toạ độ object với tâm canvas, vẽ đường kẻ tạm khi gần trùng | Có thể viết tay, không bắt buộc dùng lib ngoài |
| Đọc/ghi file ảnh, lưu template | Node.js `fs` module (có sẵn trong Electron) | Không cần database |

**Lệnh cài đặt gốc cho agent:**
```bash
npm install electron electron-builder fabric --save
npm install electron-builder --save-dev
```
(Angular project khởi tạo bằng `ng new`, sau đó tích hợp Electron theo hướng dẫn `electron-builder` cho Angular.)

## 4. Flow tổng quan (Wizard 3 bước)

```
Bước 1: Chọn Template
   └─ Hiển thị danh sách mẫu (thumbnail), click để chọn
        │
        ▼
Bước 2: Nhập nội dung
   ├─ Upload ảnh nền (tự động crop/fit vào khung template)
   ├─ Nhập text (tiêu đề)
   ├─ [Tự động] canh giữa, auto-fit size, auto-contrast màu
   └─ [Tuỳ chọn] Kéo thả text để tinh chỉnh vị trí
        ├─ Snap-guide hiện ra khi kéo gần tâm/canh chuẩn
        └─ Nút "Khôi phục vị trí mặc định"
        │
        ▼
Bước 3: Xuất file
   └─ Nút "Tải ảnh xuống" → export canvas ra PNG, lưu vào máy
```

## 5. Cấu trúc dữ liệu Template (JSON)

```json
{
  "templateId": "tpl_01",
  "name": "Mẫu đỏ - vàng trang trọng",
  "canvas": { "width": 1080, "height": 1350 },
  "background": { "type": "user-image", "fitMode": "cover" },
  "textDefault": {
    "content": "TIÊU ĐỀ TUYÊN TRUYỀN",
    "x": 540, "y": 1100,
    "align": "center",
    "fontFamily": "Montserrat-Bold",
    "maxFontSize": 64,
    "minFontSize": 24,
    "color": "auto",
    "strokeColor": "auto",
    "strokeWidth": 2
  }
}
```
`color: "auto"` và `strokeColor: "auto"` nghĩa là hệ thống tự tính theo độ sáng ảnh nền lúc render.

## 6. Giai đoạn triển khai

### Phase 1 — Ưu tiên làm ngay (theo yêu cầu hiện tại)
- [ ] Setup Electron + Angular, build chạy được app rỗng trên Windows
- [ ] Tạo 1-2 template mẫu (hard-code JSON như mục 5)
- [ ] Màn hình Bước 1: hiển thị danh sách template, chọn 1 mẫu
- [ ] Màn hình Bước 2:
  - [ ] Upload ảnh, tự fit vào khung canvas (Fabric.js `fitMode: cover`)
  - [ ] Input nhập text, render lên canvas tại vị trí mặc định của template
  - [ ] Auto-fit fontSize (chữ dài tự thu nhỏ trong khoảng min-max)
  - [ ] Auto-contrast: tính độ sáng trung bình vùng ảnh dưới text → chọn màu chữ đen/trắng + viền tương phản
  - [ ] Cho kéo thả text box (Fabric.js built-in), giới hạn trong biên canvas
  - [ ] Snap-guide: hiện đường kẻ dọc/ngang khi tâm text gần trùng tâm canvas (sai số ~5-10px)
  - [ ] Nút "Khôi phục vị trí mặc định" → set lại x, y, fontSize theo template gốc
- [ ] Màn hình Bước 3: nút xuất ảnh, dùng `canvas.toDataURL()` (multiplier ≥2 để nét), lưu file qua Electron dialog (`dialog.showSaveDialog`)

**Acceptance criteria Phase 1:** Người dùng không rành công nghệ có thể tự làm hết 3 bước mà không cần hướng dẫn, ra được file ảnh có chữ rõ, canh giữa đẹp, không bị vỡ layout.

### Phase 2 — Mở rộng (sau khi Phase 1 chạy ổn)
- [ ] Thêm nhiều template (2-3 bộ phối màu/phong cách khác: đỏ-vàng, xanh dương đậm...)
- [ ] Cho chọn nhanh 1 trong vài "kiểu chữ" định sẵn (ẩn khái niệm font/style, hiện tên gợi cảm xúc: "Trang trọng", "Nổi bật", "Mềm mại")
- [ ] Lưu lại project gần nhất (JSON) để mở lại chỉnh sửa tiếp

## 7. Lưu ý kỹ thuật quan trọng cho agent

- App phải chạy **hoàn toàn offline** — không gọi API/CDN nào ra ngoài (font, icon đều bundle local)
- Test build trên **Windows** trước, đảm bảo file .exe chạy được bằng double-click, không cần cài Node.js trên máy user
- Nếu ảnh upload quá lớn (>10MB hoặc độ phân giải quá cao), tự động resize xuống trước khi đưa lên canvas để tránh lag
- Giới hạn kéo thả trong biên canvas (không cho kéo text ra ngoài khung ảnh)
- Giao diện dùng chữ tiếng Việt rõ ràng, tránh thuật ngữ kỹ thuật tiếng Anh

## 8. Checklist bàn giao cho agent

1. Làm đúng theo thứ tự Phase 1 → test trên Windows sau mỗi task nhỏ
2. Không thêm tính năng ngoài phạm vi Phase 1 khi chưa xong (tránh over-engineer)
3. Mỗi task hoàn thành = 1 commit riêng, mô tả rõ ràng
4. Sau khi xong Phase 1, demo lại toàn bộ flow 3 bước trước khi làm Phase 2
