import {
  Component,
  output,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { Template } from '../../models/template.model';

@Component({
  selector: 'app-step-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-template">
      <h2 class="step-title">Bước 1: Chọn mẫu thiết kế</h2>
      <p class="step-desc">Chọn một mẫu bố cục bên dưới để bắt đầu tạo ảnh</p>

      <div class="template-grid">
        @for (tpl of templateService.templates(); track tpl.templateId) {
          <button
            class="template-card"
            [class.selected]="
              templateService.selectedTemplate()?.templateId === tpl.templateId
            "
            (click)="onSelectTemplate(tpl)"
            type="button"
          >
            <div class="template-thumb">
              <img [src]="tpl.thumbnail" [alt]="tpl.name" loading="lazy" />
            </div>
            <span class="template-name">{{ tpl.name }}</span>
            @if (
              templateService.selectedTemplate()?.templateId ===
              tpl.templateId
            ) {
              <span class="selected-badge">✓ Đang chọn</span>
            }
          </button>
        }
      </div>

      <div class="step-actions">
        <button
          class="btn btn-primary btn-lg"
          [disabled]="!templateService.hasSelection()"
          (click)="onNext()"
          type="button"
        >
          Tiếp theo: Nhập nội dung →
        </button>
      </div>
    </div>
  `,
  styles: `
    .step-template {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      max-width: 900px;
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

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-xl);
      width: 100%;
    }

    .template-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      position: relative;
      text-align: center;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-3px);
      }

      &.selected {
        border-color: var(--color-primary);
        background: rgba(26, 86, 219, 0.04);
        box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.2);
      }
    }

    .template-thumb {
      width: 100%;
      aspect-ratio: 4 / 5;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .template-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .selected-badge {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      background: var(--color-primary);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      box-shadow: var(--shadow-sm);
    }

    .step-actions {
      display: flex;
      justify-content: center;
      padding-top: var(--spacing-lg);
    }
  `,
})
export class StepTemplateComponent {
  readonly stepComplete = output<void>();
  protected readonly templateService = inject(TemplateService);
  private readonly editorState = inject(EditorStateService);

  onSelectTemplate(tpl: Template): void {
    this.templateService.selectTemplate(tpl.templateId);
    this.editorState.setTemplate(tpl);
  }

  onNext(): void {
    const current = this.templateService.selectedTemplate();
    if (current) {
      this.editorState.setTemplate(current);
      this.stepComplete.emit();
    }
  }
}
