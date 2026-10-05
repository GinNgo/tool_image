import { Injectable, signal } from '@angular/core';
import { TextBlock, LayerInfo } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class EditorStateService {
  readonly activeTextBlock = signal<TextBlock | null>(null);
  readonly backgroundImage = signal<string | null>(null);
  readonly backgroundImageDimensions = signal<{ width: number; height: number } | null>(null);
  readonly projectTitle = signal<string>('Bản thiết kế mới');
  readonly canvasSize = signal<{ width: number; height: number }>({ width: 1080, height: 1080 });
  readonly layers = signal<LayerInfo[]>([]);
  readonly layerPanelOpen = signal<boolean>(true);

  setActiveTextBlock(block: TextBlock | null): void {
    this.activeTextBlock.set(block);
  }

  setBackgroundImage(url: string | null, dimensions?: { width: number; height: number }): void {
    this.backgroundImage.set(url);
    if (dimensions) {
      this.backgroundImageDimensions.set(dimensions);
      this.canvasSize.set(dimensions);
    }
  }

  updateProjectTitle(title: string): void {
    this.projectTitle.set(title);
  }

  updateLayers(layers: LayerInfo[]): void {
    this.layers.set(layers);
  }

  toggleLayerPanel(): void {
    this.layerPanelOpen.update((v) => !v);
  }
}
