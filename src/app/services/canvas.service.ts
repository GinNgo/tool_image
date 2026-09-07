import { Injectable, NgZone } from '@angular/core';
import * as fabric from 'fabric';
import { TextBlock } from '../models/project.model';
import { EditorStateService } from './editor-state.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  private canvas: fabric.Canvas | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private editorState: EditorStateService,
    private ngZone: NgZone
  ) {}

  initializeCanvas(canvasElement: HTMLCanvasElement, containerElement: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      this.canvas = new fabric.Canvas(canvasElement, {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#f1f5f9'
      });

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

    // Add 40px padding
    const zoom = Math.min(scaleX, scaleY) * 0.95;

    this.canvas.setDimensions({
      width: baseSize.width,
      height: baseSize.height
    }, { cssOnly: false });

    this.canvas.setZoom(zoom);

    // Center it in CSS
    const visualWidth = baseSize.width * zoom;
    const visualHeight = baseSize.height * zoom;

    const canvasEl = this.canvas.getElement();
    if (canvasEl) {
      canvasEl.style.width = `${visualWidth}px`;
      canvasEl.style.height = `${visualHeight}px`;
    }
  }

  private setupEvents(): void {
    if (!this.canvas) return;

    this.canvas.on('selection:created', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:updated', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:cleared', () => {
      this.ngZone.run(() => {
        this.editorState.setActiveTextBlock(null);
      });
    });

    this.canvas.on('object:modified', (e) => {
      // Sync coordinates / text after modification
      if (e.target && e.target.type === 'textbox') {
        this.handleSelection([e.target]);
      }
    });
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
      textAlign: (obj.textAlign as 'left' | 'center' | 'right') || 'left',
      bold: obj.fontWeight === 'bold',
      italic: obj.fontStyle === 'italic'
    };

    this.ngZone.run(() => {
      this.editorState.setActiveTextBlock(block);
    });
  }

  addTextBox(text: string = 'Nhập văn bản...'): void {
    if (!this.canvas) return;

    const baseSize = this.editorState.canvasSize();

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
      name: `tb_${Date.now()}`,
      // Enable PowerPoint-like word wrap resizing (only scale width, not stretching text)
      lockScalingY: true,
      splitByGrapheme: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.5)',
        blur: 4,
        offsetX: 2,
        offsetY: 2
      })
    });

    // Remove middle-top and middle-bottom handles to force width-only resizing
    textbox.setControlsVisibility({
      mt: false,
      mb: false
    });

    this.canvas.add(textbox);
    this.canvas.setActiveObject(textbox);
    this.canvas.requestRenderAll();
  }

  setBackgroundImage(url: string, width: number, height: number): void {
    if (!this.canvas) return;

    this.editorState.setBackgroundImage(url, { width, height });

    // We update base size, but we need to re-trigger resize to fix zoom
    const containerEl = this.canvas.getElement().parentElement?.parentElement;

    fabric.Image.fromURL(url).then((img) => {
      // Fit to canvas strictly by setting width/height
      if (this.canvas) {
        this.canvas.setDimensions({ width, height });
        this.canvas.backgroundImage = img;
        this.canvas.requestRenderAll();

        if (containerEl) {
          this.updateCanvasDisplaySize(containerEl.clientWidth, containerEl.clientHeight);
        }
      }
    });
  }

  
  updateActiveTextFormat(prop: string, value: any): void {
    if (!this.canvas) return;

    const activeObj = this.canvas.getActiveObject() as fabric.Textbox;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (prop === 'fontFamily') activeObj.set('fontFamily', value);
    if (prop === 'fontSize') activeObj.set('fontSize', Number(value));
    if (prop === 'color') activeObj.set('fill', value);
    if (prop === 'textAlign') activeObj.set('textAlign', value);
    if (prop === 'bold') activeObj.set('fontWeight', value ? 'bold' : 'normal');
    if (prop === 'italic') activeObj.set('fontStyle', value ? 'italic' : 'normal');

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
      activeObj.set('shadow', new fabric.Shadow({
        color: 'rgba(0,0,0,0.8)',
        blur: 6,
        offsetX: 3,
        offsetY: 3
      }));
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
        paintFirst: 'stroke'
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
      case 'up': activeObj.top = (activeObj.top || 0) - amount; break;
      case 'down': activeObj.top = (activeObj.top || 0) + amount; break;
      case 'left': activeObj.left = (activeObj.left || 0) - amount; break;
      case 'right': activeObj.left = (activeObj.left || 0) + amount; break;
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

  loadCanvasObjectsJson(json: any): Promise<void> {
    return new Promise((resolve) => {
      if (!this.canvas) return resolve();
      this.canvas.loadFromJSON(json, () => {
        this.canvas?.requestRenderAll();
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
      multiplier: 1 // High res based on original canvas dims
    });
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
