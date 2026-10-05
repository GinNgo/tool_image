import { Injectable, signal, computed } from '@angular/core';
import { ViewportTransform } from '../models/canvas.model';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  private readonly MIN_ZOOM = 0.1;
  private readonly MAX_ZOOM = 4.0;
  private readonly DEFAULT_PADDING = 32;

  readonly transform = signal<ViewportTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
    fitZoom: 1,
  });

  readonly zoomPercent = computed(() => Math.round(this.transform().zoom * 100));

  /**
   * Tính toán hệ số scale (0.1 - 4.0) và toạ độ căn giữa để canvas luôn hiển thị
   * trọn vẹn trong vùng stage mà không bao giờ bị tràn cửa sổ hay xuất hiện thanh cuộn ngoài.
   */
  calculateAutoFit(
    stageWidth: number,
    stageHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    padding = this.DEFAULT_PADDING,
  ): { scale: number; panX: number; panY: number } {
    if (!stageWidth || !stageHeight || !canvasWidth || !canvasHeight) {
      return { scale: 1, panX: 0, panY: 0 };
    }

    const availableWidth = Math.max(10, stageWidth - padding * 2);
    const availableHeight = Math.max(10, stageHeight - padding * 2);

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    let scale = Math.min(scaleX, scaleY);

    // Giới hạn trong khoảng [0.1, 4.0]
    scale = Math.min(Math.max(scale, this.MIN_ZOOM), this.MAX_ZOOM);
    // Làm tròn xuống để không bao giờ vượt quá kích thước khả dụng
    scale = Math.floor(scale * 10000) / 10000;

    const panX = Math.round((stageWidth - canvasWidth * scale) / 2);
    const panY = Math.round((stageHeight - canvasHeight * scale) / 2);

    this.transform.update((t) => ({
      ...t,
      zoom: scale,
      panX,
      panY,
      fitZoom: scale,
    }));

    return { scale, panX, panY };
  }

  setZoom(scale: number): void {
    const clampedScale = Math.min(Math.max(scale, this.MIN_ZOOM), this.MAX_ZOOM);
    const roundedScale = Math.round(clampedScale * 10000) / 10000;
    this.transform.update((t) => ({
      ...t,
      zoom: roundedScale,
    }));
  }

  zoomIn(step = 0.1): void {
    this.setZoom(this.transform().zoom + step);
  }

  zoomOut(step = 0.1): void {
    this.setZoom(this.transform().zoom - step);
  }

  fitScreen(): void {
    const fit = this.transform().fitZoom;
    this.setZoom(fit);
  }

  setPan(panX: number, panY: number): void {
    this.transform.update((t) => ({
      ...t,
      panX,
      panY,
    }));
  }

  reset(): void {
    this.transform.set({
      zoom: 1,
      panX: 0,
      panY: 0,
      fitZoom: 1,
    });
  }
}
