import { TestBed } from '@angular/core/testing';
import { CanvasService } from './canvas.service';
import { Template } from '../models/template.model';

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
    service.initCanvas(canvasEl, mockTemplate);

    expect(service.isCanvasReady()).toBe(true);
    expect(service.getCanvas()).not.toBeNull();

    service.dispose();
    expect(service.isCanvasReady()).toBe(false);
    expect(service.getCanvas()).toBeNull();
  });

  it('should create and update text on canvas', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate);

    service.setText('TIÊU ĐỀ KIỂM THỬ', 'BeVietnamPro-Bold');

    const textbox = service.getTextbox();
    expect(textbox).not.toBeNull();
    expect(textbox?.text).toBe('TIÊU ĐỀ KIỂM THỬ');
    expect(textbox?.fontFamily).toBe('BeVietnamPro-Bold');
  });

  it('should update font family dynamically', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate);

    service.setText('CHỮ MẪU');
    service.setFontFamily('BeVietnamPro');

    const textbox = service.getTextbox();
    expect(textbox?.fontFamily).toBe('BeVietnamPro');
  });

  it('should reset text position back to template defaults', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate);

    service.setText('CHỮ MẪU');
    const textbox = service.getTextbox();
    textbox?.set({ left: 100, top: 200 });

    service.resetTextPosition();

    expect(textbox?.left).toBe(mockTemplate.textDefault.x);
    expect(textbox?.top).toBe(mockTemplate.textDefault.y);
  });

  it('should export canvas to PNG data URL', () => {
    const canvasEl = document.createElement('canvas');
    service.initCanvas(canvasEl, mockTemplate);
    service.setText('CHÀO MỪNG');

    const dataUrl = service.exportToPng();
    expect(dataUrl).toBeTruthy();
    expect(typeof dataUrl).toBe('string');
  });
});
