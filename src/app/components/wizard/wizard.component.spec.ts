import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WizardComponent } from './wizard.component';
import { EditorStateService } from '../../services/editor-state.service';
import { TemplateService } from '../../services/template.service';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let editorState: EditorStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardComponent],
      providers: [EditorStateService, TemplateService],
    }).compileComponents();

    editorState = TestBed.inject(EditorStateService);
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create wizard component and start at step 1', () => {
    expect(component).toBeTruthy();
    expect(editorState.currentStep()).toBe(1);
  });

  it('should navigate between wizard steps', () => {
    component.goToStep(2);
    expect(editorState.currentStep()).toBe(2);

    component.goToStep(3);
    expect(editorState.currentStep()).toBe(3);

    component.goToStep(1);
    expect(editorState.currentStep()).toBe(1);
  });
});
