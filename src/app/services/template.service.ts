import { Injectable, signal, computed } from '@angular/core';
import { Template } from '../models/template.model';

import tpl01Data from '../../assets/templates/tpl_01.json';
import tpl02Data from '../../assets/templates/tpl_02.json';
import tpl03Data from '../../assets/templates/tpl_03.json';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly _templates = signal<Template[]>([]);
  private readonly _selectedTemplate = signal<Template | null>(null);

  readonly templates = this._templates.asReadonly();
  readonly selectedTemplate = this._selectedTemplate.asReadonly();
  readonly hasSelection = computed(() => this._selectedTemplate() !== null);

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templates: Template[] = [
      tpl01Data as Template,
      tpl02Data as Template,
      tpl03Data as Template,
    ];
    this._templates.set(templates);
  }

  selectTemplate(templateId: string): void {
    const found = this._templates().find((t) => t.templateId === templateId);
    this._selectedTemplate.set(found ?? null);
  }

  clearSelection(): void {
    this._selectedTemplate.set(null);
  }

  getTemplateById(templateId: string): Template | undefined {
    return this._templates().find((t) => t.templateId === templateId);
  }
}
