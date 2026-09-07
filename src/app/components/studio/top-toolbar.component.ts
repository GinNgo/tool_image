import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { FileService } from '../../services/file.service';
import { FormsModule } from '@angular/forms';
import { FontService } from '../../services/font.service';

@Component({
  selector: 'app-top-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="toolbar">
      <!-- 1. Left: Brand & File Name -->
      <div class="brand-group">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13v6"/><path d="M7 16h6"/></svg>
        </div>
        <div class="brand-info">
          <h1>PhotoText Studio</h1>
          <input
            type="text"
            class="project-title-input"
            [ngModel]="editorState.projectTitle()"
            (ngModelChange)="editorState.updateProjectTitle($event)"
            title="Đổi tên thiết kế"
          />
        </div>
      </div>

      <!-- 2. Middle: Dynamic Context Tools -->
      <div class="tools-center">
        <!-- Khi đang chọn một hộp chữ -->
        <div class="tools-group" *ngIf="editorState.activeTextBlock() as block">

          <!-- Phông chữ -->
          <div class="tool-item">
            <select [ngModel]="block.fontFamily" (ngModelChange)="onFormatChange('fontFamily', $event)" class="tool-select">
              <option *ngFor="let font of fontService.fonts()" [value]="font.fontFamily">{{ font.name }}</option>
            </select>
          </div>

          <!-- Cỡ chữ -->
          <div class="tool-item stepper">
            <button (click)="onFormatChange('fontSize', block.fontSize - 2)" title="Giảm cỡ chữ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="stepper-value">{{ block.fontSize }}</span>
            <button (click)="onFormatChange('fontSize', block.fontSize + 2)" title="Tăng cỡ chữ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <!-- Màu chữ -->
          <div class="tool-item color-item" title="Đổi màu chữ">
            <input type="color" [ngModel]="block.color" (ngModelChange)="onFormatChange('color', $event)" class="color-picker" />
            <div class="color-preview" [style.backgroundColor]="block.color"></div>
          </div>

          <div class="v-divider"></div>

          <!-- In đậm / Nghiêng -->
          <div class="tool-item toggle-group">
            <button [class.active]="block.bold" (click)="onFormatChange('bold', !block.bold)" title="In đậm (Bold)">
              <b>B</b>
            </button>
            <button [class.active]="block.italic" (click)="onFormatChange('italic', !block.italic)" title="In nghiêng (Italic)">
              <i>I</i>
            </button>
          </div>

          <!-- Canh lề -->
          <div class="tool-item toggle-group">
            <button [class.active]="block.textAlign === 'left'" (click)="onFormatChange('textAlign', 'left')" title="Canh trái">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            </button>
            <button [class.active]="block.textAlign === 'center'" (click)="onFormatChange('textAlign', 'center')" title="Canh giữa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
            </button>
            <button [class.active]="block.textAlign === 'right'" (click)="onFormatChange('textAlign', 'right')" title="Canh phải">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
            </button>
          </div>

          <div class="v-divider"></div>

          <!-- Hiệu ứng đặc biệt -->
          <div class="tool-item toggle-group">
            <button (click)="canvasService.toggleShadow()" title="Bật/Tắt bóng đổ">
              Bóng mờ
            </button>
            <button (click)="canvasService.toggleStroke()" title="Bật/Tắt viền chữ">
              Viền chữ
            </button>
          </div>

          <!-- Nút xóa nhanh -->
          <button class="tool-btn delete-btn" (click)="canvasService.deleteActiveObject()" title="Xóa hộp chữ này (Delete)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>

        <!-- Khi không chọn hộp chữ nào (Trạng thái Canvas chung) -->
        <div class="canvas-quick-tools" *ngIf="!editorState.activeTextBlock()">
          <span class="quick-label">Kích thước khung hình:</span>
          <div class="dimension-badges">
            <button class="badge" [class.active]="isSize(1080, 1080)" (click)="setCanvasSize(1080, 1080)">
              Vuông (1:1)
            </button>
            <button class="badge" [class.active]="isSize(1080, 1350)" (click)="setCanvasSize(1080, 1350)">
              Dọc bài đăng (4:5)
            </button>
            <button class="badge" [class.active]="isSize(1920, 1080)" (click)="setCanvasSize(1920, 1080)">
              Ngang HD (16:9)
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Right: Quick Actions & Export -->
      <div class="actions-right">
        <button class="btn btn-export" (click)="onExportClick()" title="Xuất ảnh PNG chất lượng cao">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Xuất PNG
        </button>
      </div>
    </header>
  `,
  styles: [`
    .toolbar {
      height: 64px;
      background: var(--color-panel-surface); /* #1e293b */
      border-bottom: 1px solid var(--color-dark-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      color: #f8fafc;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    /* 1. Brand & Title */
    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 250px;
    }
    .brand-logo {
      color: #7c3aed; /* Violet primary */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-info {
      display: flex;
      flex-direction: column;
    }
    .brand-info h1 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    .project-title-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      color: #94a3b8;
      font-size: 0.8rem;
      padding: 2px 0;
      outline: none;
      width: 150px;
      transition: all var(--transition-fast);
    }
    .project-title-input:hover, .project-title-input:focus {
      color: #cbd5e1;
      border-color: #475569;
    }

    /* 2. Middle Tools */
    .tools-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tools-group {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #0f172a;
      padding: 6px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-dark-border);
    }
    .tool-item {
      display: flex;
      align-items: center;
    }
    .tool-select {
      background: #1e293b;
      color: #ffffff;
      border: 1px solid var(--color-dark-border);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      outline: none;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .tool-select:hover {
      border-color: #7c3aed;
    }
    .stepper {
      display: flex;
      align-items: center;
      background: #1e293b;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-dark-border);
      overflow: hidden;
    }
    .stepper button {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 6px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stepper button:hover {
      background: #334155;
      color: #ffffff;
    }
    .stepper-value {
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 32px;
      text-align: center;
      color: #ffffff;
    }
    .color-item {
      position: relative;
      cursor: pointer;
    }
    .color-picker {
      position: absolute;
      opacity: 0;
      width: 28px;
      height: 28px;
      cursor: pointer;
    }
    .color-preview {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 1px #475569;
    }
    .v-divider {
      width: 1px;
      height: 20px;
      background: var(--color-dark-border);
    }
    .toggle-group {
      display: flex;
      border: 1px solid var(--color-dark-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: #1e293b;
    }
    .toggle-group button {
      background: transparent;
      border: none;
      border-right: 1px solid var(--color-dark-border);
      color: #94a3b8;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .toggle-group button:last-child {
      border-right: none;
    }
    .toggle-group button:hover {
      background: #334155;
      color: #ffffff;
    }
    .toggle-group button.active {
      background: #7c3aed;
      color: #ffffff;
    }
    .tool-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 6px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .delete-btn:hover {
      background: #dc2626;
      color: #ffffff;
    }

    /* Canvas Size Controls */
    .canvas-quick-tools {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #0f172a;
      padding: 6px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-dark-border);
    }
    .quick-label {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .dimension-badges {
      display: flex;
      gap: 8px;
    }
    .badge {
      background: #1e293b;
      border: 1px solid var(--color-dark-border);
      color: #cbd5e1;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .badge:hover {
      border-color: #7c3aed;
      color: #ffffff;
    }
    .badge.active {
      background: #7c3aed;
      border-color: #7c3aed;
      color: #ffffff;
    }

    /* 3. Right Actions */
    .actions-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-export {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }
    .btn-export:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
    }
    .btn-export:active {
      transform: translateY(0);
    }
  `]
})
export class TopToolbarComponent {
  constructor(
    public editorState: EditorStateService,
    public fontService: FontService,
    public canvasService: CanvasService,
    private fileService: FileService
  ) {}

  onFormatChange(prop: string, value: any): void {
    this.canvasService.updateActiveTextFormat(prop, value);
  }

  isSize(w: number, h: number): boolean {
    const current = this.editorState.canvasSize();
    return current.width === w && current.height === h;
  }

  setCanvasSize(w: number, h: number): void {
    this.editorState.canvasSize.set({ width: w, height: h });
    // Update background image if any
    const bg = this.editorState.backgroundImage();
    if (bg) {
      this.canvasService.setBackgroundImage(bg, w, h);
    }
    // Re-trigger resize
    const container = document.querySelector('.layout-workspace') as HTMLElement;
    if (container) {
      (this.canvasService as any).updateCanvasDisplaySize(container.clientWidth, container.clientHeight);
    }
  }

  onExportClick(): void {
    const dataUrl = this.canvasService.exportToPng();
    if (dataUrl) {
      this.fileService.downloadFile(dataUrl, `${this.editorState.projectTitle()}.png`);
    }
  }
}
