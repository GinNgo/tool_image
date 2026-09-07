import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';
import { CanvasService } from '../../services/canvas.service';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-sidebar-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Công Cụ</h2>
      </div>

      <div class="action-group">
        <label class="btn btn-primary file-upload-label">
          📁 Tải ảnh nền
          <input type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;" />
        </label>

        <button class="btn btn-secondary" (click)="onAddTextClick()">
          ➕ Thêm hộp chữ
        </button>

        
        <label class="btn btn-secondary file-upload-label">
          📂 Mở dự án (.json)
          <input type="file" (change)="onOpenProject($event)" accept=".json" style="display: none;" />
        </label>

        <button class="btn btn-secondary" (click)="onSaveProject()">
          💾 Lưu dự án (.json)
        </button>

        <button class="btn btn-success" (click)="onExportClick()">
          💾 Xuất ảnh PNG
        </button>
      </div>

      <div class="info-box" *ngIf="editorState.backgroundImage()">
        <p>Ảnh nền: {{ editorState.canvasSize().width }} x {{ editorState.canvasSize().height }} px</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100%;
      background: #1e293b;
      color: #f8fafc;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      transition: background 0.2s;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
    .btn-secondary {
      background: #475569;
      color: white;
    }
    .btn-secondary:hover {
      background: #334155;
    }
    .btn-success {
      background: #10b981;
      color: white;
    }
    .btn-success:hover {
      background: #059669;
    }
    .info-box {
      margin-top: auto;
      background: #0f172a;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #94a3b8;
    }
  `]
})
export class SidebarDrawerComponent {
  constructor(
    private fileService: FileService,
    private canvasService: CanvasService,
    public editorState: EditorStateService
  ) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const dataUrl = await this.fileService.readFileAsDataUrl(file);
      const dims = await this.fileService.getImageDimensions(dataUrl);
      this.canvasService.setBackgroundImage(dataUrl, dims.width, dims.height);
    }
  }

  onAddTextClick(): void {
    this.canvasService.addTextBox();
  }

  
  onSaveProject(): void {
    const canvasData = this.canvasService.getCanvasObjectsJson();
    const project = {
      version: '1.0',
      canvasSize: this.editorState.canvasSize(),
      backgroundImage: this.editorState.backgroundImage(),
      canvasData
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.fileService.downloadFile(url, 'du-an-thiet-ke.json');
  }

  async onOpenProject(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const text = await input.files[0].text();
      const project = JSON.parse(text);
      
      if (project.backgroundImage) {
        this.canvasService.setBackgroundImage(
          project.backgroundImage, 
          project.canvasSize.width, 
          project.canvasSize.height
        );
      }
      
      if (project.canvasData) {
        await this.canvasService.loadCanvasObjectsJson(project.canvasData);
      }
    }
  }

  onExportClick(): void {
    const dataUrl = this.canvasService.exportToPng();
    if (dataUrl) {
      this.fileService.downloadFile(dataUrl, 'thiet-ke-anh.png');
    }
  }
}
