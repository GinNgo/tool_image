import {
  Component,
  inject,
  signal,
  viewChild,
  ElementRef,
  afterNextRender,
  effect,
  OnDestroy,
} from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { TopToolbarComponent } from './top-toolbar.component';
import { SidebarDrawerComponent } from './sidebar-drawer.component';
import { Template } from '../../models/template.model';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [TopToolbarComponent, SidebarDrawerComponent],
  template: `
    <div class="studio-root">
      <!-- 1. STUDIO HEADER -->
      <header class="studio-header">
        <div class="brand-zone">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <div class="brand-meta">
            <h1 class="brand-title">Banner Studio Pro</h1>
            <span class="brand-subtitle">Trình tạo pano khẩu hiệu chuyên nghiệp</span>
          </div>
        </div>

        <!-- Center: Project Name & Auto-save Status -->
        <div class="header-center">
          <span class="project-name">{{ editorState.selectedTemplate()?.name || 'Bản thiết kế mới' }}</span>
          <span class="save-status-indicator">
            <span class="status-dot"></span> Tự động lưu
          </span>
        </div>

        <!-- Right: Primary Actions (Export PNG) -->
        <div class="header-actions">
          <button
            class="btn btn-studio btn-sm"
            (click)="onSaveDraftClick()"
            title="Lưu bản thiết kế ra máy tính"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Lưu bản thảo
          </button>

          <button
            class="btn btn-accent btn-sm export-btn"
            [disabled]="isExporting() || !editorState.canProceedToExport()"
            (click)="onExportPng()"
            type="button"
          >
            @if (isExporting()) {
              <svg class="spin-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
              Đang xuất...
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Xuất ảnh PNG chất lượng cao
            }
          </button>
        </div>
      </header>

      <!-- 2. STUDIO WORKSPACE (DRAWER + TOP TOOLBAR + CANVAS) -->
      <div class="studio-body">
        <!-- Left Asset & Layer Drawer -->
        <app-sidebar-drawer (templateChanged)="onTemplateChanged($event)" />

        <!-- Main Studio Area -->
        <main class="studio-main">
          <!-- Top Properties Toolbar -->
          <app-top-toolbar />

          <!-- Center Stage (Dark Canvas Stage) -->
          <div
            class="canvas-stage"
            [class.dragging]="isDragging()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <div class="canvas-viewport" #canvasViewport>
              <div class="canvas-artboard" #canvasArtboard>
                <canvas #fabricCanvas></canvas>
              </div>
            </div>

            <!-- Empty Background Prompt Overlay -->
            @if (!editorState.hasImage()) {
              <div class="canvas-empty-state" (click)="fileInput.click()">
                <div class="empty-icon-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <h3 class="empty-title">Tải ảnh nền để bắt đầu</h3>
                <p class="empty-desc">Nhấp chuột vào đây hoặc kéo thả ảnh nền vào khung vẽ</p>
                <span class="empty-badge">Hỗ trợ JPG, PNG, WebP (Tối đa 10MB)</span>
              </div>
            }

            <input
              #fileInput
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp"
              (change)="onFileInputChanged($event)"
              style="display: none"
            />

            <!-- Bottom Canvas Info Bar -->
            <div class="canvas-bottom-bar">
              <span class="dimension-tag">
                {{ canvasService.canvasDimensions().width }} × {{ canvasService.canvasDimensions().height }} px
              </span>
              <span class="hint-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Kéo chuột di chuyển chữ • Thước tự động gióng thẳng hàng
              </span>
            </div>
          </div>
        </main>
      </div>

      <!-- Toast Feedback Message -->
      @if (toastMessage()) {
        <div class="studio-toast" [class.success]="toastSuccess()">
          {{ toastMessage() }}
        </div>
      }
    </div>
  `,
  styles: `
    .studio-root {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #020617;
      color: #f8fafc;
      font-family: inherit;
    }

    /* === Studio Header === */
    .studio-header {
      height: 52px;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      flex-shrink: 0;
      user-select: none;
    }

    .brand-zone {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 0.96rem;
      font-weight: 700;
      letter-spacing: -0.2px;
      color: #f8fafc;
      margin: 0;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .header-center {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #1e293b;
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid #334155;
    }

    .project-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .save-status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .export-btn {
      font-weight: 600;
      gap: 6px;
    }

    /* === Studio Body === */
    .studio-body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .studio-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      background: #090d16;
    }

    /* Canvas Stage */
    .canvas-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
      padding: 24px;
      overflow: hidden;
      transition: background 150ms ease;

      &.dragging {
        background: rgba(37, 99, 235, 0.15);
      }
    }

    .canvas-viewport {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .canvas-artboard {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      background: #ffffff;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .canvas-artboard canvas {
      display: block;
    }

    /* Empty State */
    .canvas-empty-state {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px dashed #3b82f6;
      border-radius: 12px;
      padding: 24px 32px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      backdrop-filter: blur(8px);
      z-index: 10;
      text-align: center;
      transition: all 150ms ease;

      &:hover {
        border-color: #60a5fa;
        transform: translateY(-2px);
      }
    }

    .empty-icon-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.15);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .empty-desc {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0;
    }

    .empty-badge {
      font-size: 0.72rem;
      color: #60a5fa;
      background: rgba(37, 99, 235, 0.12);
      padding: 3px 8px;
      border-radius: 12px;
      margin-top: 4px;
    }

    .canvas-bottom-bar {
      position: absolute;
      bottom: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #1e293b;
      backdrop-filter: blur(6px);
      padding: 4px 14px;
      border-radius: 16px;
      font-size: 0.74rem;
      color: #94a3b8;
      user-select: none;
    }

    .dimension-tag {
      font-weight: 600;
      color: #cbd5e1;
    }

    .hint-tag {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Toast */
    .studio-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #334155;
      padding: 10px 18px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      font-size: 0.85rem;
      z-index: 1000;
      animation: fadeIn 200ms ease;

      &.success {
        border-color: #10b981;
        color: #6ee7b7;
      }
    }

    .spin-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class StudioComponent implements OnDestroy {
  private readonly templateService = inject(TemplateService);
  protected readonly editorState = inject(EditorStateService);
  protected readonly canvasService = inject(CanvasService);
  private readonly fileService = inject(FileService);
  private readonly imageService = inject(ImageService);

  readonly fabricCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('fabricCanvas');
  readonly canvasViewport = viewChild.required<ElementRef<HTMLDivElement>>('canvasViewport');

  private resizeObserver: ResizeObserver | null = null;

  readonly isExporting = signal(false);
  readonly isDragging = signal(false);
  readonly toastMessage = signal('');
  readonly toastSuccess = signal(true);

  constructor() {
    afterNextRender(() => {
      this.initStudio();
    });

    // 2-way sync: Canvas object selection updates editorState
    effect(() => {
      const selectedId = this.canvasService.onBlockSelected();
      if (selectedId) {
        this.editorState.setActiveBlockId(selectedId);
      }
    });

    // 2-way sync: Canvas object drag/move/resize updates editorState coordinates
    effect(() => {
      const modified = this.canvasService.onBlockModified();
      if (modified) {
        this.editorState.updateBlockFormat(modified.id, {
          x: modified.x,
          y: modified.y,
          ...(modified.width ? { width: modified.width } : {}),
          ...(modified.fontSize ? { fontSize: modified.fontSize } : {}),
        });
      }
    });

    // 2-way sync: PowerPoint-style inline typing on canvas updates editorState content
    effect(() => {
      const textChange = this.canvasService.onTextInlineChanged();
      if (textChange) {
        this.editorState.updateBlockContent(textChange.id, textChange.text);
      }
    });
  }

  private async initStudio(): Promise<void> {
    // If no template is selected yet, choose the first curated one
    let template = this.editorState.selectedTemplate() || this.templateService.selectedTemplate();
    if (!template) {
      const all = this.templateService.templates();
      template = all[0];
      this.templateService.selectTemplate(template.templateId);
      this.editorState.setTemplate(template);
    }

    const canvasEl = this.fabricCanvas().nativeElement;
    const blocks = this.editorState.textBlocks();
    this.canvasService.initCanvas(canvasEl, template, blocks);

    // Attach ResizeObserver to auto-fit canvas viewport dynamically
    this.setupResizeObserver();

    // Restore background if present
    const savedImg = this.editorState.userImageDataUrl();
    if (savedImg) {
      await this.canvasService.setBackgroundImage(savedImg);
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    const viewportEl = this.canvasViewport().nativeElement;
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.canvasService.fitToViewport(width, height);
        }
      }
    });

    this.resizeObserver.observe(viewportEl);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  async onTemplateChanged(template: Template): Promise<void> {
    const canvasEl = this.fabricCanvas().nativeElement;
    const blocks = this.editorState.textBlocks();
    this.canvasService.initCanvas(canvasEl, template, blocks);

    this.setupResizeObserver();

    const savedImg = this.editorState.userImageDataUrl();
    if (savedImg) {
      await this.canvasService.setBackgroundImage(savedImg);
    }
  }

  async onSaveDraftClick(): Promise<void> {
    const project = this.editorState.getProjectData();
    if (!project) return;

    const saved = await this.fileService.saveProject(project);
    if (saved) {
      this.showToast('Đã lưu bản thiết kế vào máy tính!', true);
    }
  }

  async onExportPng(): Promise<void> {
    const dataUrl = this.canvasService.exportToPng();
    if (!dataUrl) {
      this.showToast('Không thể kết xuất hình ảnh.', false);
      return;
    }

    this.isExporting.set(true);
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
      const filename = `banner-tuyen-truyen-${timestamp}.png`;

      const saved = await this.fileService.saveImage(dataUrl, filename);
      if (saved) {
        this.showToast('Đã lưu ảnh PNG chất lượng cao thành công!', true);
      } else {
        this.showToast('Đã hủy lưu ảnh.', false);
      }
    } catch {
      this.showToast('Lỗi khi xuất ảnh.', false);
    } finally {
      this.isExporting.set(false);
    }
  }

  // === Drag and drop & File Upload ===
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await this.handleImageFile(file);
    }
  }

  async onFileInputChanged(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    await this.handleImageFile(file);
    input.value = '';
  }

  private async handleImageFile(file: File): Promise<void> {
    try {
      const dataUrl = await this.imageService.loadImageFile(file);
      this.editorState.setImage(dataUrl, file.name);
      await this.canvasService.setBackgroundImage(dataUrl);
      this.showToast('Đã cập nhật ảnh nền thành công!', true);
    } catch (err) {
      this.showToast(err instanceof Error ? err.message : 'Lỗi khi đọc file ảnh.', false);
    }
  }

  private showToast(message: string, success: boolean): void {
    this.toastMessage.set(message);
    this.toastSuccess.set(success);
    setTimeout(() => this.toastMessage.set(''), 3500);
  }
}
