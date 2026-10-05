import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitlebarComponent } from '../titlebar/titlebar.component';
import { ToolDockComponent } from '../tool-dock/tool-dock.component';
import { CanvasStageComponent } from '../canvas-stage/canvas-stage.component';
import { InspectorComponent } from '../inspector/inspector.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { TemplateDrawerComponent } from '../template-drawer/template-drawer.component';
import { LayerPanelComponent } from '../layer-panel/layer-panel.component';
import { ExportModalComponent } from '../export-modal/export-modal.component';
import { KeyboardShortcutsDirective } from '../../shared/directives/keyboard-shortcuts.directive';
import { StudioStateService } from '../../services/studio-state.service';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [
    CommonModule,
    TitlebarComponent,
    ToolDockComponent,
    CanvasStageComponent,
    InspectorComponent,
    StatusBarComponent,
    TemplateDrawerComponent,
    LayerPanelComponent,
    ExportModalComponent,
    KeyboardShortcutsDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="studio-root h-screen w-screen overflow-hidden flex flex-col bg-zinc-950 font-sans text-zinc-100 select-none"
      appKeyboardShortcuts
    >
      <!-- Top Titlebar -->
      <app-titlebar />

      <!-- Center Studio Workspace (Dock + Drawer + Stage + Inspector) -->
      <div class="flex-1 flex overflow-hidden relative">
        <!-- 1. Left Icon Navigation Dock (72px) -->
        <app-tool-dock />

        <!-- 2. Expandable Secondary Drawer (for Templates or Layers) -->
        @if (studioState.activeToolTab() === 'template') {
          <div
            class="w-80 h-full bg-zinc-900 border-r border-zinc-800 z-10 overflow-y-auto animate-slideRight"
          >
            <app-template-drawer />
          </div>
        } @else if (studioState.activeToolTab() === 'layer') {
          <div
            class="w-80 h-full bg-zinc-900 border-r border-zinc-800 z-10 overflow-y-auto animate-slideRight"
          >
            <app-layer-panel />
          </div>
        }

        <!-- 3. Central Canvas Stage -->
        <main class="flex-1 h-full overflow-hidden relative">
          <app-canvas-stage />
        </main>

        <!-- 4. Right Inspector Panel (320px) -->
        <app-inspector />
      </div>

      <!-- Bottom Status Bar (28px) -->
      <app-status-bar />

      <!-- Export Modal Dialog -->
      <app-export-modal />

      <!-- Keyboard Shortcuts Help Modal -->
      @if (studioState.isShortcutsModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fadeIn"
        >
          <div
            class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                <span>⌨️</span>
                <span>Phím Tắt Trợ Giúp</span>
              </h3>
              <button
                type="button"
                (click)="studioState.closeShortcutsModal()"
                class="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div class="flex flex-col gap-2.5 text-xs text-zinc-300">
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Hoàn tác (Undo)</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Ctrl + Z</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Làm lại (Redo)</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Ctrl + Y</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Lưu dự án</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Ctrl + S</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Mở dự án</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Ctrl + O</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Xóa lớp đang chọn</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Delete / Backspace</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1 border-b border-zinc-800/60">
                <span class="text-zinc-400">Dịch chuyển vị trí 1px</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Mũi tên (↑ ↓ ← →)</kbd
                >
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-zinc-400">Dịch chuyển vị trí 10px</span>
                <kbd
                  class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200"
                  >Shift + Mũi tên</kbd
                >
              </div>
            </div>

            <div class="mt-2 flex justify-end">
              <button
                type="button"
                (click)="studioState.closeShortcutsModal()"
                class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    `,
  ],
})
export class StudioComponent {
  constructor(public studioState: StudioStateService) {}
}
