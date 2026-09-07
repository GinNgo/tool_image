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
        <h2>Công cụ thiết kế</h2>
      </div>

      <div class="sidebar-content">
        <!-- 1. Cấu hình Nền -->
        <div class="tool-section">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <h3>Hình ảnh nền</h3>
          </div>
          <p class="section-desc">Tải ảnh lên làm phông nền. Bạn có thể phóng to, thu nhỏ hoặc di chuyển tùy ý.</p>

          <label class="btn btn-accent file-upload-label w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {{ editorState.backgroundImage() ? 'Đổi ảnh khác' : 'Tải ảnh lên' }}
            <input type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;" />
          </label>

          <!-- Công cụ tùy chỉnh ảnh nền khi đã có ảnh -->
          <div class="bg-controls" *ngIf="editorState.backgroundImage()">
            <div class="pixel-info" *ngIf="editorState.backgroundImageDimensions() as dims">
              <span>Độ phân giải ảnh:</span>
              <strong>{{ dims.width }} × {{ dims.height }} px</strong>
            </div>

            <button
              class="btn w-full"
              [ngClass]="canvasService.isBgEditing ? 'btn-success' : 'btn-studio'"
              (click)="toggleBgEdit()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
              {{ canvasService.isBgEditing ? 'Xong (Khóa ảnh nền)' : 'Chỉnh vị trí / Phóng to ảnh' }}
            </button>

            <div class="btn-group mt-2">
              <button class="btn btn-studio flex-1 btn-sm" (click)="matchImageSize()" title="Điều chỉnh khung hình bằng đúng kích thước ảnh pixel gốc">
                Khớp ảnh gốc
              </button>
              <button class="btn btn-studio flex-1 btn-sm" (click)="canvasService.resetBackgroundFit('cover')" title="Phủ kín khung hình (Cover)">
                Phủ kín
              </button>
              <button class="btn btn-danger btn-sm" (click)="canvasService.removeBackgroundImage()" title="Gỡ bỏ ảnh nền">
                Xóa
              </button>
            </div>
            <p class="hint-text" *ngIf="canvasService.isBgEditing">
              💡 Bạn có thể kéo chuột trên ảnh để di chuyển vị trí hoặc kéo 4 góc để phóng to/thu nhỏ mà <b>không làm giảm chất lượng ảnh pixel gốc</b>.
            </p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 2. Cấu hình Chữ -->
        <div class="tool-section">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            <h3>Văn bản</h3>
          </div>
          <p class="section-desc">Thêm hộp chữ tự do để tự tay thiết kế bố cục.</p>
          <button class="btn btn-studio w-full" (click)="onAddTextClick()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm hộp chữ mới
          </button>
        </div>

        <div class="divider"></div>

        <!-- 3. Mẫu Khuôn Bố Cục -->
        <div class="tool-section">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <h3>Khuôn mẫu nghệ thuật</h3>
          </div>
          <p class="section-desc">Áp dụng ngay các mẫu chữ đẹp. Ảnh nền của bạn sẽ được giữ nguyên.</p>

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
          <div class="btn-group">
            <label class="btn btn-studio file-upload-label flex-1">
              Mở dự án
              <input type="file" (change)="onOpenProject($event)" accept=".json" style="display: none;" />
            </label>
            <button class="btn btn-studio flex-1" (click)="onSaveProject()">
              Lưu dự án
            </button>
          </div>
        </div>

      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 320px;
      height: 100%;
      background: var(--color-panel-surface); /* #1e293b */
      color: var(--color-text-light);
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--color-dark-border);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    }
    .sidebar-header {
      padding: 24px;
      padding-bottom: 16px;
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #f8fafc;
      letter-spacing: 0.2px;
    }
    .sidebar-content {
      padding: 0 24px 24px 24px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Scrollbar styling */
    .sidebar-content::-webkit-scrollbar {
      width: 6px;
    }
    .sidebar-content::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-content::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 10px;
    }
    .sidebar-content::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    .divider {
      height: 1px;
      background: var(--color-dark-border);
      margin: 0 -24px;
    }

    .tool-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #e2e8f0;
    }
    .section-header h3 {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
    }
    .section-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    .w-full {
      width: 100%;
    }
    .flex-1 {
      flex: 1;
    }
    .mt-auto {
      margin-top: auto;
      padding-top: 24px;
    }
    .btn-group {
      display: flex;
      gap: 12px;
    }
    .bg-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
      background: #0f172a;
      padding: 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-dark-border);
    }
    .pixel-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      background: #1e293b;
      padding: 6px 10px;
      border-radius: 4px;
      color: #cbd5e1;
      margin-bottom: 4px;
    }
    .pixel-info strong {
      color: #38bdf8;
    }
    .mt-2 {
      margin-top: 8px;
    }
    .hint-text {
      font-size: 0.75rem;
      color: #38bdf8;
      line-height: 1.4;
      margin: 4px 0 0 0;
    }

    /* Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .layout-card {
      background: #0f172a;
      border: 1px solid var(--color-dark-border);
      border-radius: var(--radius-md);
      padding: 10px;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .layout-card:hover {
      border-color: #7c3aed; /* Primary Violet */
      background: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .layout-name {
      font-size: 0.8rem;
      text-align: center;
      color: #cbd5e1;
      font-weight: 500;
      line-height: 1.3;
    }

    /* Mocks for layout types */
    .layout-preview {
      width: 100%;
      aspect-ratio: 4/5;
      background: #1e293b;
      border-radius: 6px;
      position: relative;
      overflow: hidden;
      border: 1px solid #334155;
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
  `]
})
export class SidebarDrawerComponent {
  constructor(
    private fileService: FileService,
    public canvasService: CanvasService,
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

  toggleBgEdit(): void {
    this.canvasService.toggleBackgroundEdit();
  }

  matchImageSize(): void {
    const dims = this.editorState.backgroundImageDimensions();
    if (dims) {
      this.canvasService.setCanvasDimensions(dims.width, dims.height);
      this.canvasService.resetBackgroundFit('contain');
    }
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
    this.fileService.downloadFile(url, `${this.editorState.projectTitle() || 'du-an-thiet-ke'}.json`);
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
        this.canvasService.setCanvasDimensions(project.canvasSize.width, project.canvasSize.height);
      }

      if (project.canvasData) {
        await this.canvasService.loadCanvasObjectsJson(project.canvasData);
      }

      if (project.backgroundImage) {
        this.editorState.setBackgroundImage(project.backgroundImage, project.canvasSize);
      }

      input.value = '';
    }
  }
}
