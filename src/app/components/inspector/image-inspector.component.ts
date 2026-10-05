import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageProcessingService } from '../../services/image-processing.service';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { DimmerGradientType } from '../../models/image-processing.model';

@Component({
  selector: 'app-image-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="image-inspector p-4 flex flex-col gap-4 text-xs text-zinc-300 select-none">
      <!-- Section: Header & Image Info -->
      <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span class="font-semibold text-zinc-100 flex items-center gap-1.5">
          <span>🖼️</span>
          <span>Thuộc tính Ảnh Nền</span>
        </span>
        @if (imageService.currentBackground(); as bg) {
          <span class="text-[11px] text-zinc-400 font-mono">
            {{ bg.originalWidth }} × {{ bg.originalHeight }}px
          </span>
        }
      </div>

      <!-- Action Buttons: Rotate & Flip -->
      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          (click)="imageService.rotateBackground(90)"
          class="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors text-[11px]"
          title="Xoay 90 độ"
        >
          <span>↻</span>
          <span>Xoay 90°</span>
        </button>

        <button
          type="button"
          (click)="imageService.flipBackground('x')"
          class="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors text-[11px]"
          title="Lật ngang ảnh"
        >
          <span>⇄</span>
          <span>Lật ngang</span>
        </button>

        <button
          type="button"
          (click)="imageService.flipBackground('y')"
          class="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors text-[11px]"
          title="Lật dọc ảnh"
        >
          <span>⇅</span>
          <span>Lật dọc</span>
        </button>
      </div>

      <!-- SECTION: Bộ Lọc Quang Học Phi Hủy Diệt -->
      <div class="flex flex-col gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
        <div class="flex items-center justify-between">
          <span class="font-medium text-zinc-200 flex items-center gap-1">
            <span>✨</span>
            <span>Bộ lọc Quang học</span>
          </span>
          <button
            type="button"
            (click)="imageService.resetAdjustments()"
            class="text-[10px] text-blue-400 hover:underline"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <!-- Độ sáng (Brightness) -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-[11px] text-zinc-400">
            <span>Độ sáng (Brightness)</span>
            <span class="font-mono">{{ imageService.adjustments().brightness }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="-100"
              max="100"
              [ngModel]="imageService.adjustments().brightness"
              (ngModelChange)="onAdjustmentChange('brightness', $event)"
              class="w-full accent-blue-500 cursor-pointer h-1"
            />
            <button
              type="button"
              (click)="onAdjustmentChange('brightness', 0)"
              title="Đặt lại 0"
              class="text-[10px] text-zinc-500 hover:text-zinc-300 w-4"
            >
              ↺
            </button>
          </div>
        </div>

        <!-- Độ tương phản (Contrast) -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-[11px] text-zinc-400">
            <span>Độ tương phản (Contrast)</span>
            <span class="font-mono">{{ imageService.adjustments().contrast }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="-100"
              max="100"
              [ngModel]="imageService.adjustments().contrast"
              (ngModelChange)="onAdjustmentChange('contrast', $event)"
              class="w-full accent-blue-500 cursor-pointer h-1"
            />
            <button
              type="button"
              (click)="onAdjustmentChange('contrast', 0)"
              title="Đặt lại 0"
              class="text-[10px] text-zinc-500 hover:text-zinc-300 w-4"
            >
              ↺
            </button>
          </div>
        </div>

        <!-- Độ bão hòa (Saturation) -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-[11px] text-zinc-400">
            <span>Độ bão hòa (Saturation)</span>
            <span class="font-mono">{{ imageService.adjustments().saturation }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="-100"
              max="100"
              [ngModel]="imageService.adjustments().saturation"
              (ngModelChange)="onAdjustmentChange('saturation', $event)"
              class="w-full accent-blue-500 cursor-pointer h-1"
            />
            <button
              type="button"
              (click)="onAdjustmentChange('saturation', 0)"
              title="Đặt lại 0"
              class="text-[10px] text-zinc-500 hover:text-zinc-300 w-4"
            >
              ↺
            </button>
          </div>
        </div>

        <!-- Làm mờ (Blur) -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-[11px] text-zinc-400">
            <span>Làm mờ nền (Blur)</span>
            <span class="font-mono">{{ imageService.adjustments().blur }}px</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              [ngModel]="imageService.adjustments().blur"
              (ngModelChange)="onAdjustmentChange('blur', $event)"
              class="w-full accent-blue-500 cursor-pointer h-1"
            />
            <button
              type="button"
              (click)="onAdjustmentChange('blur', 0)"
              title="Đặt lại 0"
              class="text-[10px] text-zinc-500 hover:text-zinc-300 w-4"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION: Lớp Phủ Làm Tối (Dimmer Overlay) -->
      <div class="flex flex-col gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
        <div class="flex items-center justify-between">
          <span class="font-medium text-zinc-200 flex items-center gap-1">
            <span>🌓</span>
            <span>Lớp Phủ Nền (Dimmer)</span>
          </span>
          <input
            type="checkbox"
            [ngModel]="imageService.dimmerConfig().enabled"
            (ngModelChange)="onDimmerToggle($event)"
            class="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>

        @if (imageService.dimmerConfig().enabled) {
          <div class="flex flex-col gap-2.5 pt-2 border-t border-zinc-700/50">
            <!-- Gradient Type -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] text-zinc-400">Kiểu phủ mờ</label>
              <select
                [ngModel]="imageService.dimmerConfig().type"
                (ngModelChange)="onDimmerTypeChange($event)"
                class="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none cursor-pointer"
              >
                <option value="bottom-to-top">Từ đáy lên (Đặt chữ ở dưới)</option>
                <option value="top-to-bottom">Từ đỉnh xuống</option>
                <option value="two-sided">Hai đầu trên dưới</option>
                <option value="solid">Phủ mờ toàn bộ</option>
              </select>
            </div>

            <!-- Color & Opacity -->
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center gap-1.5 bg-zinc-800 rounded p-1 border border-zinc-700">
                <input
                  type="color"
                  [ngModel]="imageService.dimmerConfig().color"
                  (ngModelChange)="onDimmerColorChange($event)"
                  class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span class="text-[11px] font-mono uppercase">{{
                  imageService.dimmerConfig().color
                }}</span>
              </div>

              <div class="flex flex-col justify-center">
                <div class="flex justify-between text-[10px] text-zinc-400">
                  <span>Độ phủ</span>
                  <span>{{ imageService.dimmerConfig().opacity }}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  [ngModel]="imageService.dimmerConfig().opacity"
                  (ngModelChange)="onDimmerOpacityChange($event)"
                  class="w-full accent-blue-500 cursor-pointer h-1"
                />
              </div>
            </div>

            <!-- Height Ratio -->
            <div class="flex flex-col gap-1">
              <div class="flex justify-between text-[10px] text-zinc-400">
                <span>Chiều cao phủ</span>
                <span
                  >{{ Math.round((imageService.dimmerConfig().heightRatio || 0.5) * 100) }}%</span
                >
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                [ngModel]="imageService.dimmerConfig().heightRatio"
                (ngModelChange)="onDimmerHeightChange($event)"
                class="w-full accent-blue-500 cursor-pointer h-1"
              />
            </div>
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
export class ImageInspectorComponent {
  readonly Math = Math;

  constructor(
    public imageService: ImageProcessingService,
    private canvasEngine: CanvasEngineService,
  ) {}

  onAdjustmentChange(key: string, value: number): void {
    const current = { ...this.imageService.adjustments(), [key]: Number(value) };
    this.imageService.applyAdjustments(current);
  }

  onDimmerToggle(enabled: boolean): void {
    const current = { ...this.imageService.dimmerConfig(), enabled };
    this.imageService.setDimmerOverlay(current);
  }

  onDimmerTypeChange(type: DimmerGradientType): void {
    const current = { ...this.imageService.dimmerConfig(), type };
    this.imageService.setDimmerOverlay(current);
  }

  onDimmerColorChange(color: string): void {
    const current = { ...this.imageService.dimmerConfig(), color };
    this.imageService.setDimmerOverlay(current);
  }

  onDimmerOpacityChange(opacity: number): void {
    const current = { ...this.imageService.dimmerConfig(), opacity: Number(opacity) };
    this.imageService.setDimmerOverlay(current);
  }

  onDimmerHeightChange(heightRatio: number): void {
    const current = { ...this.imageService.dimmerConfig(), heightRatio: Number(heightRatio) };
    this.imageService.setDimmerOverlay(current);
  }
}
