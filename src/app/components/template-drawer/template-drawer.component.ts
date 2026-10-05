import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateLibraryService } from '../../services/template-library.service';
import { TemplateCategory, TemplatePreset } from '../../models/template.model';

@Component({
  selector: 'app-template-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="template-drawer p-3 flex flex-col gap-3 text-xs text-zinc-300 select-none">
      <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span class="font-semibold text-zinc-100 flex items-center gap-1.5">
          <span>🎨</span>
          <span>Mẫu Thiết Kế Thông Minh</span>
        </span>
        <span class="text-[11px] text-zinc-500 font-mono">{{ filteredPresets().length }} mẫu</span>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="flex flex-wrap gap-1">
        @for (cat of categories; track cat.id) {
          <button
            type="button"
            (click)="selectedCategory.set(cat.id)"
            [class.bg-blue-600]="selectedCategory() === cat.id"
            [class.text-white]="selectedCategory() === cat.id"
            [class.bg-zinc-800]="selectedCategory() !== cat.id"
            [class.text-zinc-400]="selectedCategory() !== cat.id"
            class="px-2 py-1 rounded text-[11px] hover:text-white transition-colors"
          >
            {{ cat.label }}
          </button>
        }
      </div>

      <!-- Templates Grid List -->
      <div class="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-0.5">
        @for (tpl of filteredPresets(); track tpl.id) {
          <div
            (click)="onApply(tpl.id)"
            class="template-card p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 hover:border-blue-500/60 transition-all cursor-pointer flex flex-col gap-1.5 group"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ tpl.thumbnail }}</span>
                <span
                  class="font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors text-xs"
                >
                  {{ tpl.name }}
                </span>
              </div>
            </div>

            <p class="text-[11px] text-zinc-400 leading-relaxed">
              {{ tpl.description }}
            </p>

            <div class="flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-700/40">
              <span class="text-[10px] text-zinc-500">
                Tỷ lệ phù hợp: {{ tpl.recommendedAspectRatios.join(', ') }}
              </span>
              <button
                type="button"
                class="px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-medium transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        }
      </div>
    </div>
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
export class TemplateDrawerComponent {
  readonly categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'propaganda', label: 'Cổ động' },
    { id: 'ceremony', label: 'Lễ hội' },
    { id: 'event', label: 'Sự kiện' },
    { id: 'quote', label: 'Trích dẫn' },
    { id: 'announcement', label: 'Báo chí' },
  ];

  readonly selectedCategory = signal<string>('all');

  readonly filteredPresets = computed(() => {
    const cat = this.selectedCategory();
    const all = this.templateService.getPresets();
    if (cat === 'all') return all;
    return all.filter((t) => t.category === cat);
  });

  constructor(private templateService: TemplateLibraryService) {}

  onApply(templateId: string): void {
    this.templateService.applyTemplate(templateId);
  }
}
