import { Injectable, signal, computed } from '@angular/core';
import { Template, WizardStep, TextBlock, ProjectData, LayoutMaster } from '../models/template.model';

const STORAGE_KEY = 'tool_image_last_project';

@Injectable({ providedIn: 'root' })
export class EditorStateService {
  readonly currentStep = signal<WizardStep>(1);
  readonly selectedTemplate = signal<Template | null>(null);
  readonly userImageDataUrl = signal<string | null>(null);
  readonly userImageFileName = signal<string>('');
  readonly exportedDataUrl = signal<string | null>(null);

  // Multi-layer text blocks support
  readonly textBlocks = signal<TextBlock[]>([]);
  readonly activeBlockId = signal<string | null>(null);

  // Computed signals
  readonly hasTemplate = computed(() => this.selectedTemplate() !== null);
  readonly hasImage = computed(() => this.userImageDataUrl() !== null);
  readonly activeBlock = computed(() => {
    const activeId = this.activeBlockId();
    return this.textBlocks().find((b) => b.id === activeId) || this.textBlocks()[0] || null;
  });

  readonly canProceedToExport = computed(() => {
    const hasImg = this.hasImage();
    const hasValidText = this.textBlocks().some((b) => b.content.trim().length > 0);
    return hasImg && hasValidText;
  });

  // Backward compatibility getters for existing single-text components/tests
  readonly userText = computed(() => {
    const titleBlock = this.textBlocks().find((b) => b.type === 'title') || this.textBlocks()[0];
    return titleBlock ? titleBlock.content : '';
  });

  readonly selectedFontFamily = computed(() => {
    const active = this.activeBlock();
    return active ? active.fontFamily : 'Montserrat-Bold';
  });

  setTemplate(template: Template): void {
    const prev = this.selectedTemplate();
    this.selectedTemplate.set(template);

    // If template changed or no blocks exist, initialize default title block
    if (!prev || prev.templateId !== template.templateId || this.textBlocks().length === 0) {
      const defaultBlock: TextBlock = {
        id: 'title',
        type: 'title',
        label: 'Tiêu đề chính',
        content: template.textDefault.content,
        x: template.textDefault.x,
        y: template.textDefault.y,
        align: template.textDefault.align,
        fontFamily: template.textDefault.fontFamily,
        fontSize: template.textDefault.maxFontSize,
        minFontSize: template.textDefault.minFontSize,
        maxFontSize: template.textDefault.maxFontSize,
        colorMode: 'auto',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: template.textDefault.strokeWidth || 2,
        removable: false,
        defaultX: template.textDefault.x,
        defaultY: template.textDefault.y,
      };

      this.textBlocks.set([defaultBlock]);
      this.activeBlockId.set('title');
      this.exportedDataUrl.set(null);
    }
  }

  /**
   * Áp dụng một Mẫu khuôn bố cục PowerPoint (Layout Master):
   * Giữ nguyên ảnh nền đang có (nếu có), chỉ áp dụng vị trí, kiểu dáng và cấu trúc các hộp chữ
   */
  applyLayoutMaster(master: LayoutMaster, keepExistingText: boolean = true): void {
    const curTemplate = this.selectedTemplate();
    const cw = curTemplate?.canvas.width || master.canvas.width;
    const ch = curTemplate?.canvas.height || master.canvas.height;

    // Scaling ratio if current canvas aspect ratio changed due to uploaded image
    const scaleX = cw / master.canvas.width;
    const scaleY = ch / master.canvas.height;

    const existingBlocks = this.textBlocks();

    const newBlocks: TextBlock[] = master.blocks.map((b, index) => {
      const existing = existingBlocks[index];
      // If keepExistingText and user already typed content, keep user's content
      const content = keepExistingText && existing && existing.content.trim() ? existing.content : b.content;

      const newId = existing ? existing.id : `box_${Date.now()}_${index}`;
      const posX = Math.round(b.x * scaleX);
      const posY = Math.round(b.y * scaleY);

      return {
        ...b,
        id: newId,
        content,
        x: posX,
        y: posY,
        defaultX: posX,
        defaultY: posY,
      };
    });

    this.textBlocks.set(newBlocks);
    this.activeBlockId.set(newBlocks.length > 0 ? newBlocks[0].id : null);
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
  }

  setImage(dataUrl: string, fileName: string): void {
    this.userImageDataUrl.set(dataUrl);
    this.userImageFileName.set(fileName);
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
  }

  clearImage(): void {
    this.userImageDataUrl.set(null);
    this.userImageFileName.set('');
    this.exportedDataUrl.set(null);
  }

  setText(text: string): void {
    const activeId = this.activeBlockId() || 'title';
    this.updateBlockContent(activeId, text);
  }

  setFontFamily(fontFamily: string): void {
    const activeId = this.activeBlockId() || 'title';
    this.updateBlockFont(activeId, fontFamily);
  }

  // === TextBlock Operations ===

  setActiveBlockId(id: string): void {
    this.activeBlockId.set(id);
  }

