import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioStateService, ToolTabType } from '../../services/studio-state.service';
import { TypographyService } from '../../services/typography.service';
import { ImageProcessingService } from '../../services/image-processing.service';

interface DockTab {
  id: ToolTabType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-tool-dock',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="tool-dock w-[72px] h-full bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 select-none z-20"
    >
      <!-- Hidden file input for quick image upload -->
      <input
        #fileInput
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFileSelected($event)"
      />

      <div class="flex flex-col gap-2 w-full px-1.5">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            (click)="selectTab(tab.id)"
            [class.bg-blue-600]="studioState.activeToolTab() === tab.id"
            [class.text-white]="studioState.activeToolTab() === tab.id"
            [class.text-zinc-400]="studioState.activeToolTab() !== tab.id"
            [class.hover:bg-zinc-800]="studioState.activeToolTab() !== tab.id"
            [class.hover:text-zinc-200]="studioState.activeToolTab() !== tab.id"
            class="flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition-all text-[11px] font-medium gap-1 text-center"
          >
            <span class="text-xl leading-none">{{ tab.icon }}</span>
            <span class="tracking-tight">{{ tab.label }}</span>
          </button>
        }
      </div>

      <!-- Quick Add Text Shortcut at bottom -->
      <div class="mt-auto flex flex-col gap-2 w-full px-2">
        <button
          type="button"
          (click)="onQuickAddHeading()"
          title="Thêm Tiêu đề nhanh"
          class="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[10px] font-semibold"
        >
          <span class="text-base leading-none">➕</span>
          <span>Thêm chữ</span>
        </button>

        <button
          type="button"
          (click)="fileInput.click()"
          title="Tải ảnh nền mới"
          class="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[10px] font-semibold"
        >
          <span class="text-base leading-none">📁</span>
          <span>Nạp ảnh</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class ToolDockComponent {
  readonly tabs: DockTab[] = [
    { id: 'image', label: 'Ảnh nền', icon: '🖼️' },
    { id: 'text', label: 'Thêm chữ', icon: '🔤' },
    { id: 'template', label: 'Mẫu sẵn', icon: '🎨' },
    { id: 'filter', label: 'Bộ lọc', icon: '✨' },
    { id: 'layer', label: 'Lớp ảnh', icon: '📑' },
  ];

  constructor(
    public studioState: StudioStateService,
    private typographyService: TypographyService,
    private imageService: ImageProcessingService,
  ) {}

  selectTab(tabId: ToolTabType): void {
    this.studioState.setActiveToolTab(tabId);
  }

  onQuickAddHeading(): void {
    this.typographyService.createTextbox('KHẨU HIỆU TIÊU BIỂU', {
      typography: {
        fontSize: 54,
        fontWeight: 'bold',
        fontFamily: 'Montserrat',
        color: '#FFD700',
        align: 'center',
        fontStyle: 'normal',
        underline: false,
        uppercase: true,
        lineHeight: 1.2,
        letterSpacing: 2,
      },
      ribbon: {
        enabled: true,
        backgroundColor: '#DC2626',
        opacity: 95,
        paddingX: 20,
        paddingY: 10,
        borderRadius: 8,
      },
    });
    this.studioState.setActiveToolTab('text');
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.imageService.setBackgroundImage(file);
      this.studioState.setActiveToolTab('image');
      event.target.value = '';
    }
  }
}
