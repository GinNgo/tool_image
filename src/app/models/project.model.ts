export interface Project {
  id: string;
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage: string | null;
  textBlocks: TextBlock[];
  createdAt: string;
  updatedAt: string;
}

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
  strokeColor?: string | null;
  strokeWidth?: number;
  shadowColor?: string | null;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface FontDefinition {
  name: string;
  fontFamily: string;
  category: 'Sans-serif' | 'Serif' | 'Handwriting' | 'Display';
  isVietnameseSupported: boolean;
}
