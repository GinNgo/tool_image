import {
  Component,
  output,
  inject,
  signal,
  viewChild,
  ElementRef,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import { CanvasService } from '../../services/canvas.service';
import { ImageService } from '../../services/image.service';
import { FileService } from '../../services/file.service';
import { EditorStateService, FONT_STYLE_OPTIONS } from '../../services/editor-state.service';

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
          <h3 class="panel-title">Bước 2: Nhập nội dung</h3>

          <!-- Upload Image -->
          <div class="control-group">
            <label class="control-label">1. Ảnh nền</label>
            <div class="button-group-vertical">
              <button
                class="btn btn-primary upload-btn"
                (click)="onSelectImageClick(fileInput)"
                type="button"
              >
                📷 {{ editorState.hasImage() ? 'Đổi ảnh khác' : 'Tải ảnh nền lên' }}
              </button>
            </div>
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

          <!-- Text Input -->
          <div class="control-group">
            <label class="control-label" for="textInput">2. Tiêu đề / Nội dung</label>
            <textarea
              id="textInput"
              class="text-input"
              placeholder="Nhập tiêu đề hoặc khẩu hiệu..."
              [ngModel]="editorState.userText()"
              (ngModelChange)="onTextChanged($event)"
              rows="3"
            ></textarea>
          </div>

          <!-- Font Style Selector -->
          <div class="control-group">
            <label class="control-label">3. Kiểu chữ</label>
            <div class="font-options-grid">
              @for (font of fontOptions; track font.id) {
                <button
                  type="button"
                  class="font-option-btn"
                  [class.active]="editorState.selectedFontFamily() === font.fontFamily"
                  (click)="onFontSelected(font.fontFamily)"
                >
                  {{ font.name }}
                </button>
              }
            </div>
          </div>

          <!-- Reset Position Button -->
          <div class="control-group">
            <button
              class="btn btn-secondary"
              (click)="onResetPosition()"
              type="button"
            >
              ↩ Khôi phục vị trí mặc định
            </button>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="error-message">
              ⚠️ {{ errorMessage() }}
            </div>
          }

          <!-- Guide / Tip Box -->
          <div class="tip-box">
            💡 <strong>Mẹo:</strong> Bạn có thể dùng chuột kéo thả trực tiếp tiêu đề trên ảnh. Đường kẻ xanh sẽ tự động hiện ra giúp bạn canh chuẩn giữa ảnh.
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
      background: #eef0f4;
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
      background: rgba(255, 255, 255, 0.9);
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
      width: 320px;
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

    .panel-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-text);
      padding-bottom: var(--spacing-xs);
      border-bottom: 2px solid var(--color-border);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .control-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
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

    .text-input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
      min-height: 70px;
      line-height: 1.4;
      transition: border-color var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.15);
      }
    }

    .font-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .font-option-btn {
      padding: 8px 4px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;

      &:hover {
        border-color: var(--color-primary);
      }

      &.active {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }
    }

    .error-message {
      padding: var(--spacing-sm) var(--spacing-md);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 0.85rem;
    }

    .tip-box {
      padding: var(--spacing-sm) var(--spacing-md);
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
  protected readonly editorState = inject(EditorStateService);

  readonly fabricCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('fabricCanvas');
  readonly canvasWrapper =
    viewChild.required<ElementRef<HTMLDivElement>>('canvasWrapper');

  readonly errorMessage = signal('');
  readonly isDragging = signal(false);
  readonly fontOptions = FONT_STYLE_OPTIONS;

  constructor() {
    afterNextRender(() => {
      this.initEditor();
    });
  }

  private async initEditor(): Promise<void> {
    const template =
      this.editorState.selectedTemplate() ||
      this.templateService.selectedTemplate();

    if (!template) return;

    const canvasEl = this.fabricCanvas().nativeElement;
    this.canvasService.initCanvas(canvasEl, template);

    // Restore background image if available in state
    const savedImage = this.editorState.userImageDataUrl();
    if (savedImage) {
      await this.canvasService.setBackgroundImage(savedImage);
    }

    // Set text and font
    const textToSet =
      this.editorState.userText() || template.textDefault.content;
    const fontToSet =
      this.editorState.selectedFontFamily() || template.textDefault.fontFamily;

    this.editorState.setText(textToSet);
    this.editorState.setFontFamily(fontToSet);
    this.canvasService.setText(textToSet, fontToSet);
  }

  async onSelectImageClick(fileInput: HTMLInputElement): Promise<void> {
    this.errorMessage.set('');

    // Try Electron native dialog first if available
    if (this.fileService.isElectron()) {
      const result = await this.fileService.openImageViaElectron();
      if (result) {
        await this.applyImageData(result.dataUrl, result.fileName);
        return;
      }
    }

    // Fallback to browser file input
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
    this.errorMessage.set('');
    try {
      const dataUrl = await this.imageService.loadImageFile(file);
      await this.applyImageData(dataUrl, file.name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi không xác định khi tải ảnh.';
      this.errorMessage.set(message);
    }
  }

  private async applyImageData(dataUrl: string, fileName: string): Promise<void> {
    this.editorState.setImage(dataUrl, fileName);
    await this.canvasService.setBackgroundImage(dataUrl);
  }

  onTextChanged(text: string): void {
    this.editorState.setText(text);
    this.canvasService.setText(text, this.editorState.selectedFontFamily());
  }

  onFontSelected(fontFamily: string): void {
    this.editorState.setFontFamily(fontFamily);
    this.canvasService.setFontFamily(fontFamily);
  }

  onResetPosition(): void {
    this.canvasService.resetTextPosition();
  }

  onBack(): void {
    this.goBack.emit();
  }

  onNext(): void {
    if (this.editorState.canProceedToExport()) {
      // Pre-render the export image into editor state so Step 3 has immediate access
      const exportDataUrl = this.canvasService.exportToPng();
      this.editorState.setExportedDataUrl(exportDataUrl);
      this.stepComplete.emit();
    }
  }
}
