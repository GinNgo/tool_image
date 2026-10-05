export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type ExportResolutionMultiplier = 1 | 2 | 3;

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0.6 đến 1.0 (áp dụng cho JPEG/WebP)
  multiplier: ExportResolutionMultiplier; // 1x, 2x, 3x
  fileName: string; // Tên file xuất gợi ý (ví dụ: "banner-20261005_153000.png")
  targetWidth: number; // width * multiplier
  targetHeight: number; // height * multiplier
  estimatedSizeBytes?: number; // Ước lượng dung lượng file
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 0.92,
  multiplier: 1,
  fileName: 'studio-export.png',
  targetWidth: 1920,
  targetHeight: 1080,
};
