import { AspectRatioType } from './canvas.model';
import { DimmerOverlayConfig } from './image-processing.model';
import { TextLayer, ShapeLayer } from './project.model';

export type TemplateCategory =
  | 'propaganda' // Cổ động, tuyên truyền
  | 'ceremony' // Lễ kỷ niệm, đại hội trang trọng
  | 'event' // Sự kiện thanh niên, phong trào
  | 'quote' // Trích dẫn nghệ thuật, danh ngôn
  | 'announcement'; // Thông báo, tin tức báo chí

export interface TemplateLayerDefinition {
  type: 'text' | 'shape';
  relativeX: number; // Tọa độ tính theo % canvas width (0.0 - 1.0)
  relativeY: number; // Tọa độ tính theo % canvas height (0.0 - 1.0)
  relativeWidth: number; // Độ rộng tính theo % canvas width (0.0 - 1.0)
  textConfig?: Partial<TextLayer>;
  shapeConfig?: Partial<ShapeLayer>;
}

export interface TemplatePreset {
  id: string; // ví dụ: "tpl_propaganda_gold_red"
  name: string; // "Khẩu hiệu Cổ động Đỏ - Vàng"
  category: TemplateCategory;
  thumbnail: string; // Đường dẫn SVG/PNG thu nhỏ hoặc inline SVG
  description: string;
  recommendedAspectRatios: AspectRatioType[];
  dimmerOverlay?: DimmerOverlayConfig;
  defaultLayers: TemplateLayerDefinition[];
}
