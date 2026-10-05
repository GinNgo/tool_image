import { TestBed } from '@angular/core/testing';
import { ImageProcessingService } from './image-processing.service';
import { CanvasEngineService } from './canvas-engine.service';
import { DEFAULT_IMAGE_ADJUSTMENTS } from '../models/image-processing.model';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let canvasEngine: CanvasEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageProcessingService);
    canvasEngine = TestBed.inject(CanvasEngineService);

    const canvasEl = document.createElement('canvas');
    canvasEngine.initialize(canvasEl, 1920, 1080);
  });

  afterEach(() => {
    canvasEngine.destroy();
  });

  it('should be created with default adjustments and dimmer state', () => {
    expect(service).toBeTruthy();
    expect(service.adjustments().brightness).toBe(0);
    expect(service.adjustments().contrast).toBe(0);
    expect(service.dimmerConfig().enabled).toBe(false);
  });

  it('should apply and reset optical adjustments', () => {
    service.applyAdjustments({
      brightness: 20,
      contrast: 15,
      saturation: -10,
      blur: 5,
      vignette: 0,
    });

    expect(service.adjustments().brightness).toBe(20);
    expect(service.adjustments().contrast).toBe(15);
    expect(service.adjustments().saturation).toBe(-10);
    expect(service.adjustments().blur).toBe(5);

    service.resetAdjustments();
    expect(service.adjustments()).toEqual(DEFAULT_IMAGE_ADJUSTMENTS);
  });

  it('should create and configure dimmer overlay gradient', () => {
    service.setDimmerOverlay({
      enabled: true,
      type: 'bottom-to-top',
      color: '#000000',
      opacity: 60,
      heightRatio: 0.5,
    });

    expect(service.dimmerConfig().enabled).toBe(true);
    expect(service.dimmerConfig().opacity).toBe(60);

    const canvas = canvasEngine.getCanvas();
    const dimmerObj = canvas?.getObjects().find((o) => (o as any).isDimmerOverlay);
    expect(dimmerObj).toBeTruthy();

    // Tắt dimmer
    service.setDimmerOverlay({
      enabled: false,
      type: 'bottom-to-top',
      color: '#000000',
      opacity: 60,
      heightRatio: 0.5,
    });

    const dimmerDisabled = canvas?.getObjects().find((o) => (o as any).isDimmerOverlay);
    expect(dimmerDisabled).toBeFalsy();
  });
});
