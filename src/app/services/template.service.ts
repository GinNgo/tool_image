import { Injectable, signal, computed } from '@angular/core';
import { Template, LayoutMaster, TextBlock } from '../models/template.model';

const CUSTOM_LAYOUTS_STORAGE_KEY = 'tool_image_custom_layout_masters';

// Curated PowerPoint-style Layout Masters (Mẫu khuôn bố cục chuyên nghiệp)
export const DEFAULT_LAYOUT_MASTERS: LayoutMaster[] = [
  {
    id: 'layout_banner_bottom',
    name: 'Tiêu đề dưới chân',
    description: 'Tiêu đề lớn nổi bật kèm thông điệp chân trang',
    category: 'banner',
    canvas: { width: 1080, height: 1350 },
    decorations: {
      borderColor: '#D4AF37',
      borderWidth: 6,
    },
    blocks: [
      {
        type: 'title',
        label: 'Tiêu đề chính',
        content: 'NHẬP TIÊU ĐỀ TẠI ĐÂY',
        x: 540,
        y: 1100,
        align: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 64,
        minFontSize: 24,
        maxFontSize: 80,
        colorMode: 'auto',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        bold: true,
        uppercase: true,
        effect: 'deep-shadow',
        removable: false,
        defaultX: 540,
        defaultY: 1100,
      },
      {
        type: 'subtitle',
        label: 'Thông điệp hành động',
        content: 'NHẬP NỘI DUNG PHỤ MÔ TẢ CHO BỨC ẢNH',
        x: 540,
        y: 1210,
        align: 'center',
        fontFamily: 'BeVietnamPro',
        fontSize: 32,
        minFontSize: 18,
        maxFontSize: 44,
        colorMode: 'auto',
        color: '#ffeb3b',
        strokeColor: '#000000',
        strokeWidth: 2,
        bold: true,
        uppercase: true,
        effect: 'shadow',
        removable: true,
        defaultX: 540,
        defaultY: 1210,
      },
    ],
  },
  {
    id: 'layout_header_top',
    name: 'Tiêu đề trang trọng trên đỉnh',
    description: 'Phần chữ đặt phía trên đỉnh ảnh, nhường không gian trung tâm cho hình ảnh',
    category: 'standard',
    canvas: { width: 1080, height: 1350 },
    blocks: [
      {
        type: 'title',
        label: 'Tiêu đề đỉnh',
        content: 'THÔNG ĐIỆP SỰ KIỆN',
        x: 540,
        y: 180,
        align: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 58,
        minFontSize: 24,
        maxFontSize: 72,
        colorMode: 'custom',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        bold: true,
        uppercase: true,
        effect: 'stroke',
        removable: false,
        defaultX: 540,
        defaultY: 180,
      },
      {
        type: 'subtitle',
        label: 'Thời gian & Địa điểm',
        content: 'Thời gian & Địa điểm',
        x: 540,
        y: 260,
        align: 'center',
        fontFamily: 'BeVietnamPro',
        fontSize: 30,
        minFontSize: 16,
        maxFontSize: 40,
        colorMode: 'custom',
        color: '#ffeb3b',
        strokeColor: '#000000',
        strokeWidth: 2,
        italic: true,
        removable: true,
        defaultX: 540,
        defaultY: 260,
      },
    ],
  },
  {
    id: 'layout_ribbon_center',
    name: 'Băng rôn trung tâm (Ribbon)',
    description: 'Hộp chữ có nền tương phản nổi bật ngay giữa bức ảnh',
    category: 'banner',
    canvas: { width: 1080, height: 1350 },
    blocks: [
      {
        type: 'title',
        label: 'Thông điệp trung tâm',
        content: 'KHUYẾN MÃI ĐẶC BIỆT',
        x: 540,
        y: 640,
        align: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 60,
        minFontSize: 24,
        maxFontSize: 76,
        colorMode: 'custom',
        color: '#ffffff',
        strokeColor: '#b91c1c',
        strokeWidth: 0,
        bold: true,
        uppercase: true,
        effect: 'background',
        backgroundColor: 'rgba(185, 28, 28, 0.88)',
        removable: false,
        defaultX: 540,
        defaultY: 640,
      },
      {
        type: 'subtitle',
        label: 'Ghi chú phụ',
        content: 'Áp dụng cho tất cả khách hàng thân thiết',
        x: 540,
        y: 730,
        align: 'center',
        fontFamily: 'BeVietnamPro',
        fontSize: 28,
        minFontSize: 16,
        maxFontSize: 38,
        colorMode: 'custom',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        removable: true,
        defaultX: 540,
        defaultY: 730,
      },
    ],
  },
  {
    id: 'layout_quote_split',
    name: 'Trích dẫn & Tác giả',
    description: 'Bố cục chữ trích dẫn ý nghĩa, phong cách mềm mại trang nhã',
    category: 'quote',
    canvas: { width: 1080, height: 1350 },
    blocks: [
      {
        type: 'title',
        label: 'Lời trích dẫn',
        content: '"Sáng tạo là thông minh và vui vẻ"',
        x: 540,
        y: 980,
        align: 'center',
        fontFamily: 'Merriweather',
        fontSize: 46,
        minFontSize: 22,
        maxFontSize: 60,
        colorMode: 'auto',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        bold: true,
        italic: true,
        effect: 'deep-shadow',
        removable: false,
        defaultX: 540,
        defaultY: 980,
      },
      {
        type: 'caption',
        label: 'Tác giả / Nguồn',
        content: '— ALBERT EINSTEIN —',
        x: 540,
        y: 1070,
        align: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 28,
        minFontSize: 16,
        maxFontSize: 38,
        colorMode: 'auto',
        color: '#ffeb3b',
        strokeColor: '#000000',
        strokeWidth: 2,
        bold: true,
        effect: 'shadow',
        removable: true,
        defaultX: 540,
        defaultY: 1070,
      },
    ],
  },
  {
    id: 'layout_minimal_caption',
    name: 'Tối giản - 1 Hộp chữ tiêu đề',
    description: 'Chỉ gồm 1 tiêu đề lớn tự do di chuyển linh hoạt trên ảnh',
    category: 'minimal',
    canvas: { width: 1080, height: 1350 },
    blocks: [
      {
        type: 'title',
        label: 'Tiêu đề chính',
        content: 'NHẬP TIÊU ĐỀ ẢNH TẠI ĐÂY',
        x: 540,
        y: 1120,
        align: 'center',
        fontFamily: 'Montserrat-Bold',
        fontSize: 64,
        minFontSize: 24,
        maxFontSize: 80,
        colorMode: 'auto',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        bold: true,
        uppercase: true,
        effect: 'deep-shadow',
        removable: false,
        defaultX: 540,
        defaultY: 1120,
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly _layoutMasters = signal<LayoutMaster[]>([]);
  private readonly _selectedLayoutMaster = signal<LayoutMaster | null>(null);

  // Backward compatibility: Template compatibility layer
  private readonly _selectedTemplate = signal<Template | null>(null);

  readonly layoutMasters = this._layoutMasters.asReadonly();
  readonly selectedLayoutMaster = this._selectedLayoutMaster.asReadonly();

  // Backward compatibility getters
  readonly templates = computed<Template[]>(() => {
    return this._layoutMasters().map((m) => this.layoutMasterToTemplate(m));
  });
  readonly selectedTemplate = this._selectedTemplate.asReadonly();
  readonly hasSelection = computed(() => this._selectedLayoutMaster() !== null || this._selectedTemplate() !== null);

  constructor() {
    this.loadAllLayoutMasters();
  }

  private loadAllLayoutMasters(): void {
    const customMasters = this.loadCustomLayoutMastersFromStorage();
    const all = [...DEFAULT_LAYOUT_MASTERS, ...customMasters];
    this._layoutMasters.set(all);
    if (all.length > 0) {
      this.selectLayoutMaster(all[0].id);
    }
  }

  selectLayoutMaster(layoutId: string): LayoutMaster | undefined {
    const found = this._layoutMasters().find((m) => m.id === layoutId);
    if (found) {
      this._selectedLayoutMaster.set(found);
      this._selectedTemplate.set(this.layoutMasterToTemplate(found));
      return found;
    }
    this._selectedLayoutMaster.set(null);
    this._selectedTemplate.set(null);
    return undefined;
  }

  // Backward compatibility method
  selectTemplate(templateId: string): void {
    this.selectLayoutMaster(templateId);
  }

  clearSelection(): void {
    this._selectedLayoutMaster.set(null);
    this._selectedTemplate.set(null);
  }

  getLayoutMasterById(layoutId: string): LayoutMaster | undefined {
    return this._layoutMasters().find((m) => m.id === layoutId);
  }

  // Backward compatibility method
  getTemplateById(templateId: string): Template | undefined {
    const master = this.getLayoutMasterById(templateId);
    return master ? this.layoutMasterToTemplate(master) : undefined;
  }

  /**
   * Lưu bố cục các hộp chữ hiện tại thành Mẫu khuôn bố cục mới (PowerPoint Layout Master)
   */
  saveCustomLayoutMaster(name: string, description: string, blocks: TextBlock[], canvasSize: { width: number; height: number }): LayoutMaster {
    const id = `custom_layout_${Date.now()}`;
    const cleanBlocks: Omit<TextBlock, 'id'>[] = blocks.map((b) => {
      const { id: _, ...rest } = b;
      return rest;
    });

    const newMaster: LayoutMaster = {
      id,
      name: name.trim() || 'Mẫu khuôn tự tạo',
      description: description.trim() || 'Khuôn bố cục tùy chỉnh của người dùng',
      category: 'custom',
      isCustom: true,
      canvas: { ...canvasSize },
      blocks: cleanBlocks,
    };

    const updated = [...this._layoutMasters(), newMaster];
    this._layoutMasters.set(updated);
    this._selectedLayoutMaster.set(newMaster);
    this._selectedTemplate.set(this.layoutMasterToTemplate(newMaster));

    this.saveCustomLayoutMastersToStorage();
    return newMaster;
  }

  deleteCustomLayoutMaster(layoutId: string): boolean {
    const found = this._layoutMasters().find((m) => m.id === layoutId);
    if (!found || !found.isCustom) return false;

    const filtered = this._layoutMasters().filter((m) => m.id !== layoutId);
    this._layoutMasters.set(filtered);

    if (this._selectedLayoutMaster()?.id === layoutId) {
      const fallback = filtered[0] || null;
      this._selectedLayoutMaster.set(fallback);
      this._selectedTemplate.set(fallback ? this.layoutMasterToTemplate(fallback) : null);
    }

    this.saveCustomLayoutMastersToStorage();
    return true;
  }

  private loadCustomLayoutMastersFromStorage(): LayoutMaster[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(CUSTOM_LAYOUTS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LayoutMaster[]) : [];
    } catch {
      return [];
    }
  }

  private saveCustomLayoutMastersToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const customOnly = this._layoutMasters().filter((m) => m.isCustom);
      localStorage.setItem(CUSTOM_LAYOUTS_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // Ignore in headless
    }
  }

  /**
   * Helper: Chuyển đổi LayoutMaster sang Template chuẩn để tương thích ngược
   */
  layoutMasterToTemplate(master: LayoutMaster): Template {
    const firstBlock = master.blocks[0] || {
      content: 'NHẬP TIÊU ĐỀ TẠI ĐÂY',
      x: master.canvas.width / 2,
      y: master.canvas.height * 0.85,
      align: 'center',
      fontFamily: 'Montserrat-Bold',
      fontSize: 64,
      strokeWidth: 4,
    };

    return {
      templateId: master.id,
      name: master.name,
      thumbnail: '',
      canvas: { ...master.canvas },
      background: { type: 'user-image', fitMode: 'cover' },
      textDefault: {
        content: firstBlock.content,
        x: firstBlock.x,
        y: firstBlock.y,
        align: firstBlock.align,
        fontFamily: firstBlock.fontFamily,
        maxFontSize: (firstBlock as any).maxFontSize || 64,
        minFontSize: (firstBlock as any).minFontSize || 24,
        color: firstBlock.color || '#ffffff',
        strokeColor: firstBlock.strokeColor || '#000000',
        strokeWidth: firstBlock.strokeWidth || 2,
      },
      decorations: master.decorations,
    };
  }
}
