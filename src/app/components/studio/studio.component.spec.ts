import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudioComponent } from './studio.component';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { CanvasService } from '../../services/canvas.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { FontService } from '../../services/font.service';

describe('StudioComponent', () => {
  let component: StudioComponent;
  let fixture: ComponentFixture<StudioComponent>;
  let editorState: EditorStateService;
  let templateService: TemplateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioComponent],
      providers: [
        TemplateService,
        EditorStateService,
        CanvasService,
        FileService,
        ImageService,
        FontService,
      ],
    }).compileComponents();

    templateService = TestBed.inject(TemplateService);
    editorState = TestBed.inject(EditorStateService);

    fixture = TestBed.createComponent(StudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create StudioComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default template and title block', () => {
    component.ensureInitialTemplate();
    expect(editorState.selectedTemplate()).toBeTruthy();
    expect(editorState.textBlocks().length).toBeGreaterThanOrEqual(1);
  });
});
