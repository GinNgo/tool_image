import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { LayerInfo } from '../../models/project.model';

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="layer-panel" *ngIf="editorState.layerPanelOpen()">
      <div class="panel-header">
        <h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Lớp (Layers)
        </h3>
        <button class="close-btn" (click)="editorState.toggleLayerPanel()" title="Đóng panel">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="layer-list">
        @for (layer of editorState.layers(); track layer.id) {
          <div
            class="layer-item"
            [class.active]="layer.isActive"
            [class.hidden-layer]="!layer.visible"
            [class.locked-layer]="layer.locked"
            (click)="onLayerClick(layer)"
          >
            <!-- Layer type icon -->
            <div class="layer-icon" [title]="layer.type === 'text' ? 'Văn bản' : 'Ảnh nền'">
              @if (layer.type === 'text') {
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              } @else {
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              }
            </div>

            <!-- Layer name (editable on double-click) -->
            <div class="layer-info" (dblclick)="startRename(layer)">
              @if (editingLayerId === layer.id) {
                <input
                  class="rename-input"
                  [value]="layer.name"
                  (blur)="finishRename(layer.id, $event)"
                  (keydown.enter)="finishRename(layer.id, $event)"
                  (keydown.escape)="cancelRename()"
                  #renameInput
                />
              } @else {
                <span class="layer-name" [title]="layer.name">{{ layer.name }}</span>
                <span class="layer-preview">{{ layer.preview }}</span>
              }
            </div>

            <!-- Layer controls -->
            <div class="layer-controls" (click)="$event.stopPropagation()">
              <!-- Visibility toggle -->
              <button
                class="ctrl-btn"
                [class.active]="layer.visible"
                (click)="toggleVisibility(layer)"
                [title]="layer.visible ? 'Ẩn lớp' : 'Hiện lớp'"
              >
                @if (layer.visible) {
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                } @else {
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                }
              </button>

              <!-- Lock toggle (only for text layers) -->
              @if (layer.type === 'text') {
                <button
                  class="ctrl-btn"
                  [class.active]="!layer.locked"
                  (click)="toggleLock(layer)"
                  [title]="layer.locked ? 'Mở khóa' : 'Khóa lớp'"
                >
                  @if (layer.locked) {
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  } @else {
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  }
                </button>
              }

              <!-- Reorder buttons (only for text layers) -->
              @if (layer.type === 'text') {
                <button class="ctrl-btn" (click)="moveUp(layer)" title="Đưa lên trên">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button class="ctrl-btn" (click)="moveDown(layer)" title="Đưa xuống dưới">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              }

              <!-- Delete (only for text layers) -->
              @if (layer.type === 'text') {
                <button class="ctrl-btn delete-btn" (click)="deleteLayer(layer)" title="Xóa lớp">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              opacity="0.3"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Chưa có lớp nào</span>
            <span class="empty-hint">Thêm hộp chữ hoặc ảnh nền để bắt đầu</span>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      .layer-panel {
        width: 260px;
        height: 100%;
        background: var(--color-panel-surface);
        color: var(--color-text-light);
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--color-dark-border);
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      }

      .panel-header {
        padding: 16px 16px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-dark-border);
      }
      .panel-header h3 {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .close-btn:hover {
        background: #334155;
        color: #f8fafc;
      }

      .layer-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      .layer-list::-webkit-scrollbar {
        width: 5px;
      }
      .layer-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .layer-list::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 10px;
      }

      .layer-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
        border: 1px solid transparent;
        margin-bottom: 2px;
      }
      .layer-item:hover {
        background: #1e293b;
        border-color: #334155;
      }
      .layer-item.active {
        background: rgba(124, 58, 237, 0.15);
        border-color: #7c3aed;
      }
      .layer-item.hidden-layer {
        opacity: 0.4;
      }
      .layer-item.locked-layer .layer-info {
        opacity: 0.6;
      }

      .layer-icon {
        flex: 0 0 auto;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background: #0f172a;
      }
      .layer-item.active .layer-icon {
        color: #a78bfa;
        background: rgba(124, 58, 237, 0.2);
      }

      .layer-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .layer-name {
        font-size: 0.8rem;
        font-weight: 500;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .layer-preview {
        font-size: 0.7rem;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rename-input {
        background: #0f172a;
        border: 1px solid #7c3aed;
        color: #f8fafc;
        font-size: 0.8rem;
        padding: 2px 6px;
        border-radius: 4px;
        outline: none;
        width: 100%;
      }

      .layer-controls {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .layer-item:hover .layer-controls,
      .layer-item.active .layer-controls {
        opacity: 1;
      }

      .ctrl-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s;
      }
      .ctrl-btn:hover {
        background: #334155;
        color: #f8fafc;
      }
      .ctrl-btn.active {
        color: #38bdf8;
      }
      .ctrl-btn.delete-btn:hover {
        background: #dc2626;
        color: #ffffff;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 40px 20px;
        color: #475569;
        font-size: 0.85rem;
        text-align: center;
      }
      .empty-hint {
        font-size: 0.75rem;
        color: #334155;
      }
    `,
  ],
})
export class LayerPanelComponent {
  editingLayerId: string | null = null;

  constructor(
    public editorState: EditorStateService,
    private canvasService: CanvasService,
  ) {}

  onLayerClick(layer: LayerInfo): void {
    if (layer.type === 'text' && layer.visible && !layer.locked) {
      this.canvasService.selectLayerById(layer.id);
    }
  }

  toggleVisibility(layer: LayerInfo): void {
    this.canvasService.setLayerVisibility(layer.id, !layer.visible);
  }

  toggleLock(layer: LayerInfo): void {
    this.canvasService.setLayerLock(layer.id, !layer.locked);
  }

  moveUp(layer: LayerInfo): void {
    // Visual "up" in the list = higher z-index = 'up' direction in canvas
    this.canvasService.reorderLayers(layer.id, 'up');
  }

  moveDown(layer: LayerInfo): void {
    this.canvasService.reorderLayers(layer.id, 'down');
  }

  deleteLayer(layer: LayerInfo): void {
    this.canvasService.deleteLayerById(layer.id);
  }

  startRename(layer: LayerInfo): void {
    if (layer.type === 'background') return;
    this.editingLayerId = layer.id;
    // Focus the input after render
    setTimeout(() => {
      const input = document.querySelector('.rename-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  finishRename(layerId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    if (newName) {
      this.canvasService.renameLayer(layerId, newName);
    }
    this.editingLayerId = null;
  }

  cancelRename(): void {
    this.editingLayerId = null;
  }
}
