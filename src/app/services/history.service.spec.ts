import { TestBed } from '@angular/core/testing';
import { HistoryService } from './history.service';
import { HistoryCommand } from '../models/history.model';

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryService);
  });

  it('should be created with empty history', () => {
    expect(service).toBeTruthy();
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(false);
    expect(service.undoCount()).toBe(0);
  });

  it('should push command and execute undo/redo correctly', () => {
    let value = 0;
    const cmd: HistoryCommand = {
      id: 'cmd-1',
      name: 'Tăng giá trị',
      timestamp: Date.now(),
      execute: () => {
        value += 10;
      },
      undo: () => {
        value -= 10;
      },
    };

    service.execute(cmd);
    expect(value).toBe(10);
    expect(service.canUndo()).toBe(true);
    expect(service.canRedo()).toBe(false);

    service.undo();
    expect(value).toBe(0);
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(true);

    service.redo();
    expect(value).toBe(10);
    expect(service.canUndo()).toBe(true);
    expect(service.canRedo()).toBe(false);
  });

  it('should cap history at 50 steps', () => {
    for (let i = 1; i <= 60; i++) {
      service.push({
        id: `cmd-${i}`,
        name: `Lệnh ${i}`,
        timestamp: Date.now(),
        execute: () => {},
        undo: () => {},
      });
    }

    expect(service.undoCount()).toBe(50);
  });

  it('should clear future redo stack when new command is pushed', () => {
    service.push({
      id: '1',
      name: 'A',
      timestamp: Date.now(),
      execute: () => {},
      undo: () => {},
    });

    service.undo();
    expect(service.canRedo()).toBe(true);

    // Push new command -> Redo stack should be emptied
    service.push({
      id: '2',
      name: 'B',
      timestamp: Date.now(),
      execute: () => {},
      undo: () => {},
    });

    expect(service.canRedo()).toBe(false);
  });
});
