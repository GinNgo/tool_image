import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../../services/canvas.service';
import { SidebarDrawerComponent } from './sidebar-drawer.component';
import { TopToolbarComponent } from './top-toolbar.component';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, SidebarDrawerComponent, TopToolbarComponent],
  template: `
    <div class="studio-layout">
      <app-top-toolbar class="layout-header"></app-top-toolbar>
      <div class="layout-body">
        <app-sidebar-drawer class="layout-sidebar"></app-sidebar-drawer>
        <main class="layout-workspace" #workspaceContainer>
          <div class="canvas-wrapper">
            <canvas #fabricCanvas></canvas>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .studio-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #0f172a;
    }
    .layout-header {
      flex: 0 0 auto;
      z-index: 10;
    }
    .layout-body {
      flex: 1 1 auto;
      display: flex;
      overflow: hidden;
    }
    .layout-sidebar {
      flex: 0 0 320px;
      z-index: 5;
    }
    .layout-workspace {
      flex: 1 1 auto;
      background: #020617; /* Slate 950 - Deep dark canvas background */
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 40px;
      /* Subtle dot pattern for workspace */
      background-image: radial-gradient(#334155 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .canvas-wrapper {
      box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
      /* Container for fabric.js */
      display: flex;
      background-color: transparent;
      border-radius: 2px;
      overflow: hidden;
    }
  `]
})
export class StudioComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fabricCanvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('workspaceContainer') workspaceEl!: ElementRef<HTMLElement>;

  constructor(private canvasService: CanvasService) {}


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.canvasService.isEditingText()) return;
    
    // Check if user is typing in a normal HTML input/textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.canvasService.deleteActiveObject();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); // Prevent page scrolling
      const amount = event.shiftKey ? 10 : 2;
      const directionMap: Record<string, 'up'|'down'|'left'|'right'> = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      this.canvasService.nudgeActiveObject(directionMap[event.key], amount);
    }
  }

  ngAfterViewInit(): void {
    this.canvasService.initializeCanvas(this.canvasEl.nativeElement, this.workspaceEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.canvasService.destroy();
  }
}
