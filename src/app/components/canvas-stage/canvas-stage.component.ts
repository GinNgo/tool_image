import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { ViewportService } from '../../services/viewport.service';
import { ImageProcessingService } from '../../services/image-processing.service';
import { ASPECT_RATIO_PRESETS, AspectRatioType } from '../../models/canvas.model';

@Component({
  selector: 'app-canvas-stage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #stageContainer
      class="canvas-stage relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden select-none"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <!-- Floating Viewport Toolbar on Top -->
      <div
        class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur border border-zinc-800 shadow-xl text-zinc-300 text-xs"
      >
        <!-- Aspect Ratio Selector -->
        <div class="flex items-center gap-1.5 pr-2 border-r border-zinc-700">
          <span class="text-zinc-500 text-[11px]">Tỷ lệ:</span>
          <select
            [ngModel]="canvasEngine.canvasConfig().aspectRatio"
            (ngModelChange)="onAspectRatioChange($event)"
            class="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded px-2 py-0.5 outline-none cursor-pointer border border-zinc-700"
          >
            @for (preset of aspectPresets; track preset.id) {
              <option [value]="preset.id">{{ preset.label }}</option>
            }
          </select>
        </div>

        <!-- Zoom Controls -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="onZoomOut()"
            title="Thu nhỏ (Ctrl -)"
            class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 font-bold"
          >
            −
          </button>

          <span class="w-12 text-center font-mono font-medium text-zinc-200">
            {{ viewportService.zoomPercent() }}%
          </span>

          <button
            type="button"
            (click)="onZoomIn()"
            title="Phóng to (Ctrl +)"
            class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 font-bold"
          >
            +
          </button>

          <button
            type="button"
            (click)="onFitScreen()"
            title="Vừa màn hình"
            class="ml-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 text-[11px]"
          >
            Vừa khung
          </button>
        </div>
      </div>

      <!-- Drag & Drop Overlay Indicator -->
      @if (isDragging()) {
        <div
          class="absolute inset-4 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/10 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none"
        >
          <span class="text-4xl mb-2">📥</span>
          <span class="text-base font-semibold text-blue-400">Thả ảnh vào đây để nạp ảnh nền</span>
        </div>
      }

      <!-- Canvas Viewport Wrapper -->
      <div
        class="canvas-wrapper relative shadow-2xl transition-transform duration-75 ease-out"
        [style.transform]="getCanvasTransform()"
      >
        <canvas #canvasElement></canvas>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .canvas-wrapper {
        transform-origin: center center;
      }
    `,
  ],
})
export class CanvasStageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stageContainer') stageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  readonly aspectPresets = ASPECT_RATIO_PRESETS;
  readonly isDragging = signal<boolean>(false);

  private resizeObserver: ResizeObserver | null = null;

  constructor(
    public canvasEngine: CanvasEngineService,
    public viewportService: ViewportService,
    private imageService: ImageProcessingService,
  ) {}

  ngAfterViewInit(): void {
    const canvasNative = this.canvasElement.nativeElement;
    const config = this.canvasEngine.canvasConfig();

    // 1. Khởi tạo Fabric canvas
    this.canvasEngine.initialize(canvasNative, config.width, config.height);

    // 2. Kích hoạt ResizeObserver để tự động Auto-Fit khi cửa sổ co giãn
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.canvasEngine.destroy();
  }

  onAspectRatioChange(aspectRatio: AspectRatioType): void {
    this.canvasEngine.setAspectRatio(aspectRatio);
    this.recalculateViewport();
  }

  onZoomIn(): void {
    this.viewportService.zoomIn();
  }

  onZoomOut(): void {
    this.viewportService.zoomOut();
  }

  onFitScreen(): void {
    this.viewportService.fitScreen();
  }

  getCanvasTransform(): string {
    const t = this.viewportService.transform();
    return `scale(${t.zoom})`;
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.imageService.setBackgroundImage(file);
        setTimeout(() => this.recalculateViewport(), 100);
      }
    }
  }

  private setupResizeObserver(): void {
    if (!this.stageContainer) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.recalculateViewport();
    });

    this.resizeObserver.observe(this.stageContainer.nativeElement);
    // Kích hoạt tính toán ban đầu
    setTimeout(() => this.recalculateViewport(), 50);
  }

  private recalculateViewport(): void {
    if (!this.stageContainer) return;
    const container = this.stageContainer.nativeElement;
    const config = this.canvasEngine.canvasConfig();

    const stageWidth = container.clientWidth;
    const stageHeight = container.clientHeight;

    if (stageWidth > 0 && stageHeight > 0) {
      this.viewportService.calculateAutoFit(
        stageWidth,
        stageHeight,
        config.width,
        config.height,
        40, // 40px padding an toàn
      );
    }
  }
}
