import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { FormsModule } from '@angular/forms';
import { FontService } from '../../services/font.service';

@Component({
  selector: 'app-top-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="toolbar">
      <div class="brand">
        <h1>PhotoText Studio</h1>
      </div>

      <div class="tools" *ngIf="editorState.activeTextBlock() as block">
        
        <select [ngModel]="block.fontFamily" (ngModelChange)="onFormatChange('fontFamily', $event)" class="tool-select">
          <option *ngFor="let font of fontService.fonts()" [value]="font.fontFamily">{{ font.name }}</option>
        </select>


        <div class="stepper">
          <button (click)="onFormatChange('fontSize', block.fontSize - 2)">-</button>
          <span>{{ block.fontSize }}</span>
          <button (click)="onFormatChange('fontSize', block.fontSize + 2)">+</button>
        </div>

        <input type="color" [ngModel]="block.color" (ngModelChange)="onFormatChange('color', $event)" class="color-picker" />

        <div class="toggle-group">
          <button [class.active]="block.bold" (click)="onFormatChange('bold', !block.bold)"><b>B</b></button>
          <button [class.active]="block.italic" (click)="onFormatChange('italic', !block.italic)"><i>I</i></button>
        </div>

        <div class="toggle-group">
          <button [class.active]="block.textAlign === 'left'" (click)="onFormatChange('textAlign', 'left')">⇤</button>
          <button [class.active]="block.textAlign === 'center'" (click)="onFormatChange('textAlign', 'center')">↔</button>
          <button [class.active]="block.textAlign === 'right'" (click)="onFormatChange('textAlign', 'right')">⇥</button>
        </div>

        <div class="toggle-group">
          <button (click)="canvasService.toggleShadow()">Bóng</button>
          <button (click)="canvasService.toggleStroke()">Viền</button>
        </div>
      </div>

      <div class="tools-placeholder" *ngIf="!editorState.activeTextBlock()">
        <span>Chọn một hộp chữ để định dạng</span>
      </div>
    </header>
  `,
  styles: [`
    .toolbar {
      height: 60px;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 30px;
      color: #f8fafc;
    }
    .brand h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .tools {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .tools-placeholder {
      color: #64748b;
      font-size: 0.9rem;
      font-style: italic;
    }
    .tool-select {
      background: #1e293b;
      color: white;
      border: 1px solid #334155;
      padding: 6px 12px;
      border-radius: 4px;
      outline: none;
    }
    .stepper {
      display: flex;
      align-items: center;
      background: #1e293b;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #334155;
    }
    .stepper button {
      background: transparent;
      border: none;
      color: white;
      padding: 6px 10px;
      cursor: pointer;
    }
    .stepper button:hover {
      background: #334155;
    }
    .stepper span {
      padding: 0 10px;
      min-width: 40px;
      text-align: center;
    }
    .color-picker {
      background: none;
      border: none;
      height: 32px;
      width: 32px;
      cursor: pointer;
      padding: 0;
    }
    .toggle-group {
      display: flex;
      border: 1px solid #334155;
      border-radius: 4px;
      overflow: hidden;
    }
    .toggle-group button {
      background: #1e293b;
      border: none;
      border-right: 1px solid #334155;
      color: white;
      padding: 6px 12px;
      cursor: pointer;
    }
    .toggle-group button:last-child {
      border-right: none;
    }
    .toggle-group button.active {
      background: #3b82f6;
    }
    .toggle-group button:hover:not(.active) {
      background: #334155;
    }
  `]
})
export class TopToolbarComponent {
  constructor(
    public editorState: EditorStateService,
    public fontService: FontService,
    public canvasService: CanvasService
  ) {}

  onFormatChange(prop: string, value: any): void {
    // We will implement updateActiveTextFormat in CanvasService
    this.canvasService.updateActiveTextFormat(prop, value);
  }
}
