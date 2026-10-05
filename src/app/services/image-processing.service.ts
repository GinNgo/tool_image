import { Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';
import {
  BackgroundConfig,
  ImageAdjustments,
  DimmerOverlayConfig,
  CropRect,
  DEFAULT_IMAGE_ADJUSTMENTS,
  DEFAULT_DIMMER_CONFIG,
  DEFAULT_IMAGE_TRANSFORM,
} from '../models/image-processing.model';
import { CanvasEngineService } from './canvas-engine.service';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessingService {
  private bgImage: fabric.FabricImage | null = null;
  private dimmerRect: fabric.Rect | null = null;

  readonly currentBackground = signal<BackgroundConfig | null>(null);
  readonly adjustments = signal<ImageAdjustments>({ ...DEFAULT_IMAGE_ADJUSTMENTS });
  readonly dimmerConfig = signal<DimmerOverlayConfig>({ ...DEFAULT_DIMMER_CONFIG });

  constructor(private canvasEngine: CanvasEngineService) {}

  getBackgroundImage(): fabric.FabricImage | null {
    return this.bgImage;
  }

  /**
   * Tải ảnh nền: đọc ảnh từ File hoặc DataUrl, tự căn tỷ lệ canvas theo ảnh gốc nếu cần
   */
  async setBackgroundImage(
    fileOrDataUrl: File | string,
    fitMode: 'fit' | 'cover' = 'fit',
  ): Promise<void> {
    const dataUrl =
      typeof fileOrDataUrl === 'string'
        ? fileOrDataUrl
        : await this.readFileAsDataUrl(fileOrDataUrl);

    const fileName = typeof fileOrDataUrl === 'string' ? 'image.jpg' : fileOrDataUrl.name;

    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) throw new Error('Canvas chưa được khởi tạo');

    // Tải ảnh qua FabricImage
    const img = await fabric.FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
    const originalWidth = img.width || 1920;
    const originalHeight = img.height || 1080;

    // Nếu chưa có ảnh nền hoặc tỷ lệ đang là original, đổi kích thước canvas theo ảnh
    const currentConfig = this.canvasEngine.canvasConfig();
    if (!this.bgImage || currentConfig.aspectRatio === 'original') {
      this.canvasEngine.setDimensions(originalWidth, originalHeight, 'original');
    }

    // Xóa ảnh nền cũ nếu có
    if (this.bgImage) {
      canvas.remove(this.bgImage);
      this.bgImage = null;
    }

    this.bgImage = img;
    (this.bgImage as any).isBackgroundImage = true;
    this.bgImage.set({
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
    });

    this.fitBackgroundImage(fitMode);

    // Thêm ảnh vào dưới cùng
    canvas.add(this.bgImage);
    canvas.sendObjectToBack(this.bgImage);

    // Cập nhật State
    const bgConfig: BackgroundConfig = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'bg-' + Date.now(),
      fileName,
      sourceDataUrl: dataUrl,
      originalWidth,
      originalHeight,
      fitMode,
      transform: {
        x: this.bgImage.left || 0,
        y: this.bgImage.top || 0,
        scaleX: this.bgImage.scaleX || 1,
        scaleY: this.bgImage.scaleY || 1,
        rotation: this.bgImage.angle || 0,
        flipX: this.bgImage.flipX || false,
        flipY: this.bgImage.flipY || false,
      },
      adjustments: { ...this.adjustments() },
      dimmerOverlay: { ...this.dimmerConfig() },
    };

    this.currentBackground.set(bgConfig);

    // Áp dụng bộ lọc và dimmer nếu có
    this.applyAdjustments(this.adjustments());
    this.setDimmerOverlay(this.dimmerConfig());

    canvas.requestRenderAll();
  }

  /**
   * Căn chỉnh kích thước ảnh nền vừa vặn hoặc phủ kín canvas
   */
  fitBackgroundImage(fitMode: 'fit' | 'cover' = 'fit'): void {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas || !this.bgImage) return;

    const canvasWidth = canvas.width || 1920;
    const canvasHeight = canvas.height || 1080;
    const imgWidth = this.bgImage.width || canvasWidth;
    const imgHeight = this.bgImage.height || canvasHeight;

    const scaleX = canvasWidth / imgWidth;
    const scaleY = canvasHeight / imgHeight;
    const scale = fitMode === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

    this.bgImage.set({
      scaleX: scale,
      scaleY: scale,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
    });

    canvas.requestRenderAll();
  }

  /**
   * Áp dụng các bộ lọc quang học phi hủy diệt trong thời gian thực
   */
  applyAdjustments(adjustments: ImageAdjustments): void {
    this.adjustments.set({ ...adjustments });
    if (!this.bgImage) return;

    const filters: fabric.filters.BaseFilter<string, Record<string, any>>[] = [];

    // Độ sáng: -100 đến +100 -> -1 đến 1
    if (adjustments.brightness !== 0) {
      filters.push(
        new fabric.filters.Brightness({
          brightness: adjustments.brightness / 100,
        }),
      );
    }

    // Độ tương phản: -100 đến +100 -> -1 đến 1
    if (adjustments.contrast !== 0) {
      filters.push(
        new fabric.filters.Contrast({
          contrast: adjustments.contrast / 100,
        }),
      );
    }

    // Độ bão hòa: -100 đến +100 -> -1 đến 1
    if (adjustments.saturation !== 0) {
      filters.push(
        new fabric.filters.Saturation({
          saturation: adjustments.saturation / 100,
        }),
      );
    }

    // Độ làm mờ: 0 đến 50 -> 0 đến 1
    if (adjustments.blur > 0) {
      filters.push(
        new fabric.filters.Blur({
          blur: Math.min(adjustments.blur / 50, 1),
        }),
      );
    }

    this.bgImage.filters = filters;
    this.bgImage.applyFilters();
    this.canvasEngine.renderAll();
  }

  /**
   * Cài đặt hoặc cập nhật Lớp phủ làm tối (Dimmer Overlay Gradient / Solid)
   */
  setDimmerOverlay(config: DimmerOverlayConfig): void {
    this.dimmerConfig.set({ ...config });
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return;

    // Nếu tắt dimmer, xóa rect nếu tồn tại
    if (!config.enabled || config.type === 'none') {
      if (this.dimmerRect) {
        canvas.remove(this.dimmerRect);
        this.dimmerRect = null;
        canvas.requestRenderAll();
      }
      return;
    }

    const canvasWidth = canvas.width || 1920;
    const canvasHeight = canvas.height || 1080;
    const heightRatio = Math.max(0.1, Math.min(config.heightRatio || 0.5, 1.0));
    const overlayHeight = Math.round(canvasHeight * heightRatio);
    const alpha = (config.opacity || 40) / 100;

    let fill: string | fabric.Gradient<'linear'> = config.color;

    if (config.type === 'bottom-to-top') {
      fill = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: overlayHeight },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0)' },
          { offset: 1, color: this.hexToRgba(config.color, alpha) },
        ],
      });
    } else if (config.type === 'top-to-bottom') {
      fill = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: overlayHeight },
        colorStops: [
          { offset: 0, color: this.hexToRgba(config.color, alpha) },
          { offset: 1, color: 'rgba(0,0,0,0)' },
        ],
      });
    } else if (config.type === 'two-sided') {
      fill = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: canvasHeight },
        colorStops: [
          { offset: 0, color: this.hexToRgba(config.color, alpha) },
          { offset: 0.5, color: 'rgba(0,0,0,0)' },
          { offset: 1, color: this.hexToRgba(config.color, alpha) },
        ],
      });
    } else {
      // Solid
      fill = this.hexToRgba(config.color, alpha);
    }

    const top = config.type === 'bottom-to-top' ? canvasHeight - overlayHeight : 0;
    const rectHeight =
      config.type === 'two-sided' || (config.type === 'solid' && heightRatio === 1)
        ? canvasHeight
        : overlayHeight;

    if (!this.dimmerRect) {
      this.dimmerRect = new fabric.Rect({
        left: 0,
        top,
        width: canvasWidth,
        height: rectHeight,
        fill,
        selectable: false,
        evented: false,
      });
      (this.dimmerRect as any).isDimmerOverlay = true;
      canvas.add(this.dimmerRect);
    } else {
      this.dimmerRect.set({
        left: 0,
        top,
        width: canvasWidth,
        height: rectHeight,
        fill,
      });
    }

    // Luôn đảm bảo dimmer nằm trên ảnh nền và dưới tất cả các lớp text/shape
    if (this.bgImage) {
      canvas.sendObjectToBack(this.dimmerRect);
      canvas.sendObjectToBack(this.bgImage);
    } else {
      canvas.sendObjectToBack(this.dimmerRect);
    }

    canvas.requestRenderAll();
  }

  /**
   * Xoay ảnh nền góc 90 hoặc -90 độ
   */
  rotateBackground(deg: 90 | -90): void {
    if (!this.bgImage) return;
    const currentAngle = this.bgImage.angle || 0;
    const newAngle = (currentAngle + deg + 360) % 360;
    this.bgImage.set('angle', newAngle);

    // Nếu canvas đang ở chế độ original, tráo đổi width và height
    const canvas = this.canvasEngine.getCanvas();
    const config = this.canvasEngine.canvasConfig();
    if (canvas && config.aspectRatio === 'original') {
      const curW = canvas.width || 1920;
      const curH = canvas.height || 1080;
      this.canvasEngine.setDimensions(curH, curW, 'original');
      this.fitBackgroundImage(this.currentBackground()?.fitMode || 'fit');
    } else {
      this.canvasEngine.renderAll();
    }
  }

  /**
   * Lật ảnh theo trục X hoặc Y
   */
  flipBackground(axis: 'x' | 'y'): void {
    if (!this.bgImage) return;
    if (axis === 'x') {
      this.bgImage.set('flipX', !this.bgImage.flipX);
    } else {
      this.bgImage.set('flipY', !this.bgImage.flipY);
    }
    this.canvasEngine.renderAll();
  }

  /**
   * Cắt ảnh nền (Crop)
   */
  applyCrop(cropRect: CropRect): void {
    if (!this.bgImage) return;
    this.bgImage.set({
      cropX: cropRect.x,
      cropY: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
    });
    this.canvasEngine.renderAll();
  }

  /**
   * Đặt lại toàn bộ bộ lọc quang học về mặc định
   */
  resetAdjustments(): void {
    this.applyAdjustments({ ...DEFAULT_IMAGE_ADJUSTMENTS });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Lỗi khi đọc tệp ảnh'));
      reader.readAsDataURL(file);
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    let r = 0,
      g = 0,
      b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
