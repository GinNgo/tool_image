import { Injectable, NgZone } from '@angular/core';
import * as fabric from 'fabric';
import { TextBlock, LayerInfo } from '../models/project.model';
import { EditorStateService } from './editor-state.service';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  private canvas: fabric.Canvas | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private editorState: EditorStateService,
    private ngZone: NgZone,
  ) {}

  initializeCanvas(canvasElement: HTMLCanvasElement, containerElement: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      const baseSize = this.editorState.canvasSize();
      this.canvas = new fabric.Canvas(canvasElement, {
        width: baseSize.width,
        height: baseSize.height,
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#f1f5f9',
      });

      // Trigger initial resize immediately
      setTimeout(() => {
        if (containerElement) {
          this.updateCanvasDisplaySize(containerElement.clientWidth, containerElement.clientHeight);
        }
      }, 50);

      this.setupResponsiveScaling(containerElement);
      this.setupEvents();
    });
  }

  private setupResponsiveScaling(containerElement: HTMLElement): void {
    if (!this.canvas) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.updateCanvasDisplaySize(entry.contentRect.width, entry.contentRect.height);
      }
    });

    this.resizeObserver.observe(containerElement);
  }

  private updateCanvasDisplaySize(containerWidth: number, containerHeight: number): void {
    if (!this.canvas) return;

    const baseSize = this.editorState.canvasSize();

    // Calculate aspect-ratio preserving zoom
    const scaleX = containerWidth / baseSize.width;
    const scaleY = containerHeight / baseSize.height;

    // Add 40px padding (so 0.9 or 0.95)
    const zoom = Math.min(scaleX, scaleY) * 0.95;

    this.canvas.setDimensions({
      width: baseSize.width,
      height: baseSize.height,
    });

    this.canvas.setZoom(zoom);

    // Center it in CSS
    const visualWidth = baseSize.width * zoom;
    const visualHeight = baseSize.height * zoom;

    // In Fabric v7+, setDimensions({ cssOnly: true }) might be missing or different,
    // so we manually apply the CSS styles to all relevant layers:
    const canvasContainer =
      (this.canvas as any).wrapperEl || document.querySelector('.canvas-container');
    const lowerCanvas = document.querySelector('.lower-canvas') as HTMLCanvasElement;
    const upperCanvas = document.querySelector('.upper-canvas') as HTMLCanvasElement;

    if (canvasContainer) {
      (canvasContainer as HTMLElement).style.width = `${visualWidth}px`;
      (canvasContainer as HTMLElement).style.height = `${visualHeight}px`;
    }
    if (lowerCanvas) {
      lowerCanvas.style.width = `${visualWidth}px`;
      lowerCanvas.style.height = `${visualHeight}px`;
    }
    if (upperCanvas) {
      upperCanvas.style.width = `${visualWidth}px`;
      upperCanvas.style.height = `${visualHeight}px`;
    }

    this.canvas.requestRenderAll();
  }

  private setupEvents(): void {
    if (!this.canvas) return;

    this.canvas.on('selection:created', (e) => {
      this.handleSelection(e.selected);
      this.refreshLayers();
    });
    this.canvas.on('selection:updated', (e) => {
      this.handleSelection(e.selected);
      this.refreshLayers();
    });
    this.canvas.on('selection:cleared', () => {
      this.ngZone.run(() => {
        this.editorState.setActiveTextBlock(null);
      });
      this.refreshLayers();
    });

    this.canvas.on('object:modified', (e) => {
      if (e.target && e.target.type === 'textbox') {
        this.handleSelection([e.target]);
      }
      this.refreshLayers();
    });

    this.canvas.on('object:added', () => this.refreshLayers());
    this.canvas.on('object:removed', () => this.refreshLayers());
  }

  private handleSelection(selected: fabric.Object[] | undefined): void {
    if (!selected || selected.length !== 1) {
      this.ngZone.run(() => this.editorState.setActiveTextBlock(null));
      return;
    }

    const obj = selected[0] as fabric.Textbox;
    if (obj.type !== 'textbox') return;

    const block: TextBlock = {
      id: (obj as any).name || `tb_${Date.now()}`,
      text: obj.text || '',
      x: obj.left || 0,
      y: obj.top || 0,
      width: obj.width || 200,
      fontFamily: obj.fontFamily || 'Arial',
      fontSize: obj.fontSize || 40,
      color: (obj.fill as string) || '#000000',
      backgroundColor: (obj.backgroundColor as string) || '',
      textAlign: (obj.textAlign as 'left' | 'center' | 'right') || 'left',
      bold: obj.fontWeight === 'bold',
      italic: obj.fontStyle === 'italic',
      layerName: (obj as any).layerName || '',
      visible: obj.visible !== false,
      locked: !(obj.selectable !== false),
      opacity: obj.opacity ?? 1,
      letterSpacing: (obj as any).charSpacing || 0,
      lineHeight: obj.lineHeight || 1.2,
    };

    this.ngZone.run(() => {
      this.editorState.setActiveTextBlock(block);
    });
  }

  addTextBox(text: string = 'Nhập văn bản...'): void {
    if (!this.canvas) return;

    const baseSize = this.editorState.canvasSize();

    const tbName = `tb_${Date.now()}`;
    const textbox = new fabric.Textbox(text, {
      left: baseSize.width / 2,
      top: baseSize.height / 2,
      originX: 'center',
      originY: 'center',
      width: Math.min(baseSize.width * 0.8, 600),
      fontSize: 60,
      fontFamily: 'Arial',
      fill: '#ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
      name: tbName,
      // Enable PowerPoint-like word wrap resizing (only scale width, not stretching text)
      lockScalingY: true,
      splitByGrapheme: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.5)',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      }),
    });
    (textbox as any).layerName = `Văn bản ${this.getTextBoxCount() + 1}`;

    // Remove middle-top and middle-bottom handles to force width-only resizing
    textbox.setControlsVisibility({
      mt: false,
      mb: false,
    });

    this.canvas.add(textbox);
    this.canvas.setActiveObject(textbox);
    this.canvas.requestRenderAll();
  }

  private bgImage: fabric.Image | null = null;
  public isBgEditing = false;

  setBackgroundImage(
    url: string,
    width?: number,
    height?: number,
    fitMode: 'match-image' | 'cover' = 'match-image',
  ): void {
    if (!this.canvas) return;

    fabric.Image.fromURL(url).then((img) => {
      if (!this.canvas) return;

      const imgWidth = width || img.width || 1080;
      const imgHeight = height || img.height || 1080;

      // Clean up previous background object by reference or by name
      if (this.bgImage) {
        this.canvas.remove(this.bgImage);
      }
      const existingBgs = this.canvas.getObjects().filter((o) => (o as any).name === 'bg_image');
      existingBgs.forEach((bg) => this.canvas?.remove(bg));

      this.bgImage = null;
      this.canvas.backgroundImage = undefined;
      this.bgImage = img;

      if (fitMode === 'match-image') {
        // Tự động điều chỉnh kích thước Canvas khớp 100% với kích thước pixel gốc của ảnh!
        this.editorState.setBackgroundImage(url, { width: imgWidth, height: imgHeight });
        this.canvas.setDimensions({ width: imgWidth, height: imgHeight });

        img.set({
          scaleX: 1,
          scaleY: 1,
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          name: 'bg_image',
        });
      } else {
        // Giữ kích thước Canvas hiện tại và scale ảnh phủ kín
        const baseSize = this.editorState.canvasSize();
        this.editorState.setBackgroundImage(url);

        const scale = Math.max(baseSize.width / imgWidth, baseSize.height / imgHeight);
        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: baseSize.width / 2,
          top: baseSize.height / 2,
          selectable: false,
          evented: false,
          name: 'bg_image',
        });
      }

      this.canvas.add(img);
      (this.canvas as any).sendObjectToBack
        ? (this.canvas as any).sendObjectToBack(img)
        : (this.canvas as any).sendToBack(img);

      // Cập nhật lại zoom hiển thị để vừa vặn hoàn hảo trong màn hình làm việc
      const containerEl = document.querySelector('.layout-workspace') as HTMLElement;
      if (containerEl) {
        this.updateCanvasDisplaySize(containerEl.clientWidth, containerEl.clientHeight);
      } else {
        this.canvas.requestRenderAll();
      }
    });
  }

  setCanvasDimensions(width: number, height: number): void {
    if (!this.canvas) return;

    this.editorState.canvasSize.set({ width, height });
    this.canvas.setDimensions({ width, height });

    // Nếu đang có ảnh nền, tự động căn lại ảnh theo khung mới
    if (this.bgImage && this.bgImage.width && this.bgImage.height) {
      const scale = Math.max(width / this.bgImage.width, height / this.bgImage.height);
      this.bgImage.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: width / 2,
        top: height / 2,
      });
      this.bgImage.setCoords();
    }

    const containerEl = document.querySelector('.layout-workspace') as HTMLElement;
    if (containerEl) {
      this.updateCanvasDisplaySize(containerEl.clientWidth, containerEl.clientHeight);
    } else {
      this.canvas.requestRenderAll();
    }
  }

  toggleBackgroundEdit(): boolean {
    if (!this.canvas || !this.bgImage) return false;

    this.isBgEditing = !this.isBgEditing;

    if (this.isBgEditing) {
      this.bgImage.set({
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      this.canvas.setActiveObject(this.bgImage);
    } else {
      this.bgImage.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
      this.canvas.discardActiveObject();
      // Ensure it stays at back
      (this.canvas as any).sendObjectToBack
        ? (this.canvas as any).sendObjectToBack(this.bgImage)
        : (this.canvas as any).sendToBack(this.bgImage);
    }

    this.canvas.requestRenderAll();
    return this.isBgEditing;
  }

  resetBackgroundFit(mode: 'cover' | 'contain' | 'center'): void {
    if (!this.canvas || !this.bgImage) return;

    const baseSize = this.editorState.canvasSize();
    const imgWidth = this.bgImage.width || baseSize.width;
    const imgHeight = this.bgImage.height || baseSize.height;

    let scale = 1;
    if (mode === 'cover') {
      scale = Math.max(baseSize.width / imgWidth, baseSize.height / imgHeight);
    } else if (mode === 'contain') {
      scale = Math.min(baseSize.width / imgWidth, baseSize.height / imgHeight);
    } else {
      scale = this.bgImage.scaleX || 1;
    }

    this.bgImage.set({
      scaleX: scale,
      scaleY: scale,
      originX: 'center',
      originY: 'center',
      left: baseSize.width / 2,
      top: baseSize.height / 2,
    });

    this.bgImage.setCoords();
    this.canvas.requestRenderAll();
  }

  removeBackgroundImage(): void {
    if (!this.canvas) return;

    if (this.bgImage) {
      this.canvas.remove(this.bgImage);
    }
    const existingBgs = this.canvas.getObjects().filter((o) => (o as any).name === 'bg_image');
    existingBgs.forEach((bg) => this.canvas?.remove(bg));

    this.bgImage = null;
    this.canvas.backgroundImage = undefined;
    this.editorState.setBackgroundImage(null);
    this.canvas.requestRenderAll();
  }

  updateActiveTextFormat(prop: string, value: any): void {
    if (!this.canvas) return;

    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (prop === 'fontFamily') activeObj.set('fontFamily', value);
    if (prop === 'fontSize') activeObj.set('fontSize', Number(value));
    if (prop === 'color') activeObj.set('fill', value);
    if (prop === 'backgroundColor') activeObj.set('backgroundColor', value);
    if (prop === 'textAlign') activeObj.set('textAlign', value);
    if (prop === 'bold') activeObj.set('fontWeight', value ? 'bold' : 'normal');
    if (prop === 'italic') activeObj.set('fontStyle', value ? 'italic' : 'normal');
    if (prop === 'letterSpacing') activeObj.set('charSpacing', Number(value));
    if (prop === 'lineHeight') activeObj.set('lineHeight', Number(value));
    if (prop === 'opacity') activeObj.set('opacity', Number(value));

    this.canvas.requestRenderAll();
    this.handleSelection([activeObj]);
  }

  toggleTextBackground(color: string = 'rgba(220, 38, 38, 0.95)'): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (activeObj.backgroundColor) {
      activeObj.set('backgroundColor', '');
    } else {
      activeObj.set('backgroundColor', color);
    }

    this.canvas.requestRenderAll();
    this.handleSelection([activeObj]);
  }

  toggleShadow(): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (activeObj.shadow) {
      activeObj.set('shadow', null);
    } else {
      activeObj.set(
        'shadow',
        new fabric.Shadow({
          color: 'rgba(0,0,0,0.8)',
          blur: 6,
          offsetX: 3,
          offsetY: 3,
        }),
      );
    }
    this.canvas.requestRenderAll();
  }

  toggleStroke(): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (activeObj.strokeWidth && activeObj.strokeWidth > 0) {
      activeObj.set({ strokeWidth: 0, stroke: null });
    } else {
      activeObj.set({
        stroke: '#000000',
        strokeWidth: 2,
        paintFirst: 'stroke',
      });
    }
    this.canvas.requestRenderAll();
  }

  isEditingText(): boolean {
    if (!this.canvas) return false;
    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    return activeObj && activeObj.type === 'textbox' && activeObj.isEditing;
  }

  deleteActiveObject(): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject();
    if (activeObj) {
      this.canvas.remove(activeObj);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  nudgeActiveObject(direction: 'up' | 'down' | 'left' | 'right', amount: number): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject();
    if (!activeObj) return;

    switch (direction) {
      case 'up':
        activeObj.top = (activeObj.top || 0) - amount;
        break;
      case 'down':
        activeObj.top = (activeObj.top || 0) + amount;
        break;
      case 'left':
        activeObj.left = (activeObj.left || 0) - amount;
        break;
      case 'right':
        activeObj.left = (activeObj.left || 0) + amount;
        break;
    }

    activeObj.setCoords();
    this.canvas.requestRenderAll();
    // Fire modified to update state
    this.canvas.fire('object:modified', { target: activeObj });
  }

  getCanvasObjectsJson(): any {
    if (!this.canvas) return null;
    return this.canvas.toJSON();
  }

  clearCanvasText(): void {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects();
    const textObjects = objects.filter((obj) => obj.type === 'textbox');
    textObjects.forEach((obj) => this.canvas?.remove(obj));
    this.canvas.requestRenderAll();
  }

  addConfiguredTextBox(block: any): void {
    if (!this.canvas) return;
    const textbox = new fabric.Textbox(block.text, {
      left: block.x,
      top: block.y,
      originX: 'center',
      originY: 'center',
      width: block.width,
      fontSize: block.fontSize,
      fontFamily: block.fontFamily,
      fill: block.color,
      textAlign: block.textAlign,
      fontWeight: block.bold ? 'bold' : 'normal',
      fontStyle: block.italic ? 'italic' : 'normal',
      name: `tb_${Date.now()}_${Math.random()}`,
      lockScalingY: true,
      splitByGrapheme: true,
    });
    (textbox as any).layerName = block.layerName || `Văn bản ${this.getTextBoxCount() + 1}`;

    if (block.effect === 'shadow' || block.effect === 'deep-shadow') {
      textbox.set(
        'shadow',
        new fabric.Shadow({
          color: block.shadowColor || 'rgba(0,0,0,0.5)',
          blur: block.shadowBlur || 4,
          offsetX: block.shadowOffsetX || 2,
          offsetY: block.shadowOffsetY || 2,
        }),
      );
    }

    if (block.effect === 'stroke' || block.effect === 'deep-shadow') {
      textbox.set({
        stroke: block.strokeColor || '#000000',
        strokeWidth: block.strokeWidth || 2,
        paintFirst: 'stroke',
      });
    }

    if (block.effect === 'background') {
      textbox.set('backgroundColor', block.backgroundColor || 'rgba(0,0,0,0.5)');
    }

    if (block.opacity !== undefined) {
      textbox.set('opacity', block.opacity);
    }

    textbox.setControlsVisibility({
      mt: false,
      mb: false,
    });

    this.canvas.add(textbox);
    this.canvas.requestRenderAll();
  }

  loadCanvasObjectsJson(json: any): Promise<void> {
    return new Promise((resolve) => {
      if (!this.canvas) return resolve();
      this.canvas.loadFromJSON(json, () => {
        // Re-bind this.bgImage if one was saved with name === 'bg_image'
        const foundBg = this.canvas
          ?.getObjects()
          .find((o) => (o as any).name === 'bg_image') as fabric.Image;
        if (foundBg) {
          this.bgImage = foundBg;
          // Ensure it cannot be selected directly unless edit mode is enabled
          foundBg.set({
            selectable: false,
            evented: false,
          });
        }
        this.canvas?.requestRenderAll();
        this.refreshLayers();
        resolve();
      });
    });
  }

  exportToPng(): string | null {
    if (!this.canvas) return null;

    // Temporarily discard active object to remove bounding boxes
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();

    return this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1, // High res based on original canvas dims
    });
  }

  // ── Layer Management ──────────────────────────────────────────────

  private getTextBoxCount(): number {
    if (!this.canvas) return 0;
    return this.canvas.getObjects().filter((o) => o.type === 'textbox').length;
  }

  refreshLayers(): void {
    if (!this.canvas) return;
    const activeObj = this.canvas.getActiveObject();
    const objects = this.canvas.getObjects();
    const layers: LayerInfo[] = [];

    // Build layer list in reverse order (top layer first)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const objName = (obj as any).name || '';

      if (obj.type === 'textbox') {
        const tb = obj as fabric.Textbox;
        layers.push({
          id: objName,
          name: (obj as any).layerName || objName,
          type: 'text',
          visible: obj.visible !== false,
          locked: obj.selectable === false,
          isActive: obj === activeObj,
          opacity: obj.opacity ?? 1,
          preview: (tb.text || '').substring(0, 30) || '(Trống)',
        });
      } else if (objName === 'bg_image') {
        layers.push({
          id: 'bg_image',
          name: 'Ảnh nền',
          type: 'background',
          visible: obj.visible !== false,
          locked: true,
          isActive: false,
          opacity: obj.opacity ?? 1,
          preview: '[Ảnh nền]',
        });
      }
    }

    this.ngZone.run(() => {
      this.editorState.updateLayers(layers);
    });
  }

  setLayerVisibility(objectId: string, visible: boolean): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj) return;

    obj.set('visible', visible);
    if (!visible) {
      // Deselect if hidden
      if (this.canvas.getActiveObject() === obj) {
        this.canvas.discardActiveObject();
      }
    }
    this.canvas.requestRenderAll();
    this.refreshLayers();
  }

  setLayerLock(objectId: string, locked: boolean): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj || (obj as any).name === 'bg_image') return;

    obj.set({
      selectable: !locked,
      evented: !locked,
      hasControls: !locked,
      hasBorders: !locked,
    });

    if (locked && this.canvas.getActiveObject() === obj) {
      this.canvas.discardActiveObject();
    }

    this.canvas.requestRenderAll();
    this.refreshLayers();
  }

  reorderLayers(objectId: string, direction: 'up' | 'down'): void {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects();
    const idx = objects.findIndex((o) => (o as any).name === objectId);
    if (idx === -1) return;

    const obj = objects[idx];

    if (direction === 'up' && idx < objects.length - 1) {
      // Move forward (visually up = higher z-index)
      const nextObj = objects[idx + 1];
      // Don't swap past background
      if ((nextObj as any).name === 'bg_image') return;
      this.canvas.moveObjectTo(obj, idx + 1);
    } else if (direction === 'down' && idx > 0) {
      // Move backward (visually down = lower z-index)
      const prevObj = objects[idx - 1];
      if ((prevObj as any).name === 'bg_image') return;
      this.canvas.moveObjectTo(obj, idx - 1);
    }

    this.canvas.requestRenderAll();
    this.refreshLayers();
  }

  renameLayer(objectId: string, name: string): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj) return;

    (obj as any).layerName = name;
    this.refreshLayers();
  }

  setLayerOpacity(objectId: string, opacity: number): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj) return;

    obj.set('opacity', Math.max(0, Math.min(1, opacity)));
    this.canvas.requestRenderAll();
    this.refreshLayers();
  }

  selectLayerById(objectId: string): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj || obj.visible === false || obj.selectable === false) return;

    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
  }

  deleteLayerById(objectId: string): void {
    if (!this.canvas) return;
    const obj = this.canvas.getObjects().find((o) => (o as any).name === objectId);
    if (!obj || (obj as any).name === 'bg_image') return;

    this.canvas.remove(obj);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  // ── Template Content Fill ─────────────────────────────────────────

  fillTemplateContent(fills: { layerName: string; text: string }[]): void {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects();

    for (const fill of fills) {
      const obj = objects.find(
        (o) => o.type === 'textbox' && (o as any).layerName === fill.layerName,
      ) as fabric.Textbox | undefined;

      if (obj) {
        obj.set('text', fill.text);
      }
    }

    this.canvas.requestRenderAll();
    this.refreshLayers();
  }

  swapBackgroundKeepLayout(imageUrl: string, width?: number, height?: number): void {
    this.setBackgroundImage(imageUrl, width, height, 'cover');
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
}
