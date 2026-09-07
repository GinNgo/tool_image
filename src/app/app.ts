import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<h1>App Started</h1>`,
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
