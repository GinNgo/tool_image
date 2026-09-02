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

export interface EditorState {
  selectedTemplate: Template | null;
  userImageDataUrl: string | null;
  userText: string;
  currentStep: WizardStep;
}

export type WizardStep = 1 | 2 | 3;
