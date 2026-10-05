import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { CanvasService } from '../../services/canvas.service';
import { EditorStateService } from '../../services/editor-state.service';
import { TemplateService } from '../../services/template.service';
import { CustomTemplate } from '../../models/project.model';

@Component({
  selector: 'app-sidebar-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>CÃ´ng cá»¥ thiáº¿t káº¿</h2>
      </div>

      <div class="sidebar-content">
        <!-- 1. Cáº¥u hÃ¬nh Ná»n -->
        <div class="tool-section">
          <div class="section-header">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <h3>HÃ¬nh áº£nh ná»n</h3>
          </div>
          <p class="section-desc">
            Táº£i áº£nh lÃªn lÃ m phÃ´ng ná»n. Báº¡n cÃ³ thá»ƒ phÃ³ng to, thu nhá» hoáº·c di
            chuyá»ƒn tÃ¹y Ã½.
          </p>

          <label class="btn btn-accent file-upload-label w-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {{ editorState.backgroundImage() ? 'Äá»•i áº£nh khÃ¡c' : 'Táº£i áº£nh lÃªn' }}
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
              style="display: none;"
            />
          </label>

          <!-- CÃ´ng cá»¥ tÃ¹y chá»‰nh áº£nh ná»n khi Ä‘Ã£ cÃ³ áº£nh -->
          <div class="bg-controls" *ngIf="editorState.backgroundImage()">
            <div class="pixel-info" *ngIf="editorState.backgroundImageDimensions() as dims">
              <span>Äá»™ phÃ¢n giáº£i áº£nh:</span>
              <strong>{{ dims.width }} Ã— {{ dims.height }} px</strong>
            </div>

            <button
              class="btn w-full"
              [ngClass]="canvasService.isBgEditing ? 'btn-success' : 'btn-studio'"
              (click)="toggleBgEdit()"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="5 9 2 12 5 15" />
                <polyline points="9 5 12 2 15 5" />
                <polyline points="15 19 12 22 9 19" />
                <polyline points="19 9 22 12 19 15" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
              {{
                canvasService.isBgEditing
                  ? 'Xong (KhÃ³a áº£nh ná»n)'
                  : 'Chá»‰nh vá»‹ trÃ­ / PhÃ³ng to áº£nh'
              }}
            </button>

            <div class="btn-group mt-2">
              <button
                class="btn btn-studio flex-1 btn-sm"
                (click)="matchImageSize()"
                title="Äiá»u chá»‰nh khung hÃ¬nh báº±ng Ä‘Ãºng kÃ­ch thÆ°á»›c áº£nh pixel gá»‘c"
              >
                Khá»›p áº£nh gá»‘c
              </button>
              <button
                class="btn btn-studio flex-1 btn-sm"
                (click)="canvasService.resetBackgroundFit('cover')"
                title="Phá»§ kÃ­n khung hÃ¬nh (Cover)"
              >
                Phá»§ kÃ­n
              </button>
              <button
                class="btn btn-danger btn-sm"
                (click)="canvasService.removeBackgroundImage()"
                title="Gá»¡ bá» áº£nh ná»n"
              >
                XÃ³a
              </button>
            </div>
            <p class="hint-text" *ngIf="canvasService.isBgEditing">
              ðŸ’¡ Báº¡n cÃ³ thá»ƒ kÃ©o chuá»™t trÃªn áº£nh Ä‘á»ƒ di chuyá»ƒn vá»‹ trÃ­ hoáº·c kÃ©o
              4 gÃ³c Ä‘á»ƒ phÃ³ng to/thu nhá» mÃ 
              <b>khÃ´ng lÃ m giáº£m cháº¥t lÆ°á»£ng áº£nh pixel gá»‘c</b>.
            </p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 2. Cáº¥u hÃ¬nh Chá»¯ -->
        <div class="tool-section">
          <div class="section-header">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            <h3>VÄƒn báº£n</h3>
          </div>
          <p class="section-desc">
            ThÃªm há»™p chá»¯ tá»± do Ä‘á»ƒ tá»± tay thiáº¿t káº¿ bá»‘ cá»¥c.
          </p>
          <button class="btn btn-studio w-full" (click)="onAddTextClick()">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ThÃªm há»™p chá»¯ má»›i
          </button>
        </div>

        <div class="divider"></div>

        <!-- 3. KhuÃ´n máº«u (Builtin + Custom Tabs) -->
        <div class="tool-section">
          <div class="section-header">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <h3>KhuÃ´n máº«u</h3>
          </div>

          <!-- Tabs -->
          <div class="template-tabs">
            <button
              class="tab-btn"
              [class.active]="templateTab === 'builtin'"
              (click)="templateTab = 'builtin'"
            >
              CÃ³ sáºµn
            </button>
            <button
              class="tab-btn"
              [class.active]="templateTab === 'custom'"
              (click)="templateTab = 'custom'"
            >
              Cá»§a tÃ´i ({{ templateService.customTemplates().length }})
            </button>
          </div>

          <!-- Builtin Templates -->
          <div class="layout-grid" *ngIf="templateTab === 'builtin'">
            <div
              *ngFor="let layout of templateService.layoutMasters()"
              class="layout-card"
              (click)="applyLayout(layout)"
            >
              <div class="layout-preview">
                <div class="layout-mock" [ngClass]="layout.category"></div>
              </div>
              <span class="layout-name">{{ layout.name }}</span>
            </div>
          </div>

          <!-- Custom Templates -->
          <div *ngIf="templateTab === 'custom'">
            <div class="template-actions">
              <button class="btn btn-accent btn-sm w-full" (click)="onSaveAsTemplate()">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                LÆ°u layout hiá»‡n táº¡i lÃ m khuÃ´n máº«u
              </button>
              <label class="btn btn-studio btn-sm w-full file-upload-label">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Nháº­p khuÃ´n máº«u tá»« file
                <input
                  type="file"
                  (change)="onImportTemplate($event)"
                  accept=".json"
                  style="display: none;"
                />
              </label>
            </div>

            <!-- Save template dialog -->
            <div class="save-template-dialog" *ngIf="showSaveTemplateDialog">
              <input
                class="template-name-input"
                [(ngModel)]="newTemplateName"
                placeholder="TÃªn khuÃ´n máº«u..."
                (keydown.enter)="confirmSaveTemplate()"
              />
              <input
                class="template-name-input"
                [(ngModel)]="newTemplateDesc"
                placeholder="MÃ´ táº£ (tÃ¹y chá»n)..."
              />
              <div class="btn-group">
                <button class="btn btn-accent btn-sm flex-1" (click)="confirmSaveTemplate()">
                  LÆ°u
                </button>
                <button
                  class="btn btn-studio btn-sm flex-1"
                  (click)="showSaveTemplateDialog = false"
                >
                  Há»§y
                </button>
              </div>
            </div>

            <div class="layout-grid" *ngIf="templateService.customTemplates().length > 0">
              <div
                *ngFor="let tpl of templateService.customTemplates()"
                class="layout-card custom-card"
              >
                <div class="layout-preview custom-preview" (click)="applyCustomTemplate(tpl)">
                  <div class="custom-preview-text">
                    <span class="block-count">{{ tpl.blocks.length }} khá»‘i</span>
                    <span class="canvas-dims">{{ tpl.canvasWidth }}Ã—{{ tpl.canvasHeight }}</span>
                  </div>
                </div>
                <span class="layout-name">{{ tpl.name }}</span>
                <div class="card-actions">
                  <button class="mini-btn" (click)="onExportTemplate(tpl)" title="Xuáº¥t file">
                    ðŸ“¤
                  </button>
                  <button class="mini-btn delete" (click)="onDeleteTemplate(tpl)" title="XÃ³a">
                    ðŸ—‘
                  </button>
                </div>
              </div>
            </div>

            <div
              class="empty-custom"
              *ngIf="templateService.customTemplates().length === 0 && !showSaveTemplateDialog"
            >
              <p>
                ChÆ°a cÃ³ khuÃ´n máº«u nÃ o. Thiáº¿t káº¿ bá»‘ cá»¥c rá»“i nháº¥n "LÆ°u layout
                hiá»‡n táº¡i" Ä‘á»ƒ táº¡o khuÃ´n máº«u Ä‘áº§u tiÃªn.
              </p>
            </div>
          </div>
        </div>

        <!-- 4. Dá»± Ã¡n & LÆ°u trá»¯ -->
        <div class="tool-section mt-auto">
          <div class="btn-group">
            <label class="btn btn-studio file-upload-label flex-1">
              Má»Ÿ dá»± Ã¡n
              <input
                type="file"
                (change)="onOpenProject($event)"
                accept=".json"
                style="display: none;"
              />
            </label>
            <button class="btn btn-studio flex-1" (click)="onSaveProject()">LÆ°u dá»± Ã¡n</button>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 320px;
        height: 100%;
        background: var(--color-panel-surface); /* #1e293b */
        color: var(--color-text-light);
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--color-dark-border);
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
      }
      .sidebar-header {
        padding: 24px;
        padding-bottom: 16px;
      }
      .sidebar-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #f8fafc;
        letter-spacing: 0.2px;
      }
      .sidebar-content {
        padding: 0 24px 24px 24px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Scrollbar styling */
      .sidebar-content::-webkit-scrollbar {
        width: 6px;
      }
      .sidebar-content::-webkit-scrollbar-track {
        background: transparent;
      }
      .sidebar-content::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 10px;
      }
      .sidebar-content::-webkit-scrollbar-thumb:hover {
        background: #475569;
      }

      .divider {
        height: 1px;
        background: var(--color-dark-border);
        margin: 0 -24px;
      }

      .tool-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #e2e8f0;
      }
      .section-header h3 {
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0;
      }
      .section-desc {
        font-size: 0.85rem;
        color: #94a3b8;
        margin: 0;
        line-height: 1.5;
      }
      .w-full {
        width: 100%;
      }
      .flex-1 {
        flex: 1;
      }
      .mt-auto {
        margin-top: auto;
        padding-top: 24px;
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
      .bg-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
        background: #0f172a;
        padding: 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-dark-border);
      }
      .pixel-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        background: #1e293b;
        padding: 6px 10px;
        border-radius: 4px;
        color: #cbd5e1;
        margin-bottom: 4px;
      }
      .pixel-info strong {
        color: #38bdf8;
      }
      .mt-2 {
        margin-top: 8px;
      }
      .hint-text {
        font-size: 0.75rem;
        color: #38bdf8;
        line-height: 1.4;
        margin: 4px 0 0 0;
      }

      /* Template Tabs */
      .template-tabs {
        display: flex;
        background: #0f172a;
        border-radius: 6px;
        padding: 3px;
        border: 1px solid var(--color-dark-border);
      }
      .tab-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
      }
      .tab-btn:hover {
        color: #e2e8f0;
      }
      .tab-btn.active {
        background: #7c3aed;
        color: #ffffff;
      }

      /* Template actions */
      .template-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      /* Save template dialog */
      .save-template-dialog {
        background: #0f172a;
        border: 1px solid #7c3aed;
        border-radius: var(--radius-md);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      .template-name-input {
        background: #1e293b;
        border: 1px solid var(--color-dark-border);
        color: #f8fafc;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.85rem;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .template-name-input:focus {
        border-color: #7c3aed;
      }

      /* Layout Grid */
      .layout-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .layout-card {
        background: #0f172a;
        border: 1px solid var(--color-dark-border);
        border-radius: var(--radius-md);
        padding: 10px;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .layout-card:hover {
        border-color: #7c3aed; /* Primary Violet */
        background: #1e293b;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .layout-name {
        font-size: 0.75rem;
        text-align: center;
        color: #cbd5e1;
        font-weight: 500;
        line-height: 1.3;
      }

      /* Mocks for layout types */
      .layout-preview {
        width: 100%;
        aspect-ratio: 4/5;
        background: #1e293b;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        border: 1px solid #334155;
      }
      .layout-mock {
        position: absolute;
        left: 10%;
        right: 10%;
      }
      .layout-mock.header {
        top: 15%;
        height: 15%;
        background: #38bdf8;
        border-radius: 2px;
      }
      .layout-mock.banner {
        bottom: 10%;
        height: 25%;
        background: #fbbf24;
        border-radius: 2px;
      }
      .layout-mock.quote {
        top: 40%;
        height: 20%;
        background: #a78bfa;
        border-radius: 2px;
      }

      /* Custom template preview */
      .custom-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      }
      .custom-preview-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .block-count {
        font-size: 0.75rem;
        color: #a78bfa;
        font-weight: 600;
      }
      .canvas-dims {
        font-size: 0.65rem;
        color: #64748b;
      }
      .card-actions {
        display: flex;
        gap: 4px;
      }
      .mini-btn {
        background: transparent;
        border: 1px solid #334155;
        border-radius: 4px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 0.7rem;
        transition: all 0.15s;
      }
      .mini-btn:hover {
        background: #334155;
      }
      .mini-btn.delete:hover {
        background: #dc2626;
        border-color: #dc2626;
      }
      .empty-custom {
        text-align: center;
        padding: 20px 10px;
        color: #64748b;
        font-size: 0.8rem;
        line-height: 1.5;
      }
      .empty-custom p {
        margin: 0;
      }
    `,
  ],
})
export class SidebarDrawerComponent {
  templateTab: 'builtin' | 'custom' = 'builtin';
  showSaveTemplateDialog = false;
  newTemplateName = '';
  newTemplateDesc = '';

  constructor(
    private fileService: FileService,
    public canvasService: CanvasService,
    public editorState: EditorStateService,
    public templateService: TemplateService,
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

  toggleBgEdit(): void {
    this.canvasService.toggleBackgroundEdit();
  }

  matchImageSize(): void {
    const dims = this.editorState.backgroundImageDimensions();
    if (dims) {
      this.canvasService.setCanvasDimensions(dims.width, dims.height);
      this.canvasService.resetBackgroundFit('contain');
    }
  }

  applyLayout(layout: any): void {
    // Clear existing objects
    this.canvasService.clearCanvasText();

    // Add layout blocks
    layout.blocks.forEach((block: any) => {
      this.canvasService.addConfiguredTextBox(block);
    });
  }

  applyCustomTemplate(tpl: any): void {
    this.canvasService.clearCanvasText();
    if (tpl.canvasWidth && tpl.canvasHeight) {
      this.canvasService.setCanvasDimensions(tpl.canvasWidth, tpl.canvasHeight);
    }
    tpl.blocks.forEach((block: any) => {
      this.canvasService.addConfiguredTextBox(block);
    });
  }

  onSaveAsTemplate(): void {
    this.showSaveTemplateDialog = true;
    this.newTemplateName = '';
    this.newTemplateDesc = '';
  }

  confirmSaveTemplate(): void {
    if (!this.newTemplateName.trim()) return;

    const canvasJson = this.canvasService.getCanvasObjectsJson();
    if (!canvasJson) return;

    const size = this.editorState.canvasSize();
    const template = this.templateService.createTemplateFromCanvas(canvasJson.objects || [], {
      name: this.newTemplateName.trim(),
      description: this.newTemplateDesc.trim() || undefined,
      canvasWidth: size.width,
      canvasHeight: size.height,
    });

    this.templateService.saveCustomTemplate(template);
    this.showSaveTemplateDialog = false;
    this.templateTab = 'custom';
  }

  onDeleteTemplate(tpl: any): void {
    this.templateService.deleteCustomTemplate(tpl.id);
  }

  onExportTemplate(tpl: any): void {
    const json = this.templateService.exportCustomTemplate(tpl.id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      this.fileService.downloadFile(url, `${tpl.name}.template.json`);
    }
  }

  async onImportTemplate(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const text = await input.files[0].text();
      this.templateService.importCustomTemplate(text);
      this.templateTab = 'custom';
      input.value = '';
    }
  }

  onSaveProject(): void {
    const canvasData = this.canvasService.getCanvasObjectsJson();
    const project = {
      version: '3.0',
      title: this.editorState.projectTitle(),
      canvasSize: this.editorState.canvasSize(),
      backgroundImage: this.editorState.backgroundImage(),
      canvasData,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.fileService.downloadFile(
      url,
      `${this.editorState.projectTitle() || 'du-an-thiet-ke'}.json`,
    );
  }

  async onOpenProject(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const text = await input.files[0].text();
      const project = JSON.parse(text);

      if (project.title) {
        this.editorState.updateProjectTitle(project.title);
      }

      if (project.canvasSize) {
        this.canvasService.setCanvasDimensions(project.canvasSize.width, project.canvasSize.height);
      }

      if (project.canvasData) {
        await this.canvasService.loadCanvasObjectsJson(project.canvasData);
      }

      if (project.backgroundImage) {
        this.editorState.setBackgroundImage(project.backgroundImage, project.canvasSize);
      }

      input.value = '';
    }
  }
}
