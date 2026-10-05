import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import {
  TypographyConfig,
  TextRibbonConfig,
  TextStrokeConfig,
  TextShadowConfig,
  DEFAULT_TYPOGRAPHY_CONFIG,
  DEFAULT_RIBBON_CONFIG,
  DEFAULT_STROKE_CONFIG,
  DEFAULT_SHADOW_CONFIG,
} from '../models/typography.model';
import { TextLayer } from '../models/project.model';
import { CanvasEngineService } from './canvas-engine.service';

@Injectable({
  providedIn: 'root',
})
export class TypographyService {
  constructor(private canvasEngine: CanvasEngineService) {}

  /**
   * Khởi tạo fabric.Textbox với cấu hình typography tiếng Việt chuẩn
   */
  createTextbox(
    text = 'Nhập nội dung tiếng Việt',
    options: Partial<Omit<TextLayer, 'typography' | 'ribbon' | 'stroke' | 'shadow'>> & {
      typography?: Partial<TypographyConfig>;
      ribbon?: Partial<TextRibbonConfig>;
      stroke?: Partial<TextStrokeConfig>;
      shadow?: Partial<TextShadowConfig>;
    } = {},
  ): fabric.Textbox {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) throw new Error('Canvas chưa được khởi tạo');

    const typo: TypographyConfig = {
      ...DEFAULT_TYPOGRAPHY_CONFIG,
      ...(options.typography || {}),
    };

    const canvasWidth = canvas.width || 1920;
    const canvasHeight = canvas.height || 1080;

    const layerId = options.id || (crypto.randomUUID ? crypto.randomUUID() : 'txt-' + Date.now());
    const layerName = options.name || (text.length > 20 ? text.substring(0, 20) + '...' : text);

    const textbox = new fabric.Textbox(text, {
      left: options.x ?? canvasWidth / 2,
      top: options.y ?? canvasHeight / 2,
      width: options.width ?? Math.min(800, canvasWidth * 0.8),
      originX: 'center',
      originY: 'center',
      fontFamily: typo.fontFamily,
      fontSize: typo.fontSize,
      fontWeight: typo.fontWeight as any,
      fontStyle: typo.fontStyle as any,
      underline: typo.underline,
      textAlign: typo.align,
      lineHeight: typo.lineHeight,
      charSpacing: typo.letterSpacing,
      fill: typo.color,
      splitByGrapheme: false,
      transparentCorners: false,
      cornerColor: '#3b82f6',
      cornerStrokeColor: '#ffffff',
      borderColor: '#3b82f6',
      cornerSize: 10,
      padding: 6,
    });

    (textbox as any).layerId = layerId;
    (textbox as any).layerName = layerName;
    (textbox as any).layerType = 'text';
    (textbox as any).typographyConfig = typo;

    // Xử lý viền chữ (Stroke) nếu có
    if (options.stroke?.enabled) {
      this.setStroke(textbox, options.stroke.color || '#000000', options.stroke.width || 2);
    } else {
      (textbox as any).strokeConfig = { ...DEFAULT_STROKE_CONFIG };
    }

    // Xử lý bóng đổ (Shadow) nếu có
    if (options.shadow?.enabled) {
      this.setShadow(
        textbox,
        options.shadow.color || 'rgba(0,0,0,0.6)',
        options.shadow.blur ?? 8,
        options.shadow.offsetX ?? 2,
        options.shadow.offsetY ?? 4,
      );
    } else {
      (textbox as any).shadowConfig = { ...DEFAULT_SHADOW_CONFIG };
    }

    // Xử lý dải nền chữ (Text Ribbon) nếu có
    if (options.ribbon?.enabled) {
      this.applyRibbonHighlight(textbox, { ...DEFAULT_RIBBON_CONFIG, ...options.ribbon });
    } else {
      (textbox as any).ribbonConfig = { ...DEFAULT_RIBBON_CONFIG };
    }

    // Xử lý bộ gõ Unikey / Telex tiếng Việt
    this.setupVietnameseInputSupport(textbox);

    // Đồng bộ companion ribbon khi textbox di chuyển hoặc thay đổi kích thước
    this.bindTextboxEvents(textbox);

    canvas.add(textbox);
    this.canvasEngine.selectObject(textbox);
    canvas.requestRenderAll();

