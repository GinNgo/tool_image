import { Injectable } from '@angular/core';
import { CustomTemplate } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateStorageService {
  private readonly STORAGE_KEY = 'phototext_custom_templates';

  /**
   * Save a custom template.
   * Uses localStorage for web, will be upgraded to Electron userData in Phase 5.
   */
  saveTemplate(template: CustomTemplate): void {
    const templates = this.loadTemplates();
    const existingIdx = templates.findIndex((t) => t.id === template.id);
    if (existingIdx >= 0) {
      templates[existingIdx] = template;
    } else {
      templates.push(template);
    }
    this.persistTemplates(templates);
  }

  loadTemplates(): CustomTemplate[] {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) return [];
      return JSON.parse(json) as CustomTemplate[];
    } catch {
      return [];
    }
  }

  deleteTemplate(id: string): void {
    const templates = this.loadTemplates().filter((t) => t.id !== id);
    this.persistTemplates(templates);
  }

  updateTemplate(id: string, partial: Partial<CustomTemplate>): void {
    const templates = this.loadTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      templates[idx] = { ...templates[idx], ...partial, updatedAt: new Date().toISOString() };
      this.persistTemplates(templates);
    }
  }

  exportTemplateToJson(id: string): string | null {
    const templates = this.loadTemplates();
    const template = templates.find((t) => t.id === id);
    if (!template) return null;
    return JSON.stringify(template, null, 2);
  }

  importTemplateFromJson(json: string): CustomTemplate | null {
    try {
      const template = JSON.parse(json) as CustomTemplate;
      if (!template.id || !template.name || !template.blocks) return null;
      // Generate a new ID to avoid conflicts
      template.id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      template.category = 'custom';
      template.updatedAt = new Date().toISOString();
      this.saveTemplate(template);
      return template;
    } catch {
      return null;
    }
  }

  private persistTemplates(templates: CustomTemplate[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }
}
