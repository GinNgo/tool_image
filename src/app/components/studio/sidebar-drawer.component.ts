import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';
import { CanvasService } from '../../services/canvas.service';
import { EditorStateService } from '../../services/editor-state.service';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-sidebar-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Công Cụ</h2>
      </div>

      <div class="sidebar-content">
        <!-- 1. Cấu hình Nền -->
        <div class="tool-section">
          <h3>Ảnh Nền</h3>
          <label class="btn btn-primary file-upload-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Tải ảnh nền
            <input type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;" />
          </label>
        </div>

        <!-- 2. Cấu hình Chữ -->
        <div class="tool-section">
          <h3>Hộp Chữ</h3>
          <button class="btn btn-secondary w-full" (click)="onAddTextClick()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            Thêm hộp chữ tự do
          </button>
        </div>

        <!-- 3. Mẫu Khuôn Bố Cục -->
        <div class="tool-section">
          <h3>Khuôn Bố Cục Nhanh</h3>
          <p class="section-desc">Nhấp chọn để sắp xếp các dòng chữ tự động. Ảnh nền vẫn được giữ nguyên.</p>

          <div class="layout-grid">
            <div *ngFor="let layout of templateService.layoutMasters()" class="layout-card" (click)="applyLayout(layout)">
              <div class="layout-preview">
                 <div class="layout-mock" [ngClass]="layout.category"></div>
              </div>
              <span class="layout-name">{{ layout.name }}</span>
            </div>
          </div>
        </div>

        <!-- 4. Dự án & Lưu trữ -->
        <div class="tool-section mt-auto">
          <h3>Dự án</h3>
          <div class="btn-group">
            <label class="btn btn-secondary file-upload-label flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Mở .json
              <input type="file" (change)="onOpenProject($event)" accept=".json" style="display: none;" />
            </label>
            <button class="btn btn-secondary flex-1" (click)="onSaveProject()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu .json
            </button>
          </div>
        </div>

        <button class="btn btn-success export-btn" (click)="onExportClick()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Xuất ảnh PNG sắc nét
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100%;
      background: var(--color-panel-surface);
      color: var(--color-text-light);
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--color-dark-border);
    }
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--color-dark-border);
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sidebar-content {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .tool-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tool-section h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #94a3b8;
      margin: 0;
    }
    .section-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
    .w-full {
      width: 100%;
    }
    .flex-1 {
      flex: 1;
    }
    .mt-auto {
      margin-top: auto;
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .file-upload-label {
      margin: 0;
      width: 100%;
    }

    /* Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .layout-card {
      background: var(--color-bg);
      border: 1px solid var(--color-dark-border);
      border-radius: var(--radius-md);
      padding: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .layout-card:hover {
      border-color: var(--color-primary);
      background: #1e293b;
    }
    .layout-name {
      font-size: 0.75rem;
      text-align: center;
      color: #cbd5e1;
      line-height: 1.2;
    }

    /* Mocks for layout types */
    .layout-preview {
      width: 100%;
      aspect-ratio: 4/5;
      background: #334155;
      border-radius: 4px;
      position: relative;
    }
    .layout-mock {
      position: absolute;
      left: 10%;
      right: 10%;
    }
    .layout-mock.header {
      top: 15%;
      height: 15%;
      background: #38bdf8;
      border-radius: 2px;
    }
    .layout-mock.banner {
      bottom: 10%;
      height: 25%;
      background: #fbbf24;
      border-radius: 2px;
    }
    .layout-mock.quote {
      top: 40%;
      height: 20%;
      background: #a78bfa;
      border-radius: 2px;
    }

    .export-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      margin-top: 8px;
    }
  `]
})
export class SidebarDrawerComponent {
  constructor(
    private fileService: FileService,
    private canvasService: CanvasService,
    public editorState: EditorStateService,
    public templateService: TemplateService
  ) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const dataUrl = await this.fileService.readFileAsDataUrl(file);
      const dims = await this.fileService.getImageDimensions(dataUrl);
      this.canvasService.setBackgroundImage(dataUrl, dims.width, dims.height);
    }
  }

  onAddTextClick(): void {
    this.canvasService.addTextBox();
  }

  applyLayout(layout: any): void {
    // Clear existing objects
    this.canvasService.clearCanvasText();

    // Add layout blocks
    layout.blocks.forEach((block: any) => {
      this.canvasService.addConfiguredTextBox(block);
    });
  }

  onSaveProject(): void {
    const canvasData = this.canvasService.getCanvasObjectsJson();
    const project = {
      version: '2.0',
      title: this.editorState.projectTitle(),
      canvasSize: this.editorState.canvasSize(),
      backgroundImage: this.editorState.backgroundImage(),
      canvasData
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.fileService.downloadFile(url, 'du-an-thiet-ke.json');
  }

  async onOpenProject(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const text = await input.files[0].text();
      const project = JSON.parse(text);

      if (project.title) {
        this.editorState.updateProjectTitle(project.title);
      }

      if (project.canvasSize) {
        this.editorState.canvasSize.set(project.canvasSize);
      }

      if (project.backgroundImage) {
        this.canvasService.setBackgroundImage(
          project.backgroundImage,
          project.canvasSize.width,
          project.canvasSize.height
        );
      }

      if (project.canvasData) {
        await this.canvasService.loadCanvasObjectsJson(project.canvasData);
      }
    }
  }

  onExportClick(): void {
    const dataUrl = this.canvasService.exportToPng();
    if (dataUrl) {
      this.fileService.downloadFile(dataUrl, 'anh-xuat.png');
    }
  }
}
