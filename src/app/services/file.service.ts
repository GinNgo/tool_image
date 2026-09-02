import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {
  /**
   * Lưu ảnh PNG ra máy.
   * Khi chạy trong Electron: native save dialog.
   * Khi chạy trong browser: tải về qua thẻ <a>.
   */
  async saveImage(
    dataUrl: string,
    defaultFilename: string = 'anh-xuat.png',
  ): Promise<boolean> {
    if (this.isElectron()) {
      return this.saveViaElectron(dataUrl, defaultFilename);
    }
    return this.saveViaBrowser(dataUrl, defaultFilename);
  }

  /**
   * Mở file ảnh qua Electron native dialog (nếu có).
   */
  async openImageViaElectron(): Promise<{ dataUrl: string; fileName: string } | null> {
    if (!this.isElectron()) return null;

    try {
      const electronAPI = this.getElectronAPI();
      if (!electronAPI?.showOpenDialog || !electronAPI?.readFile) return null;

      const filePath = await electronAPI.showOpenDialog();
      if (!filePath) return null;

      const dataUrl = await electronAPI.readFile(filePath);
      const fileName = filePath.split(/[/\\]/).pop() || 'anh-nen.png';
      return { dataUrl, fileName };
    } catch (err) {
      console.error('Lỗi mở file qua Electron:', err);
      return null;
    }
  }

  isElectron(): boolean {
    return !!(window as unknown as Record<string, unknown>)['electronAPI'];
  }

  private getElectronAPI(): ElectronAPI | null {
    return (
      ((window as unknown as Record<string, unknown>)['electronAPI'] as ElectronAPI) ??
      null
    );
  }

  private async saveViaElectron(
    dataUrl: string,
    defaultFilename: string,
  ): Promise<boolean> {
    try {
      const electronAPI = this.getElectronAPI();
      if (!electronAPI) return this.saveViaBrowser(dataUrl, defaultFilename);

      const filePath = await electronAPI.showSaveDialog({
        defaultPath: defaultFilename,
        filters: [{ name: 'Ảnh PNG', extensions: ['png'] }],
      });

      if (!filePath) return false; // Người dùng huỷ

      const base64Data = dataUrl.includes(',')
        ? dataUrl.split(',')[1]
        : dataUrl.replace(/^data:image\/\w+;base64,/, '');

      await electronAPI.writeFile(filePath, base64Data);
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu file:', error);
      return false;
    }
  }

  private saveViaBrowser(
    dataUrl: string,
    defaultFilename: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const link = document.createElement('a');
        link.download = defaultFilename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve(true);
      } catch {
        resolve(false);
      }
    });
  }
}

interface ElectronAPI {
  showSaveDialog(options: {
    defaultPath: string;
    filters: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null>;
  writeFile(filePath: string, base64Data: string): Promise<void>;
  showOpenDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<string>;
}
