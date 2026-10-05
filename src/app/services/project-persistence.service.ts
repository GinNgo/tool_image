import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { ProjectDocument, CanvasLayer, TextLayer } from '../models/project.model';
import { CanvasEngineService } from './canvas-engine.service';
import { ImageProcessingService } from './image-processing.service';
import { TypographyService } from './typography.service';
import { StudioStateService } from './studio-state.service';
import {
  DEFAULT_TYPOGRAPHY_CONFIG,
  DEFAULT_RIBBON_CONFIG,
  DEFAULT_STROKE_CONFIG,
  DEFAULT_SHADOW_CONFIG,
} from '../models/typography.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectPersistenceService {
  private readonly STORAGE_DRAFT_KEY = 'tool_image_studio_draft_v2';

  constructor(
    private canvasEngine: CanvasEngineService,
    private imageProcessing: ImageProcessingService,
    private typography: TypographyService,
    private studioState: StudioStateService,
  ) {}

  /**
   * Trích xuất toàn bộ cấu hình canvas, lớp chữ, bộ lọc ảnh nền thành JSON chuẩn ProjectDocument v2.0
   */
  exportProjectToJson(): ProjectDocument {
    const canvasConfig = this.canvasEngine.canvasConfig();
    const bgConfig = this.imageProcessing.currentBackground();
    const canvas = this.canvasEngine.getCanvas();

    const layers: CanvasLayer[] = [];

    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach((obj, idx) => {
        // Bỏ qua ảnh nền, dimmer, ribbon companion và snapping guides
        if (
          (obj as any).isBackgroundImage ||
          (obj as any).isDimmerOverlay ||
          (obj as any).isRibbonCompanion ||
          (obj as any).excludeFromExport
        ) {
          return;
        }

        if (obj.type === 'textbox' || obj.type === 'text') {
          const tb = obj as fabric.Textbox;
          const typo = (tb as any).typographyConfig || {
            ...DEFAULT_TYPOGRAPHY_CONFIG,
            fontFamily: tb.fontFamily || 'Montserrat',
            fontSize: tb.fontSize || 48,
            color: (tb.fill as string) || '#FFFFFF',
            align: tb.textAlign || 'center',
          };
          const ribbon = (tb as any).ribbonConfig || { ...DEFAULT_RIBBON_CONFIG };
          const stroke = (tb as any).strokeConfig || { ...DEFAULT_STROKE_CONFIG };
          const shadow = (tb as any).shadowConfig || { ...DEFAULT_SHADOW_CONFIG };

          const textLayer: TextLayer = {
            id: (tb as any).layerId || (crypto.randomUUID ? crypto.randomUUID() : 'layer-' + idx),
            type: 'text',
            name: (tb as any).layerName || tb.text || 'Lớp chữ',
            x: tb.left || 0,
            y: tb.top || 0,
            width: tb.width || 400,
            height: tb.height || 100,
            rotation: tb.angle || 0,
            opacity: tb.opacity ?? 1,
            visible: tb.visible ?? true,
            locked: !tb.selectable,
            zIndex: idx,
            text: tb.text || '',
            typography: typo,
            ribbon,
            stroke,
            shadow,
          };

          layers.push(textLayer);
        }
      });
    }

    const doc: ProjectDocument = {
      version: '2.0.0',
      id: crypto.randomUUID ? crypto.randomUUID() : 'proj-' + Date.now(),
      title: this.studioState.projectTitle(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canvas: { ...canvasConfig },
      background: bgConfig ? { ...bgConfig } : null,
      layers,
      meta: {
        appName: 'ToolImage Studio',
        appVersion: '2.0.0',
      },
    };

    return doc;
  }

  /**
   * Tái dựng nguyên vẹn canvas từ tệp JSON ProjectDocument
   */
  async importProjectFromJson(doc: ProjectDocument): Promise<void> {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) throw new Error('Canvas chưa được khởi tạo');

    // 1. Phục hồi tên dự án & canvas config
    this.studioState.setProjectTitle(doc.title || 'Dự án Khôi phục');
    this.canvasEngine.setDimensions(
      doc.canvas.width || 1920,
      doc.canvas.height || 1080,
      doc.canvas.aspectRatio || '16:9',
    );

    // 2. Xóa các đối tượng người dùng hiện tại (giữ lại snapping lines)
    const objects = [...canvas.getObjects()];
    objects.forEach((obj) => {
      if (!(obj as any).excludeFromExport) {
        canvas.remove(obj);
      }
    });

    // 3. Phục hồi ảnh nền và bộ lọc nếu có
    if (doc.background && doc.background.sourceDataUrl) {
      await this.imageProcessing.setBackgroundImage(
        doc.background.sourceDataUrl,
        doc.background.fitMode || 'fit',
      );

      if (doc.background.adjustments) {
        this.imageProcessing.applyAdjustments(doc.background.adjustments);
      }

      if (doc.background.dimmerOverlay) {
        this.imageProcessing.setDimmerOverlay(doc.background.dimmerOverlay);
      }
    }

    // 4. Phục hồi các lớp Text & Shape
    if (doc.layers && doc.layers.length > 0) {
      for (const layer of doc.layers) {
        if (layer.type === 'text') {
          const textLayer = layer as TextLayer;
          this.typography.createTextbox(textLayer.text, textLayer);
        }
      }
    }

    this.studioState.markDirty(false);
    canvas.requestRenderAll();
  }

  /**
   * Tự động lưu bản nháp vào LocalStorage
   */
  saveToLocalDraft(): void {
    try {
      const doc = this.exportProjectToJson();
      localStorage.setItem(this.STORAGE_DRAFT_KEY, JSON.stringify(doc));
    } catch (e) {
      console.warn('Không thể lưu bản nháp vào LocalStorage:', e);
    }
  }

  /**
   * Khôi phục bản nháp từ LocalStorage
   */
  restoreFromLocalDraft(): ProjectDocument | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_DRAFT_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as ProjectDocument;
    } catch {
      return null;
    }
  }
}
