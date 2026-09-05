import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepTemplateComponent } from './step-template.component';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { FileService } from '../../services/file.service';

describe('StepTemplateComponent', () => {
  let component: StepTemplateComponent;
  let fixture: ComponentFixture<StepTemplateComponent>;
  let templateService: TemplateService;
  let editorState: EditorStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTemplateComponent],
      providers: [TemplateService, EditorStateService, FileService],
    }).compileComponents();

    fixture = TestBed.createComponent(StepTemplateComponent);
    component = fixture.componentInstance;
    templateService = TestBed.inject(TemplateService);
    editorState = TestBed.inject(EditorStateService);
    fixture.detectChanges();
  });

  it('should render template cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.template-card');
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it('should select template when clicking a card', () => {
    const tpls = templateService.templates();
    component.onSelectTemplate(tpls[0]);

    expect(templateService.selectedTemplate()?.templateId).toBe(tpls[0].templateId);
    expect(editorState.selectedTemplate()?.templateId).toBe(tpls[0].templateId);
  });

  it('should emit stepComplete on next when template is selected', () => {
    let emitted = false;
    component.stepComplete.subscribe(() => {
      emitted = true;
    });

    const tpls = templateService.templates();
    component.onSelectTemplate(tpls[0]);
    component.onNext();

    expect(emitted).toBe(true);
  });
});
