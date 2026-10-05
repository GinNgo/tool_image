import { Injectable, signal } from '@angular/core';
import { TemplatePreset } from '../models/template.model';
import { CanvasEngineService } from './canvas-engine.service';
import { TypographyService } from './typography.service';
import { ImageProcessingService } from './image-processing.service';
import { TextLayer } from '../models/project.model';

import tplPropaganda from '../../assets/templates/tpl_propaganda_red_gold.json';
import tplYouth from '../../assets/templates/tpl_youth_volunteer_blue.json';
import tplCeremony from '../../assets/templates/tpl_ceremony_formal_gold.json';
import tplQuote from '../../assets/templates/tpl_quote_artistic.json';
import tplNews from '../../assets/templates/tpl_breaking_news.json';
import tplWelcome from '../../assets/templates/tpl_welcome_banner.json';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  readonly presets = signal<TemplatePreset[]>([
    tplPropaganda as unknown as TemplatePreset,
    tplYouth as unknown as TemplatePreset,
    tplCeremony as unknown as TemplatePreset,
    tplQuote as unknown as TemplatePreset,
    tplNews as unknown as TemplatePreset,
    tplWelcome as unknown as TemplatePreset,
  ]);

  constructor(
    private canvasEngine: CanvasEngineService,
    private typographyService: TypographyService,
    private imageService: ImageProcessingService,
  ) {}

  getPresets(): TemplatePreset[] {
    return this.presets();
  }

  getPresetById(id: string): TemplatePreset | undefined {
    return this.presets().find((p) => p.id === id);
  }

  /**
   * Áp dụng mẫu thiết kế: tính toán tọa độ tương đối theo kích thước thật của canvas hiện tại
   * để sinh ra các lớp chữ, dải băng rôn và dải phủ tối phù hợp mà vẫn bảo toàn ảnh nền của người dùng.
   */
  applyTemplate(templateId: string): void {
    const template = this.getPresetById(templateId);
    if (!template) return;

    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return;

    const canvasWidth = canvas.width || 1920;
    const canvasHeight = canvas.height || 1080;

    // 1. Áp dụng Lớp phủ làm tối (Dimmer Overlay) nếu mẫu yêu cầu
    if (template.dimmerOverlay) {
      this.imageService.setDimmerOverlay(template.dimmerOverlay);
    }

    // 2. Xóa các lớp chữ/hình hiện tại (bảo toàn ảnh nền và đường gióng)
    const objects = [...canvas.getObjects()];
    objects.forEach((obj) => {
      if (
        !(obj as any).isBackgroundImage &&
        !(obj as any).isDimmerOverlay &&
        !(obj as any).excludeFromExport
      ) {
        canvas.remove(obj);
      }
    });

    // 3. Hệ số co giãn kích thước chữ theo tỷ lệ canvas thực tế so với chuẩn 1920px
    const scaleFactor = Math.max(0.5, Math.min(2.0, canvasWidth / 1920));

    // 4. Sinh ra các lớp chữ từ cấu hình tương đối
    for (const def of template.defaultLayers) {
      if (def.type === 'text' && def.textConfig) {
        const textConf = def.textConfig;
        const typo = textConf.typography;

        const posX = Math.round(def.relativeX * canvasWidth);
        const posY = Math.round(def.relativeY * canvasHeight);
        const width = Math.round(def.relativeWidth * canvasWidth);

        const scaledFontSize = typo?.fontSize ? Math.round(typo.fontSize * scaleFactor) : 48;

        const layerOptions: Partial<TextLayer> = {
          x: posX,
          y: posY,
          width,
          typography: typo
            ? {
                ...typo,
                fontSize: scaledFontSize,
              }
            : undefined,
          ribbon: textConf.ribbon,
          stroke: textConf.stroke,
          shadow: textConf.shadow,
        };

        this.typographyService.createTextbox(textConf.text || '', layerOptions);
      }
    }

    canvas.requestRenderAll();
  }
}
