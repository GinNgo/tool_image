import { Injectable, signal } from '@angular/core';
import { Canvas, FabricImage, Textbox, Line, Rect, FabricObject, Shadow } from 'fabric';
import { Template, TextBlock } from '../models/template.model';

const SNAP_THRESHOLD = 14;
const EXPORT_MULTIPLIER = 2;

export interface BlockModifiedEvent {
  id: string;
  x: number;
  y: number;
  width?: number;
  fontSize?: number;
}

export interface TextInlineChangedEvent {
  id: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvas: Canvas | null = null;
  private backgroundImage: FabricImage | null = null;
  private decorationBorder: Rect | null = null;
  private textboxes: Map<string, Textbox> = new Map();
  private snapLineH: Line | null = null;
  private snapLineV: Line | null = null;
  private currentTemplate: Template | null = null;
  private currentZoom: number = 1;

  readonly isCanvasReady = signal(false);
  readonly onBlockSelected = signal<string | null>(null);
  readonly onBlockModified = signal<BlockModifiedEvent | null>(null);
  readonly onTextInlineChanged = signal<TextInlineChangedEvent | null>(null);
  readonly canvasDimensions = signal<{ width: number; height: number }>({ width: 1080, height: 1350 });
  readonly displayDimensions = signal<{ width: number; height: number }>({ width: 1080, height: 1350 });

