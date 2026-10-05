import { Injectable, signal, computed, NgZone } from '@angular/core';
import * as fabric from 'fabric';
import { CanvasConfig, AspectRatioType, ASPECT_RATIO_PRESETS } from '../models/canvas.model';
import { ExportOptions } from '../models/export.model';
import { ViewportService } from './viewport.service';
import { SnappingService } from './snapping.service';

export type SelectedType = 'text' | 'shape' | 'image' | 'canvas';

@Injectable({
  providedIn: 'root',
})
export class CanvasEngineService {
  private fabricCanvas: fabric.Canvas | null = null;

  readonly canvasConfig = signal<CanvasConfig>({
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    backgroundColor: '#18181b',
  });

  readonly selectedObject = signal<fabric.FabricObject | null>(null);

  readonly selectedLayerType = computed<SelectedType>(() => {
    const obj = this.selectedObject();
    if (!obj) return 'canvas';
    if (obj.type === 'textbox' || obj.type === 'text') return 'text';
    if (obj.type === 'image') return 'image';
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'line') return 'shape';
    return 'canvas';
  });

  readonly selectedLayerId = computed<string | null>(() => {
    const obj = this.selectedObject() as any;
    return obj ? obj.layerId || null : null;
  });

  constructor(
    private viewportService: ViewportService,
    private snappingService: SnappingService,
    private ngZone: NgZone,
  ) {}

  getCanvas(): fabric.Canvas | null {
    return this.fabricCanvas;
  }

  initialize(canvasElement: HTMLCanvasElement, width = 1920, height = 1080): void {
    this.destroy();

    this.ngZone.runOutsideAngular(() => {
      this.fabricCanvas = new fabric.Canvas(canvasElement, {
        width,
        height,
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#18181b',
        stopContextMenu: true,
        fireRightClick: true,
      });

      this.canvasConfig.set({
        width,
        height,
        aspectRatio: '16:9',
        backgroundColor: '#18181b',
      });

      // Tích hợp Snapping Service
      this.snappingService.attach(this.fabricCanvas);

      // Lắng nghe sự kiện selection để cập nhật Reactive Signals cho Inspector
      this.fabricCanvas.on('selection:created', (e) => {
        this.ngZone.run(() => {
          this.selectedObject.set(e.selected ? e.selected[0] : null);
        });
      });

      this.fabricCanvas.on('selection:updated', (e) => {
        this.ngZone.run(() => {
          this.selectedObject.set(e.selected ? e.selected[0] : null);
        });
      });

      this.fabricCanvas.on('selection:cleared', () => {
        this.ngZone.run(() => {
          this.selectedObject.set(null);
        });
      });
    });
  }

  /**
   * Thay đổi kích thước thực của Canvas (pixel dimensions)
   */
  setDimensions(width: number, height: number, aspectRatio: AspectRatioType = 'custom'): void {
    if (!this.fabricCanvas) return;

    this.fabricCanvas.setDimensions({ width, height });
    this.canvasConfig.update((c) => ({
      ...c,
      width,
      height,
      aspectRatio,
    }));

    this.snappingService.updateCanvasSize(width, height);
    this.fabricCanvas.requestRenderAll();
  }

  /**
   * Đặt tỷ lệ Aspect Ratio Preset
   */
  setAspectRatio(ratioType: AspectRatioType, baseLongEdge = 1920): void {
    if (ratioType === 'original' || ratioType === 'custom') {
      this.canvasConfig.update((c) => ({ ...c, aspectRatio: ratioType }));
      return;
    }

    const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === ratioType);
    if (!preset || !preset.ratio) return;

    let targetWidth: number;
    let targetHeight: number;

    if (preset.ratio >= 1) {
      targetWidth = baseLongEdge;
      targetHeight = Math.round(baseLongEdge / preset.ratio);
    } else {
      targetHeight = baseLongEdge;
      targetWidth = Math.round(baseLongEdge * preset.ratio);
    }

    this.setDimensions(targetWidth, targetHeight, ratioType);
  }

  selectObject(obj: fabric.FabricObject | null): void {
    if (!this.fabricCanvas) return;
    if (obj) {
      this.fabricCanvas.setActiveObject(obj);
    } else {
      this.fabricCanvas.discardActiveObject();
    }
    this.selectedObject.set(obj);
    this.fabricCanvas.requestRenderAll();
  }

  discardSelection(): void {
    if (!this.fabricCanvas) return;
    this.fabricCanvas.discardActiveObject();
    this.selectedObject.set(null);
    this.fabricCanvas.requestRenderAll();
  }

  deleteSelectedObject(): fabric.FabricObject | null {
    if (!this.fabricCanvas) return null;
    const active = this.fabricCanvas.getActiveObject();
    if (!active) return null;

    // Nếu đối tượng gắn liền với ribbon hoặc companion, xử lý dọn dẹp
    const companion = (active as any).companionObject;
    if (companion) {
      this.fabricCanvas.remove(companion);
    }

    this.fabricCanvas.remove(active);
    this.fabricCanvas.discardActiveObject();
    this.selectedObject.set(null);
    this.fabricCanvas.requestRenderAll();
    return active;
  }

  /**
   * Xuất ảnh sắc nét theo multiplier (1x, 2x, 3x) và format (PNG, JPEG, WebP)
   */
  async exportToImage(options: ExportOptions): Promise<string> {
    if (!this.fabricCanvas) throw new Error('Canvas chưa được khởi tạo');

    // 1. Tạm ẩn guides và bỏ active selection trước khi chụp
    this.snappingService.hideGuides();
    const activeObj = this.fabricCanvas.getActiveObject();
    this.fabricCanvas.discardActiveObject();
    this.fabricCanvas.requestRenderAll();

    const multiplier = options.multiplier || 1;
    const format = options.format === 'jpeg' ? 'jpeg' : options.format === 'webp' ? 'webp' : 'png';
    const quality = options.quality ?? 0.92;

    const dataUrl = this.fabricCanvas.toDataURL({
      format: format as any,
      quality,
      multiplier,
      enableRetinaScaling: false,
    });

    // 2. Phục hồi lại active selection nếu có
    if (activeObj) {
      this.fabricCanvas.setActiveObject(activeObj);
      this.fabricCanvas.requestRenderAll();
    }

    return dataUrl;
  }

  renderAll(): void {
    this.fabricCanvas?.requestRenderAll();
  }

  destroy(): void {
    if (this.fabricCanvas) {
      this.snappingService.detach();
      this.fabricCanvas.dispose();
      this.fabricCanvas = null;
    }
    this.selectedObject.set(null);
  }
}
