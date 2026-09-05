import { Injectable } from '@angular/core';
import { ProjectData } from '../models/template.model';

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

  // === Project File Save & Load (.json) ===

  async saveProject(project: ProjectData, defaultFilename?: string): Promise<boolean> {
    const filename = defaultFilename || `${project.projectName || 'du-an'}.json`;
    const jsonStr = JSON.stringify(project, null, 2);

    if (this.isElectron()) {
      try {
        const electronAPI = this.getElectronAPI();
        if (electronAPI?.showSaveProjectDialog && electronAPI?.writeProjectFile) {
          const filePath = await electronAPI.showSaveProjectDialog({
            defaultPath: filename,
            filters: [{ name: 'Dự án tạo ảnh', extensions: ['json'] }],
          });
          if (!filePath) return false;
          await electronAPI.writeProjectFile(filePath, jsonStr);
          return true;
        }
      } catch (err) {
        console.error('Lỗi lưu dự án qua Electron:', err);
      }
    }

    // Fallback: download as JSON file in browser
    return new Promise((resolve) => {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve(true);
      } catch {
        resolve(false);
      }
    });
  }

  async openProjectViaElectron(): Promise<ProjectData | null> {
    if (!this.isElectron()) return null;

    try {
      const electronAPI = this.getElectronAPI();
      if (!electronAPI?.showOpenProjectDialog || !electronAPI?.readProjectFile) return null;

      const filePath = await electronAPI.showOpenProjectDialog();
      if (!filePath) return null;

      const jsonStr = await electronAPI.readProjectFile(filePath);
      return JSON.parse(jsonStr) as ProjectData;
    } catch (err) {
      console.error('Lỗi mở dự án qua Electron:', err);
      return null;
    }
  }

  async readProjectFromFile(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as ProjectData;
          resolve(parsed);
        } catch {
          reject(new Error('File dự án không hợp lệ hoặc đã bị lỗi.'));
        }
      };
      reader.onerror = () => reject(new Error('Không thể đọc file dự án.'));
      reader.readAsText(file);
    });
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

      if (!filePath) return false;

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
  showSaveProjectDialog?(options: {
    defaultPath: string;
    filters: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null>;
  showOpenProjectDialog?(): Promise<string | null>;
  writeProjectFile?(filePath: string, content: string): Promise<void>;
  readProjectFile?(filePath: string): Promise<string>;
}
