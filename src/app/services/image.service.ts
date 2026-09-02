import { Injectable } from '@angular/core';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096; // max width or height after resize

@Injectable({ providedIn: 'root' })
export class ImageService {
  /**
   * Đọc file ảnh từ input, resize nếu quá lớn, trả về data URL.
   */
  async loadImageFile(file: File): Promise<string> {
    this.validateFile(file);

    const dataUrl = await this.readFileAsDataUrl(file);

    // Nếu file lớn hoặc resolution cao → resize
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return this.resizeImage(dataUrl);
    }

    // Kiểm tra resolution
    const needsResize = await this.checkNeedsResize(dataUrl);
    if (needsResize) {
      return this.resizeImage(dataUrl);
    }

    return dataUrl;
  }

  private validateFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        'Định dạng ảnh không hỗ trợ. Vui lòng chọn file JPG, PNG hoặc WebP.',
      );
    }
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error('Không thể đọc file ảnh. Vui lòng thử lại.'));
      reader.readAsDataURL(file);
    });
  }

  private checkNeedsResize(dataUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const done = (val: boolean) => {
        if (!settled) {
          settled = true;
          resolve(val);
        }
      };

      const timer = setTimeout(() => done(false), 200);

      img.onload = () => {
        clearTimeout(timer);
        done(img.width > MAX_DIMENSION || img.height > MAX_DIMENSION);
      };
      img.onerror = () => {
        clearTimeout(timer);
        done(false);
      };
      img.src = dataUrl;

      if (img.complete && img.naturalWidth > 0) {
        clearTimeout(timer);
        done(img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION);
      }
    });
  }

  private resizeImage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(dataUrl);
        }
      }, 500);

      img.onload = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        try {
          let { width, height } = img;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(resizedDataUrl);
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error('Không thể xử lý ảnh. File có thể bị hỏng.'));
        }
      };

      img.src = dataUrl;
    });
  }
}
