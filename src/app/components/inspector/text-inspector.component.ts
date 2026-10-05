import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { TypographyService } from '../../services/typography.service';
import { OFFLINE_FONTS } from '../../models/typography.model';

@Component({
  selector: 'app-text-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-inspector p-4 flex flex-col gap-4 text-xs text-zinc-300">
      <!-- Section: Header with Smart Contrast -->
      <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span class="font-semibold text-zinc-100 flex items-center gap-1.5">
          <span>🔤</span>
          <span>Thuộc tính Chữ</span>
        </span>
        <button
          type="button"
          (click)="onAutoContrast()"
          title="Tự động chọn màu tương phản tối ưu với nền ảnh"
          class="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
        >
          <span>✨</span>
          <span>Tương phản</span>
        </button>
      </div>

      <!-- Typography: Font & Size -->
      <div class="flex flex-col gap-2">
        <label class="text-[11px] text-zinc-400">Phông chữ Việt hóa</label>
        <select
          [ngModel]="currentFontFamily"
          (ngModelChange)="onFontChange($event)"
          class="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none cursor-pointer"
        >
          @for (f of fonts; track f.id) {
            <option [value]="f.name">{{ f.name }} ({{ f.category }})</option>
          }
        </select>
      </div>

      <!-- Size & Color -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-zinc-400">Cỡ chữ (px)</label>
          <div class="flex items-center bg-zinc-800 border border-zinc-700 rounded overflow-hidden">
            <button
              type="button"
              (click)="onFontSizeStep(-4)"
              class="px-2 py-1 hover:bg-zinc-700 text-zinc-300 font-bold"
            >
              −
            </button>
            <input
              type="number"
              [ngModel]="currentFontSize"
              (ngModelChange)="onFontSizeChange($event)"
              class="w-full bg-transparent text-center text-zinc-100 outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              (click)="onFontSizeStep(4)"
              class="px-2 py-1 hover:bg-zinc-700 text-zinc-300 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-zinc-400">Màu chữ</label>
          <div class="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded p-1">
            <input
              type="color"
              [ngModel]="currentColor"
              (ngModelChange)="onColorChange($event)"
              class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <input
              type="text"
              [ngModel]="currentColor"
              (ngModelChange)="onColorChange($event)"
              class="w-full bg-transparent text-[11px] text-zinc-200 outline-none uppercase font-mono"
            />
          </div>
        </div>
      </div>

      <!-- Styles & Alignment -->
      <div
        class="flex items-center justify-between bg-zinc-800/60 p-1.5 rounded-lg border border-zinc-800"
      >
        <!-- Formatting -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="onToggleBold()"
            [class.bg-zinc-700]="isBold"
            [class.text-blue-400]="isBold"
            class="w-7 h-7 flex items-center justify-center rounded font-bold hover:bg-zinc-700 transition-colors"
            title="In đậm (Bold)"
          >
            B
          </button>
          <button
            type="button"
            (click)="onToggleItalic()"
            [class.bg-zinc-700]="isItalic"
            [class.text-blue-400]="isItalic"
            class="w-7 h-7 flex items-center justify-center rounded italic hover:bg-zinc-700 transition-colors"
            title="In nghiêng (Italic)"
          >
            I
          </button>
          <button
            type="button"
            (click)="onToggleUnderline()"
            [class.bg-zinc-700]="isUnderline"
            [class.text-blue-400]="isUnderline"
            class="w-7 h-7 flex items-center justify-center rounded underline hover:bg-zinc-700 transition-colors"
            title="Gạch chân (Underline)"
          >
            U
          </button>
        </div>

        <div class="h-4 w-px bg-zinc-700"></div>

        <!-- Align -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="onAlignChange('left')"
            [class.bg-zinc-700]="currentAlign === 'left'"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700"
            title="Căn trái"
          >
            ⇤
          </button>
          <button
            type="button"
            (click)="onAlignChange('center')"
            [class.bg-zinc-700]="currentAlign === 'center'"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700"
            title="Căn giữa"
          >
            ≡
          </button>
          <button
            type="button"
            (click)="onAlignChange('right')"
            [class.bg-zinc-700]="currentAlign === 'right'"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700"
            title="Căn phải"
          >
            ⇥
          </button>
        </div>
      </div>

      <!-- SECTION: Dải Nền Chữ (Text Ribbon Highlight) -->
      <div class="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800">
        <div class="flex items-center justify-between">
          <span class="font-medium text-zinc-200 flex items-center gap-1">
            <span>🏷️</span>
            <span>Dải nền chữ (Ribbon)</span>
          </span>
          <input
            type="checkbox"
            [ngModel]="ribbonEnabled"
            (ngModelChange)="onToggleRibbon($event)"
            class="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        @if (ribbonEnabled) {
          <div class="flex flex-col gap-2 pt-2 border-t border-zinc-700/50">
            <!-- Ribbon Color & Opacity -->
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center gap-1.5 bg-zinc-800 rounded p-1 border border-zinc-700">
                <input
                  type="color"
                  [ngModel]="ribbonColor"
                  (ngModelChange)="onRibbonColorChange($event)"
                  class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span class="text-[11px] font-mono uppercase">{{ ribbonColor }}</span>
              </div>

              <div class="flex flex-col justify-center">
                <div class="flex justify-between text-[10px] text-zinc-400">
                  <span>Độ mờ</span>
                  <span>{{ ribbonOpacity }}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  [ngModel]="ribbonOpacity"
                  (ngModelChange)="onRibbonOpacityChange($event)"
                  class="w-full accent-blue-500 cursor-pointer h-1"
                />
              </div>
            </div>

            <!-- Border radius slider -->
            <div class="flex flex-col gap-1">
              <div class="flex justify-between text-[10px] text-zinc-400">
                <span>Bo góc</span>
                <span>{{ ribbonBorderRadius }}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                [ngModel]="ribbonBorderRadius"
                (ngModelChange)="onRibbonRadiusChange($event)"
                class="w-full accent-blue-500 cursor-pointer h-1"
              />
            </div>
          </div>
        }
      </div>

      <!-- SECTION: Viền Chữ (Stroke) -->
      <div class="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800">
        <div class="flex items-center justify-between">
          <span class="font-medium text-zinc-200">Viền chữ (Stroke)</span>
          <input
            type="checkbox"
            [ngModel]="strokeEnabled"
            (ngModelChange)="onToggleStroke($event)"
            class="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        @if (strokeEnabled) {
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-700/50">
            <input
              type="color"
              [ngModel]="strokeColor"
              (ngModelChange)="onStrokeColorChange($event)"
              class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between text-[10px] text-zinc-400">
                <span>Độ dày</span>
                <span>{{ strokeWidth }}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                [ngModel]="strokeWidth"
                (ngModelChange)="onStrokeWidthChange($event)"
                class="w-full accent-blue-500 cursor-pointer h-1"
              />
            </div>
          </div>
        }
      </div>

      <!-- SECTION: Bóng Đổ (Shadow) -->
      <div class="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800">
        <div class="flex items-center justify-between">
          <span class="font-medium text-zinc-200">Bóng đổ (Shadow)</span>
          <input
            type="checkbox"
            [ngModel]="shadowEnabled"
            (ngModelChange)="onToggleShadow($event)"
            class="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        @if (shadowEnabled) {
          <div class="flex flex-col gap-2 pt-2 border-t border-zinc-700/50">
            <div class="flex justify-between text-[10px] text-zinc-400">
              <span>Độ nhòe (Blur)</span>
              <span>{{ shadowBlur }}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              [ngModel]="shadowBlur"
              (ngModelChange)="onShadowBlurChange($event)"
              class="w-full accent-blue-500 cursor-pointer h-1"
            />
          </div>
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
export class TextInspectorComponent {
  readonly fonts = OFFLINE_FONTS;

