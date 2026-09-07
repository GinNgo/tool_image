import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarDrawerComponent } from './sidebar-drawer.component';
import { TemplateService } from '../../services/template.service';
import { EditorStateService } from '../../services/editor-state.service';
import { FontService } from '../../services/font.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { CanvasService } from '../../services/canvas.service';

describe('SidebarDrawerComponent', () => {
  let component: SidebarDrawerComponent;
  let fixture: ComponentFixture<SidebarDrawerComponent>;
  let templateService: TemplateService;
  let editorState: EditorStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDrawerComponent],
      providers: [
        TemplateService,
        EditorStateService,
        FontService,
        FileService,
        ImageService,
        CanvasService,
      ],
    }).compileComponents();

    templateService = TestBed.inject(TemplateService);
    editorState = TestBed.inject(EditorStateService);

    fixture = TestBed.createComponent(SidebarDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SidebarDrawerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should switch navigation tabs', () => {
    expect(component.activeTab()).toBe('templates');

    component.selectTab('text');
    expect(component.activeTab()).toBe('text');

    component.selectTab('image');
    expect(component.activeTab()).toBe('image');

    component.selectTab('projects');
    expect(component.activeTab()).toBe('projects');
  });

  it('should apply layout master to editor state and emit template', () => {
    const layout = templateService.layoutMasters()[0];
    const emitSpy = vi.spyOn(component.templateChanged, 'emit');

    component.onApplyLayoutMaster(layout);

    expect(templateService.selectedLayoutMaster()?.id).toBe(layout.id);
    expect(editorState.textBlocks().length).toBe(layout.blocks.length);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should support saving and deleting custom layout masters', () => {
    editorState.addCustomTextBlock('title', 'Tiêu đề lưu mẫu', 'Nội dung test', 50);

    component.openSaveLayoutDialog();
    expect(component.isSavingLayout()).toBe(true);

    component.newLayoutName = 'Mẫu cá nhân kiểm thử';
    component.confirmSaveLayout();
    expect(component.isSavingLayout()).toBe(false);

    const saved = templateService.layoutMasters().find((m) => m.name === 'Mẫu cá nhân kiểm thử');
    expect(saved).toBeTruthy();
    expect(saved?.isCustom).toBe(true);

    // Delete custom layout
    const mockEvent = new MouseEvent('click');
    component.onDeleteCustomLayout(saved!.id, mockEvent);
    const afterDelete = templateService.layoutMasters().find((m) => m.id === saved!.id);
    expect(afterDelete).toBeUndefined();
  });
});
