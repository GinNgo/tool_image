import { Injectable, signal, computed } from '@angular/core';
import { HistoryCommand } from '../models/history.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly MAX_HISTORY_STEPS = 50;

  private undoStack: HistoryCommand[] = [];
  private redoStack: HistoryCommand[] = [];

  readonly undoCount = signal<number>(0);
  readonly redoCount = signal<number>(0);
  readonly lastActionName = signal<string | null>(null);

  readonly canUndo = computed(() => this.undoCount() > 0);
  readonly canRedo = computed(() => this.redoCount() > 0);

  /**
   * Đưa một lệnh mới vào ngăn xếp Hoàn tác (Undo Stack)
   */
  push(command: HistoryCommand): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.MAX_HISTORY_STEPS) {
      this.undoStack.shift();
    }
    // Xóa ngăn xếp Làm lại (Redo) khi có thao tác mới
    this.redoStack = [];

    this.undoCount.set(this.undoStack.length);
    this.redoCount.set(0);
    this.lastActionName.set(command.name);
  }

  /**
   * Thực thi và tự động ghi nhận vào lịch sử
   */
  execute(command: HistoryCommand): void {
    command.execute();
    this.push(command);
  }

  /**
   * Hoàn tác thao tác gần nhất (Ctrl+Z)
   */
  undo(): void {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    try {
      command.undo();
      this.redoStack.push(command);
    } catch (err) {
      console.error('Lỗi khi thực hiện Undo command:', err);
    }

    this.undoCount.set(this.undoStack.length);
    this.redoCount.set(this.redoStack.length);
    this.lastActionName.set(
      this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].name : null,
    );
  }

  /**
   * Làm lại thao tác vừa hoàn tác (Ctrl+Y)
   */
  redo(): void {
    if (this.redoStack.length === 0) return;

    const command = this.redoStack.pop()!;
    try {
      command.execute();
      this.undoStack.push(command);
    } catch (err) {
      console.error('Lỗi khi thực hiện Redo command:', err);
    }

    this.undoCount.set(this.undoStack.length);
    this.redoCount.set(this.redoStack.length);
    this.lastActionName.set(command.name);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.undoCount.set(0);
    this.redoCount.set(0);
    this.lastActionName.set(null);
  }
}
