import { TestBed } from '@angular/core/testing';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplateService],
    });
    service = TestBed.inject(TemplateService);
  });

  it('should load default PowerPoint-style layout masters upon creation', () => {
    const layouts = service.layoutMasters();
    expect(layouts.length).toBeGreaterThanOrEqual(4);
    expect(layouts.some((l) => l.id === 'layout_banner_bottom')).toBe(true);
    expect(layouts.some((l) => l.id === 'layout_header_top')).toBe(true);
    expect(layouts.some((l) => l.id === 'layout_ribbon_center')).toBe(true);
    expect(layouts.some((l) => l.id === 'layout_quote_split')).toBe(true);
  });

  it('should select layout master by ID and sync backward-compatible template', () => {
    service.selectLayoutMaster('layout_header_top');
    expect(service.selectedLayoutMaster()?.id).toBe('layout_header_top');
    expect(service.selectedTemplate()?.templateId).toBe('layout_header_top');
    expect(service.hasSelection()).toBe(true);
  });

  it('should handle non-existent layout ID', () => {
    service.selectLayoutMaster('non_existent_id');
    expect(service.selectedLayoutMaster()).toBeNull();
    expect(service.hasSelection()).toBe(false);
  });

  it('should save and delete custom layout masters', () => {
    const initialCount = service.layoutMasters().length;
    const mockBlock = {
      id: 'b1',
      type: 'title' as const,
      label: 'Tiêu đề',
      content: 'Chữ kiểm thử',
      x: 540,
      y: 1000,
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
    };

    const created = service.saveCustomLayoutMaster(
      'Mẫu thử nghiệm',
      'Mô tả mẫu',
      [mockBlock],
      { width: 1080, height: 1350 }
    );

    expect(created).toBeTruthy();
    expect(created.isCustom).toBe(true);
    expect(service.layoutMasters().length).toBe(initialCount + 1);
    expect(service.selectedLayoutMaster()?.id).toBe(created.id);

    // Delete custom layout
    const deleted = service.deleteCustomLayoutMaster(created.id);
    expect(deleted).toBe(true);
    expect(service.layoutMasters().length).toBe(initialCount);
  });
});
