import { Injectable, signal, computed } from '@angular/core';
import { Template, WizardStep } from '../models/template.model';

export interface FontStyleOption {
  id: string;
  name: string;
  fontFamily: string;
}

export const FONT_STYLE_OPTIONS: FontStyleOption[] = [
  { id: 'solemn', name: 'Trang trọng', fontFamily: 'Montserrat-Bold' },
  { id: 'bold', name: 'Nổi bật', fontFamily: 'BeVietnamPro-Bold' },
  { id: 'modern', name: 'Hiện đại', fontFamily: 'BeVietnamPro' },
];

@Injectable({ providedIn: 'root' })
export class EditorStateService {
  readonly currentStep = signal<WizardStep>(1);
  readonly selectedTemplate = signal<Template | null>(null);
  readonly userImageDataUrl = signal<string | null>(null);
  readonly userImageFileName = signal<string>('');
  readonly userText = signal<string>('');
  readonly selectedFontFamily = signal<string>('Montserrat-Bold');
  readonly exportedDataUrl = signal<string | null>(null);

  readonly hasTemplate = computed(() => this.selectedTemplate() !== null);
  readonly hasImage = computed(() => this.userImageDataUrl() !== null);
  readonly canProceedToExport = computed(
    () => this.hasImage() && this.userText().trim().length > 0
  );

  setTemplate(template: Template): void {
    const prev = this.selectedTemplate();
    this.selectedTemplate.set(template);
    if (!prev || prev.templateId !== template.templateId) {
      this.userText.set(template.textDefault.content);
      this.selectedFontFamily.set(template.textDefault.fontFamily);
      this.exportedDataUrl.set(null);
    }
  }

  setImage(dataUrl: string, fileName: string): void {
    this.userImageDataUrl.set(dataUrl);
    this.userImageFileName.set(fileName);
    this.exportedDataUrl.set(null);
  }

  clearImage(): void {
    this.userImageDataUrl.set(null);
    this.userImageFileName.set('');
    this.exportedDataUrl.set(null);
  }

  setText(text: string): void {
    this.userText.set(text);
    this.exportedDataUrl.set(null);
  }

  setFontFamily(fontFamily: string): void {
    this.selectedFontFamily.set(fontFamily);
    this.exportedDataUrl.set(null);
  }

  setExportedDataUrl(dataUrl: string | null): void {
    this.exportedDataUrl.set(dataUrl);
  }

  setStep(step: WizardStep): void {
    this.currentStep.set(step);
  }

  resetAll(): void {
    this.currentStep.set(1);
    this.selectedTemplate.set(null);
    this.userImageDataUrl.set(null);
    this.userImageFileName.set('');
    this.userText.set('');
    this.selectedFontFamily.set('Montserrat-Bold');
    this.exportedDataUrl.set(null);
  }
}
