import { TestBed } from '@angular/core/testing';
import { CanvasService } from './canvas.service';
import { Template, TextBlock } from '../models/template.model';

describe('CanvasService', () => {
  let service: CanvasService;

  const mockTemplate: Template = {
    templateId: 'tpl_test',
    name: 'Mẫu kiểm thử',
    thumbnail: 'assets/templates/test.svg',
    canvas: { width: 1080, height: 1350 },
    background: { type: 'user-image', fitMode: 'cover' },
    textDefault: {
      content: 'VĂN BẢN MẶC ĐỊNH',
      x: 540,
      y: 1100,
      align: 'center',
      fontFamily: 'Montserrat-Bold',
      maxFontSize: 64,
      minFontSize: 24,
      color: 'auto',
      strokeColor: 'auto',
      strokeWidth: 2,
    },
    decorations: {
      borderColor: '#D4AF37',
      borderWidth: 8,
    },
  };

  const mockBlock: TextBlock = {
    id: 'title',
    type: 'title',
    label: 'Tiêu đề chính',
    content: 'VĂN BẢN MẶC ĐỊNH',
    x: 540,
    y: 1100,
    align: 'center',
    fontFamily: 'Montserrat-Bold',
    fontSize: 64,
    minFontSize: 24,
    maxFontSize: 64,
    colorMode: 'auto',
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    removable: false,
    defaultX: 540,
    defaultY: 1100,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanvasService],
    });
    service = TestBed.inject(CanvasService);
  });

  afterEach(() => {
    service.dispose();
  });

  it('should initialize and dispose canvas properly', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    expect(service.isCanvasReady()).toBe(true);
    expect(service.getCanvas()).not.toBeNull();

    service.dispose();
    expect(service.isCanvasReady()).toBe(false);
    expect(service.getCanvas()).toBeNull();
  });

  it('should render and update multiple text blocks on canvas', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    const subtitleBlock: TextBlock = {
      id: 'sub_1',
      type: 'subtitle',
      label: 'Tiêu đề phụ',
      content: 'DÒNG CHỮ PHỤ',
      x: 540,
      y: 1200,
      align: 'center',
      fontFamily: 'BeVietnamPro',
      fontSize: 36,
      minFontSize: 18,
      maxFontSize: 48,
      colorMode: 'auto',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      removable: true,
    };

    service.renderTextBlock(subtitleBlock);
    const tb = service.getTextbox('sub_1');
    expect(tb).not.toBeNull();
    expect(tb?.text).toBe('DÒNG CHỮ PHỤ');

    service.centerHorizontally('sub_1');
    expect(tb?.left).toBe(mockTemplate.canvas.width / 2);

    service.removeTextBlock('sub_1');
    expect(service.getTextbox('sub_1')).toBeNull();
  });

  it('should reset text position back to template defaults', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    const tb = service.getTextbox('title');
    tb?.set({ left: 100, top: 200 });

    service.resetBlockPosition(mockBlock);

    expect(tb?.left).toBe(mockTemplate.textDefault.x);
    expect(tb?.top).toBe(mockTemplate.textDefault.y);
  });

  it('should export canvas to PNG data URL', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    const dataUrl = service.exportToPng();
    expect(dataUrl).toBeTruthy();
    expect(typeof dataUrl).toBe('string');
  });

  it('should support fitToViewport and scale canvas zoom proportionally', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    service.fitToViewport(600, 800);
    expect(service.getCurrentZoom()).toBeLessThan(1);
    expect(service.getCurrentZoom()).toBeGreaterThan(0);

    const dims = service.displayDimensions();
    expect(dims.width).toBeLessThanOrEqual(600);
    expect(dims.height).toBeLessThanOrEqual(800);
  });

  it('should support typography formatting (bold, italic, uppercase, shadow, background)', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate, [mockBlock]);

    const formattedBlock: TextBlock = {
      ...mockBlock,
      id: 'formatted',
      content: 'Chữ Đậm Nghiêng Hoa',
      bold: true,
      italic: true,
      uppercase: true,
      effect: 'shadow',
      shadowColor: '#000000',
    };

    const tb = service.renderTextBlock(formattedBlock);
    expect(tb).not.toBeNull();
    expect(tb?.text).toBe('CHỮ ĐẬM NGHIÊNG HOA');
    expect(tb?.fontWeight).toBe('bold');
    expect(tb?.fontStyle).toBe('italic');
    expect(tb?.shadow).toBeTruthy();
  });
});

