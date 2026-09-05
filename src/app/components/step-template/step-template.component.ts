import {
  Component,
  output,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { FileService } from '../../services/file.service';
import { Template } from '../../models/template.model';

@Component({
  selector: 'app-step-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-template">
      <h2 class="step-title">Bước 1: Chọn mẫu thiết kế</h2>
      <p class="step-desc">Chọn một mẫu bố cục bên dưới hoặc mở lại dự án đã lưu trước đây</p>

      <!-- Quick Action: Open existing project file or restore last session -->
      <div class="resume-bar">
        <button
          class="btn btn-secondary open-proj-btn"
          (click)="onOpenProjectClick(projectFileInput)"
          type="button"
        >
          📂 Mở bản thảo cũ đã lưu (.json)
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
            class="btn btn-secondary resume-last-btn"
            (click)="onResumeLastSession()"
            type="button"
          >
            ⚡ Tiếp tục bản thảo dở dang gần nhất
          </button>
        }
      </div>

      @if (errorMessage()) {
        <div class="alert-box error">
          ⚠️ {{ errorMessage() }}
        </div>
      }

      <!-- Templates Grid -->
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
      max-width: 920px;
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

    .resume-bar {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      justify-content: center;
      padding: 10px 16px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-lg);
      width: 100%;
    }

    .open-proj-btn,
    .resume-last-btn {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .alert-box {
      width: 100%;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      text-align: center;

      &.error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: var(--color-danger);
      }
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
      background: #e2e8f0;
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
  protected readonly editorState = inject(EditorStateService);
  private readonly fileService = inject(FileService);

  readonly errorMessage = signal('');

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

  async onOpenProjectClick(fileInput: HTMLInputElement): Promise<void> {
    this.errorMessage.set('');

    if (this.fileService.isElectron()) {
      const project = await this.fileService.openProjectViaElectron();
      if (project) {
        this.applyLoadedProject(project);
        return;
      }
    }

    fileInput.click();
  }

  async onProjectFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const project = await this.fileService.readProjectFromFile(file);
      this.applyLoadedProject(project);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Lỗi đọc file dự án');
    } finally {
      input.value = '';
    }
  }

  onResumeLastSession(): void {
    const saved = this.editorState.getSavedProjectFromStorage();
    if (saved) {
      this.applyLoadedProject(saved);
    }
  }

  private applyLoadedProject(project: import('../../models/template.model').ProjectData): void {
    const tpl =
      this.templateService.getTemplateById(project.templateId) ||
      this.templateService.templates()[0];

    if (!tpl) {
      this.errorMessage.set('Không tìm thấy mẫu phù hợp với file dự án này.');
      return;
    }

    this.templateService.selectTemplate(tpl.templateId);
    this.editorState.loadProjectData(project, tpl);
    this.stepComplete.emit();
  }
}
