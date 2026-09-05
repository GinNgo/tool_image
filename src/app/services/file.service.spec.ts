import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { ProjectData } from '../models/template.model';

describe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService],
    });
    service = TestBed.inject(FileService);
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['electronAPI'];
  });

  it('should detect browser environment when electronAPI is not present', () => {
    expect(service.isElectron()).toBe(false);
  });

  it('should save file via browser fallback when not in Electron', async () => {
    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await service.saveImage(mockDataUrl, 'test.png');
    expect(result).toBe(true);
  });

  it('should save file via Electron API when electronAPI is present', async () => {
    const showSaveDialogMock = vi.fn().mockResolvedValue('C:\\test\\banner.png');
    const writeFileMock = vi.fn().mockResolvedValue(true);

    (window as unknown as Record<string, unknown>)['electronAPI'] = {
      showSaveDialog: showSaveDialogMock,
      writeFile: writeFileMock,
    };

    expect(service.isElectron()).toBe(true);

    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
    const result = await service.saveImage(mockDataUrl, 'banner.png');

    expect(showSaveDialogMock).toHaveBeenCalledWith({
      defaultPath: 'banner.png',
      filters: [{ name: 'Ảnh PNG', extensions: ['png'] }],
    });
    expect(writeFileMock).toHaveBeenCalledWith('C:\\test\\banner.png', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
    expect(result).toBe(true);
  });

  it('should save and load project data via Electron API', async () => {
    const showSaveProjectDialogMock = vi.fn().mockResolvedValue('C:\\test\\du-an.json');
    const writeProjectFileMock = vi.fn().mockResolvedValue(true);
    const showOpenProjectDialogMock = vi.fn().mockResolvedValue('C:\\test\\du-an.json');
    const readProjectFileMock = vi.fn().mockResolvedValue(
      JSON.stringify({
        version: '2.0',
        projectName: 'du-an-test',
        templateId: 'tpl_01',
      })
    );

    (window as unknown as Record<string, unknown>)['electronAPI'] = {
      showSaveProjectDialog: showSaveProjectDialogMock,
      writeProjectFile: writeProjectFileMock,
      showOpenProjectDialog: showOpenProjectDialogMock,
      readProjectFile: readProjectFileMock,
    };

    const mockProject: ProjectData = {
      version: '2.0',
      projectName: 'du-an-test',
      updatedAt: '2026-09-05',
      templateId: 'tpl_01',
      canvas: { width: 1080, height: 1350 },
      backgroundImage: null,
      textBlocks: [],
      activeBlockId: null,
    };

    const saved = await service.saveProject(mockProject);
    expect(saved).toBe(true);
    expect(showSaveProjectDialogMock).toHaveBeenCalled();

    const loaded = await service.openProjectViaElectron();
    expect(loaded).toBeTruthy();
    expect(loaded?.templateId).toBe('tpl_01');
  });
});
