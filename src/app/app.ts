import { Component } from '@angular/core';
import { StudioComponent } from './components/studio/studio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StudioComponent],
  template: `<app-studio></app-studio>`,
  styles: `
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
  `,
})
export class App {}
