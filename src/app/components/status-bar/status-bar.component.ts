import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { ViewportService } from '../../services/viewport.service';
import { StudioStateService } from '../../services/studio-state.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="studio-status-bar flex items-center justify-between px-3 h-7 bg-zinc-900 border-t border-zinc-800 text-[11px] text-zinc-400 select-none z-30"
    >
      <!-- Left: Real Pixel Dimensions -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 font-mono">
          <span class="text-zinc-500">Kích thước:</span>
          <span class="text-zinc-200"
            >{{ canvasEngine.canvasConfig().width }} ×
            {{ canvasEngine.canvasConfig().height }} px</span
          >
        </div>
        <div class="h-3 w-px bg-zinc-700"></div>
        <div class="flex items-center gap-1">
          <span class="text-zinc-500">Tỷ lệ:</span>
          <span class="text-zinc-300 font-medium capitalize">{{
            canvasEngine.canvasConfig().aspectRatio
          }}</span>
        </div>
      </div>

      <!-- Center: Status & Zoom -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <span class="text-zinc-500">Thu phóng:</span>
          <span class="font-mono text-zinc-300">{{ viewportService.zoomPercent() }}%</span>
        </div>
        @if (canvasEngine.selectedLayerType() !== 'canvas') {
          <div class="flex items-center gap-1 text-blue-400">
            <span>Đang chọn:</span>
            <span class="font-medium capitalize">{{ canvasEngine.selectedLayerType() }}</span>
          </div>
        }
      </div>

      <!-- Right: Shortcuts Help -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="studioState.openShortcutsModal()"
          class="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer text-zinc-400"
          title="Xem danh sách phím tắt"
        >
          <span>⌨️</span>
          <span>Phím tắt</span>
        </button>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class StatusBarComponent {
  constructor(
    public canvasEngine: CanvasEngineService,
    public viewportService: ViewportService,
    public studioState: StudioStateService,
  ) {}
}
