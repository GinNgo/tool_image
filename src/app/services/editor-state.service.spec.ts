import { TestBed } from '@angular/core/testing';
import { EditorStateService, FONT_STYLE_OPTIONS } from './editor-state.service';
import { Template } from '../models/template.model';

describe('EditorStateService', () => {
  let service: EditorStateService;

  const mockTemplate: Template = {
    templateId: 'test_tpl',
    name: 'Mẫu thử nghiệm',
    thumbnail: 'assets/templates/test.svg',
    canvas: { width: 1080, height: 1350 },
    background: { type: 'user-image', fitMode: 'cover' },
    textDefault: {
      content: 'MẪU TEXT BAN ĐẦU',
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
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorStateService],
    });
    service = TestBed.inject(EditorStateService);
  });

  it('should initialize with default state', () => {
    expect(service.currentStep()).toBe(1);
    expect(service.selectedTemplate()).toBeNull();
    expect(service.userImageDataUrl()).toBeNull();
    expect(service.userImageFileName()).toBe('');
    expect(service.userText()).toBe('');
    expect(service.hasTemplate()).toBe(false);
    expect(service.hasImage()).toBe(false);
    expect(service.canProceedToExport()).toBe(false);
  });

  it('should set template and initialize default text and font', () => {
    service.setTemplate(mockTemplate);
    expect(service.selectedTemplate()).toEqual(mockTemplate);
    expect(service.hasTemplate()).toBe(true);
    expect(service.userText()).toBe('MẪU TEXT BAN ĐẦU');
    expect(service.selectedFontFamily()).toBe('Montserrat-Bold');
  });

  it('should set and clear user image', () => {
    service.setImage('data:image/png;base64,mockdata', 'sample.png');
    expect(service.userImageDataUrl()).toBe('data:image/png;base64,mockdata');
    expect(service.userImageFileName()).toBe('sample.png');
    expect(service.hasImage()).toBe(true);

    service.clearImage();
    expect(service.userImageDataUrl()).toBeNull();
    expect(service.userImageFileName()).toBe('');
    expect(service.hasImage()).toBe(false);
  });

  it('should update text and font family', () => {
    service.setText('Tiêu đề mới');
    expect(service.userText()).toBe('Tiêu đề mới');

    service.setFontFamily('BeVietnamPro-Bold');
    expect(service.selectedFontFamily()).toBe('BeVietnamPro-Bold');
  });

  it('should evaluate canProceedToExport accurately', () => {
    service.setText('');
    service.clearImage();
    expect(service.canProceedToExport()).toBe(false);

    service.setImage('data:image/png;base64,mock', 'test.png');
    expect(service.canProceedToExport()).toBe(false);

    service.setText('   ');
    expect(service.canProceedToExport()).toBe(false);

    service.setText('Nội dung hợp lệ');
    expect(service.canProceedToExport()).toBe(true);
  });

  it('should navigate steps and reset state', () => {
    service.setStep(2);
    expect(service.currentStep()).toBe(2);

    service.setStep(3);
    expect(service.currentStep()).toBe(3);

    service.resetAll();
    expect(service.currentStep()).toBe(1);
    expect(service.selectedTemplate()).toBeNull();
    expect(service.userImageDataUrl()).toBeNull();
    expect(service.userText()).toBe('');
  });

  it('should provide valid font style options', () => {
    expect(FONT_STYLE_OPTIONS.length).toBeGreaterThanOrEqual(3);
    expect(FONT_STYLE_OPTIONS.some((f) => f.fontFamily === 'Montserrat-Bold')).toBe(true);
    expect(FONT_STYLE_OPTIONS.some((f) => f.fontFamily === 'BeVietnamPro-Bold')).toBe(true);
  });
});
