import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudioStateService } from '../../services/studio-state.service';
import { CanvasEngineService } from '../../services/canvas-engine.service';
import { ExportFormat, ExportResolutionMultiplier, ExportOptions } from '../../models/export.model';

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (studioState.isExportModalOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fadeIn"
      >
        <div
          class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">💾</span>
              <h2 class="text-base font-semibold text-white">Xuất ảnh Độ nét cao</h2>
            </div>
            <button
              type="button"
              (click)="studioState.closeExportModal()"
              class="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body: 2 Columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <!-- Left: Live Preview -->
            <div
              class="flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 p-3 min-h-[220px]"
            >
              @if (previewDataUrl(); as preview) {
                <img
                  [src]="preview"
                  alt="Bản xem trước"
                  class="max-w-full max-h-52 object-contain rounded shadow-md"
                />
              } @else {
                <div class="text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <span>⏳ Đang tạo bản xem trước...</span>
                </div>
              }
              <span class="text-[11px] text-zinc-500 mt-2 font-mono">
                Đầu ra: {{ targetWidth() }} × {{ targetHeight() }} px
              </span>
            </div>

            <!-- Right: Settings -->
            <div class="flex flex-col gap-4 text-xs text-zinc-300">
              <!-- Format Selection -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Định dạng tệp</label>
                <div class="grid grid-cols-3 gap-2">
                  @for (fmt of formats; track fmt.id) {
                    <button
                      type="button"
                      (click)="selectedFormat.set(fmt.id)"
                      [class.bg-blue-600]="selectedFormat() === fmt.id"
                      [class.text-white]="selectedFormat() === fmt.id"
                      [class.bg-zinc-800]="selectedFormat() !== fmt.id"
                      [class.text-zinc-300]="selectedFormat() !== fmt.id"
                      class="py-2 px-1 rounded-lg border border-zinc-700 text-center font-medium transition-all"
                    >
                      {{ fmt.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Multiplier (Resolution) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] text-zinc-400 font-medium">Độ phân giải xuất</label>
                <div class="grid grid-cols-3 gap-2">
                  @for (mul of multipliers; track mul.value) {
                    <button
                      type="button"
                      (click)="selectedMultiplier.set(mul.value)"
                      [class.bg-blue-600]="selectedMultiplier() === mul.value"
                      [class.text-white]="selectedMultiplier() === mul.value"
                      [class.bg-zinc-800]="selectedMultiplier() !== mul.value"
                      [class.text-zinc-300]="selectedMultiplier() !== mul.value"
                      class="py-2 px-1 rounded-lg border border-zinc-700 text-center transition-all flex flex-col items-center"
                    >
                      <span class="font-bold text-xs">{{ mul.value }}x</span>
                      <span class="text-[10px] text-zinc-400">{{ mul.desc }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Quality Slider (if JPEG or WebP) -->
              @if (selectedFormat() !== 'png') {
                <div class="flex flex-col gap-1.5">
                  <div class="flex justify-between text-[11px] text-zinc-400">
                    <span>Chất lượng nén</span>
                    <span class="font-mono">{{ quality() }}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    [ngModel]="quality()"
                    (ngModelChange)="quality.set(Number($event))"
                    class="w-full accent-blue-500 cursor-pointer h-1.5"
                  />
                </div>
              }

              <!-- Estimated File Size -->
              <div
                class="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex justify-between items-center text-[11px]"
              >
                <span class="text-zinc-400">Dung lượng ước tính:</span>
                <span class="font-mono text-zinc-200 font-semibold">{{ estimatedSize() }}</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="flex items-center justify-between px-6 py-4 bg-zinc-950/60 border-t border-zinc-800"
          >
            <span class="text-[11px] text-zinc-500">
              💡 Ảnh xuất giữ nguyên 100% độ sắc nét ở độ phân giải mục tiêu.
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="studioState.closeExportModal()"
                class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-xs font-medium"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                (click)="onConfirmExport()"
                [disabled]="isExporting()"
                class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                @if (isExporting()) {
                  <span>⏳ Đang xuất...</span>
                } @else {
                  <span>💾 Tải ảnh về máy</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ExportModalComponent implements OnInit {
  readonly Number = Number;

  readonly formats: { id: ExportFormat; label: string }[] = [
    { id: 'png', label: 'PNG (Sắc nét)' },
    { id: 'jpeg', label: 'JPEG (Nhẹ)' },
    { id: 'webp', label: 'WebP (Hiện đại)' },
  ];

  readonly multipliers: { value: ExportResolutionMultiplier; desc: string }[] = [
    { value: 1, desc: 'Chuẩn 1x' },
    { value: 2, desc: 'Retina 2x' },
    { value: 3, desc: 'In ấn 3x' },
  ];

  readonly selectedFormat = signal<ExportFormat>('png');
  readonly selectedMultiplier = signal<ExportResolutionMultiplier>(1);
  readonly quality = signal<number>(95);
  readonly isExporting = signal<boolean>(false);
  readonly previewDataUrl = signal<string | null>(null);

  readonly targetWidth = computed(() => {
    const baseW = this.canvasEngine.canvasConfig().width;
    return baseW * this.selectedMultiplier();
  });

  readonly targetHeight = computed(() => {
    const baseH = this.canvasEngine.canvasConfig().height;
    return baseH * this.selectedMultiplier();
  });

  readonly estimatedSize = computed(() => {
    const pixels = this.targetWidth() * this.targetHeight();
    const fmt = this.selectedFormat();
    if (fmt === 'png') {
      const mb = (pixels * 3) / (1024 * 1024);
      return `~${Math.round(mb * 10) / 10} MB`;
    } else {
      const q = this.quality() / 100;
      const mb = (pixels * 0.8 * q) / (1024 * 1024);
      return `~${Math.max(0.2, Math.round(mb * 10) / 10)} MB`;
    }
  });

  constructor(
    public studioState: StudioStateService,
    private canvasEngine: CanvasEngineService,
  ) {}

  ngOnInit(): void {
    // Generate initial low-res preview when modal opens
    this.refreshPreview();
  }

  async refreshPreview(): Promise<void> {
    try {
      const dataUrl = await this.canvasEngine.exportToImage({
        format: 'png',
        multiplier: 1,
        quality: 0.8,
        fileName: 'preview.png',
        targetWidth: 640,
        targetHeight: 360,
      });
      this.previewDataUrl.set(dataUrl);
    } catch {
      // preview error ignored
    }
  }

  async onConfirmExport(): Promise<void> {
    this.isExporting.set(true);

    try {
      const options: ExportOptions = {
        format: this.selectedFormat(),
        quality: this.quality() / 100,
        multiplier: this.selectedMultiplier(),
        fileName: `${this.studioState.projectTitle().replace(/\s+/g, '_')}_${this.selectedMultiplier()}x.${this.selectedFormat()}`,
        targetWidth: this.targetWidth(),
        targetHeight: this.targetHeight(),
      };

      const dataUrl = await this.canvasEngine.exportToImage(options);

      // Check if Electron IPC Bridge is available
      const electronApi = (window as any).electronAPI;
      if (electronApi && electronApi.saveImage) {
        await electronApi.saveImage({
          dataUrl,
          defaultName: options.fileName,
          format: options.format,
        });
      } else {
        // Fallback Web Browser Download
        const link = document.createElement('a');
        link.download = options.fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      this.studioState.closeExportModal();
    } catch (err) {
      console.error('Lỗi khi xuất ảnh:', err);
      alert('Đã xảy ra lỗi trong quá trình xuất ảnh.');
    } finally {
      this.isExporting.set(false);
    }
  }
}
