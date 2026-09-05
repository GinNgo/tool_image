import { Component, inject, computed } from '@angular/core';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { FontService } from '../../services/font.service';
import { TextEffectType } from '../../models/template.model';

@Component({
  selector: 'app-top-toolbar',
  standalone: true,
  template: `
    <header class="studio-toolbar">
      <!-- Left: Quick Insert Text Box (PowerPoint-style) -->
      <div class="toolbar-group">
        <button
          class="btn-add-box"
          (click)="onInsertTextBox()"
          title="Thêm hộp chữ mới vào ảnh (giống PowerPoint)"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>+ Thêm hộp chữ</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      @if (activeBlock(); as block) {
        <!-- Font family & Size Stepper -->
        <div class="toolbar-group">
          <div class="select-wrapper">
            <select
              class="font-select"
              [value]="block.fontFamily"
              (change)="onFontChange($event)"
              title="Chọn phông chữ tiếng Việt"
            >
              @for (preset of fontService.getPresets(); track preset.id) {
                <option [value]="preset.fontFamily">{{ preset.name }} ({{ preset.category }})</option>
              }
            </select>
          </div>

          <div class="stepper-group" title="Cỡ chữ">
            <button class="tool-btn square-btn" (click)="adjustFontSize(-2)" title="Giảm cỡ chữ" type="button">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="stepper-val">{{ block.fontSize }}</span>
            <button class="tool-btn square-btn" (click)="adjustFontSize(2)" title="Tăng cỡ chữ" type="button">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Typography Formats: Bold, Italic, Uppercase -->
        <div class="toolbar-group">
          <button
            class="tool-btn"
            [class.active]="block.bold"
            (click)="toggleBold()"
            title="In đậm (Bold)"
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            class="tool-btn italic-text"
            [class.active]="block.italic"
            (click)="toggleItalic()"
            title="In nghiêng (Italic)"
            type="button"
          >
            <em>I</em>
          </button>
          <button
            class="tool-btn"
            [class.active]="block.uppercase"
            (click)="toggleUppercase()"
            title="Chữ hoa toàn bộ (UPPERCASE)"
            type="button"
          >
            aA
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Alignment -->
        <div class="toolbar-group">
          <button
            class="tool-btn"
            [class.active]="block.align === 'left'"
            (click)="setAlignment('left')"
            title="Căn trái"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button
            class="tool-btn"
            [class.active]="block.align === 'center'"
            (click)="setAlignment('center')"
            title="Căn giữa"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </button>
          <button
            class="tool-btn"
            [class.active]="block.align === 'right'"
            (click)="setAlignment('right')"
            title="Căn phải"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Color Mode & Swatches -->
        <div class="toolbar-group">
          <button
            class="tool-btn mode-btn"
            [class.active]="block.colorMode === 'auto'"
            (click)="setColorMode('auto')"
            title="Tự động tương phản màu nền"
            type="button"
          >
            Tự động
          </button>

          <label class="color-picker-label" [class.disabled]="block.colorMode === 'auto'" title="Chọn màu chữ tùy biến">
            <span class="color-preview" [style.background-color]="block.color || '#ffffff'"></span>
            <input
              type="color"
              class="hidden-color-input"
              [value]="block.color || '#ffffff'"
              [disabled]="block.colorMode === 'auto'"
              (change)="onCustomColorChange($event)"
            />
          </label>

          <div class="preset-colors">
            @for (c of presetColors; track c) {
              <button
                type="button"
                class="color-dot"
                [style.background-color]="c"
                [class.selected]="block.colorMode === 'custom' && block.color === c"
                (click)="setCustomColor(c)"
              ></button>
            }
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Photoshop-grade Layer Effects -->
        <div class="toolbar-group">
          <span class="group-label">Hiệu ứng:</span>
          <select
            class="effect-select"
            [value]="block.effect || 'none'"
            (change)="onEffectChange($event)"
            title="Hiệu ứng chữ Photoshop (Đổ bóng, Viền nét, Phát sáng)"
          >
            <option value="none">Chuẩn (Không)</option>
            <option value="shadow">Đổ bóng Photoshop</option>
            <option value="deep-shadow">Bóng sâu 3D</option>
            <option value="stroke">Viền nét tương phản</option>
            <option value="glow">Phát sáng (Glow)</option>
            <option value="background">Băng rôn (Ribbon)</option>
          </select>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Position Controls & Reset -->
        <div class="toolbar-group ml-auto">
          <button
            class="tool-btn action-text-btn"
            (click)="centerHorizontally()"
            title="Gióng chữ vào chính giữa chiều ngang ảnh"
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="3"/><line x1="20" y1="21" x2="20" y2="3"/><line x1="14" y1="12" x2="10" y2="12"/></svg>
            Gióng giữa
          </button>

          <button
            class="tool-btn action-text-btn"
            (click)="resetPosition()"
            title="Khôi phục vị trí mặc định"
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Vị trí mẫu
          </button>
        </div>
      } @else {
        <div class="no-selection-hint">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Nhấp đúp chuột vào chữ trên ảnh để sửa trực tiếp hoặc nhấn <strong>"+ Thêm hộp chữ"</strong>
        </div>
      }
    </header>
  `,
  styles: `
    .studio-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      height: 44px;
      color: #f8fafc;
      user-select: none;
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .btn-add-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: 1px solid #3b82f6;
      border-radius: 6px;
      padding: 5px 11px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.4);
      transition: all 150ms ease;

      &:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.6);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .toolbar-divider {
      width: 1px;
      height: 18px;
      background: #334155;
      margin: 0 2px;
      flex-shrink: 0;
    }

    .select-wrapper {
      position: relative;
    }

    .font-select,
    .effect-select {
      background: #0f172a;
      color: #f1f5f9;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 0.8rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      max-width: 155px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      transition: all 150ms ease;

      &:hover {
        border-color: #3b82f6;
      }
      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }
    }

    .stepper-group {
      display: flex;
      align-items: center;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      overflow: hidden;
      height: 28px;
    }

    .stepper-val {
      min-width: 28px;
      text-align: center;
      font-size: 0.78rem;
      font-weight: 700;
      color: #f8fafc;
      padding: 0 2px;
    }

    .tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: transparent;
      border: 1px solid transparent;
      color: #94a3b8;
      border-radius: 6px;
      padding: 2px 6px;
      height: 28px;
      min-width: 28px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        background: #334155;
        color: #f8fafc;
      }

      &.active {
        background: #2563eb;
        color: #ffffff;
      }

      &.square-btn {
        height: 26px;
        min-width: 24px;
        padding: 0;
      }

      &.action-text-btn {
        font-size: 0.76rem;
        background: #0f172a;
        border-color: #334155;
        padding: 3px 8px;
        color: #cbd5e1;

        &:hover {
          background: #334155;
          color: #ffffff;
        }
      }

      &.mode-btn {
        font-size: 0.74rem;
        padding: 3px 6px;
        border: 1px solid #334155;
        background: #0f172a;
      }
    }

    .italic-text {
      font-family: Georgia, serif;
    }

    .color-picker-label {
      position: relative;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 2px;
      border: 1px solid #475569;
      border-radius: 5px;
      background: #0f172a;

      &.disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }

    .color-preview {
      width: 18px;
      height: 18px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hidden-color-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .preset-colors {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: transform 150ms ease;

      &:hover {
        transform: scale(1.2);
      }

      &.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
      }
    }

    .group-label {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 700;
    }

    .ml-auto {
      margin-left: auto;
    }

    .no-selection-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: #94a3b8;

      strong {
        color: #60a5fa;
      }
    }
  `,
})
export class TopToolbarComponent {
  protected readonly editorState = inject(EditorStateService);
  private readonly canvasService = inject(CanvasService);
  protected readonly fontService = inject(FontService);

