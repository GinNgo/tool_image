import { Injectable, signal } from '@angular/core';
import { Canvas, FabricImage, Textbox, Line, Rect, FabricObject } from 'fabric';
import { Template } from '../models/template.model';

const SNAP_THRESHOLD = 12;
const EXPORT_MULTIPLIER = 2;

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvas: Canvas | null = null;
  private backgroundImage: FabricImage | null = null;
  private decorationBorder: Rect | null = null;
  private textbox: Textbox | null = null;
  private snapLineH: Line | null = null;
  private snapLineV: Line | null = null;
  private currentTemplate: Template | null = null;

  readonly isCanvasReady = signal(false);

  initCanvas(canvasElement: HTMLCanvasElement, template: Template): void {
    this.dispose();

    this.currentTemplate = template;
    this.canvas = new Canvas(canvasElement, {
      width: template.canvas.width,
      height: template.canvas.height,
      backgroundColor: '#f3f4f6',
      selection: false,
    });

    this.createDecorations();
    this.createSnapLines();
    this.setupSnapGuides();
    this.isCanvasReady.set(true);
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    this.backgroundImage = null;
    this.decorationBorder = null;
    this.textbox = null;
    this.snapLineH = null;
    this.snapLineV = null;
    this.currentTemplate = null;
    this.isCanvasReady.set(false);
  }

  async setBackgroundImage(dataUrl: string): Promise<void> {
    if (!this.canvas || !this.currentTemplate) return;

    const { width: cw, height: ch } = this.currentTemplate.canvas;

    if (this.backgroundImage) {
      this.canvas.remove(this.backgroundImage);
      this.backgroundImage = null;
    }

    const img = await FabricImage.fromURL(dataUrl);
    const scaleX = cw / (img.width || 1);
    const scaleY = ch / (img.height || 1);
    const scale = Math.max(scaleX, scaleY); // cover mode

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: cw / 2,
      top: ch / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    this.backgroundImage = img;
    // Insert at index 0 (bottom layer)
    this.canvas.insertAt(0, img);

    // Ensure decorations and snap lines remain above background
    if (this.decorationBorder) {
      this.canvas.bringObjectToFront(this.decorationBorder);
    }
    if (this.textbox) {
      this.canvas.bringObjectToFront(this.textbox);
      this.applyAutoContrast();
    }

    this.canvas.renderAll();
  }

  setText(text: string, fontFamily?: string): void {
    if (!this.canvas || !this.currentTemplate) return;

    const config = this.currentTemplate.textDefault;
    const content = text || config.content;
    const targetFont = fontFamily || config.fontFamily;

    if (!this.textbox) {
      this.textbox = new Textbox(content, {
        left: config.x,
        top: config.y,
        originX: 'center',
        originY: 'center',
        width: this.currentTemplate.canvas.width * 0.85,
        fontFamily: targetFont,
        fontSize: config.maxFontSize,
        textAlign: config.align,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: config.strokeWidth,
        editable: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: true,
        borderColor: 'rgba(26, 86, 219, 0.7)',
        cornerColor: 'rgba(26, 86, 219, 0.9)',
      });

      this.constrainToBounds(this.textbox);
      this.canvas.add(this.textbox);
      this.canvas.setActiveObject(this.textbox);
    } else {
      this.textbox.set({
        text: content,
        fontFamily: targetFont,
      });
    }

    this.autoFitFontSize();
    this.applyAutoContrast();
    this.canvas.renderAll();
  }

  setFontFamily(fontFamily: string): void {
    if (!this.textbox || !this.canvas) return;
    this.textbox.set({ fontFamily });
    this.autoFitFontSize();
    this.canvas.renderAll();
  }

  resetTextPosition(): void {
    if (!this.textbox || !this.currentTemplate) return;

    const config = this.currentTemplate.textDefault;
    this.textbox.set({
      left: config.x,
      top: config.y,
      fontSize: config.maxFontSize,
    });
    this.textbox.setCoords();
    this.autoFitFontSize();
    this.applyAutoContrast();
    this.canvas?.renderAll();
  }

  exportToPng(): string | null {
    if (!this.canvas) return null;

    // Discard active object so selection borders are not baked into the export
    this.canvas.discardActiveObject();
    this.hideSnapLines();
    this.canvas.renderAll();

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: EXPORT_MULTIPLIER,
    });

    return dataUrl;
  }

  getCanvas(): Canvas | null {
    return this.canvas;
  }

  getTextbox(): Textbox | null {
    return this.textbox;
  }

  // === Template Decorations ===
  private createDecorations(): void {
    if (!this.canvas || !this.currentTemplate?.decorations) return;

    const dec = this.currentTemplate.decorations;
    const { width: cw, height: ch } = this.currentTemplate.canvas;

    if (dec.borderColor && dec.borderWidth) {
      const inset = dec.borderWidth * 2;
      this.decorationBorder = new Rect({
        left: inset,
        top: inset,
        width: cw - inset * 2,
        height: ch - inset * 2,
        fill: 'transparent',
        stroke: dec.borderColor,
        strokeWidth: dec.borderWidth,
        selectable: false,
        evented: false,
        rx: 8,
        ry: 8,
      });
      this.canvas.add(this.decorationBorder);
    }
  }

  // === Auto-fit: reduce fontSize until text fits within width & height ===
  private autoFitFontSize(): void {
    if (!this.textbox || !this.currentTemplate) return;

    const config = this.currentTemplate.textDefault;
    const maxWidth = this.currentTemplate.canvas.width * 0.85;
    const maxHeight = this.currentTemplate.canvas.height * 0.35;

    let fontSize = config.maxFontSize;
    this.textbox.set({ fontSize, width: maxWidth });

    while (fontSize > config.minFontSize) {
      const textWidth = this.textbox.calcTextWidth ? this.textbox.calcTextWidth() : (this.textbox.width || 0);
      const textHeight = this.textbox.height || 0;

      if (textWidth <= maxWidth && textHeight <= maxHeight) {
        break;
      }
      fontSize -= 1;
      this.textbox.set({ fontSize });
    }
    this.textbox.setCoords();
  }

  // === Auto-contrast: sample background luminance without text interference ===
  private applyAutoContrast(): void {
    if (!this.canvas || !this.textbox || !this.backgroundImage) return;

    const config = this.currentTemplate?.textDefault;
    if (!config || (config.color !== 'auto' && config.strokeColor !== 'auto')) return;

    const textBounds = this.textbox.getBoundingRect();
    const ctx = this.canvas.getContext() as unknown as CanvasRenderingContext2D;

    const sampleX = Math.max(0, Math.floor(textBounds.left));
    const sampleY = Math.max(0, Math.floor(textBounds.top));
    const sampleW = Math.min(
      Math.floor(textBounds.width),
      this.currentTemplate!.canvas.width - sampleX,
    );
    const sampleH = Math.min(
      Math.floor(textBounds.height),
      this.currentTemplate!.canvas.height - sampleY,
    );

    if (sampleW <= 0 || sampleH <= 0) return;

    let imageData: ImageData;
    try {
      // Temporarily hide text to avoid reading text's own color
      const wasVisible = this.textbox.visible;
      this.textbox.set({ visible: false });
      this.canvas.renderAll();

      imageData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);

      this.textbox.set({ visible: wasVisible });
    } catch {
      // Canvas tainted or headless fallback
      this.textbox.set({ fill: '#ffffff', stroke: '#1a1a1a' });
      return;
    }

    const luminance = this.calculateAverageLuminance(imageData);

    // Luminance > 130 -> dark text with white outline on bright background
    // Luminance <= 130 -> white text with dark outline on dark background
    if (luminance > 130) {
      this.textbox.set({ fill: '#111827', stroke: '#ffffff', strokeWidth: config.strokeWidth || 2 });
    } else {
      this.textbox.set({ fill: '#ffffff', stroke: '#111827', strokeWidth: config.strokeWidth || 2 });
    }
  }

  private calculateAverageLuminance(imageData: ImageData): number {
    const data = imageData.data;
    let totalLuminance = 0;
    const step = 4;
    let sampledCount = 0;

    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Only calculate if pixel is reasonably opaque
      if (a > 30) {
        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
        sampledCount++;
      }
    }

    return sampledCount > 0 ? totalLuminance / sampledCount : 128;
  }

  // === Snap-to-center guides ===
  private createSnapLines(): void {
    if (!this.canvas || !this.currentTemplate) return;

    const { width: cw, height: ch } = this.currentTemplate.canvas;

    this.snapLineV = new Line([cw / 2, 0, cw / 2, ch], {
      stroke: 'rgba(37, 99, 235, 0.85)',
      strokeWidth: 2,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
      visible: false,
    });

    this.snapLineH = new Line([0, ch / 2, cw, ch / 2], {
      stroke: 'rgba(37, 99, 235, 0.85)',
      strokeWidth: 2,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
      visible: false,
    });

    this.canvas.add(this.snapLineV);
    this.canvas.add(this.snapLineH);
  }

  private setupSnapGuides(): void {
    if (!this.canvas || !this.currentTemplate) return;

    const { width: cw, height: ch } = this.currentTemplate.canvas;
    const centerX = cw / 2;
    const centerY = ch / 2;

    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj || obj === this.snapLineH || obj === this.snapLineV) return;

      const objCenterX = obj.left!;
      const objCenterY = obj.top!;

      // Snap to vertical center
      if (Math.abs(objCenterX - centerX) < SNAP_THRESHOLD) {
        obj.set({ left: centerX });
        this.snapLineV?.set({ visible: true });
        if (this.snapLineV) this.canvas?.bringObjectToFront(this.snapLineV);
      } else {
        this.snapLineV?.set({ visible: false });
      }

      // Snap to horizontal center
      if (Math.abs(objCenterY - centerY) < SNAP_THRESHOLD) {
        obj.set({ top: centerY });
        this.snapLineH?.set({ visible: true });
        if (this.snapLineH) this.canvas?.bringObjectToFront(this.snapLineH);
      } else {
        this.snapLineH?.set({ visible: false });
      }

      obj.setCoords();
      this.canvas?.renderAll();
    });

    this.canvas.on('object:modified', () => {
      this.hideSnapLines();
      this.applyAutoContrast();
      this.canvas?.renderAll();
    });
  }

  private hideSnapLines(): void {
    this.snapLineV?.set({ visible: false });
    this.snapLineH?.set({ visible: false });
  }

  private constrainToBounds(obj: FabricObject): void {
    if (!this.canvas || !this.currentTemplate) return;

    const { width: cw, height: ch } = this.currentTemplate.canvas;

    this.canvas.on('object:moving', (e) => {
      if (e.target !== obj) return;

      const bounds = obj.getBoundingRect();
      const halfW = bounds.width / 2;
      const halfH = bounds.height / 2;

      let left = obj.left!;
      let top = obj.top!;

      // Constrain within canvas bounds (object origin is center)
      left = Math.max(halfW, Math.min(cw - halfW, left));
      top = Math.max(halfH, Math.min(ch - halfH, top));

      obj.set({ left, top });
      obj.setCoords();
    });
  }
}
