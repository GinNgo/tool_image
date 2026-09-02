import { Component } from '@angular/core';
import { WizardComponent } from './components/wizard/wizard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WizardComponent],
  template: `<app-wizard />`,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `,
})
export class App {}
