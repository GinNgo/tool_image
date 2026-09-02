import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepEditorComponent } from './step-editor.component';
import { TemplateService } from '../../services/template.service';
import { CanvasService } from '../../services/canvas.service';
import { ImageService } from '../../services/image.service';
import { FileService } from '../../services/file.service';
import { EditorStateService } from '../../services/editor-state.service';

describe('StepEditorComponent', () => {
  let component: StepEditorComponent;
  let fixture: ComponentFixture<StepEditorComponent>;
  let templateService: TemplateService;
  let editorState: EditorStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEditorComponent],
      providers: [
        TemplateService,
        CanvasService,
        ImageService,
        FileService,
        EditorStateService,
      ],
    }).compileComponents();

    templateService = TestBed.inject(TemplateService);
    editorState = TestBed.inject(EditorStateService);

    // Select template first
    const tpls = templateService.templates();
    editorState.setTemplate(tpls[0]);

    fixture = TestBed.createComponent(StepEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create editor component', () => {
    expect(component).toBeTruthy();
  });

  it('should update text in state when typed', () => {
    component.onTextChanged('KHẨU HIỆU MỚI');
    expect(editorState.userText()).toBe('KHẨU HIỆU MỚI');
  });

  it('should change font style when selected', () => {
    component.onFontSelected('BeVietnamPro-Bold');
    expect(editorState.selectedFontFamily()).toBe('BeVietnamPro-Bold');
  });

  it('should emit goBack event', () => {
    let backEmitted = false;
    component.goBack.subscribe(() => {
      backEmitted = true;
    });

    component.onBack();
    expect(backEmitted).toBe(true);
  });

  it('should emit stepComplete when image and text are provided', () => {
    let nextEmitted = false;
    component.stepComplete.subscribe(() => {
      nextEmitted = true;
    });

    editorState.setImage('data:image/png;base64,mock', 'test.png');
    editorState.setText('TIÊU ĐỀ HỢP LỆ');

    component.onNext();
    expect(nextEmitted).toBe(true);
  });
});
