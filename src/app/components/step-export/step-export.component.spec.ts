import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepExportComponent } from './step-export.component';
import { CanvasService } from '../../services/canvas.service';
import { FileService } from '../../services/file.service';
import { EditorStateService } from '../../services/editor-state.service';

describe('StepExportComponent', () => {
  let component: StepExportComponent;
  let fixture: ComponentFixture<StepExportComponent>;
  let fileService: FileService;
  let editorState: EditorStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepExportComponent],
      providers: [CanvasService, FileService, EditorStateService],
    }).compileComponents();

    fileService = TestBed.inject(FileService);
    editorState = TestBed.inject(EditorStateService);

    editorState.setExportedDataUrl('data:image/png;base64,mockexportdata');

    fixture = TestBed.createComponent(StepExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create export component and load preview data', () => {
    expect(component).toBeTruthy();
    expect(component.previewDataUrl()).toBe('data:image/png;base64,mockexportdata');
  });

  it('should call fileService.saveImage when saving', async () => {
    const saveSpy = vi.spyOn(fileService, 'saveImage').mockResolvedValue(true);

    await component.onSaveImage();

    expect(saveSpy).toHaveBeenCalled();
    expect(component.saveSuccess()).toBe(true);
  });

  it('should emit goBack event on back', () => {
    let backEmitted = false;
    component.goBack.subscribe(() => {
      backEmitted = true;
    });

    component.onBack();
    expect(backEmitted).toBe(true);
  });

  it('should emit startOver event and reset state', () => {
    let startOverEmitted = false;
    component.startOver.subscribe(() => {
      startOverEmitted = true;
    });

    component.onStartOver();
    expect(startOverEmitted).toBe(true);
    expect(editorState.userImageDataUrl()).toBeNull();
  });
});
