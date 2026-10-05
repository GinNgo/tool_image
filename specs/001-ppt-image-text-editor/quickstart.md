# Quickstart & Validation Guide: PPT-Style Image & Text Editor

## Prerequisites

- Node.js 20+
- Angular CLI (`npm install -g @angular/cli`)
- Fabric.js (`npm install fabric`)

## Running the Application

```bash
npm start
```

Open browser to `http://localhost:4200`

## Validation Scenarios

### Scenario 1: Basic Editing and Export

1. Click "Tải ảnh nền" (Upload Background Image) and select a local JPG/PNG.
2. Verify the image appears centered on the canvas.
3. Click "+ Thêm hộp chữ" (Add Text Box).
4. Double click the text box and type "Chào mừng mùa hè" (with Vietnamese accents).
5. Verify the text displays correctly without missing accents.
6. Drag the text box to the top-right corner.
7. Click "Xuất ảnh PNG" (Export PNG).
8. **Expected**: A downloaded PNG file matching the original resolution of the uploaded background, containing the typed text in the top-right corner.

### Scenario 2: PowerPoint-style Resizing

1. Add a text box and type a long paragraph of text.
2. Click the text box to select it.
3. Drag the middle-right handle (control point) inward.
4. **Expected**: The text wraps to a new line automatically as the box width decreases.

### Scenario 3: Save and Restore Project

1. Setup a background image, add two text boxes, change their colors to red and blue.
2. Click "Lưu dự án" (Save Project). A `.json` file downloads.
3. Reload the page (everything resets).
4. Click "Mở dự án" (Open Project) and select the `.json` file.
5. **Expected**: The background image, the two text boxes, their exact positions, and the red/blue colors are perfectly restored.