  readonly activeBlock = computed(() => this.editorState.activeBlock());

  readonly presetColors = ['#ffffff', '#ffeb3b', '#ef4444', '#10b981', '#06b6d4', '#000000'];

  onInsertTextBox(): void {
    const newBlock = this.editorState.addCustomTextBlock('custom', 'Hộp chữ', 'Nhập tiêu đề hoặc nội dung...', 40);
    if (newBlock) {
      this.canvasService.renderTextBlock(newBlock);
      this.canvasService.selectTextBlock(newBlock.id);
    }
  }

  onFontChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    const block = this.activeBlock();
    if (!block) return;
    this.editorState.updateBlockFont(block.id, target.value);
    this.syncBlockToCanvas(block.id, { fontFamily: target.value });
  }

  adjustFontSize(delta: number): void {
    const block = this.activeBlock();
    if (!block) return;
    const newSize = Math.max(block.minFontSize, Math.min(block.maxFontSize, block.fontSize + delta));
    this.editorState.updateBlockFontSize(block.id, newSize);
    this.syncBlockToCanvas(block.id, { fontSize: newSize });
  }

  toggleBold(): void {
    const block = this.activeBlock();
    if (!block) return;
    const bold = !block.bold;
    this.editorState.updateBlockFormat(block.id, { bold });
    this.syncBlockToCanvas(block.id, { bold });
  }

  toggleItalic(): void {
    const block = this.activeBlock();
    if (!block) return;
    const italic = !block.italic;
    this.editorState.updateBlockFormat(block.id, { italic });
    this.syncBlockToCanvas(block.id, { italic });
  }

  toggleUppercase(): void {
    const block = this.activeBlock();
    if (!block) return;
    const uppercase = !block.uppercase;
    this.editorState.updateBlockFormat(block.id, { uppercase });
    this.syncBlockToCanvas(block.id, { uppercase });
  }

  setAlignment(align: 'left' | 'center' | 'right'): void {
    const block = this.activeBlock();
    if (!block) return;
    this.editorState.updateBlockFormat(block.id, { align });
    this.syncBlockToCanvas(block.id, { align });
  }

  setColorMode(mode: 'auto' | 'custom'): void {
    const block = this.activeBlock();
    if (!block) return;
    this.editorState.updateBlockFormat(block.id, { colorMode: mode });
    this.syncBlockToCanvas(block.id, { colorMode: mode });
  }

  setCustomColor(color: string): void {
    const block = this.activeBlock();
    if (!block) return;
    this.editorState.updateBlockFormat(block.id, { colorMode: 'custom', color });
    this.syncBlockToCanvas(block.id, { colorMode: 'custom', color });
  }

  onCustomColorChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.setCustomColor(target.value);
  }

  onEffectChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    const block = this.activeBlock();
    if (!block) return;
    const effect = target.value as TextEffectType;
    this.editorState.updateBlockFormat(block.id, { effect });
    this.syncBlockToCanvas(block.id, { effect });
  }

  centerHorizontally(): void {
    const block = this.activeBlock();
    if (!block) return;
    this.canvasService.centerHorizontally(block.id);
    const tb = this.canvasService.getTextbox(block.id);
    if (tb) {
      this.editorState.updateBlockPosition(block.id, tb.left!, tb.top!);
    }
  }

  resetPosition(): void {
    const block = this.activeBlock();
    if (!block) return;
    this.canvasService.resetBlockPosition(block);
    const tb = this.canvasService.getTextbox(block.id);
    if (tb) {
      this.editorState.updateBlockPosition(block.id, tb.left!, tb.top!);
      this.editorState.updateBlockFontSize(block.id, tb.fontSize || block.maxFontSize);
    }
  }

  private syncBlockToCanvas(id: string, updates: Partial<any>): void {
    const updated = this.editorState.textBlocks().find((b) => b.id === id);
    if (updated) {
      this.canvasService.updateTextBlock(updated);
    }
  }
}
