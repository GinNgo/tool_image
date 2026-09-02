import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { StepTemplateComponent } from '../step-template/step-template.component';
import { StepEditorComponent } from '../step-editor/step-editor.component';
import { StepExportComponent } from '../step-export/step-export.component';
import { EditorStateService } from '../../services/editor-state.service';
import { WizardStep } from '../../models/template.model';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [StepTemplateComponent, StepEditorComponent, StepExportComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-container">
      <!-- Progress Bar -->
      <div class="wizard-progress">
        @for (step of steps; track step.num) {
          <div
            class="progress-step"
            [class.active]="editorState.currentStep() === step.num"
            [class.completed]="editorState.currentStep() > step.num"
          >
            <div class="step-circle">
              @if (editorState.currentStep() > step.num) {
                <span class="check-icon">✓</span>
              } @else {
                {{ step.num }}
              }
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
          @if (!$last) {
            <div
              class="progress-line"
              [class.completed]="editorState.currentStep() > step.num"
            ></div>
          }
        }
      </div>

      <!-- Step Content -->
      <div class="wizard-content">
        @switch (editorState.currentStep()) {
          @case (1) {
            <app-step-template (stepComplete)="goToStep(2)" />
          }
          @case (2) {
            <app-step-editor
              (goBack)="goToStep(1)"
              (stepComplete)="goToStep(3)"
            />
          }
          @case (3) {
            <app-step-export
              (goBack)="goToStep(2)"
              (startOver)="goToStep(1)"
            />
          }
        }
      </div>
    </div>
  `,
  styles: `
    .wizard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
    }

    .wizard-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-md) var(--spacing-xl);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      gap: var(--spacing-sm);
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }

    .progress-step {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .step-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 700;
      background: var(--color-border);
      color: var(--color-text-secondary);
      transition: all var(--transition-normal);
    }

    .progress-step.active .step-circle {
      background: var(--color-primary);
      color: #fff;
      box-shadow: 0 0 0 4px rgba(26, 86, 219, 0.2);
    }

    .progress-step.completed .step-circle {
      background: var(--color-success);
      color: #fff;
    }

    .check-icon {
      font-size: 0.95rem;
    }

    .step-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: color var(--transition-normal);
    }

    .progress-step.active .step-label {
      color: var(--color-primary);
      font-weight: 700;
    }

    .progress-step.completed .step-label {
      color: var(--color-success);
    }

    .progress-line {
      width: 50px;
      height: 2px;
      background: var(--color-border);
      transition: background var(--transition-normal);
    }

    .progress-line.completed {
      background: var(--color-success);
    }

    .wizard-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
    }
  `,
})
export class WizardComponent {
  protected readonly editorState = inject(EditorStateService);

  readonly steps = [
    { num: 1 as WizardStep, label: '1. Chọn mẫu' },
    { num: 2 as WizardStep, label: '2. Nhập nội dung' },
    { num: 3 as WizardStep, label: '3. Xuất ảnh' },
  ];

  goToStep(step: WizardStep): void {
    this.editorState.setStep(step);
  }
}
