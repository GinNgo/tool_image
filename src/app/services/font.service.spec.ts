import { TestBed } from '@angular/core/testing';
import { FontService, CURATED_FONTS } from './font.service';

describe('FontService', () => {
  let service: FontService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FontService],
    });
    service = TestBed.inject(FontService);
  });

  it('should return curated font presets', () => {
    const presets = service.getPresets();
    expect(presets.length).toBe(6);
    expect(presets[0].id).toBe('solemn');
    expect(presets[0].name).toBe('Trang trọng');
    expect(presets[0].fontFamily).toBe('Montserrat-Bold');
  });

  it('should find preset by ID and by fontFamily', () => {
    const byId = service.getPresetById('impact');
    expect(byId).toBeDefined();
    expect(byId?.name).toBe('Nổi bật');

    const byFamily = service.getPresetByFontFamily('Montserrat-Bold');
    expect(byFamily).toBeDefined();
    expect(byFamily?.id).toBe('solemn');
  });
});
