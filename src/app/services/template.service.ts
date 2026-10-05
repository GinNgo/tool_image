import { Injectable, signal } from '@angular/core';
import { LayoutMaster, CustomTemplate } from '../models/project.model';
import { TemplateStorageService } from './template-storage.service';

export const DEFAULT_LAYOUT_MASTERS: LayoutMaster[] = [
  {
    id: 'header_top',
    name: 'TiÃªu Ä‘á» trÃªn Ä‘á»‰nh',
    description: 'Bá»‘ cá»¥c chá»¯ á»Ÿ phÃ­a trÃªn, nhÆ°á»ng khÃ´ng gian cho chá»§ thá»ƒ áº£nh',
    category: 'header',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'CHÃ€O ÄÃ“N Sá»° KIá»†N Má»šI',
        x: 540,
        y: 180,
        width: 800,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 56,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'stroke',
        strokeColor: '#000000',
        strokeWidth: 3,
      },
      {
        text: 'Thá»i gian & Äá»‹a Ä‘iá»ƒm diá»…n ra chÆ°Æ¡ng trÃ¬nh',
        x: 540,
        y: 260,
        width: 700,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 30,
        color: '#facc15',
        textAlign: 'center',
        bold: false,
        italic: true,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
  },
  {
    id: 'bottom_banner',
    name: 'Khung chá»¯ dÆ°á»›i chÃ¢n',
    description: 'TiÃªu Ä‘á» lá»›n ná»•i báº­t kÃ¨m thÃ´ng Ä‘iá»‡p á»Ÿ pháº§n chÃ¢n trang',
    category: 'banner',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'TIÃŠU Äá»€ Ná»”I Báº¬T NHáº¤T',
        x: 540,
        y: 1100,
        width: 900,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 64,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'deep-shadow',
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        strokeColor: '#000000',
        strokeWidth: 2,
      },
      {
        text: 'ThÃ´ng Ä‘iá»‡p hÃ nh Ä‘á»™ng hoáº·c Ä‘Æ°á»ng link trang web',
        x: 540,
        y: 1200,
        width: 800,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 32,
        color: '#fef08a',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
  },
  {
    id: 'center_ribbon',
    name: 'BÄƒng rÃ´n trung tÃ¢m (Ribbon)',
    description: 'Há»™p chá»¯ cÃ³ ná»n mÃ u tÆ°Æ¡ng pháº£n ngay giá»¯a bá»©c áº£nh',
    category: 'banner',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'KHUYáº¾N MÃƒI Äáº¶C BIá»†T',
        x: 540,
        y: 640,
        width: 850,
        fontFamily: '"Anton", sans-serif',
        fontSize: 68,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'background',
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
      },
      {
        text: 'DÃ nh riÃªng cho khÃ¡ch hÃ ng thÃ¢n thiáº¿t trong hÃ´m nay',
        x: 540,
        y: 730,
        width: 750,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 28,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
  },
  {
    id: 'quote_author',
    name: 'TrÃ­ch dáº«n & TÃ¡c giáº£',
    description: 'Phong cÃ¡ch thÆ¡ vÄƒn trang nhÃ£, má»m máº¡i vÃ  Ã½ nghÄ©a',
    category: 'quote',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: '"Háº¡nh phÃºc khÃ´ng pháº£i Ä‘Ã­ch Ä‘áº¿n, mÃ  lÃ  má»™t hÃ nh trÃ¬nh."',
        x: 540,
        y: 950,
        width: 800,
        fontFamily: '"Playfair Display", serif',
        fontSize: 48,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: true,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 6,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
      {
        text: 'â€” DANH NGÃ”N CUá»˜C Sá»NG â€”',
        x: 540,
        y: 1050,
        width: 500,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 26,
        color: '#fde047',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 3,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
      },
    ],
  },
  {
    id: 'propaganda_slogan',
    name: 'BÄƒng rÃ´n Kháº©u hiá»‡u Äá»',
    description: 'Phong cÃ¡ch tuyÃªn truyá»n rá»±c rá»¡, chá»¯ vÃ ng trÃªn ná»n bÄƒng rÃ´n Ä‘á»',
    category: 'banner',
    canvasWidth: 1080,
    canvasHeight: 1080,
    blocks: [
      {
        text: 'NHIá»†T LIá»†T CHÃ€O Má»ªNG',
        x: 540,
        y: 150,
        width: 900,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 48,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'stroke',
        strokeColor: '#000000',
        strokeWidth: 2,
      },
      {
        text: 'Äáº I Há»˜I Äáº I BIá»‚U TOÃ€N QUá»C Láº¦N THá»¨ XIII',
        x: 540,
        y: 250,
        width: 1000,
        fontFamily: '"Anton", sans-serif',
        fontSize: 72,
        color: '#fde047',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'background',
        backgroundColor: 'rgba(220, 38, 38, 0.95)',
      },
      {
        text: 'Nhiá»‡m ká»³ 2025 - 2030',
        x: 540,
        y: 360,
        width: 600,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 36,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'deep-shadow',
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
      },
    ],
  },
  {
    id: 'propaganda_youth',
    name: 'Thanh niÃªn Xung kÃ­ch',
    description: 'Phong cÃ¡ch Ä‘oÃ n thanh niÃªn, nÄƒng Ä‘á»™ng vá»›i dáº£i ruy bÄƒng xanh',
    category: 'header',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'TUá»”I TRáºº SÃNG Táº O - KHÃT Vá»ŒNG VÆ¯Æ N XA',
        x: 540,
        y: 1100,
        width: 950,
        fontFamily: '"Anton", sans-serif',
        fontSize: 60,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'background',
        backgroundColor: 'rgba(37, 99, 235, 0.95)',
      },
      {
        text: 'Chiáº¿n dá»‹ch MÃ¹a hÃ¨ xanh 2026',
        x: 540,
        y: 1200,
        width: 800,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 32,
        color: '#facc15',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private readonly _layoutMasters = signal<LayoutMaster[]>(DEFAULT_LAYOUT_MASTERS);
  private readonly _customTemplates = signal<CustomTemplate[]>([]);

  constructor(private templateStorage: TemplateStorageService) {
    this.refreshCustomTemplates();
  }

  get layoutMasters() {
    return this._layoutMasters.asReadonly();
  }

  get customTemplates() {
    return this._customTemplates.asReadonly();
  }

  refreshCustomTemplates(): void {
    this._customTemplates.set(this.templateStorage.loadTemplates());
  }

  saveCustomTemplate(template: CustomTemplate): void {
    this.templateStorage.saveTemplate(template);
    this.refreshCustomTemplates();
  }

  deleteCustomTemplate(id: string): void {
    this.templateStorage.deleteTemplate(id);
    this.refreshCustomTemplates();
  }

  exportCustomTemplate(id: string): string | null {
    return this.templateStorage.exportTemplateToJson(id);
  }

  importCustomTemplate(json: string): CustomTemplate | null {
    const result = this.templateStorage.importTemplateFromJson(json);
    if (result) this.refreshCustomTemplates();
    return result;
  }

  /**
   * Create a CustomTemplate from a Fabric.js canvas objects array.
   * Extracts all textbox objects' layout (position, format) without actual text content.
   */
  createTemplateFromCanvas(
    canvasObjects: any[],
    metadata: { name: string; description?: string; canvasWidth: number; canvasHeight: number },
  ): CustomTemplate {
    const blocks = canvasObjects
      .filter((obj: any) => obj.type === 'textbox')
      .map((obj: any) => ({
        text: obj.text || 'Ná»™i dung máº«u',
        x: obj.left || 0,
        y: obj.top || 0,
        width: obj.width || 200,
        fontFamily: obj.fontFamily || 'Arial',
        fontSize: obj.fontSize || 40,
        color: obj.fill || '#ffffff',
        textAlign: (obj.textAlign || 'center') as 'left' | 'center' | 'right',
        bold: obj.fontWeight === 'bold',
        italic: obj.fontStyle === 'italic',
        layerName: obj.layerName || '',
        opacity: obj.opacity ?? 1,
        backgroundColor: obj.backgroundColor || undefined,
        effect: this.detectEffect(obj),
        strokeColor: obj.stroke || undefined,
        strokeWidth: obj.strokeWidth || undefined,
        shadowColor: obj.shadow?.color || undefined,
        shadowBlur: obj.shadow?.blur || undefined,
        shadowOffsetX: obj.shadow?.offsetX || undefined,
        shadowOffsetY: obj.shadow?.offsetY || undefined,
      }));

    const now = new Date().toISOString();
    const template: CustomTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: metadata.name,
      description: metadata.description,
      category: 'custom',
      canvasWidth: metadata.canvasWidth,
      canvasHeight: metadata.canvasHeight,
      blocks,
      createdAt: now,
      updatedAt: now,
    };

    return template;
  }

  private detectEffect(obj: any): 'none' | 'shadow' | 'deep-shadow' | 'stroke' | 'background' {
    if (obj.backgroundColor) return 'background';
    const hasShadow = !!obj.shadow;
    const hasStroke = obj.strokeWidth && obj.strokeWidth > 0;
    if (hasShadow && hasStroke) return 'deep-shadow';
    if (hasStroke) return 'stroke';
    if (hasShadow) return 'shadow';
    return 'none';
  }
}
