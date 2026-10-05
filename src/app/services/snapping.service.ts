import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({
  providedIn: 'root',
})
export class SnappingService {
  private canvas: fabric.Canvas | null = null;
  private snapLineV: fabric.Line | null = null;
  private snapLineH: fabric.Line | null = null;
  private readonly SNAP_THRESHOLD = 10; // Ngưỡng hút nam châm 10px

  private onObjectMovingHandler = (
    e: fabric.BasicTransformEvent<fabric.TPointerEvent> & { target: fabric.FabricObject },
  ) => {
    this.handleObjectMoving(e);
  };

  private onObjectModifiedHandler = () => {
    this.hideGuides();
  };

  attach(canvas: fabric.Canvas): void {
    this.detach();
    this.canvas = canvas;

    // Khởi tạo 2 đường gióng neon xanh
    this.snapLineV = new fabric.Line([0, 0, 0, canvas.height || 1080], {
      stroke: '#00ffcc',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5],
      visible: false,
      excludeFromExport: true,
    });

    this.snapLineH = new fabric.Line([0, 0, canvas.width || 1920, 0], {
      stroke: '#00ffcc',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5],
      visible: false,
      excludeFromExport: true,
    });

    canvas.add(this.snapLineV);
    canvas.add(this.snapLineH);

    canvas.on('object:moving', this.onObjectMovingHandler);
    canvas.on('object:modified', this.onObjectModifiedHandler);
  }

  detach(): void {
    if (!this.canvas) return;

    this.canvas.off('object:moving', this.onObjectMovingHandler);
    this.canvas.off('object:modified', this.onObjectModifiedHandler);

    if (this.snapLineV) {
      this.canvas.remove(this.snapLineV);
      this.snapLineV = null;
    }
    if (this.snapLineH) {
      this.canvas.remove(this.snapLineH);
      this.snapLineH = null;
    }

    this.canvas = null;
  }

  hideGuides(): void {
    let changed = false;
    if (this.snapLineV && this.snapLineV.visible) {
      this.snapLineV.set('visible', false);
      changed = true;
    }
    if (this.snapLineH && this.snapLineH.visible) {
      this.snapLineH.set('visible', false);
      changed = true;
    }
    if (changed && this.canvas) {
      this.canvas.requestRenderAll();
    }
  }

  updateCanvasSize(width: number, height: number): void {
    if (this.snapLineV) {
      this.snapLineV.set({ y2: height });
    }
    if (this.snapLineH) {
      this.snapLineH.set({ x2: width });
    }
  }

  private handleObjectMoving(e: { target?: fabric.FabricObject }): void {
    if (!this.canvas || !e.target) return;

    const target = e.target;
    // Bỏ qua nếu chính là đường gióng
    if (target === this.snapLineV || target === this.snapLineH) return;

    const canvasWidth = this.canvas.width || 1920;
    const canvasHeight = this.canvas.height || 1080;
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    const targetCenter = target.getCenterPoint();
    let snappedX = false;
    let snappedY = false;

    // Kiểm tra snap theo trục dọc (Tâm ngang X)
    if (Math.abs(targetCenter.x - canvasCenterX) <= this.SNAP_THRESHOLD) {
      target.setPositionByOrigin(
        new fabric.Point(canvasCenterX, targetCenter.y),
        'center',
        'center',
      );
      if (this.snapLineV) {
        this.snapLineV.set({
          x1: canvasCenterX,
          x2: canvasCenterX,
          y1: 0,
          y2: canvasHeight,
          visible: true,
        });
        this.canvas.bringObjectToFront(this.snapLineV);
      }
      snappedX = true;
    } else if (this.snapLineV && this.snapLineV.visible) {
      this.snapLineV.set('visible', false);
    }

    // Kiểm tra snap theo trục ngang (Tâm dọc Y)
    const currentCenter = target.getCenterPoint();
    if (Math.abs(currentCenter.y - canvasCenterY) <= this.SNAP_THRESHOLD) {
      target.setPositionByOrigin(
        new fabric.Point(currentCenter.x, canvasCenterY),
        'center',
        'center',
      );
      if (this.snapLineH) {
        this.snapLineH.set({
          x1: 0,
          x2: canvasWidth,
          y1: canvasCenterY,
          y2: canvasCenterY,
          visible: true,
        });
        this.canvas.bringObjectToFront(this.snapLineH);
      }
      snappedY = true;
    } else if (this.snapLineH && this.snapLineH.visible) {
      this.snapLineH.set('visible', false);
    }

    this.canvas.requestRenderAll();
  }
}
