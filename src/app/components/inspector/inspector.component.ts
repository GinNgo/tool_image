import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { StudioStateService } from '../../services/studio-state.service';
import { TextInspectorComponent } from './text-inspector.component';
import { ImageInspectorComponent } from './image-inspector.component';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, TextInspectorComponent, ImageInspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="studio-inspector w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto select-none z-20"
    >
      @if (canvasEngine.selectedLayerType() === 'text') {
        <app-text-inspector />
      } @else if (
        canvasEngine.selectedLayerType() === 'image' ||
        studioState.activeToolTab() === 'filter' ||
        studioState.activeToolTab() === 'image'
      ) {
        <app-image-inspector />
      } @else {
        <!-- Canvas General Inspector -->
        <div class="p-4 flex flex-col gap-4 text-xs text-zinc-300">
          <div
            class="pb-2 border-b border-zinc-800 font-semibold text-zinc-100 flex items-center gap-1.5"
          >
            <span>⚙️</span>
            <span>Cấu hình Khung vẽ Canvas</span>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-[11px] text-zinc-400">Kích thước khung vẽ thực</span>
            <div
              class="p-2.5 rounded bg-zinc-800/60 border border-zinc-700/60 font-mono text-zinc-200 text-center text-sm font-semibold"
            >
              {{ canvasEngine.canvasConfig().width }} × {{ canvasEngine.canvasConfig().height }} px
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-[11px] text-zinc-400">Tỷ lệ hiện tại</span>
            <div class="p-2 rounded bg-zinc-800/40 text-zinc-300 capitalize">
              {{ canvasEngine.canvasConfig().aspectRatio }}
            </div>
          </div>

          <div
            class="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-300/80 leading-relaxed text-[11px]"
          >
            💡 <strong>Mẹo:</strong> Nhấp vào hộp chữ hoặc ảnh nền trên vùng vẽ để kích hoạt bảng
            điều khiển chi tiết tương ứng.
          </div>
        </div>
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class InspectorComponent {
  constructor(
    public canvasEngine: CanvasEngineService,
    public studioState: StudioStateService,
  ) {}
}
