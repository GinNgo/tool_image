import { TestBed } from '@angular/core/testing';
import { SnappingService } from './snapping.service';
import * as fabric from 'fabric';

describe('SnappingService', () => {
  let service: SnappingService;
  let canvas: fabric.Canvas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnappingService);

    const canvasEl = document.createElement('canvas');
    canvasEl.width = 1920;
    canvasEl.height = 1080;
    canvas = new fabric.Canvas(canvasEl, { width: 1920, height: 1080 });
  });

  afterEach(() => {
    service.detach();
    canvas.dispose();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should attach snap lines to the canvas', () => {
    service.attach(canvas);
    const objects = canvas.getObjects();
    // Phải có 2 đường gióng neon dọc và ngang
    const lines = objects.filter((obj) => (obj as any).excludeFromExport);
    expect(lines.length).toBe(2);
  });

  it('should hide guides cleanly on hideGuides()', () => {
    service.attach(canvas);
    service.hideGuides();
    const objects = canvas.getObjects();
    const visibleLines = objects.filter((obj) => (obj as any).excludeFromExport && obj.visible);
    expect(visibleLines.length).toBe(0);
  });

  it('should detach cleanly without leaking objects or listeners', () => {
    service.attach(canvas);
    expect(canvas.getObjects().length).toBe(2);

    service.detach();
    expect(canvas.getObjects().length).toBe(0);
  });
});
