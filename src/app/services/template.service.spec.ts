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

  it('should load templates upon creation', () => {
    const templates = service.templates();
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates.some((t) => t.templateId === 'tpl_01')).toBe(true);
    expect(templates.some((t) => t.templateId === 'tpl_02')).toBe(true);
    expect(templates.some((t) => t.templateId === 'tpl_03')).toBe(true);
  });

  it('should select template by ID', () => {
    service.selectTemplate('tpl_01');
    expect(service.selectedTemplate()?.templateId).toBe('tpl_01');
    expect(service.hasSelection()).toBe(true);

    service.selectTemplate('tpl_02');
    expect(service.selectedTemplate()?.templateId).toBe('tpl_02');
  });

  it('should handle non-existent template ID', () => {
    service.selectTemplate('non_existent_id');
    expect(service.selectedTemplate()).toBeNull();
    expect(service.hasSelection()).toBe(false);
  });

  it('should clear selection', () => {
    service.selectTemplate('tpl_01');
    expect(service.hasSelection()).toBe(true);

    service.clearSelection();
    expect(service.selectedTemplate()).toBeNull();
    expect(service.hasSelection()).toBe(false);
  });

  it('should get template by ID without changing selection', () => {
    service.selectTemplate('tpl_01');
    const tpl2 = service.getTemplateById('tpl_02');
    expect(tpl2?.templateId).toBe('tpl_02');
    expect(service.selectedTemplate()?.templateId).toBe('tpl_01');
  });
});
