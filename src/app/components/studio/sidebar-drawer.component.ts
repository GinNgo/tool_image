import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { FontService } from '../../services/font.service';
import { CanvasService } from '../../services/canvas.service';
import { Template } from '../../models/template.model';

type DrawerTab = 'templates' | 'text' | 'image' | 'projects';

@Component({
  selector: 'app-sidebar-drawer',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="studio-sidebar">
      <!-- Navigation Icon Rail (Canva-style) -->
      <nav class="sidebar-rail">
        <button
          class="rail-btn"
          [class.active]="activeTab() === 'templates'"
          (click)="selectTab('templates')"
          title="Mẫu thiết kế"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <span class="rail-label">Mẫu</span>
        </button>

        <button
          class="rail-btn"
          [class.active]="activeTab() === 'text'"
          (click)="selectTab('text')"
          title="Chữ & Tiêu đề"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          <span class="rail-label">Chữ</span>
        </button>

        <button
          class="rail-btn"
          [class.active]="activeTab() === 'image'"
          (click)="selectTab('image')"
          title="Ảnh nền"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span class="rail-label">Ảnh nền</span>
        </button>

        <button
          class="rail-btn"
          [class.active]="activeTab() === 'projects'"
          (click)="selectTab('projects')"
          title="Dự án & Bản thảo"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span class="rail-label">Dự án</span>
        </button>
      </nav>

      <!-- Expandable Drawer Panel -->
      <section class="drawer-panel">
        <!-- 1. TEMPLATES TAB -->
        @if (activeTab() === 'templates') {
          <div class="panel-inner">
            <h4 class="drawer-heading">Mẫu bố cục pano</h4>
            <div class="template-list">
              @for (tpl of templateService.templates(); track tpl.templateId) {
                <div
                  class="template-mini-card"
                  [class.selected]="editorState.selectedTemplate()?.templateId === tpl.templateId"
                  (click)="onSelectTemplate(tpl)"
                >
                  <img class="tpl-thumb" [src]="tpl.thumbnail" [alt]="tpl.name" loading="lazy" />
                  <div class="tpl-info">
                    <span class="tpl-name">{{ tpl.name }}</span>
                    <span class="tpl-dim">{{ tpl.canvas.width }} × {{ tpl.canvas.height }}px</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- 2. TEXT TAB -->
        @if (activeTab() === 'text') {
          <div class="panel-inner">
            <div class="drawer-header-row">
              <h4 class="drawer-heading">Lớp chữ</h4>
              <button
                class="btn btn-sm btn-studio add-text-btn"
                (click)="onAddSubtitle()"
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Thêm chữ
              </button>
            </div>

            <!-- List of Text Layers -->
            <div class="blocks-stack">
              @for (block of editorState.textBlocks(); track block.id) {
                <div
                  class="block-item"
                  [class.active]="editorState.activeBlockId() === block.id"
                  (click)="onSelectBlock(block.id)"
                >
                  <div class="block-item-header">
                    <span class="block-tag">{{ block.label }}</span>
                    @if (block.removable) {
                      <button
                        class="delete-icon-btn"
                        (click)="onRemoveBlock(block.id, $event)"
                        title="Xóa lớp chữ này"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    }
                  </div>

                  <textarea
                    class="block-textarea"
                    rows="2"
                    placeholder="Nhập nội dung..."
                    [ngModel]="block.content"
                    (ngModelChange)="onBlockContentChange(block.id, $event)"
                    (click)="$event.stopPropagation()"
                  ></textarea>
                </div>
              }
            </div>

            <!-- Vietnamese Typography Quick Select -->
            <div class="typography-presets">
              <span class="section-title">Phông chữ tiếng Việt</span>
              <div class="font-chips">
                @for (font of fontService.getPresets(); track font.id) {
                  <button
                    type="button"
                    class="font-chip"
                    [class.active]="editorState.activeBlock()?.fontFamily === font.fontFamily"
                    (click)="onFontSelect(font.fontFamily)"
                  >
                    <span class="chip-name">{{ font.name }}</span>
                    <span class="chip-cat">{{ font.description }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- 3. BACKGROUND IMAGE TAB -->
        @if (activeTab() === 'image') {
          <div class="panel-inner">
            <h4 class="drawer-heading">Ảnh nền tuyên truyền</h4>

            <div class="image-action-box">
              <button
                class="btn btn-primary btn-block"
                (click)="onSelectImageClick(drawerFileInput)"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {{ editorState.hasImage() ? 'Thay đổi ảnh nền' : 'Tải ảnh từ máy tính' }}
              </button>
              <input
                #drawerFileInput
                type="file"
                accept="image/jpeg,image/png,image/webp,image/bmp"
                (change)="onFileInputChanged($event)"
                style="display: none"
              />
            </div>

            @if (editorState.hasImage()) {
              <div class="current-image-preview">
                <span class="preview-title">Ảnh đang dùng:</span>
                <div class="image-card">
                  <img class="preview-thumbnail" [src]="editorState.userImageDataUrl()" alt="Ảnh nền" />
                  <span class="image-name">{{ editorState.userImageFileName() || 'anh-nen.png' }}</span>
                </div>
              </div>
            } @else {
              <div class="upload-tip">
                <p>Bạn cũng có thể kéo thả trực tiếp file ảnh vào khung vẽ ở giữa màn hình.</p>
              </div>
            }
          </div>
        }

        <!-- 4. PROJECTS & PERSISTENCE TAB -->
        @if (activeTab() === 'projects') {
          <div class="panel-inner">
            <h4 class="drawer-heading">Lưu & Khôi phục bản thảo</h4>

            <div class="project-actions">
              <button
                class="btn btn-studio btn-block"
                (click)="onSaveProjectClick()"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Lưu dự án hiện tại (.json)
              </button>

              <button
                class="btn btn-studio btn-block"
                (click)="onOpenProjectClick(projectFileInput)"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Mở file bản thảo (.json)
              </button>
              <input
                #projectFileInput
                type="file"
                accept=".json,application/json"
                (change)="onProjectFileSelected($event)"
                style="display: none"
              />

              @if (editorState.hasSavedProject()) {
                <button
                  class="btn btn-studio btn-block resume-btn"
                  (click)="onResumeLastSession()"
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Tiếp tục phiên trước
                </button>
              }
            </div>

            @if (projectStatusMsg()) {
              <div class="status-badge" [class.success]="projectStatusSuccess()">
                {{ projectStatusMsg() }}
              </div>
            }
          </div>
        }
      </section>
    </aside>
  `,
  styles: `
    .studio-sidebar {
      display: flex;
      width: 360px;
      height: 100%;
      background: #0f172a;
      border-right: 1px solid #1e293b;
      flex-shrink: 0;
      user-select: none;
    }

    /* Narrow Rail */
    .sidebar-rail {
      width: 68px;
      height: 100%;
      background: #020617;
      border-right: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      gap: 8px;
      flex-shrink: 0;
    }

    .rail-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      gap: 4px;
      transition: all 150ms ease;

      &:hover {
        color: #f8fafc;
        background: #1e293b;
      }

      &.active {
        color: #ffffff;
        background: #2563eb;
      }
    }

    .rail-label {
      font-size: 0.68rem;
      font-weight: 600;
    }

    /* Drawer Content */
    .drawer-panel {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      background: #0f172a;
      color: #f8fafc;
    }

    .panel-inner {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .drawer-heading {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.2px;
      margin: 0;
    }

    .drawer-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .add-text-btn {
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
    }

    /* Template Cards */
    .template-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .template-mini-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        border-color: #3b82f6;
        background: #273549;
      }

      &.selected {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.15);
      }
    }

    .tpl-thumb {
      width: 48px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      background: #020617;
    }

    .tpl-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tpl-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f8fafc;
    }

    .tpl-dim {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    /* Text Blocks Stack */
    .blocks-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .block-item {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        border-color: #475569;
      }

      &.active {
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
      }
    }

    .block-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .block-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: #93c5fd;
    }

    .delete-icon-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;

      &:hover {
        background: rgba(239, 68, 68, 0.15);
      }
    }

    .block-textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 6px 8px;
      font-family: inherit;
      font-size: 0.82rem;
      color: #f8fafc;
      resize: vertical;
      outline: none;

      &:focus {
        border-color: #3b82f6;
      }
    }

    /* Typography Chips */
    .typography-presets {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .font-chips {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .font-chip {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: left;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        border-color: #3b82f6;
      }

      &.active {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.2);
        .chip-name {
          color: #60a5fa;
        }
      }
    }

    .chip-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .chip-cat {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    /* Image & Project Controls */
    .btn-block {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 0.88rem;
    }

    .image-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 8px;
      margin-top: 8px;
    }

    .preview-thumbnail {
      width: 100%;
      max-height: 160px;
      object-fit: contain;
      border-radius: 4px;
      background: #020617;
    }

    .image-name {
      font-size: 0.78rem;
      color: #cbd5e1;
      word-break: break-all;
    }

    .upload-tip {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.4;
      padding: 12px;
      background: #1e293b;
      border-radius: 6px;
      border: 1px dashed #334155;
    }

    .project-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .status-badge {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      background: #7f1d1d;
      color: #fca5a5;
      text-align: center;

      &.success {
        background: #064e3b;
        color: #6ee7b7;
      }
    }
  `,
})
export class SidebarDrawerComponent {
  protected readonly templateService = inject(TemplateService);
  protected readonly editorState = inject(EditorStateService);
  protected readonly fontService = inject(FontService);
  private readonly fileService = inject(FileService);
  private readonly imageService = inject(ImageService);
  private readonly canvasService = inject(CanvasService);

  readonly activeTab = signal<DrawerTab>('text');
  readonly projectStatusMsg = signal('');
  readonly projectStatusSuccess = signal(false);

  readonly templateChanged = output<Template>();

  selectTab(tab: DrawerTab): void {
    this.activeTab.set(tab);
  }

  onSelectTemplate(tpl: Template): void {
    this.templateService.selectTemplate(tpl.templateId);
    this.editorState.setTemplate(tpl);
    this.templateChanged.emit(tpl);
  }

  onSelectBlock(id: string): void {
    this.editorState.setActiveBlockId(id);
    this.canvasService.selectTextBlock(id);
  }

  onAddSubtitle(): void {
    const newBlock = this.editorState.addCustomTextBlock('custom', 'Hộp chữ', 'Nhập tiêu đề hoặc khẩu hiệu...', 38);
    if (newBlock) {
      this.canvasService.renderTextBlock(newBlock);
      this.canvasService.selectTextBlock(newBlock.id);
    }
  }

  onRemoveBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.editorState.removeTextBlock(id);
    this.canvasService.removeTextBlock(id);
  }

  onBlockContentChange(id: string, content: string): void {
    this.editorState.updateBlockContent(id, content);
    const block = this.editorState.textBlocks().find((b) => b.id === id);
    if (block) {
      this.canvasService.updateTextBlock(block);
    }
  }

  onFontSelect(fontFamily: string): void {
    const active = this.editorState.activeBlock();
    if (!active) return;
    this.editorState.updateBlockFont(active.id, fontFamily);
    const updated = this.editorState.textBlocks().find((b) => b.id === active.id);
    if (updated) {
      this.canvasService.updateTextBlock(updated);
    }
  }

  async onSelectImageClick(fileInput: HTMLInputElement): Promise<void> {
    if (this.fileService.isElectron()) {
      const result = await this.fileService.openImageViaElectron();
      if (result) {
        await this.applyImageData(result.dataUrl, result.fileName);
        return;
      }
    }
    fileInput.click();
  }

  async onFileInputChanged(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await this.imageService.loadImageFile(file);
      await this.applyImageData(dataUrl, file.name);
    } catch {
      // Ignored
    } finally {
      input.value = '';
    }
  }

  private async applyImageData(dataUrl: string, fileName: string): Promise<void> {
    this.editorState.setImage(dataUrl, fileName);
    await this.canvasService.setBackgroundImage(dataUrl);
  }

  async onSaveProjectClick(): Promise<void> {
    const project = this.editorState.getProjectData();
    if (!project) return;
    const saved = await this.fileService.saveProject(project);
    if (saved) {
      this.projectStatusSuccess.set(true);
      this.projectStatusMsg.set('Đã lưu bản thiết kế thành công!');
      setTimeout(() => this.projectStatusMsg.set(''), 3000);
    }
  }

  onOpenProjectClick(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  async onProjectFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const project = await this.fileService.readProjectFromFile(file);
      const template = this.templateService.getTemplateById(project.templateId) || this.templateService.templates()[0];
      this.editorState.loadProjectData(project, template);
      this.templateChanged.emit(template);
      this.projectStatusSuccess.set(true);
      this.projectStatusMsg.set('Đã mở bản thảo thành công!');
      setTimeout(() => this.projectStatusMsg.set(''), 3000);
    } catch {
      this.projectStatusSuccess.set(false);
      this.projectStatusMsg.set('Lỗi khi đọc file bản thảo.');
    } finally {
      input.value = '';
    }
  }

  onResumeLastSession(): void {
    const last = this.editorState.getSavedProjectFromStorage();
    if (!last) return;
    const template = this.templateService.getTemplateById(last.templateId) || this.templateService.templates()[0];
    this.editorState.loadProjectData(last, template);
    this.templateChanged.emit(template);
    this.projectStatusSuccess.set(true);
    this.projectStatusMsg.set('Đã tiếp tục bản thảo gần nhất!');
    setTimeout(() => this.projectStatusMsg.set(''), 3000);
  }
}
