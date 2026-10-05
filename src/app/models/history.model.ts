export interface HistoryCommand {
  id: string;
  name: string; // Tên hành động tiếng Việt (ví dụ: "Đổi màu chữ", "Di chuyển")
  timestamp: number;
  execute(): void;
  undo(): void;
}

export interface HistoryState {
  past: HistoryCommand[]; // Ngăn xếp hoàn tác (tối đa 50 bước)
  future: HistoryCommand[]; // Ngăn xếp làm lại
  canUndo: boolean;
  canRedo: boolean;
}
