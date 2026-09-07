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
  version: '2.0';
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage: string | null;
  textBlocks: TextBlock[];
  createdAt: string;
  updatedAt: string;
}
