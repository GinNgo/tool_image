import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudioStateService } from '../../services/studio-state.service';
import { HistoryService } from '../../services/history.service';
import { ProjectPersistenceService } from '../../services/project-persistence.service';

@Component({
  selector: 'app-titlebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="studio-titlebar flex items-center justify-between px-4 h-12 bg-zinc-900 border-b border-zinc-800 select-none text-zinc-100 z-30"
    >
      <!-- Left: Logo & Project Title -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 font-bold text-sm tracking-wide text-blue-400">
          <span class="text-lg">🎨</span>
          <span>ToolImage Studio</span>
        </div>
        <div class="h-4 w-px bg-zinc-700"></div>
        <input
          type="text"
          [ngModel]="studioState.projectTitle()"
          (ngModelChange)="studioState.setProjectTitle($event)"
          title="Nhấp để đổi tên dự án"
          class="bg-transparent hover:bg-zinc-800 focus:bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-300 focus:text-white border border-transparent focus:border-zinc-600 outline-none transition-colors w-52"
        />
        @if (studioState.isDirty()) {
          <span class="w-2 h-2 rounded-full bg-amber-500" title="Có thay đổi chưa lưu"></span>
        }
      </div>

      <!-- Center: Undo/Redo & Quick Actions -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          (click)="historyService.undo()"
          [disabled]="!historyService.canUndo()"
          title="Hoàn tác (Ctrl+Z)"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300 transition-colors"
        >
          <span>↩️</span>
          <span>Hoàn tác</span>
        </button>

        <button
          type="button"
          (click)="historyService.redo()"
          [disabled]="!historyService.canRedo()"
          title="Làm lại (Ctrl+Y)"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300 transition-colors"
        >
          <span>↪️</span>
          <span>Làm lại</span>
        </button>

        <div class="h-4 w-px bg-zinc-700 mx-1"></div>

        <button
          type="button"
          (click)="onOpenProject()"
          title="Mở dự án .tiproj (Ctrl+O)"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <span>📂</span>
          <span>Mở</span>
        </button>

        <button
          type="button"
          (click)="onSaveProject()"
          title="Lưu dự án .tiproj (Ctrl+S)"
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <span>💾</span>
          <span>Lưu</span>
        </button>
      </div>

      <!-- Right: Primary Export CTA -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="studioState.openExportModal()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm transition-all"
        >
          <span>📥</span>
          <span>Xuất ảnh</span>
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class TitlebarComponent {
  constructor(
    public studioState: StudioStateService,
    public historyService: HistoryService,
    private persistenceService: ProjectPersistenceService,
  ) {}

  onSaveProject(): void {
    const doc = this.persistenceService.exportProjectToJson();
    const jsonString =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `${this.studioState.projectTitle().replace(/\s+/g, '_')}.tiproj`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.studioState.markDirty(false);
  }

  onOpenProject(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.tiproj,application/json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const doc = JSON.parse(event.target?.result as string);
          this.persistenceService.importProjectFromJson(doc);
        } catch {
          alert('Không thể mở tệp dự án. Định dạng tệp không hợp lệ.');
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }
}