  updateBlockContent(id: string, content: string): void {
    this.textBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, content } : b))
    );
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
  }

  updateBlockFont(id: string, fontFamily: string): void {
    this.textBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, fontFamily } : b))
    );
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
  }

  updateBlockFontSize(id: string, fontSize: number): void {
    this.textBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, fontSize } : b))
    );
    this.exportedDataUrl.set(null);
  }

  updateBlockPosition(id: string, x: number, y: number): void {
    this.textBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, x, y } : b))
    );
    this.exportedDataUrl.set(null);
  }

  updateBlockFormat(id: string, updates: Partial<TextBlock>): void {
    this.textBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
  }

  addSubtitleBlock(): TextBlock | null {
    return this.addCustomTextBlock('subtitle', 'Tiêu đề phụ', 'Nhập nội dung phụ / thông điệp...', 36);
  }

  addCustomTextBlock(
    type: 'title' | 'subtitle' | 'caption' | 'custom' = 'custom',
    label: string = 'Hộp chữ mới',
    content: string = 'Nhấp đúp chuột để sửa chữ...',
    fontSize: number = 38
  ): TextBlock | null {
    const template = this.selectedTemplate();
    const cw = template?.canvas.width || 1080;
    const ch = template?.canvas.height || 1350;

    const currentCount = this.textBlocks().length;
    const newId = `box_${Date.now()}`;

    // Place nicely near center or staggered
    const offsetY = (currentCount % 5) * 60;
    const defaultY = Math.min(ch * 0.85, ch * 0.5 + offsetY);

    const newBlock: TextBlock = {
      id: newId,
      type,
      label: `${label} ${currentCount > 0 ? currentCount + 1 : ''}`.trim(),
      content,
      x: cw / 2,
      y: defaultY,
      align: 'center',
      fontFamily: 'Montserrat-Bold',
      fontSize,
      minFontSize: 16,
      maxFontSize: 100,
      colorMode: 'custom',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      effect: 'shadow',
      bold: true,
      removable: true,
      defaultX: cw / 2,
      defaultY,
    };

    this.textBlocks.update((blocks) => [...blocks, newBlock]);
    this.activeBlockId.set(newId);
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
    return newBlock;
  }

  duplicateTextBlock(id: string): TextBlock | null {
    const target = this.textBlocks().find((b) => b.id === id);
    if (!target) return null;

    const newId = `box_${Date.now()}_copy`;
    const newBlock: TextBlock = {
      ...target,
      id: newId,
      label: `${target.label} (Bản sao)`,
      x: target.x + 40,
      y: target.y + 40,
      defaultX: (target.defaultX || target.x) + 40,
      defaultY: (target.defaultY || target.y) + 40,
      removable: true,
    };

    this.textBlocks.update((blocks) => [...blocks, newBlock]);
    this.activeBlockId.set(newId);
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
    return newBlock;
  }

  removeTextBlock(id: string): void {
    const blockToRemove = this.textBlocks().find((b) => b.id === id);
    if (!blockToRemove || !blockToRemove.removable) return;

    this.textBlocks.update((blocks) => blocks.filter((b) => b.id !== id));
    if (this.activeBlockId() === id) {
      const remaining = this.textBlocks();
      this.activeBlockId.set(remaining.length > 0 ? remaining[0].id : null);
    }
    this.exportedDataUrl.set(null);
    this.autoSaveToLocalStorage();
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
    this.textBlocks.set([]);
    this.activeBlockId.set(null);
    this.exportedDataUrl.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore in headless/SSR environments
    }
  }

  // === Project Persistence (Save & Load) ===

  getProjectData(): ProjectData | null {
    const template = this.selectedTemplate();
    if (!template) return null;

    return {
      version: '2.0',
      projectName: `du-an-${new Date().toISOString().slice(0, 10)}`,
      updatedAt: new Date().toISOString(),
      templateId: template.templateId,
      canvas: {
        width: template.canvas.width,
        height: template.canvas.height,
      },
      backgroundImage: this.userImageDataUrl()
        ? {
            dataUrl: this.userImageDataUrl()!,
            fileName: this.userImageFileName() || 'anh-nen.png',
          }
        : null,
      textBlocks: this.textBlocks(),
      activeBlockId: this.activeBlockId(),
    };
  }

  loadProjectData(project: ProjectData, template: Template): void {
    this.selectedTemplate.set(template);
    if (project.backgroundImage) {
      this.userImageDataUrl.set(project.backgroundImage.dataUrl);
      this.userImageFileName.set(project.backgroundImage.fileName);
    } else {
      this.userImageDataUrl.set(null);
      this.userImageFileName.set('');
    }

    if (project.textBlocks && project.textBlocks.length > 0) {
      this.textBlocks.set(project.textBlocks);
      this.activeBlockId.set(project.activeBlockId || project.textBlocks[0].id);
    } else {
      this.setTemplate(template);
    }

    this.exportedDataUrl.set(null);
    this.currentStep.set(2);
    this.autoSaveToLocalStorage();
  }

  private autoSaveToLocalStorage(): void {
    try {
      const data = this.getProjectData();
      if (data && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // Storage quota or headless environment
    }
  }

  hasSavedProject(): boolean {
    try {
      return typeof localStorage !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  }

  getSavedProjectFromStorage(): ProjectData | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProjectData) : null;
    } catch {
      return null;
    }
  }
}
