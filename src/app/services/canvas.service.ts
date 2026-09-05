import { Injectable, signal } from '@angular/core';
import { Canvas, FabricImage, Textbox, Line, Rect, FabricObject } from 'fabric';
import { Template, TextBlock } from '../models/template.model';

const SNAP_THRESHOLD = 14;
const EXPORT_MULTIPLIER = 2;

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvas: Canvas | null = null;
  private backgroundImage: FabricImage | null = null;
  private decorationBorder: Rect | null = null;
  private textboxes: Map<string, Textbox> = new Map();
  private snapLineH: Line | null = null;
  private snapLineV: Line | null = null;
  private currentTemplate: Template | null = null;

  readonly isCanvasReady = signal(false);
  readonly onBlockSelected = signal<string | null>(null);

  initCanvas(canvasElement: HTMLCanvasElement, template: Template, blocks: TextBlock[] = []): void {
    this.dispose();

    this.currentTemplate = template;
    this.canvas = new Canvas(canvasElement, {
      width: template.canvas.width,
      height: template.canvas.height,
      backgroundColor: '#f3f4f6',
      selection: true,
    });

    this.createDecorations();
    this.createSnapLines();
    this.setupSnapGuides();
    this.setupSelectionListener();

    // Render initial blocks
    if (blocks.length > 0) {
      blocks.forEach((block) => this.renderTextBlock(block));
    }

    this.isCanvasReady.set(true);
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    this.backgroundImage = null;
    this.decorationBorder = null;
    this.textboxes.clear();
    this.snapLineH = null;
    this.snapLineV = null;
    this.currentTemplate = null;
    this.isCanvasReady.set(false);
    this.onBlockSelected.set(null);
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
    this.canvas.insertAt(0, img);

    // Keep decorations and textboxes above background
    if (this.decorationBorder) {
      this.canvas.bringObjectToFront(this.decorationBorder);
    }
    this.textboxes.forEach((tb) => {
      this.canvas?.bringObjectToFront(tb);
      this.applyAutoContrastForBox(tb);
    });

    this.canvas.renderAll();
  }

  // === TextBlock Manipulation (Map<string, Textbox>) ===

  renderTextBlock(block: TextBlock): Textbox | null {
    if (!this.canvas || !this.currentTemplate) return null;

    let tb = this.textboxes.get(block.id);
    const cw = this.currentTemplate.canvas.width;

    if (!tb) {
      tb = new Textbox(block.content, {
        left: block.x,
        top: block.y,
        originX: 'center',
        originY: 'center',
        width: cw * 0.85,
        fontFamily: block.fontFamily,
        fontSize: block.fontSize,
        textAlign: block.align,
        fill: block.color || '#ffffff',
        stroke: block.strokeColor || '#000000',
        strokeWidth: block.strokeWidth || 2,
        editable: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: true,
        borderColor: 'rgba(26, 86, 219, 0.7)',
        cornerColor: 'rgba(26, 86, 219, 0.9)',
      });

      // Attach custom ID to the fabric object
      (tb as unknown as Record<string, unknown>)['blockId'] = block.id;

      this.constrainToBounds(tb);
      this.canvas.add(tb);
      this.textboxes.set(block.id, tb);
    } else {
      tb.set({
        text: block.content,
        fontFamily: block.fontFamily,
        fontSize: block.fontSize,
        left: block.x,
        top: block.y,
      });
    }

    this.autoFitFontSizeForBox(tb, block);
    this.applyAutoContrastForBox(tb);
    this.canvas.renderAll();
    return tb;
  }

  updateTextBlock(block: TextBlock): void {
    const tb = this.textboxes.get(block.id);
    if (!tb) {
      this.renderTextBlock(block);
      return;
    }

    tb.set({
      text: block.content,
      fontFamily: block.fontFamily,
      fontSize: block.fontSize,
      left: block.x,
      top: block.y,
    });

    this.autoFitFontSizeForBox(tb, block);
    this.applyAutoContrastForBox(tb);
    this.canvas?.renderAll();
  }

  removeTextBlock(id: string): void {
    const tb = this.textboxes.get(id);
    if (tb && this.canvas) {
      this.canvas.remove(tb);
      this.textboxes.delete(id);
      this.canvas.renderAll();
    }
  }

  selectTextBlock(id: string): void {
    const tb = this.textboxes.get(id);
    if (tb && this.canvas) {
      this.canvas.setActiveObject(tb);
      this.canvas.renderAll();
    }
  }

  centerHorizontally(id: string): void {
    if (!this.canvas || !this.currentTemplate) return;
    const tb = this.textboxes.get(id);
    if (!tb) return;

    const centerX = this.currentTemplate.canvas.width / 2;
    tb.set({ left: centerX });
    tb.setCoords();
    this.applyAutoContrastForBox(tb);
    this.canvas.renderAll();
  }

  resetBlockPosition(block: TextBlock): void {
    const tb = this.textboxes.get(block.id);
    if (!tb || !this.currentTemplate) return;

    const targetX = block.defaultX ?? this.currentTemplate.canvas.width / 2;
    const targetY = block.defaultY ?? (block.type === 'title' ? this.currentTemplate.textDefault.y : this.currentTemplate.canvas.height * 0.85);

    tb.set({
      left: targetX,
      top: targetY,
      fontSize: block.maxFontSize,
    });
    tb.setCoords();
    this.autoFitFontSizeForBox(tb, block);
    this.applyAutoContrastForBox(tb);
    this.canvas?.renderAll();
  }

  // === Backward Compatibility for single text operations ===
  setText(text: string, fontFamily?: string): void {
    const titleBox = this.textboxes.get('title') || Array.from(this.textboxes.values())[0];
    if (titleBox) {
      titleBox.set({
        text,
        fontFamily: fontFamily || titleBox.fontFamily,
      });
      if (this.currentTemplate) {
        this.autoFitFontSizeForBox(titleBox, {
          ...this.currentTemplate.textDefault,
          id: 'title',
          type: 'title',
          label: 'Tiêu đề chính',
          fontSize: this.currentTemplate.textDefault.maxFontSize,
          colorMode: 'auto',
          color: '#ffffff',
          strokeColor: '#000000',
          removable: false,
        });
      }
      this.applyAutoContrastForBox(titleBox);
      this.canvas?.renderAll();
    } else if (this.currentTemplate) {
      this.renderTextBlock({
        id: 'title',
        type: 'title',
        label: 'Tiêu đề chính',
        content: text,
        x: this.currentTemplate.textDefault.x,
        y: this.currentTemplate.textDefault.y,
        align: this.currentTemplate.textDefault.align,
        fontFamily: fontFamily || this.currentTemplate.textDefault.fontFamily,
        fontSize: this.currentTemplate.textDefault.maxFontSize,
        minFontSize: this.currentTemplate.textDefault.minFontSize,
        maxFontSize: this.currentTemplate.textDefault.maxFontSize,
        colorMode: 'auto',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: this.currentTemplate.textDefault.strokeWidth || 2,
        removable: false,
      });
    }
  }

  setFontFamily(fontFamily: string): void {
    const activeObj = this.canvas?.getActiveObject();
    const targetBox = (activeObj as Textbox) || this.textboxes.get('title') || Array.from(this.textboxes.values())[0];
    if (targetBox) {
      targetBox.set({ fontFamily });
      this.canvas?.renderAll();
    }
  }

  resetTextPosition(): void {
    const titleBox = this.textboxes.get('title');
    if (titleBox && this.currentTemplate) {
      const config = this.currentTemplate.textDefault;
      titleBox.set({
        left: config.x,
        top: config.y,
        fontSize: config.maxFontSize,
      });
      titleBox.setCoords();
      this.applyAutoContrastForBox(titleBox);
      this.canvas?.renderAll();
    }
  }

  exportToPng(): string | null {
    if (!this.canvas) return null;

    this.canvas.discardActiveObject();
    this.hideSnapLines();
    this.canvas.renderAll();

    return this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: EXPORT_MULTIPLIER,
    });
  }

  getCanvas(): Canvas | null {
    return this.canvas;
  }

  getTextbox(id: string = 'title'): Textbox | null {
    return this.textboxes.get(id) || null;
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

  // === Auto-fit fontSize ===
  private autoFitFontSizeForBox(textbox: Textbox, block: TextBlock): void {
    if (!this.currentTemplate) return;

    const maxWidth = this.currentTemplate.canvas.width * 0.85;
    const maxHeight = this.currentTemplate.canvas.height * 0.35;

    let fontSize = block.fontSize || block.maxFontSize;
    textbox.set({ fontSize, width: maxWidth });

    while (fontSize > block.minFontSize) {
      const textWidth = textbox.calcTextWidth ? textbox.calcTextWidth() : (textbox.width || 0);
      const textHeight = textbox.height || 0;

      if (textWidth <= maxWidth && textHeight <= maxHeight) {
        break;
      }
      fontSize -= 1;
      textbox.set({ fontSize });
    }
    textbox.setCoords();
  }

  // === Auto-contrast per box ===
  private applyAutoContrastForBox(textbox: Textbox): void {
    if (!this.canvas || !this.backgroundImage || !this.currentTemplate) return;

    const textBounds = textbox.getBoundingRect();
    const ctx = this.canvas.getContext() as unknown as CanvasRenderingContext2D;

    const sampleX = Math.max(0, Math.floor(textBounds.left));
    const sampleY = Math.max(0, Math.floor(textBounds.top));
    const sampleW = Math.min(Math.floor(textBounds.width), this.currentTemplate.canvas.width - sampleX);
    const sampleH = Math.min(Math.floor(textBounds.height), this.currentTemplate.canvas.height - sampleY);

    if (sampleW <= 0 || sampleH <= 0) return;

    let imageData: ImageData;
    try {
      const wasVisible = textbox.visible;
      textbox.set({ visible: false });
      this.canvas.renderAll();

      imageData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
      textbox.set({ visible: wasVisible });
    } catch {
      textbox.set({ fill: '#ffffff', stroke: '#111827' });
      return;
    }

    const luminance = this.calculateAverageLuminance(imageData);

    if (luminance > 130) {
      textbox.set({ fill: '#111827', stroke: '#ffffff', strokeWidth: 2 });
    } else {
      textbox.set({ fill: '#ffffff', stroke: '#111827', strokeWidth: 2 });
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

      if (a > 30) {
        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
        sampledCount++;
      }
    }

    return sampledCount > 0 ? totalLuminance / sampledCount : 128;
  }

  // === Snap-to-center Guides & Selection Listener ===
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

      if (Math.abs(objCenterX - centerX) < SNAP_THRESHOLD) {
        obj.set({ left: centerX });
        this.snapLineV?.set({ visible: true });
        if (this.snapLineV) this.canvas?.bringObjectToFront(this.snapLineV);
      } else {
        this.snapLineV?.set({ visible: false });
      }

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

    this.canvas.on('object:modified', (e) => {
      this.hideSnapLines();
      const obj = e.target;
      if (obj && obj instanceof Textbox) {
        this.applyAutoContrastForBox(obj);
      }
      this.canvas?.renderAll();
    });
  }

  private setupSelectionListener(): void {
    if (!this.canvas) return;

    const onSelect = (e: { selected?: FabricObject[] }) => {
      const selected = e.selected?.[0];
      if (selected) {
        const blockId = (selected as unknown as Record<string, unknown>)['blockId'] as string;
        if (blockId) {
          this.onBlockSelected.set(blockId);
        }
      }
    };

    this.canvas.on('selection:created', onSelect);
    this.canvas.on('selection:updated', onSelect);
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

      left = Math.max(halfW + 10, Math.min(cw - halfW - 10, left));
      top = Math.max(halfH + 10, Math.min(ch - halfH - 10, top));

      obj.set({ left, top });
      obj.setCoords();
    });
  }
}