    return textbox;
  }

  /**
   * Áp dụng dải nền chữ (Text Ribbon Highlight) ôm sát văn bản có bo góc
   */
  applyRibbonHighlight(textbox: fabric.Textbox, ribbon: TextRibbonConfig): void {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return;

    (textbox as any).ribbonConfig = { ...ribbon };

    let ribbonRect = (textbox as any).companionObject as fabric.Rect | undefined;

    if (!ribbon.enabled) {
      if (ribbonRect) {
        canvas.remove(ribbonRect);
        (textbox as any).companionObject = null;
        canvas.requestRenderAll();
      }
      return;
    }

    const paddingX = ribbon.paddingX ?? 16;
    const paddingY = ribbon.paddingY ?? 8;
    const alpha = (ribbon.opacity ?? 90) / 100;
    const fillColor = this.hexToRgba(ribbon.backgroundColor || '#DC2626', alpha);

    const tbWidth = textbox.getScaledWidth();
    const tbHeight = textbox.getScaledHeight();
    const centerPoint = textbox.getCenterPoint();

    if (!ribbonRect) {
      ribbonRect = new fabric.Rect({
        left: centerPoint.x,
        top: centerPoint.y,
        width: tbWidth + paddingX * 2,
        height: tbHeight + paddingY * 2,
        originX: 'center',
        originY: 'center',
        fill: fillColor,
        rx: ribbon.borderRadius || 6,
        ry: ribbon.borderRadius || 6,
        selectable: false,
        evented: false,
        angle: textbox.angle || 0,
      });

      (ribbonRect as any).isRibbonCompanion = true;
      (ribbonRect as any).parentTextbox = textbox;
      (textbox as any).companionObject = ribbonRect;

      canvas.add(ribbonRect);
    } else {
      ribbonRect.set({
        left: centerPoint.x,
        top: centerPoint.y,
        width: tbWidth + paddingX * 2,
        height: tbHeight + paddingY * 2,
        fill: fillColor,
        rx: ribbon.borderRadius || 6,
        ry: ribbon.borderRadius || 6,
        angle: textbox.angle || 0,
      });
    }

    // Đưa ribbonRect nằm ngay bên dưới textbox
    this.positionRibbonBehindTextbox(textbox, ribbonRect);
    canvas.requestRenderAll();
  }

  setFontFamily(textbox: fabric.Textbox, fontFamily: string): void {
    textbox.set('fontFamily', fontFamily);
    this.updateTypoConfig(textbox, { fontFamily });
    this.syncRibbon(textbox);
  }

  setFontSize(textbox: fabric.Textbox, fontSize: number): void {
    textbox.set('fontSize', fontSize);
    this.updateTypoConfig(textbox, { fontSize });
    this.syncRibbon(textbox);
  }

  setColor(textbox: fabric.Textbox, color: string): void {
    textbox.set('fill', color);
    this.updateTypoConfig(textbox, { color });
    this.canvasEngine.renderAll();
  }

  setBold(textbox: fabric.Textbox, bold: boolean): void {
    textbox.set('fontWeight', bold ? 'bold' : 'normal');
    this.updateTypoConfig(textbox, { fontWeight: bold ? 'bold' : 'normal' });
    this.syncRibbon(textbox);
  }

  setItalic(textbox: fabric.Textbox, italic: boolean): void {
    textbox.set('fontStyle', italic ? 'italic' : 'normal');
    this.updateTypoConfig(textbox, { fontStyle: italic ? 'italic' : 'normal' });
    this.syncRibbon(textbox);
  }

  setUnderline(textbox: fabric.Textbox, underline: boolean): void {
    textbox.set('underline', underline);
    this.updateTypoConfig(textbox, { underline });
    this.canvasEngine.renderAll();
  }

  setAlign(textbox: fabric.Textbox, align: 'left' | 'center' | 'right' | 'justify'): void {
    textbox.set('textAlign', align);
    this.updateTypoConfig(textbox, { align });
    this.canvasEngine.renderAll();
  }

  setStroke(textbox: fabric.Textbox, color: string, width: number): void {
    (textbox as any).strokeConfig = { enabled: width > 0, color, width };
    if (width > 0) {
      textbox.set({
        stroke: color,
        strokeWidth: width,
      });
    } else {
      textbox.set({
        stroke: undefined,
        strokeWidth: 0,
      });
    }
    this.canvasEngine.renderAll();
  }

  setShadow(
    textbox: fabric.Textbox,
    color: string,
    blur: number,
    offsetX: number,
    offsetY: number,
  ): void {
    (textbox as any).shadowConfig = {
      enabled: blur > 0 || offsetX !== 0 || offsetY !== 0,
      color,
      blur,
      offsetX,
      offsetY,
    };
    if (blur > 0 || offsetX !== 0 || offsetY !== 0) {
      textbox.set(
        'shadow',
        new fabric.Shadow({
          color,
          blur,
          offsetX,
          offsetY,
        }),
      );
    } else {
      textbox.set('shadow', undefined);
    }
    this.canvasEngine.renderAll();
  }

  setLineHeight(textbox: fabric.Textbox, lineHeight: number): void {
    textbox.set('lineHeight', lineHeight);
    this.updateTypoConfig(textbox, { lineHeight });
    this.syncRibbon(textbox);
  }

  setCharSpacing(textbox: fabric.Textbox, charSpacing: number): void {
    textbox.set('charSpacing', charSpacing);
    this.updateTypoConfig(textbox, { letterSpacing: charSpacing });
    this.syncRibbon(textbox);
  }

  /**
   * Phân tích độ sáng trung bình vùng ảnh dưới hộp chữ và đề xuất màu sắc tương phản tối ưu
   */
  suggestContrast(textbox: fabric.Textbox): { textColor: string; ribbonColor: string } {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return { textColor: '#FFFFFF', ribbonColor: '#DC2626' };

    const center = textbox.getCenterPoint();
    const ctx = canvas.getContext();
    if (!ctx) return { textColor: '#FFFFFF', ribbonColor: '#DC2626' };

    try {
      const pixel = ctx.getImageData(
        Math.max(0, Math.round(center.x)),
        Math.max(0, Math.round(center.y)),
        1,
        1,
      ).data;
      const luminance = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];

      if (luminance > 140) {
        // Nền sáng -> Đề xuất chữ đen hoặc đỏ đậm, ribbon vàng/trắng
        return { textColor: '#0F172A', ribbonColor: '#F59E0B' };
      } else {
        // Nền tối -> Đề xuất chữ trắng/vàng tươi, ribbon đỏ cờ/xanh đậm
        return { textColor: '#FFFFFF', ribbonColor: '#DC2626' };
      }
    } catch {
      return { textColor: '#FFFFFF', ribbonColor: '#DC2626' };
    }
  }

  private setupVietnameseInputSupport(textbox: fabric.Textbox): void {
    textbox.on('editing:entered', () => {
      const textarea = (textbox as any).hiddenTextarea as HTMLTextAreaElement | undefined;
      if (textarea) {
        textarea.setAttribute('autocomplete', 'off');
        textarea.setAttribute('autocorrect', 'off');
        textarea.setAttribute('autocapitalize', 'off');
        textarea.setAttribute('spellcheck', 'false');
      }
    });

    textbox.on('changed', () => {
      this.syncRibbon(textbox);
    });
  }

  private bindTextboxEvents(textbox: fabric.Textbox): void {
    textbox.on('moving', () => this.syncRibbon(textbox));
    textbox.on('scaling', () => this.syncRibbon(textbox));
    textbox.on('rotating', () => this.syncRibbon(textbox));
    textbox.on('resizing', () => this.syncRibbon(textbox));
  }

  private syncRibbon(textbox: fabric.Textbox): void {
    const ribbonConfig = (textbox as any).ribbonConfig as TextRibbonConfig | undefined;
    if (ribbonConfig && ribbonConfig.enabled) {
      this.applyRibbonHighlight(textbox, ribbonConfig);
    }
    this.canvasEngine.renderAll();
  }

  private positionRibbonBehindTextbox(textbox: fabric.Textbox, ribbonRect: fabric.Rect): void {
    const canvas = this.canvasEngine.getCanvas();
    if (!canvas) return;

    // Di chuyển ribbonRect ngay sau textbox trong stack
    const objects = canvas.getObjects();
    const tbIndex = objects.indexOf(textbox);
    const rbIndex = objects.indexOf(ribbonRect);

    if (tbIndex !== -1 && rbIndex !== -1 && rbIndex > tbIndex) {
      // Đưa ribbonRect xuống dưới textbox
      for (let i = 0; i < rbIndex - tbIndex + 1; i++) {
        canvas.sendObjectBackwards(ribbonRect);
      }
    }
  }

  private updateTypoConfig(textbox: fabric.Textbox, partial: Partial<TypographyConfig>): void {
    const current = (textbox as any).typographyConfig || { ...DEFAULT_TYPOGRAPHY_CONFIG };
    (textbox as any).typographyConfig = { ...current, ...partial };
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