  constructor(
    private canvasEngine: CanvasEngineService,
    private typographyService: TypographyService,
  ) {}

  get activeTextbox(): fabric.Textbox | null {
    const obj = this.canvasEngine.selectedObject();
    if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
      return obj as fabric.Textbox;
    }
    return null;
  }

  get currentFontFamily(): string {
    return this.activeTextbox?.fontFamily || 'Montserrat';
  }

  get currentFontSize(): number {
    return this.activeTextbox?.fontSize || 48;
  }

  get currentColor(): string {
    return (this.activeTextbox?.fill as string) || '#FFFFFF';
  }

  get isBold(): boolean {
    return this.activeTextbox?.fontWeight === 'bold' || this.activeTextbox?.fontWeight === '700';
  }

  get isItalic(): boolean {
    return this.activeTextbox?.fontStyle === 'italic';
  }

  get isUnderline(): boolean {
    return !!this.activeTextbox?.underline;
  }

  get currentAlign(): string {
    return this.activeTextbox?.textAlign || 'center';
  }

  get ribbonEnabled(): boolean {
    const ribbon = (this.activeTextbox as any)?.ribbonConfig;
    return !!ribbon?.enabled;
  }

  get ribbonColor(): string {
    return (this.activeTextbox as any)?.ribbonConfig?.backgroundColor || '#DC2626';
  }

  get ribbonOpacity(): number {
    return (this.activeTextbox as any)?.ribbonConfig?.opacity ?? 90;
  }

  get ribbonBorderRadius(): number {
    return (this.activeTextbox as any)?.ribbonConfig?.borderRadius ?? 6;
  }

  get strokeEnabled(): boolean {
    return !!(this.activeTextbox as any)?.strokeConfig?.enabled;
  }

  get strokeColor(): string {
    return (this.activeTextbox as any)?.strokeConfig?.color || '#000000';
  }

  get strokeWidth(): number {
    return (this.activeTextbox as any)?.strokeConfig?.width || 2;
  }

  get shadowEnabled(): boolean {
    return !!(this.activeTextbox as any)?.shadowConfig?.enabled;
  }

  get shadowBlur(): number {
    return (this.activeTextbox as any)?.shadowConfig?.blur ?? 8;
  }

  onFontChange(font: string): void {
    if (this.activeTextbox) {
      this.typographyService.setFontFamily(this.activeTextbox, font);
    }
  }

  onFontSizeChange(size: number): void {
    if (this.activeTextbox && size > 4) {
      this.typographyService.setFontSize(this.activeTextbox, size);
    }
  }

  onFontSizeStep(step: number): void {
    if (this.activeTextbox) {
      const next = Math.max(8, (this.activeTextbox.fontSize || 48) + step);
      this.typographyService.setFontSize(this.activeTextbox, next);
    }
  }

  onColorChange(color: string): void {
    if (this.activeTextbox) {
      this.typographyService.setColor(this.activeTextbox, color);
    }
  }

  onToggleBold(): void {
    if (this.activeTextbox) {
      this.typographyService.setBold(this.activeTextbox, !this.isBold);
    }
  }

  onToggleItalic(): void {
    if (this.activeTextbox) {
      this.typographyService.setItalic(this.activeTextbox, !this.isItalic);
    }
  }

  onToggleUnderline(): void {
    if (this.activeTextbox) {
      this.typographyService.setUnderline(this.activeTextbox, !this.isUnderline);
    }
  }

  onAlignChange(align: 'left' | 'center' | 'right'): void {
    if (this.activeTextbox) {
      this.typographyService.setAlign(this.activeTextbox, align);
    }
  }

  onToggleRibbon(enabled: boolean): void {
    if (this.activeTextbox) {
      const current = (this.activeTextbox as any).ribbonConfig || {};
      this.typographyService.applyRibbonHighlight(this.activeTextbox, {
        ...current,
        enabled,
        backgroundColor: current.backgroundColor || '#DC2626',
        opacity: current.opacity ?? 90,
        borderRadius: current.borderRadius ?? 6,
      });
    }
  }

  onRibbonColorChange(color: string): void {
    if (this.activeTextbox) {
      const current = (this.activeTextbox as any).ribbonConfig || {};
      this.typographyService.applyRibbonHighlight(this.activeTextbox, {
        ...current,
        backgroundColor: color,
      });
    }
  }

  onRibbonOpacityChange(opacity: number): void {
    if (this.activeTextbox) {
      const current = (this.activeTextbox as any).ribbonConfig || {};
      this.typographyService.applyRibbonHighlight(this.activeTextbox, {
        ...current,
        opacity,
      });
    }
  }

  onRibbonRadiusChange(borderRadius: number): void {
    if (this.activeTextbox) {
      const current = (this.activeTextbox as any).ribbonConfig || {};
      this.typographyService.applyRibbonHighlight(this.activeTextbox, {
        ...current,
        borderRadius,
      });
    }
  }

  onToggleStroke(enabled: boolean): void {
    if (this.activeTextbox) {
      this.typographyService.setStroke(
        this.activeTextbox,
        this.strokeColor,
        enabled ? this.strokeWidth || 2 : 0,
      );
    }
  }

  onStrokeColorChange(color: string): void {
    if (this.activeTextbox) {
      this.typographyService.setStroke(this.activeTextbox, color, this.strokeWidth);
    }
  }

  onStrokeWidthChange(width: number): void {
    if (this.activeTextbox) {
      this.typographyService.setStroke(this.activeTextbox, this.strokeColor, width);
    }
  }

  onToggleShadow(enabled: boolean): void {
    if (this.activeTextbox) {
      this.typographyService.setShadow(
        this.activeTextbox,
        'rgba(0,0,0,0.7)',
        enabled ? this.shadowBlur : 0,
        2,
        4,
      );
    }
  }

  onShadowBlurChange(blur: number): void {
    if (this.activeTextbox) {
      this.typographyService.setShadow(this.activeTextbox, 'rgba(0,0,0,0.7)', blur, 2, 4);
    }
  }

  onAutoContrast(): void {
    if (this.activeTextbox) {
      const contrast = this.typographyService.suggestContrast(this.activeTextbox);
      this.typographyService.setColor(this.activeTextbox, contrast.textColor);
      const ribbon = (this.activeTextbox as any).ribbonConfig;
      if (ribbon && ribbon.enabled) {
        this.typographyService.applyRibbonHighlight(this.activeTextbox, {
          ...ribbon,
          backgroundColor: contrast.ribbonColor,
        });
      }
    }
  }
}
