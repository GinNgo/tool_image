export interface ImageTransform {
  x: number; // Tọa độ tâm X
  y: number; // Tọa độ tâm Y
  scaleX: number; // Tỷ lệ scale X
  scaleY: number; // Tỷ lệ scale Y
  rotation: number; // Góc xoay độ (0, 90, 180, 270)
  flipX: boolean; // Lật ngang
  flipY: boolean; // Lật dọc
}

export interface CropRect {
  x: number; // Tọa độ góc trên trái vùng crop
  y: number; // Tọa độ góc trên trái vùng crop
  width: number; // Chiều rộng vùng crop
  height: number; // Chiều cao vùng crop
}

export interface ImageAdjustments {
  brightness: number; // -100 đến +100 (mặc định: 0)
  contrast: number; // -100 đến +100 (mặc định: 0)
  saturation: number; // -100 đến +100 (mặc định: 0)
  blur: number; // 0 đến 50 px (mặc định: 0)
  vignette: number; // 0 đến 100 % (mặc định: 0)
}

export type DimmerGradientType =
  | 'none'
  | 'bottom-to-top' // Tối dần từ đáy lên (cho đặt tiêu đề dưới)
  | 'top-to-bottom' // Tối dần từ đỉnh xuống
  | 'two-sided' // Tối dần ở cả 2 đầu trên dưới
  | 'solid'; // Phủ đều toàn ảnh

export interface DimmerOverlayConfig {
  enabled: boolean;
  type: DimmerGradientType;
  color: string; // Mã màu Hex (ví dụ: "#000000", "#0b192c")
  opacity: number; // 0 đến 100 % (mặc định: 40%)
  heightRatio: number; // Chiều cao vùng phủ (0.2 đến 1.0)
}

export interface BackgroundConfig {
  id: string; // UUID
  fileName: string; // Tên file gốc (ví dụ: "anh-hoi-nghi.jpg")
  sourceDataUrl: string; // Dữ liệu ảnh gốc (Data URL / base64)
  originalWidth: number; // Kích thước gốc
  originalHeight: number;
  fitMode: 'fit' | 'cover'; // Khớp vừa khung hay lấp đầy khung
  transform: ImageTransform; // Tọa độ, tỷ lệ co giãn, góc xoay
  cropRect?: CropRect; // Vùng cắt ảnh (nếu có áp dụng crop)
  adjustments: ImageAdjustments; // Các bộ lọc quang học phi hủy diệt
  dimmerOverlay: DimmerOverlayConfig; // Lớp phủ làm tối/sáng nền
}

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  vignette: 0,
};

export const DEFAULT_DIMMER_CONFIG: DimmerOverlayConfig = {
  enabled: false,
  type: 'bottom-to-top',
  color: '#000000',
  opacity: 40,
  heightRatio: 0.5,
};

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
};
