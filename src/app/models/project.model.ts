import { CanvasConfig } from './canvas.model';
import { BackgroundConfig } from './image-processing.model';
import {
  TypographyConfig,
  TextRibbonConfig,
  TextStrokeConfig,
  TextShadowConfig,
} from './typography.model';

// --- V2.0 Desktop Studio Models ---

export interface ProjectDocument {
  version: '2.0.0';
  id: string; // UUID v4
  title: string; // Tên dự án (ví dụ: "Banner Co Dong 2026")
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  canvas: CanvasConfig; // Cấu hình khung vẽ
  background: BackgroundConfig | null; // Cấu hình ảnh nền
  layers: CanvasLayer[]; // Danh sách các lớp (Text, Shape, Decoration)
  meta: ProjectMeta; // Thông tin bổ trợ (tác giả, từ khóa...)
}

export interface ProjectMeta {
  appName: 'ToolImage Studio';
  appVersion: string;
  sourceTemplateId?: string;
  tags?: string[];
}

export type LayerType = 'text' | 'shape' | 'image-overlay' | 'background';

export interface BaseLayer {
  id: string; // UUID v4
  type: LayerType;
  name: string; // Tên hiển thị trong Layer Panel (ví dụ: "Tiêu đề chính")
  x: number; // Tọa độ X trên canvas
  y: number; // Tọa độ Y trên canvas
  width: number; // Chiều rộng bounding box
  height: number; // Chiều cao bounding box
  rotation: number; // Góc xoay (-180 đến 180)
  opacity: number; // Độ mờ đục (0.0 đến 1.0)
  visible: boolean; // Ẩn/Hiện lớp
  locked: boolean; // Khóa/Mở khóa chỉnh sửa
  zIndex: number; // Thứ tự hiển thị lớp
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string; // Nội dung văn bản tiếng Việt
  typography: TypographyConfig; // Thuộc tính font và chữ
  ribbon: TextRibbonConfig; // Dải nền chữ (Highlight/Ribbon)
  stroke: TextStrokeConfig; // Viền chữ
  shadow: TextShadowConfig; // Bóng đổ chữ
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'line' | 'ribbon-banner';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
}

export type CanvasLayer = TextLayer | ShapeLayer;

// --- Legacy Compatibility Types ---

export type TextEffect = 'none' | 'shadow' | 'deep-shadow' | 'stroke' | 'glow' | 'background';

export interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  uppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  effect?: TextEffect;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  layerName?: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
}

export interface LayerInfo {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  isActive: boolean;
  opacity: number;
  preview: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: 'custom' | 'builtin';
  canvasWidth: number;
  canvasHeight: number;
  blocks: Array<Omit<TextBlock, 'id'>>;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutMaster {
  id: string;
  name: string;
  description: string;
  category: 'header' | 'banner' | 'quote' | 'minimal';
  canvasWidth: number;
  canvasHeight: number;
  blocks: Omit<TextBlock, 'id'>[];
}

export interface FontDefinition {
  name: string;
  fontFamily: string;
  category: 'formal' | 'impact' | 'modern' | 'classic' | 'friendly' | 'handwriting';
  description: string;
  isVietnameseSupported: boolean;
}

export interface Project {
  version: '2.0' | '3.0';
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage: string | null;
  textBlocks: TextBlock[];
  createdAt: string;
  updatedAt: string;
}
