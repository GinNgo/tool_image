export interface Template {
  templateId: string;
  name: string;
  thumbnail: string;
  canvas: CanvasSize;
  background: BackgroundConfig;
  textDefault: TextConfig;
  decorations?: DecorationConfig;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface BackgroundConfig {
  type: 'user-image';
  fitMode: 'cover' | 'contain';
}

export interface TextConfig {
  content: string;
  x: number;
  y: number;
  align: 'center' | 'left' | 'right';
  fontFamily: string;
  maxFontSize: number;
  minFontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface DecorationConfig {
  borderColor?: string;
  borderWidth?: number;
  overlayGradient?: string;
}

// === Text Block with Advanced Typography & Effects ===

export type TextBlockType = 'title' | 'subtitle' | 'caption' | 'custom';
export type TextEffectType = 'none' | 'shadow' | 'deep-shadow' | 'stroke' | 'glow' | 'background';

export interface TextBlock {
  id: string;
  type: TextBlockType;
  label: string;
  content: string;
  x: number;
  y: number;
  align: 'center' | 'left' | 'right';
  fontFamily: string;
  fontSize: number;
  minFontSize: number;
  maxFontSize: number;
  colorMode: 'auto' | 'custom';
  color: string;
  strokeColor: string;
  strokeWidth: number;
  bold?: boolean;
  italic?: boolean;
  uppercase?: boolean;
  letterSpacing?: number; // px or normalized
  lineHeight?: number;
  effect?: TextEffectType;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  width?: number;
  removable: boolean;
  defaultX?: number;
  defaultY?: number;
}

export interface FontPreset {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
  category: 'formal' | 'impact' | 'modern' | 'classic' | 'dynamic' | 'friendly';
}

export interface ProjectData {
  version: '2.0';
  projectName: string;
  updatedAt: string;
  templateId: string;
  canvas: CanvasSize;
  backgroundImage: {
    dataUrl: string;
    fileName: string;
  } | null;
  textBlocks: TextBlock[];
  activeBlockId: string | null;
}

export interface EditorState {
  selectedTemplate: Template | null;
  userImageDataUrl: string | null;
  userText: string;
  currentStep: WizardStep;
}

export type WizardStep = 1 | 2 | 3;
