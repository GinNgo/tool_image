import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { StudioStateService } from '../../services/studio-state.service';

export interface DisplayLayer {
  object: fabric.FabricObject;
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer-panel p-3 flex flex-col gap-3 text-xs text-zinc-300 select-none">
      <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span class="font-semibold text-zinc-100 flex items-center gap-1.5">
          <span>📑</span>
          <span>Quản lý Lớp (Layers)</span>
        </span>
        <span class="text-[11px] text-zinc-500 font-mono">{{ getLayers().length }} lớp</span>
      </div>

      <!-- Action buttons for selected layer -->
      @if (canvasEngine.selectedObject(); as selected) {
        <div class="flex items-center gap-1 p-1 bg-zinc-800/80 rounded border border-zinc-700">
          <button
            type="button"
            (click)="onBringToFront(selected)"
            title="Lên trên cùng"
            class="p-1 hover:bg-zinc-700 rounded text-zinc-300"
          >
            ⏫
          </button>
          <button
            type="button"
            (click)="onBringForward(selected)"
            title="Lên một bậc"
            class="p-1 hover:bg-zinc-700 rounded text-zinc-300"
          >
            🔼
          </button>
          <button
            type="button"
            (click)="onSendBackwards(selected)"
            title="Xuống một bậc"
            class="p-1 hover:bg-zinc-700 rounded text-zinc-300"
          >
            🔽
          </button>
          <button
            type="button"
            (click)="onSendToBack(selected)"
            title="Xuống dưới cùng"
            class="p-1 hover:bg-zinc-700 rounded text-zinc-300"
          >
            ⏬
          </button>
          <div class="h-3 w-px bg-zinc-600 mx-1"></div>
          <button
            type="button"
            (click)="onDelete(selected)"
            title="Xóa lớp này"
            class="p-1 hover:bg-red-500/20 text-red-400 rounded ml-auto"
          >
            🗑️
          </button>
        </div>
      }

      <!-- Layers List (Top to Bottom) -->
      <div class="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-0.5">
        @for (layer of getLayers(); track layer.id) {
          <div
            (click)="onSelectLayer(layer.object)"
            [class.bg-blue-600/20]="layer.isSelected"
            [class.border-blue-500/40]="layer.isSelected"
            [class.bg-zinc-800/40]="!layer.isSelected"
            [class.border-zinc-800]="!layer.isSelected"
            class="flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer hover:bg-zinc-800"
          >
            <div class="flex items-center gap-2 truncate">
              <span>{{ getLayerIcon(layer.type) }}</span>
              <span class="truncate font-medium text-zinc-200 text-[11px]">{{ layer.name }}</span>
            </div>

            <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
              <!-- Visibility Toggle -->
              <button
                type="button"
                (click)="onToggleVisibility(layer.object)"
                title="Ẩn/Hiện lớp"
                class="text-xs hover:text-white"
              >
                {{ layer.visible ? '👁️' : '🕶️' }}
              </button>

              <!-- Lock Toggle -->
              <button
                type="button"
                (click)="onToggleLock(layer.object)"
                title="Khóa/Mở khóa"
                class="text-xs hover:text-white"
              >
                {{ layer.locked ? '🔒' : '🔓' }}
              </button>
            </div>
          </div>
        } @empty {
          <div class="p-6 text-center text-zinc-500 text-[11px]">Chưa có lớp nào trên khung vẽ</div>
        }
      </div>
    </div>
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
export class LayerPanelComponent {
  constructor(
    public canvasEngine: CanvasEngineService,
    private studioState: StudioStateService,
  ) {}

  getLayers(): DisplayLayer[] {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return [];

    const selectedObj = this.canvasEngine.selectedObject();
    const objects = canvas.getObjects();

    const result: DisplayLayer[] = [];

    objects.forEach((obj, idx) => {
      if (
        (obj as any).excludeFromExport ||
        (obj as any).isRibbonCompanion ||
        (obj as any).isDimmerOverlay
      ) {
        return;
      }

      const isBg = (obj as any).isBackgroundImage;
      const type = isBg ? 'image' : obj.type || 'layer';
      const name = isBg
        ? 'Ảnh nền (Background)'
        : (obj as any).layerName || (obj as any).text || `Lớp ${idx + 1}`;

      result.push({
        object: obj,
        id: (obj as any).layerId || 'layer-' + idx,
        name,
        type,
        visible: obj.visible !== false,
        locked: !obj.selectable,
        isSelected: obj === selectedObj,
      });
    });

    // Hiển thị lớp trên cùng ở đầu danh sách
    return result.reverse();
  }

  getLayerIcon(type: string): string {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'textbox':
      case 'text':
        return '🔤';
      case 'rect':
      case 'shape':
        return '🟦';
      default:
        return '📄';
    }
  }

  onSelectLayer(obj: fabric.FabricObject): void {
    this.canvasEngine.selectObject(obj);
  }

  onToggleVisibility(obj: fabric.FabricObject): void {
    obj.set('visible', !obj.visible);
    const companion = (obj as any).companionObject as fabric.FabricObject | undefined;
    if (companion) {
      companion.set('visible', obj.visible);
    }
    this.canvasEngine.renderAll();
  }

  onToggleLock(obj: fabric.FabricObject): void {
    const isLocked = !obj.selectable;
    obj.set({
      selectable: isLocked,
      evented: isLocked,
    });
    this.canvasEngine.renderAll();
  }

  onBringToFront(obj: fabric.FabricObject): void {
    const canvas = this.canvasEngine.getCanvas();
    if (canvas) {
      canvas.bringObjectToFront(obj);
      this.canvasEngine.renderAll();
    }
  }

  onBringForward(obj: fabric.FabricObject): void {
    const canvas = this.canvasEngine.getCanvas();
    if (canvas) {
      canvas.bringObjectForward(obj);
      this.canvasEngine.renderAll();
    }
  }

  onSendBackwards(obj: fabric.FabricObject): void {
    const canvas = this.canvasEngine.getCanvas();
    if (canvas) {
      canvas.sendObjectBackwards(obj);
      this.canvasEngine.renderAll();
    }
  }

  onSendToBack(obj: fabric.FabricObject): void {
    const canvas = this.canvasEngine.getCanvas();
    if (canvas) {
      canvas.sendObjectToBack(obj);
      this.canvasEngine.renderAll();
    }
  }

  onDelete(obj: fabric.FabricObject): void {
    this.canvasEngine.deleteSelectedObject();
  }
}
