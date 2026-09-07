import { TestBed } from '@angular/core/testing';
import { EditorStateService } from './editor-state.service';
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
    expect(service.textBlocks().length).toBe(1);
    expect(service.textBlocks()[0].id).toBe('title');
  });

  it('should support adding, updating and removing subtitle blocks', () => {
    service.setTemplate(mockTemplate);
    const subtitle = service.addSubtitleBlock();
    expect(subtitle).toBeTruthy();
    expect(service.textBlocks().length).toBe(2);

    service.updateBlockContent(subtitle!.id, 'Nội dung phụ mới');
    const updated = service.textBlocks().find((b) => b.id === subtitle!.id);
    expect(updated?.content).toBe('Nội dung phụ mới');

    service.removeTextBlock(subtitle!.id);
    expect(service.textBlocks().length).toBe(1);
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

  it('should evaluate canProceedToExport accurately', () => {
    service.setTemplate(mockTemplate);
    service.clearImage();
    expect(service.canProceedToExport()).toBe(false);

    service.setImage('data:image/png;base64,mock', 'test.png');
    expect(service.canProceedToExport()).toBe(true);

    service.setText('');
    expect(service.canProceedToExport()).toBe(false);
  });

  it('should serialize and deserialize project data correctly', () => {
    service.setTemplate(mockTemplate);
    service.setImage('data:image/png;base64,mock', 'test.png');
    service.setText('Dự án đặc biệt');

    const projectData = service.getProjectData();
    expect(projectData).toBeTruthy();
    expect(projectData?.templateId).toBe('test_tpl');
    expect(projectData?.textBlocks[0].content).toBe('Dự án đặc biệt');

    service.resetAll();
    expect(service.textBlocks().length).toBe(0);

    service.loadProjectData(projectData!, mockTemplate);
    expect(service.userText()).toBe('Dự án đặc biệt');
    expect(service.hasImage()).toBe(true);
    expect(service.currentStep()).toBe(2);
  });

  it('should apply layout master without losing existing user text', () => {
    service.setTemplate(mockTemplate);
    service.setText('Nội dung người dùng đã nhập');

    const mockLayoutMaster = {
      id: 'test_master',
      name: 'Khuôn 2 dòng',
      description: 'Test layout',
      category: 'banner' as const,
      canvas: { width: 1080, height: 1350 },
      blocks: [
        {
          type: 'title' as const,
          label: 'Tiêu đề chính',
          content: 'TIÊU ĐỀ KHUÔN',
          x: 540,
          y: 200,
          align: 'center' as const,
          fontFamily: 'Montserrat-Bold',
          fontSize: 60,
          minFontSize: 20,
          maxFontSize: 80,
          colorMode: 'custom' as const,
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 4,
          removable: false,
        },
        {
          type: 'subtitle' as const,
          label: 'Thông điệp',
          content: 'KHẨU HIỆU KHUÔN',
          x: 540,
          y: 300,
          align: 'center' as const,
          fontFamily: 'BeVietnamPro',
          fontSize: 32,
          minFontSize: 16,
          maxFontSize: 40,
          colorMode: 'custom' as const,
          color: '#ffeb3b',
          strokeColor: '#000000',
          strokeWidth: 2,
          removable: true,
        },
      ],
    };

    service.applyLayoutMaster(mockLayoutMaster, true);
    expect(service.textBlocks().length).toBe(2);
    // User's text was preserved in the first block
    expect(service.textBlocks()[0].content).toBe('Nội dung người dùng đã nhập');
    expect(service.textBlocks()[0].y).toBe(200);
    // Second block gets the layout master text
    expect(service.textBlocks()[1].content).toBe('KHẨU HIỆU KHUÔN');
    expect(service.textBlocks()[1].y).toBe(300);
  });
});
