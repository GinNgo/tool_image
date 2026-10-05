export type AspectRatioType =
  | 'original' // Giữ nguyên tỷ lệ ảnh gốc
  | '1:1' // Vuông (Social Feed, Avatar)
  | '16:9' // Màn hình ngang, Banner Web, Video
  | '9:16' // Dọc Story, Reels, TikTok
  | '4:5' // Dọc Poster, Instagram Portrait
  | '3:2' // Tỷ lệ máy ảnh tiêu chuẩn
  | 'custom'; // Kích thước tự nhập

export interface CanvasConfig {
  width: number; // Chiều rộng pixel thực (ví dụ: 1920)
  height: number; // Chiều cao pixel thực (ví dụ: 1080)
  aspectRatio: AspectRatioType; // Loại tỷ lệ đang chọn
  backgroundColor: string; // Màu nền canvas khi không có ảnh (mặc định: "#18181b")
}

export interface ViewportTransform {
  zoom: number; // Hệ số thu phóng hiển thị (0.1 - 4.0)
  panX: number; // Tọa độ dịch chuyển ngang của viewport
  panY: number; // Tọa độ dịch chuyển dọc của viewport
  fitZoom: number; // Hệ số zoom tính toán để canvas vừa vặn viewport
}

export interface AspectRatioPreset {
  id: AspectRatioType;
  label: string;
  ratio: number | null; // width / height, null cho original hoặc custom
  defaultWidth: number;
  defaultHeight: number;
  icon?: string;
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  {
    id: 'original',
    label: 'Gốc (Ảnh)',
    ratio: null,
    defaultWidth: 1920,
    defaultHeight: 1080,
    icon: 'crop_original',
  },
  {
    id: '16:9',
    label: '16:9 (Ngang)',
    ratio: 16 / 9,
    defaultWidth: 1920,
    defaultHeight: 1080,
    icon: 'crop_16_9',
  },
  {
    id: '1:1',
    label: '1:1 (Vuông)',
    ratio: 1,
    defaultWidth: 1080,
    defaultHeight: 1080,
    icon: 'crop_square',
  },
  {
    id: '9:16',
    label: '9:16 (Dọc Story)',
    ratio: 9 / 16,
    defaultWidth: 1080,
    defaultHeight: 1920,
    icon: 'crop_portrait',
  },
  {
    id: '4:5',
    label: '4:5 (Dọc Feed)',
    ratio: 4 / 5,
    defaultWidth: 1080,
    defaultHeight: 1350,
    icon: 'crop_5_4',
  },
  {
    id: '3:2',
    label: '3:2 (Ảnh chụp)',
    ratio: 3 / 2,
    defaultWidth: 1800,
    defaultHeight: 1200,
    icon: 'crop_landscape',
  },
  {
    id: 'custom',
    label: 'Tùy chỉnh',
    ratio: null,
    defaultWidth: 1200,
    defaultHeight: 800,
    icon: 'tune',
  },
];
