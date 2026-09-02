import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageService],
    });
    service = TestBed.inject(ImageService);
  });

  it('should reject unsupported file types', async () => {
    const invalidFile = new File(['mock content'], 'test.txt', {
      type: 'text/plain',
    });

    await expect(service.loadImageFile(invalidFile)).rejects.toThrow(
      /Định dạng ảnh không hỗ trợ/
    );
  });

  it('should accept valid png/jpg file', async () => {
    // 1x1 transparent png data
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, -60, -119, 0, 0, 0, 10, 73, 68, 65,
      84, 120, -100, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, -76, 0, 0, 0, 0, 73,
      69, 78, 68, -82, 66, 96, -126,
    ]);

    const validFile = new File([pngBytes], 'sample.png', {
      type: 'image/png',
    });

    const result = await service.loadImageFile(validFile);
    expect(result).toContain('data:image/png;base64');
  });
});
