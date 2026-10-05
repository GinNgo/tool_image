import { Injectable, signal, effect } from '@angular/core';
import { CanvasEngineService, SelectedType } from './canvas-engine.service';

export type ToolTabType = 'image' | 'text' | 'template' | 'filter' | 'layer';

@Injectable({
  providedIn: 'root',
})
export class StudioStateService {
  readonly projectTitle = signal<string>('Dự án Khẩu hiệu Mới');
  readonly activeToolTab = signal<ToolTabType>('image');
  readonly isExportModalOpen = signal<boolean>(false);
  readonly isShortcutsModalOpen = signal<boolean>(false);
  readonly isDirty = signal<boolean>(false);

  readonly selectedLayerId = signal<string | null>(null);
  readonly selectedLayerType = signal<SelectedType>('canvas');

  constructor(private canvasEngine: CanvasEngineService) {
    // Tự động đồng bộ trạng thái layer đang chọn từ CanvasEngine sang StudioState
    effect(() => {
      const type = this.canvasEngine.selectedLayerType();
      const id = this.canvasEngine.selectedLayerId();
      this.selectedLayerType.set(type);
      this.selectedLayerId.set(id);

      // Nếu người dùng chọn vào Textbox trên Canvas, tự động mở Tab Inspector tương ứng
      if (type === 'text') {
        this.activeToolTab.set('text');
      }
    });
  }

  setProjectTitle(title: string): void {
    this.projectTitle.set(title.trim() || 'Dự án Khẩu hiệu Mới');
    this.markDirty();
  }

  setActiveToolTab(tab: ToolTabType): void {
    this.activeToolTab.set(tab);
  }

  openExportModal(): void {
    this.isExportModalOpen.set(true);
  }

  closeExportModal(): void {
    this.isExportModalOpen.set(false);
  }

  openShortcutsModal(): void {
    this.isShortcutsModalOpen.set(true);
  }

  closeShortcutsModal(): void {
    this.isShortcutsModalOpen.set(false);
  }

  markDirty(dirty = true): void {
    this.isDirty.set(dirty);
  }
}
