import { TestBed } from '@angular/core/testing';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewportService);
  });

  it('should be created with initial state', () => {
    expect(service).toBeTruthy();
    expect(service.transform().zoom).toBe(1);
    expect(service.zoomPercent()).toBe(100);
  });

  describe('calculateAutoFit', () => {
    it('should fit 16:9 canvas into 16:9 stage correctly', () => {
      // Stage: 1920x1080, Canvas: 1920x1080, Padding: 40
      const result = service.calculateAutoFit(1920, 1080, 1920, 1080, 40);
      expect(result.scale).toBeLessThanOrEqual(1.0);
      expect(result.scale).toBeGreaterThan(0.8);
      expect(result.panX).toBeGreaterThanOrEqual(0);
      expect(result.panY).toBeGreaterThanOrEqual(0);
      expect(service.transform().fitZoom).toBe(result.scale);
    });

    it('should fit vertical canvas (9:16) into horizontal stage without overflow', () => {
      // Stage: 1200x800, Canvas: 1080x1920
      const result = service.calculateAutoFit(1200, 800, 1080, 1920, 40);
      const scaledHeight = 1920 * result.scale;
      expect(scaledHeight).toBeLessThanOrEqual(800 - 80);
      expect(service.transform().zoom).toBe(result.scale);
    });

    it('should fit square canvas (1:1) into wide stage without overflow', () => {
      // Stage: 1600x900, Canvas: 1080x1080
      const result = service.calculateAutoFit(1600, 900, 1080, 1080, 30);
      const scaledHeight = 1080 * result.scale;
      expect(scaledHeight).toBeLessThanOrEqual(900 - 60);
      expect(result.panX).toBeGreaterThan(0);
    });

    it('should respect MIN_ZOOM and MAX_ZOOM constraints', () => {
      // Gigantic canvas in tiny stage
      const tinyResult = service.calculateAutoFit(100, 100, 10000, 10000, 0);
      expect(tinyResult.scale).toBeGreaterThanOrEqual(0.1);

      // Tiny canvas in giant stage
      const giantResult = service.calculateAutoFit(10000, 10000, 10, 10, 0);
      expect(giantResult.scale).toBeLessThanOrEqual(4.0);
    });
  });

  describe('Zoom controls', () => {
    it('should zoom in and zoom out within limits', () => {
      service.setZoom(1.0);
      service.zoomIn(0.2);
      expect(service.transform().zoom).toBe(1.2);
      expect(service.zoomPercent()).toBe(120);

      service.zoomOut(0.5);
      expect(service.transform().zoom).toBe(0.7);
      expect(service.zoomPercent()).toBe(70);
    });

    it('should restore zoom on fitScreen()', () => {
      service.calculateAutoFit(1200, 800, 1920, 1080, 40);
      const expectedFit = service.transform().fitZoom;

      service.setZoom(2.5);
      expect(service.transform().zoom).toBe(2.5);

      service.fitScreen();
      expect(service.transform().zoom).toBe(expectedFit);
    });

    it('should reset transform cleanly', () => {
      service.setZoom(3.0);
      service.setPan(100, 200);
      service.reset();

      expect(service.transform().zoom).toBe(1);
      expect(service.transform().panX).toBe(0);
      expect(service.transform().panY).toBe(0);
    });
  });
});
