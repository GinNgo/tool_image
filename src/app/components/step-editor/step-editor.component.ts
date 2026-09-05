import {
  Component,
  output,
  inject,
  signal,
  viewChild,
  ElementRef,
  afterNextRender,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import { CanvasService } from '../../services/canvas.service';
import { ImageService } from '../../services/image.service';
import { FileService } from '../../services/file.service';
import { FontService } from '../../services/font.service';
import { EditorStateService } from '../../services/editor-state.service';
import { TextBlock } from '../../models/template.model';

@Component({
  selector: 'app-step-editor',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-editor">
      <div class="editor-layout">
        <!-- Canvas Area with Drag & Drop -->
        <div
          class="canvas-area"
          [class.drag-over]="isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="canvas-wrapper" #canvasWrapper>
            <canvas #fabricCanvas></canvas>
          </div>

          @if (!editorState.hasImage()) {
            <div class="empty-prompt" (click)="fileInput.click()">
              <span class="prompt-icon">📷</span>
              <span class="prompt-text">Bấm vào đây hoặc kéo thả ảnh nền vào khung</span>
              <span class="prompt-sub">Hỗ trợ JPG, PNG, WebP (Tối đa 10MB)</span>
            </div>
          }
        </div>

        <!-- Controls Panel -->
        <div class="controls-panel">
          <div class="panel-header">
            <h3 class="panel-title">Chỉnh sửa chữ trên hình</h3>
            <button
              class="btn btn-sm btn-secondary"
              (click)="onSaveProjectClick()"
              title="Lưu bản thiết kế này để mở lại chỉnh sửa sau"
              type="button"
            >
              💾 Lưu bản thảo
            </button>
          </div>

          <!-- Upload Image Section -->
          <div class="control-group">
            <label class="control-label">1. Ảnh nền</label>
            <button
              class="btn btn-primary upload-btn"
              (click)="onSelectImageClick(fileInput)"
              type="button"
            >
              📷 {{ editorState.hasImage() ? 'Đổi ảnh khác' : 'Tải ảnh nền lên' }}
            </button>
            <input
              #fileInput
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp"
              (change)="onFileInputChanged($event)"
              style="display: none"
            />
            @if (editorState.userImageFileName()) {
              <div class="file-badge">
                <span class="file-name">🖼️ {{ editorState.userImageFileName() }}</span>
              </div>
            }
          </div>

          <!-- Text Blocks Manager -->
          <div class="control-group">
            <div class="label-with-action">
              <label class="control-label">2. Các dòng tiêu đề & nội dung</label>
              <button
                class="btn btn-sm btn-primary add-block-btn"
                (click)="onAddSubtitle()"
                type="button"
              >
                + Thêm tiêu đề phụ
              </button>
            </div>

            <!-- List of Text Block Cards -->
            <div class="blocks-list">
              @for (block of editorState.textBlocks(); track block.id) {
                <div
                  class="block-card"
                  [class.active]="editorState.activeBlockId() === block.id"
                  (click)="onSelectBlock(block.id)"
                >
                  <div class="block-card-header">
                    <span class="block-type-badge">{{ block.label }}</span>
                    @if (block.removable) {
                      <button
                        class="btn-icon delete-btn"
                        (click)="onRemoveBlock(block.id, $event)"
                        title="Xóa dòng chữ này"
                        type="button"
                      >
                        🗑️
                      </button>
                    }
                  </div>

                  <textarea
                    class="text-input"
                    rows="2"
                    placeholder="Nhập nội dung chữ..."
                    [ngModel]="block.content"
                    (ngModelChange)="onBlockContentChanged(block.id, $event)"
                    (click)="$event.stopPropagation()"
                  ></textarea>

                  <!-- Controls for active block -->
                  @if (editorState.activeBlockId() === block.id) {
                    <div class="block-controls-body">
                      <!-- Font Size Slider -->
                      <div class="size-slider-group">
                        <span class="slider-label">Cỡ chữ: {{ block.fontSize }}px</span>
                        <input
                          type="range"
                          class="slider-input"
                          [min]="block.minFontSize"
                          [max]="block.maxFontSize"
                          [ngModel]="block.fontSize"
                          (ngModelChange)="onBlockSizeChanged(block.id, $event)"
                          (click)="$event.stopPropagation()"
                        />
                      </div>

                      <!-- Alignment & Quick Actions -->
                      <div class="action-buttons-row">
                        <button
                          class="btn btn-sm btn-secondary"
                          (click)="onCenterBlock(block.id, $event)"
                          title="Căn chính giữa chiều ngang ảnh"
                          type="button"
                        >
                          ↔️ Căn giữa ảnh
                        </button>
                        <button
                          class="btn btn-sm btn-secondary"
                          (click)="onResetBlockPosition(block, $event)"
                          title="Khôi phục lại vị trí mặc định ban đầu"
                          type="button"
                        >
                          ↩️ Vị trí mẫu
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Font Style Selector (applies to active block) -->
          <div class="control-group">
            <label class="control-label">3. Kiểu chữ tiếng Việt</label>
            <div class="font-presets-grid">
              @for (font of fontService.getPresets(); track font.id) {
                <button
                  type="button"
                  class="font-preset-card"
                  [class.active]="editorState.activeBlock()?.fontFamily === font.fontFamily"
                  (click)="onFontSelected(font.fontFamily)"
                >
                  <span class="preset-name">{{ font.name }}</span>
                  <span class="preset-desc">{{ font.description }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Error / Success Notification -->
          @if (feedbackMessage()) {
            <div class="feedback-alert" [class.success]="isFeedbackSuccess()">
              {{ feedbackMessage() }}
            </div>
          }

          <!-- Guide / Tip Box -->
          <div class="tip-box">
            💡 <strong>Mẹo:</strong> Bạn có thể dùng chuột bấm trực tiếp vào chữ trên ảnh để kéo tới vị trí mong muốn. Đường kẻ xanh sẽ tự động gióng thẳng hàng giữa ảnh.
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="step-actions">
        <button class="btn btn-secondary" (click)="onBack()" type="button">
          ← Quay lại chọn mẫu
        </button>
        <button
          class="btn btn-primary btn-lg"
          [disabled]="!editorState.canProceedToExport()"
          (click)="onNext()"
          type="button"
        >
          Tiếp theo: Xuất ảnh →
        </button>
      </div>
    </div>
  `,
  styles: `
    .step-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--spacing-lg);
    }

    .editor-layout {
      display: flex;
      gap: var(--spacing-xl);
      flex: 1;
      min-height: 0;
    }

    .canvas-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      position: relative;
      background: #eef2f6;
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      transition: all var(--transition-fast);

      &.drag-over {
        border-color: var(--color-primary);
        background: rgba(26, 86, 219, 0.08);
      }
    }

    .canvas-wrapper {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      max-height: 100%;
    }

    .canvas-wrapper canvas {
      display: block;
      max-width: 100%;
      max-height: 65vh;
      width: auto !important;
      height: auto !important;
    }

    .empty-prompt {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.92);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      text-align: center;
      max-width: 380px;
      z-index: 10;
    }

    .prompt-icon {
      font-size: 2.8rem;
    }

    .prompt-text {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .prompt-sub {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .controls-panel {
      width: 360px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      overflow-y: auto;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--spacing-xs);
      border-bottom: 2px solid var(--color-border);
    }

    .panel-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .label-with-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .control-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .add-block-btn {
      padding: 3px 8px;
      font-size: 0.8rem;
    }

    .upload-btn {
      width: 100%;
    }

    .file-badge {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      color: var(--color-text);
      overflow: hidden;
    }

    .file-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Blocks List */
    .blocks-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .block-card {
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm);
      background: #fafafa;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: #93c5fd;
      }

      &.active {
        border-color: var(--color-primary);
        background: #f0f7ff;
        box-shadow: 0 0 0 2px rgba(26, 86, 219, 0.12);
      }
    }

    .block-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .block-type-badge {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);

      &:hover {
        background: #fee2e2;
      }
    }

    .text-input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      line-height: 1.4;
      background: #fff;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }
    }

    .block-controls-body {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #dbeafe;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .size-slider-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .slider-label {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .slider-input {
      width: 100%;
      cursor: pointer;
      accent-color: var(--color-primary);
    }

    .action-buttons-row {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    /* Font Presets */
    .font-presets-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .font-preset-card {
      display: flex;
      flex-direction: column;
      padding: 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;

      &:hover {
        border-color: var(--color-primary);
      }

      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);

        .preset-name {
          color: #fff;
        }

        .preset-desc {
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }

    .preset-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .preset-desc {
      font-size: 0.72rem;
      color: var(--color-text-secondary);
      line-height: 1.25;
      margin-top: 2px;
    }

    .feedback-alert {
      padding: 8px 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 0.82rem;

      &.success {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: var(--color-success);
      }
    }

    .tip-box {
      padding: 10px 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-sm);
      color: #1e40af;
      font-size: 0.82rem;
      line-height: 1.45;
      margin-top: auto;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      flex-shrink: 0;
    }
  `,
})
export class StepEditorComponent {
  readonly goBack = output<void>();
  readonly stepComplete = output<void>();

  private readonly templateService = inject(TemplateService);
  private readonly canvasService = inject(CanvasService);
  private readonly imageService = inject(ImageService);
  private readonly fileService = inject(FileService);
  protected readonly fontService = inject(FontService);
  protected readonly editorState = inject(EditorStateService);

  readonly fabricCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('fabricCanvas');
  readonly canvasWrapper =
    viewChild.required<ElementRef<HTMLDivElement>>('canvasWrapper');

  readonly feedbackMessage = signal('');
  readonly isFeedbackSuccess = signal(false);
  readonly isDragging = signal(false);

  constructor() {
    afterNextRender(() => {
      this.initEditor();
    });

    // Sync canvas selection back to editor state
    effect(() => {
      const selectedId = this.canvasService.onBlockSelected();
      if (selectedId) {
        this.editorState.setActiveBlockId(selectedId);
      }
    });
  }

  private async initEditor(): Promise<void> {
    const template =
      this.editorState.selectedTemplate() ||
      this.templateService.selectedTemplate();

    if (!template) return;

    const canvasEl = this.fabricCanvas().nativeElement;
    const blocks = this.editorState.textBlocks();
    this.canvasService.initCanvas(canvasEl, template, blocks);

    // Restore background image if available in state
    const savedImage = this.editorState.userImageDataUrl();
    if (savedImage) {
      await this.canvasService.setBackgroundImage(savedImage);
    }
  }

  async onSelectImageClick(fileInput: HTMLInputElement): Promise<void> {
    this.feedbackMessage.set('');

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

    await this.handleFile(file);
    input.value = '';
  }

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
      await this.handleFile(file);
    }
  }

  private async handleFile(file: File): Promise<void> {
    this.feedbackMessage.set('');
    try {
      const dataUrl = await this.imageService.loadImageFile(file);
      await this.applyImageData(dataUrl, file.name);
    } catch (err) {
      this.isFeedbackSuccess.set(false);
      this.feedbackMessage.set(err instanceof Error ? err.message : 'Lỗi khi tải ảnh.');
    }
  }

  private async applyImageData(dataUrl: string, fileName: string): Promise<void> {
    this.editorState.setImage(dataUrl, fileName);
    await this.canvasService.setBackgroundImage(dataUrl);
  }

  // === Multi-block Actions ===

  onSelectBlock(id: string): void {
    this.editorState.setActiveBlockId(id);
    this.canvasService.selectTextBlock(id);
  }

  onAddSubtitle(): void {
    const newBlock = this.editorState.addSubtitleBlock();
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

  onBlockContentChanged(id: string, content: string): void {
    this.editorState.updateBlockContent(id, content);
    const block = this.editorState.textBlocks().find((b) => b.id === id);
    if (block) {
      this.canvasService.updateTextBlock(block);
    }
  }

  onBlockSizeChanged(id: string, size: number): void {
    const numSize = Number(size);
    this.editorState.updateBlockFontSize(id, numSize);
    const block = this.editorState.textBlocks().find((b) => b.id === id);
    if (block) {
      this.canvasService.updateTextBlock(block);
    }
  }

  onFontSelected(fontFamily: string): void {
    const active = this.editorState.activeBlock();
    if (!active) return;

    this.editorState.updateBlockFont(active.id, fontFamily);
    const updated = this.editorState.textBlocks().find((b) => b.id === active.id);
    if (updated) {
      this.canvasService.updateTextBlock(updated);
    }
  }

  onCenterBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.canvasService.centerHorizontally(id);
    const tb = this.canvasService.getTextbox(id);
    if (tb) {
      this.editorState.updateBlockPosition(id, tb.left!, tb.top!);
    }
  }

  onResetBlockPosition(block: TextBlock, event: Event): void {
    event.stopPropagation();
    this.canvasService.resetBlockPosition(block);
    const tb = this.canvasService.getTextbox(block.id);
    if (tb) {
      this.editorState.updateBlockPosition(block.id, tb.left!, tb.top!);
      this.editorState.updateBlockFontSize(block.id, tb.fontSize || block.maxFontSize);
    }
  }

  async onSaveProjectClick(): Promise<void> {
    const project = this.editorState.getProjectData();
    if (!project) return;

    const saved = await this.fileService.saveProject(project);
    if (saved) {
      this.isFeedbackSuccess.set(true);
      this.feedbackMessage.set('Đã lưu bản thiết kế thành công!');
      setTimeout(() => this.feedbackMessage.set(''), 4000);
    }
  }

  onBack(): void {
    this.goBack.emit();
  }

  onNext(): void {
    if (this.editorState.canProceedToExport()) {
      const exportDataUrl = this.canvasService.exportToPng();
      this.editorState.setExportedDataUrl(exportDataUrl);
      this.stepComplete.emit();
    }
  }
}
