import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';

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

  it('should return false if user cancels Electron save dialog', async () => {
    (window as unknown as Record<string, unknown>)['electronAPI'] = {
      showSaveDialog: vi.fn().mockResolvedValue(null),
      writeFile: vi.fn(),
    };

    const mockDataUrl = 'data:image/png;base64,mock';
    const result = await service.saveImage(mockDataUrl, 'banner.png');

    expect(result).toBe(false);
  });

  it('should open image file via Electron API', async () => {
    const showOpenDialogMock = vi.fn().mockResolvedValue('C:\\images\\bg.png');
    const readFileMock = vi.fn().mockResolvedValue('data:image/png;base64,imagedata');

    (window as unknown as Record<string, unknown>)['electronAPI'] = {
      showOpenDialog: showOpenDialogMock,
      readFile: readFileMock,
    };

    const res = await service.openImageViaElectron();
    expect(res).toEqual({
      dataUrl: 'data:image/png;base64,imagedata',
      fileName: 'bg.png',
    });
  });
});
