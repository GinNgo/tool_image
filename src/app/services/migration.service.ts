import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  /**
   * Migrate a project file from v2.0 to v3.0.
   * Adds default layer management fields to text blocks.
   */
  migrateProject(project: any): any {
    if (!project || !project.version) return project;

    if (project.version === '2.0') {
      project.version = '3.0';

      // The canvas data is Fabric.js JSON, text blocks within it
      // will automatically get layerName defaults when loaded
      // via loadCanvasObjectsJson → addConfiguredTextBox workflow.
      // No structural migration needed for canvas data itself.

      // If project has explicit textBlocks array (older format), migrate them
      if (Array.isArray(project.textBlocks)) {
        project.textBlocks = project.textBlocks.map((block: any, idx: number) => ({
          ...block,
          layerName: block.layerName || `Văn bản ${idx + 1}`,
          visible: block.visible !== undefined ? block.visible : true,
          locked: block.locked !== undefined ? block.locked : false,
          opacity: block.opacity !== undefined ? block.opacity : 1,
        }));
      }
    }

    return project;
  }
}
