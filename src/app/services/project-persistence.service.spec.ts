import { TestBed } from '@angular/core/testing';
import { ProjectPersistenceService } from './project-persistence.service';
import { CanvasEngineService } from './canvas-engine.service';
import { TypographyService } from './typography.service';
import { StudioStateService } from './studio-state.service';
import { ProjectDocument } from '../models/project.model';

describe('ProjectPersistenceService', () => {
  let service: ProjectPersistenceService;
  let canvasEngine: CanvasEngineService;
  let typography: TypographyService;
  let studioState: StudioStateService;

  const mockStorage: Record<string, string> = {};

  beforeAll(() => {
    const storageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
    };
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: storageMock,
        writable: true,
        configurable: true,
      });
    } catch {}
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectPersistenceService);
    canvasEngine = TestBed.inject(CanvasEngineService);
    typography = TestBed.inject(TypographyService);
    studioState = TestBed.inject(StudioStateService);

    const canvasEl = document.createElement('canvas');
    canvasEngine.initialize(canvasEl, 1920, 1080);
  });

  afterEach(() => {
    canvasEngine.destroy();
    try {
      localStorage.clear();
    } catch {}
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export project to valid ProjectDocument JSON structure', () => {
    studioState.setProjectTitle('Khẩu hiệu Test 2026');
    typography.createTextbox('VIỆT NAM HÙNG CƯỜNG', {
      typography: { fontSize: 60, fontFamily: 'Montserrat', color: '#FFD700' },
    });

    const doc = service.exportProjectToJson();
    expect(doc.version).toBe('2.0.0');
    expect(doc.title).toBe('Khẩu hiệu Test 2026');
    expect(doc.canvas.width).toBe(1920);
    expect(doc.canvas.height).toBe(1080);
    expect(doc.layers.length).toBe(1);
    expect((doc.layers[0] as any).text).toBe('VIỆT NAM HÙNG CƯỜNG');
  });

  it('should import project correctly from ProjectDocument', async () => {
    const testDoc: ProjectDocument = {
      version: '2.0.0',
      id: 'test-uuid-123',
      title: 'Dự án Phục hồi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canvas: {
        width: 1200,
        height: 800,
        aspectRatio: 'custom',
        backgroundColor: '#18181b',
      },
      background: null,
      layers: [
        {
          id: 'layer-test-1',
          type: 'text',
          name: 'Tiêu đề phục hồi',
          x: 600,
          y: 400,
          width: 500,
          height: 100,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: 1,
          text: 'CHÀO MỪNG NĂM MỚI',
          typography: {
            fontFamily: 'Montserrat',
            fontSize: 50,
            fontWeight: 'bold',
            fontStyle: 'normal',
            underline: false,
            uppercase: true,
            align: 'center',
            lineHeight: 1.2,
            letterSpacing: 0,
            color: '#FFFFFF',
          },
          ribbon: {
            enabled: true,
            backgroundColor: '#DC2626',
            opacity: 90,
            paddingX: 16,
            paddingY: 8,
            borderRadius: 6,
          },
          stroke: { enabled: false, color: '#000', width: 0 },
          shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
        },
      ],
      meta: { appName: 'ToolImage Studio', appVersion: '2.0.0' },
    };

    await service.importProjectFromJson(testDoc);

    expect(studioState.projectTitle()).toBe('Dự án Phục hồi');
    expect(canvasEngine.canvasConfig().width).toBe(1200);
    expect(canvasEngine.canvasConfig().height).toBe(800);
  });

  it('should save to and restore from localStorage draft', () => {
    studioState.setProjectTitle('Bản nháp tự động');
    service.saveToLocalDraft();

    const restored = service.restoreFromLocalDraft();
    expect(restored).toBeTruthy();
    expect(restored?.title).toBe('Bản nháp tự động');
  });
});