  initCanvas(canvasElement: HTMLCanvasElement, template: Template, blocks: TextBlock[] = []): void {
    this.dispose();

    this.currentTemplate = template;
    const cw = template.canvas.width;
    const ch = template.canvas.height;
    this.canvasDimensions.set({ width: cw, height: ch });

    this.canvas = new Canvas(canvasElement, {
      width: cw,
      height: ch,
      backgroundColor: '#111827',
      selection: true,
      preserveObjectStacking: true,
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
    this.onBlockModified.set(null);
    this.onTextInlineChanged.set(null);
  }

  async setBackgroundImage(dataUrl: string): Promise<void> {
    if (!this.canvas || !this.currentTemplate) return;

    if (this.backgroundImage) {
      this.canvas.remove(this.backgroundImage);
      this.backgroundImage = null;
    }

    const img = await FabricImage.fromURL(dataUrl);
    const imgW = img.width || 1080;
    const imgH = img.height || 1350;

    // Adapt canvas aspect ratio to uploaded image so image is never "tí tẹo" or awkwardly cropped
    // Maintain standard HD resolution (base width 1080, height proportional)
    const targetWidth = 1080;
    const targetHeight = Math.round(targetWidth * (imgH / imgW));

    // Update current template canvas and fabric dimensions
    this.currentTemplate.canvas = { width: targetWidth, height: targetHeight };
    this.canvasDimensions.set({ width: targetWidth, height: targetHeight });
    this.canvas.setDimensions({ width: targetWidth, height: targetHeight });

    const scale = targetWidth / imgW;

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: targetWidth / 2,
      top: targetHeight / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    this.backgroundImage = img;
    this.canvas.insertAt(0, img);

    // Recreate decorations and snap lines for new dimensions
    this.rebuildGuidesAndDecorations();

    // Keep textboxes above background and re-apply auto contrast
    this.textboxes.forEach((tb) => {
      this.canvas?.bringObjectToFront(tb);
      this.applyAutoContrastForBox(tb);
    });

    if (this.lastContainerWidth > 0 && this.lastContainerHeight > 0) {
      this.fitToViewport(this.lastContainerWidth, this.lastContainerHeight);
    } else {
      this.canvas.renderAll();
    }
  }

  private rebuildGuidesAndDecorations(): void {
    if (!this.canvas || !this.currentTemplate) return;

    if (this.decorationBorder) {
      this.canvas.remove(this.decorationBorder);
      this.decorationBorder = null;
    }
    if (this.snapLineH) {
      this.canvas.remove(this.snapLineH);
      this.snapLineH = null;
    }
    if (this.snapLineV) {
      this.canvas.remove(this.snapLineV);
      this.snapLineV = null;
    }

    this.createDecorations();
    this.createSnapLines();
  }

  // === TextBlock Manipulation (Map<string, Textbox>) ===

  renderTextBlock(block: TextBlock): Textbox | null {
    if (!this.canvas || !this.currentTemplate) return null;

    let tb = this.textboxes.get(block.id);
    const cw = this.currentTemplate.canvas.width;

    const isCustomColor = block.colorMode === 'custom';
    const textContent = block.uppercase ? block.content.toUpperCase() : block.content;
    const boxWidth = block.width || Math.min(cw * 0.85, 900);

    if (!tb) {
      tb = new Textbox(textContent, {
        left: block.x,
        top: block.y,
        originX: 'center',
        originY: 'center',
        width: boxWidth,
        fontFamily: block.fontFamily,
        fontSize: block.fontSize,
        textAlign: block.align,
        fontWeight: block.bold ? 'bold' : 'normal',
        fontStyle: block.italic ? 'italic' : 'normal',
        charSpacing: block.letterSpacing ? block.letterSpacing * 10 : 0,
        lineHeight: block.lineHeight || 1.2,
        fill: isCustomColor ? block.color : '#ffffff',
        stroke: this.computeStrokeColor(block),
        strokeWidth: this.computeStrokeWidth(block),
        paintFirst: 'stroke', // Photoshop-style: stroke is rendered behind fill so letters stay bold & legible!
        backgroundColor: block.effect === 'background' ? (block.backgroundColor || 'rgba(0,0,0,0.75)') : '',
        shadow: this.computeShadow(block),
        editable: true, // PowerPoint-style: double click to edit text inline!
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: true,
        hasControls: true, // Show handles so user can grab, move, and adjust width!
        hasBorders: true,
        borderColor: '#3b82f6',
        borderScaleFactor: 2,
        cornerColor: '#2563eb',
        cornerStrokeColor: '#ffffff',
        cornerStyle: 'circle',
        cornerSize: 12,
        transparentCorners: false,
        padding: 8,
        cursorColor: '#2563eb',
      });

      // Attach custom ID to the fabric object
      (tb as unknown as Record<string, unknown>)['blockId'] = block.id;

      // Inline editing sync (PowerPoint behavior)
      tb.on('changed', () => {
        this.onTextInlineChanged.set({
          id: block.id,
          text: tb?.text || '',
        });
      });

      this.setupObjectMovementAndResize(tb, block.id);
      this.canvas.add(tb);
      this.textboxes.set(block.id, tb);
    } else {
      tb.set({
        text: textContent,
        fontFamily: block.fontFamily,
        fontSize: block.fontSize,
        left: block.x,
        top: block.y,
        textAlign: block.align,
        fontWeight: block.bold ? 'bold' : 'normal',
        fontStyle: block.italic ? 'italic' : 'normal',
        charSpacing: block.letterSpacing ? block.letterSpacing * 10 : 0,
        lineHeight: block.lineHeight || 1.2,
        stroke: this.computeStrokeColor(block),
        strokeWidth: this.computeStrokeWidth(block),
        paintFirst: 'stroke',
        backgroundColor: block.effect === 'background' ? (block.backgroundColor || 'rgba(0,0,0,0.75)') : '',
        shadow: this.computeShadow(block),
      });

      if (isCustomColor) {
        tb.set({ fill: block.color });
      }
    }

    this.autoFitFontSizeForBox(tb, block);
    if (!isCustomColor) {
      this.applyAutoContrastForBox(tb);
    }
    this.canvas.renderAll();
    return tb;
  }

  updateTextBlock(block: TextBlock): void {
    const tb = this.textboxes.get(block.id);
    if (!tb) {
      this.renderTextBlock(block);
      return;
    }

    const isCustomColor = block.colorMode === 'custom';
    const textContent = block.uppercase ? block.content.toUpperCase() : block.content;

    tb.set({
      text: textContent,
      fontFamily: block.fontFamily,
      fontSize: block.fontSize,
      left: block.x,
      top: block.y,
      textAlign: block.align,
      fontWeight: block.bold ? 'bold' : 'normal',
      fontStyle: block.italic ? 'italic' : 'normal',
      charSpacing: block.letterSpacing ? block.letterSpacing * 10 : 0,
      lineHeight: block.lineHeight || 1.2,
      stroke: this.computeStrokeColor(block),
      strokeWidth: this.computeStrokeWidth(block),
      paintFirst: 'stroke',
      backgroundColor: block.effect === 'background' ? (block.backgroundColor || 'rgba(0,0,0,0.75)') : '',
      shadow: this.computeShadow(block),
    });

    if (isCustomColor) {
      tb.set({ fill: block.color });
    }

    this.autoFitFontSizeForBox(tb, block);
    if (!isCustomColor) {
      this.applyAutoContrastForBox(tb);
    }
    this.canvas?.renderAll();
  }

  isCanvasFocused(): boolean {
    return this.canvas !== null;
  }

  isTextEditing(): boolean {
    if (!this.canvas) return false;
    const activeObj = this.canvas.getActiveObject();
    if (activeObj && activeObj.type === 'textbox') {
      return (activeObj as Textbox).isEditing;
    }
    return false;
  }

  requestRenderAll(): void {
    this.canvas?.requestRenderAll();
  }

  removeTextBlock(id: string): void {
    const tb = this.textboxes.get(id);
    if (tb && this.canvas) {
      this.canvas.remove(tb);
      this.textboxes.delete(id);
      this.canvas.renderAll();
    }
  }

  /**
   * Đồng bộ lại toàn bộ các khối chữ lên Canvas (ví dụ khi đổi Mẫu khuôn bố cục PPT)
   */
  syncAllTextBlocks(blocks: TextBlock[]): void {
    if (!this.canvas) return;

    // Remove textboxes not present in blocks
    const newIds = new Set(blocks.map((b) => b.id));
    this.textboxes.forEach((tb, id) => {
      if (!newIds.has(id)) {
        this.canvas?.remove(tb);
        this.textboxes.delete(id);
      }
    });

    // Render or update each block
    blocks.forEach((block) => {
      this.updateTextBlock(block);
    });

    if (blocks.length > 0) {
      this.selectTextBlock(blocks[0].id);
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

    this.onBlockModified.set({
      id,
      x: centerX,
      y: tb.top!,
      width: tb.width,
      fontSize: tb.fontSize,
    });
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

    this.onBlockModified.set({
      id: block.id,
      x: targetX,
      y: targetY,
      width: tb.width,
      fontSize: tb.fontSize,
    });
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
          strokeWidth: 2,
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

  private lastContainerWidth = 0;
  private lastContainerHeight = 0;

  fitToViewport(containerWidth: number, containerHeight: number): void {
    if (containerWidth > 0 && containerHeight > 0) {
      this.lastContainerWidth = containerWidth;
      this.lastContainerHeight = containerHeight;
    }

    if (!this.canvas || !this.currentTemplate) return;
    const { width: vW, height: vH } = this.canvasDimensions();
    const cW = containerWidth || this.lastContainerWidth;
    const cH = containerHeight || this.lastContainerHeight;
    if (vW <= 0 || vH <= 0 || cW <= 0 || cH <= 0) return;

    // Leave comfortable breathing padding around artboard
    const padding = 32;
    const availableW = Math.max(100, cW - padding);
    const availableH = Math.max(100, cH - padding);

    const zoom = Math.min(availableW / vW, availableH / vH, 1);
    this.currentZoom = zoom;

    const dW = Math.round(vW * zoom);
    const dH = Math.round(vH * zoom);

    this.displayDimensions.set({ width: dW, height: dH });
    this.canvas.setDimensions({ width: dW, height: dH });
    this.canvas.setZoom(zoom);
    this.canvas.calcOffset();
    this.canvas.renderAll();
  }

  getCurrentZoom(): number {
    return this.currentZoom;
  }

  exportToPng(): string | null {
    if (!this.canvas) return null;

    this.canvas.discardActiveObject();
    this.hideSnapLines();
    this.canvas.renderAll();

    // With viewport zoom applied, scale multiplier so exported image is 2x Super HD (virtual 2x)
    const exportMultiplier = this.currentZoom > 0 ? EXPORT_MULTIPLIER / this.currentZoom : EXPORT_MULTIPLIER;

    return this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: exportMultiplier,
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

    const maxWidth = this.currentTemplate.canvas.width * 0.92;
    const maxHeight = this.currentTemplate.canvas.height * 0.45;

    let fontSize = block.fontSize || block.maxFontSize;
    textbox.set({ fontSize });

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

    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj || obj === this.snapLineH || obj === this.snapLineV || !this.currentTemplate) return;

      const cw = this.currentTemplate.canvas.width;
      const ch = this.currentTemplate.canvas.height;
      const centerX = cw / 2;
      const centerY = ch / 2;

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
        const blockId = (obj as unknown as Record<string, unknown>)['blockId'] as string;
        if (blockId) {
          this.onBlockModified.set({
            id: blockId,
            x: obj.left!,
            y: obj.top!,
            width: obj.width,
            fontSize: obj.fontSize,
          });
        }
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

  private setupObjectMovementAndResize(obj: FabricObject, blockId: string): void {
    if (!this.canvas) return;

    // Free dragging with soft boundary clamping (never locking or freezing movement!)
    obj.on('moving', () => {
      if (!this.currentTemplate) return;
      const cw = this.currentTemplate.canvas.width;
      const ch = this.currentTemplate.canvas.height;

      let left = obj.left!;
      let top = obj.top!;

      // Soft clamp keeps the object center inside reasonable canvas view
      left = Math.max(30, Math.min(cw - 30, left));
      top = Math.max(30, Math.min(ch - 30, top));

      obj.set({ left, top });
      obj.setCoords();
    });
  }

  private computeStrokeColor(block: TextBlock): string {
    if (block.effect === 'stroke') {
      return block.strokeColor || '#000000';
    }
    if (block.colorMode === 'custom') {
      return block.strokeColor || 'transparent';
    }
    return '#000000';
  }

  private computeStrokeWidth(block: TextBlock): number {
    if (block.effect === 'stroke') {
      return block.strokeWidth || 6;
    }
    if (block.colorMode === 'custom') {
      return block.strokeWidth ?? 0;
    }
    return 2;
  }

  private computeShadow(block: TextBlock): Shadow | null {
    if (!block.effect || block.effect === 'none') {
      return null;
    }

    if (block.effect === 'shadow') {
      return new Shadow({
        color: block.shadowColor || 'rgba(0, 0, 0, 0.85)',
        blur: block.shadowBlur ?? 14,
        offsetX: block.shadowOffsetX ?? 6,
        offsetY: block.shadowOffsetY ?? 8,
      });
    }

    if (block.effect === 'deep-shadow') {
      return new Shadow({
        color: block.shadowColor || 'rgba(0, 0, 0, 0.95)',
        blur: block.shadowBlur ?? 24,
        offsetX: block.shadowOffsetX ?? 10,
        offsetY: block.shadowOffsetY ?? 14,
      });
    }

    if (block.effect === 'glow') {
      return new Shadow({
        color: block.shadowColor || 'rgba(250, 204, 21, 0.95)',
        blur: block.shadowBlur ?? 28,
        offsetX: 0,
        offsetY: 0,
      });
    }

    return null;
  }
}
