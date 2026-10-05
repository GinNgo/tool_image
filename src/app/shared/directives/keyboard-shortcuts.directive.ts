import { Directive, HostListener } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { StudioStateService } from '../../services/studio-state.service';

@Directive({
  selector: '[appKeyboardShortcuts]',
  standalone: true,
})
export class KeyboardShortcutsDirective {
  constructor(
    private historyService: HistoryService,
    private canvasEngine: CanvasEngineService,
    private studioState: StudioStateService,
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isEditingText =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.classList.contains('canvas-container');

    const isCtrlOrMeta = event.ctrlKey || event.metaKey;

    // 1. Undo: Ctrl + Z
    if (isCtrlOrMeta && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (!isEditingText) {
        event.preventDefault();
        this.historyService.undo();
        return;
      }
    }

    // 2. Redo: Ctrl + Y hoặc Ctrl + Shift + Z
    if (
      (isCtrlOrMeta && event.key.toLowerCase() === 'y') ||
      (isCtrlOrMeta && event.shiftKey && event.key.toLowerCase() === 'z')
    ) {
      if (!isEditingText) {
        event.preventDefault();
        this.historyService.redo();
        return;
      }
    }

    // 3. Delete / Backspace: Xóa lớp đang chọn (khi không trong chế độ gõ chữ)
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isEditingText) {
      const active = this.canvasEngine.selectedObject();
      if (active) {
        event.preventDefault();
        this.canvasEngine.deleteSelectedObject();
        this.studioState.markDirty();
        return;
      }
    }

    // 4. Phím Mũi tên: Di chuyển đối tượng 1px (hoặc 10px với Shift)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) && !isEditingText) {
      const active = this.canvasEngine.selectedObject();
      if (active) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        switch (event.key) {
          case 'ArrowUp':
            active.set('top', (active.top || 0) - step);
            break;
          case 'ArrowDown':
            active.set('top', (active.top || 0) + step);
            break;
          case 'ArrowLeft':
            active.set('left', (active.left || 0) - step);
            break;
          case 'ArrowRight':
            active.set('left', (active.left || 0) + step);
            break;
        }
        active.setCoords();
        this.canvasEngine.renderAll();
        return;
      }
    }
  }
}
