import {
  Component,
  output,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CanvasService } from '../../services/canvas.service';
import { FileService } from '../../services/file.service';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-step-export',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-export">
      <h2 class="step-title">Bước 3: Hoàn thành & Xuất ảnh</h2>
      <p class="step-desc">Kiểm tra lại hình ảnh và lưu về máy tính của bạn</p>

      <!-- Status Notification -->
      @if (saveSuccess()) {
        <div class="alert alert-success">
          ✅ <strong>Đã lưu thành công!</strong> Ảnh đã được lưu vào máy tính của bạn.
        </div>
      } @else if (saveError()) {
        <div class="alert alert-danger">
          ⚠️ {{ saveError() }}
        </div>
      }

      <!-- Image Preview Area -->
      <div class="preview-area">
        @if (previewDataUrl()) {
          <img
            class="preview-image"
            [src]="previewDataUrl()"
            alt="Xem trước ảnh hoàn thiện"
          />
        } @else {
          <div class="preview-placeholder">
            <span class="preview-icon">🖼️</span>
            <span>Đang chuẩn bị ảnh xem trước...</span>
          </div>
        }
      </div>

      <!-- Main Actions -->
      <div class="step-actions-center">
        <button
          class="btn btn-success btn-lg"
          (click)="onSaveImage()"
          [disabled]="isExporting() || !previewDataUrl()"
          type="button"
        >
          @if (isExporting()) {
            ⏳ Đang lưu ảnh...
          } @else {
            💾 Tải và Lưu ảnh về máy
          }
        </button>

        <button
          class="btn btn-secondary btn-lg"
          (click)="onStartOver()"
          type="button"
        >
          🔄 Tạo ảnh mới
        </button>
      </div>

      <!-- Back Link -->
      <div class="step-actions-bottom">
        <button class="btn btn-secondary" (click)="onBack()" type="button">
          ← Quay lại chỉnh sửa tiếp
        </button>
      </div>
    </div>
  `,
  styles: `
    .step-export {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: var(--spacing-xl);
    }

    .step-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--color-text);
      text-align: center;
    }

    .step-desc {
      font-size: 1rem;
      color: var(--color-text-secondary);
      margin-top: calc(-1 * var(--spacing-sm));
      text-align: center;
    }

    .alert {
      width: 100%;
      max-width: 540px;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      text-align: center;
    }

    .alert-success {
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: var(--color-success);
    }

    .alert-danger {
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      color: var(--color-danger);
    }

    .preview-area {
      width: 100%;
      max-width: 520px;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-border);
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .preview-icon {
      font-size: 3rem;
    }

    .preview-image {
      width: 100%;
      height: auto;
      max-height: 65vh;
      object-fit: contain;
      display: block;
    }

    .step-actions-center {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    .step-actions-bottom {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }
  `,
})
export class StepExportComponent implements OnInit {
  readonly goBack = output<void>();
  readonly startOver = output<void>();

  private readonly canvasService = inject(CanvasService);
  private readonly fileService = inject(FileService);
  private readonly editorState = inject(EditorStateService);

  readonly isExporting = signal(false);
  readonly previewDataUrl = signal<string | null>(null);
  readonly saveSuccess = signal(false);
  readonly saveError = signal('');

  ngOnInit(): void {
    const cached = this.editorState.exportedDataUrl();
    if (cached) {
      this.previewDataUrl.set(cached);
    } else {
      const generated = this.canvasService.exportToPng();
      if (generated) {
        this.previewDataUrl.set(generated);
        this.editorState.setExportedDataUrl(generated);
      }
    }
  }

  async onSaveImage(): Promise<void> {
    const dataUrl = this.previewDataUrl() || this.canvasService.exportToPng();
    if (!dataUrl) {
      this.saveError.set('Không có dữ liệu ảnh để lưu. Vui lòng quay lại bước chỉnh sửa.');
      return;
    }

    this.isExporting.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');

    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `banner-tuyen-truyen-${timestamp}.png`;

      const saved = await this.fileService.saveImage(dataUrl, filename);
      if (saved) {
        this.saveSuccess.set(true);
      } else {
        this.saveError.set('Bạn đã hủy hoặc xảy ra lỗi khi lưu file.');
      }
    } catch {
      this.saveError.set('Đã xảy ra lỗi trong quá trình lưu file. Vui lòng thử lại.');
    } finally {
      this.isExporting.set(false);
    }
  }

  onBack(): void {
    this.saveSuccess.set(false);
    this.saveError.set('');
    this.goBack.emit();
  }

  onStartOver(): void {
    this.canvasService.dispose();
    this.editorState.resetAll();
    this.startOver.emit();
  }
}
