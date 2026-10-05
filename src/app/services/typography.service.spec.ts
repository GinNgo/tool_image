import { TestBed } from '@angular/core/testing';
import { TypographyService } from './typography.service';
import { CanvasEngineService } from './canvas-engine.service';
import * as fabric from 'fabric';

describe('TypographyService', () => {
  let service: TypographyService;
  let canvasEngine: CanvasEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypographyService);
    canvasEngine = TestBed.inject(CanvasEngineService);

    const canvasEl = document.createElement('canvas');
    canvasEngine.initialize(canvasEl, 1920, 1080);
  });

  afterEach(() => {
    canvasEngine.destroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a textbox with default Vietnamese font and word wrap', () => {
    const tb = service.createTextbox('Khẩu hiệu Việt Nam');
    expect(tb).toBeTruthy();
    expect(tb.text).toBe('Khẩu hiệu Việt Nam');
    expect(tb.fontFamily).toBe('Montserrat');
    expect(tb.fontSize).toBe(48);
    expect((tb as any).layerType).toBe('text');
  });

  it('should apply typography formatting properly', () => {
    const tb = service.createTextbox('Văn bản thử nghiệm');

    service.setFontFamily(tb, 'Playfair Display');
    expect(tb.fontFamily).toBe('Playfair Display');

    service.setFontSize(tb, 64);
    expect(tb.fontSize).toBe(64);

    service.setColor(tb, '#FFD700');
    expect(tb.fill).toBe('#FFD700');

    service.setBold(tb, true);
    expect(tb.fontWeight).toBe('bold');

    service.setItalic(tb, true);
    expect(tb.fontStyle).toBe('italic');

    service.setAlign(tb, 'center');
    expect(tb.textAlign).toBe('center');
  });

  it('should apply text ribbon highlight with companion rect', () => {
    const tb = service.createTextbox('Khẩu hiệu Đỏ');
    service.applyRibbonHighlight(tb, {
      enabled: true,
      backgroundColor: '#DC2626',
      opacity: 90,
      paddingX: 20,
      paddingY: 10,
      borderRadius: 8,
    });

    const companion = (tb as any).companionObject as fabric.Rect | undefined;
    expect(companion).toBeTruthy();
    expect((companion as any)?.isRibbonCompanion).toBe(true);

    // Disable ribbon removes companion
    service.applyRibbonHighlight(tb, {
      enabled: false,
      backgroundColor: '#DC2626',
      opacity: 90,
      paddingX: 20,
      paddingY: 10,
      borderRadius: 8,
    });
    expect((tb as any).companionObject).toBeNull();
  });

  it('should configure stroke and shadow', () => {
    const tb = service.createTextbox('Hiệu ứng Chữ');

    service.setStroke(tb, '#000000', 3);
    expect(tb.stroke).toBe('#000000');
    expect(tb.strokeWidth).toBe(3);

    service.setShadow(tb, 'rgba(0,0,0,0.8)', 10, 2, 4);
    expect(tb.shadow).toBeTruthy();
  });

  it('should suggest contrast colors based on background brightness', () => {
    const tb = service.createTextbox('Tương phản');
    const contrast = service.suggestContrast(tb);
    expect(contrast.textColor).toBeTruthy();
    expect(contrast.ribbonColor).toBeTruthy();
  });
});
