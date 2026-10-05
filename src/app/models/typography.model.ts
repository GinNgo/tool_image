export interface TypographyConfig {
  fontFamily: string; // 'Montserrat' | 'Be Vietnam Pro' | 'Playfair Display' | 'Oswald'...
  fontSize: number; // 8 đến 400 px
  fontWeight: 'normal' | 'bold' | '600' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  uppercase: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number; // 0.8 đến 2.5 (mặc định: 1.2)
  letterSpacing: number; // -50 đến 300 (mặc định: 0)
  color: string; // Mã màu Hex (ví dụ: "#FFFFFF", "#FFD700")
}

export interface TextRibbonConfig {
  enabled: boolean; // Bật/tắt dải nền chữ
  backgroundColor: string; // Màu nền (ví dụ: "#DC2626" đỏ cờ, "#1E3A8A" xanh)
  opacity: number; // 0 đến 100 % (mặc định: 90%)
  paddingX: number; // Đệm ngang pixel (mặc định: 16)
  paddingY: number; // Đệm dọc pixel (mặc định: 8)
  borderRadius: number; // Bo góc px (0 đến 50, mặc định: 6)
  boxShadow?: string;
}

export interface TextStrokeConfig {
  enabled: boolean;
  color: string; // Màu viền chữ (ví dụ: "#000000")
  width: number; // Độ dày viền px (0 đến 20)
}

export interface TextShadowConfig {
  enabled: boolean;
  color: string; // Màu bóng (ví dụ: "rgba(0,0,0,0.7)")
  blur: number; // Độ nhòe (0 đến 40)
  offsetX: number; // Độ lệch X (-30 đến 30)
  offsetY: number; // Độ lệch Y (-30 đến 30)
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting';
  weights: number[];
  previewText?: string;
}

export const OFFLINE_FONTS: FontOption[] = [
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat',
    category: 'sans-serif',
    weights: [400, 600, 700, 800],
    previewText: 'Khẩu hiệu Tiêu biểu',
  },
  {
    id: 'be-vietnam-pro',
    name: 'Be Vietnam Pro',
    family: 'Be Vietnam Pro',
    category: 'sans-serif',
    weights: [400, 600, 700],
    previewText: 'Việt Nam Đổi Mới',
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: 'Playfair Display',
    category: 'serif',
    weights: [400, 600, 700],
    previewText: 'Đại Hội Trang Trọng',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    family: 'Oswald',
    category: 'display',
    weights: [500, 600, 700],
    previewText: 'QUYẾT TÂM THẮNG LỢI',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto',
    category: 'sans-serif',
    weights: [400, 500, 700],
    previewText: 'Phông chữ phổ thông',
  },
];

export const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
  fontFamily: 'Montserrat',
  fontSize: 48,
  fontWeight: '700',
  fontStyle: 'normal',
  underline: false,
  uppercase: false,
  align: 'center',
  lineHeight: 1.2,
  letterSpacing: 0,
  color: '#FFFFFF',
};

export const DEFAULT_RIBBON_CONFIG: TextRibbonConfig = {
  enabled: false,
  backgroundColor: '#DC2626',
  opacity: 90,
  paddingX: 16,
  paddingY: 8,
  borderRadius: 6,
};

export const DEFAULT_STROKE_CONFIG: TextStrokeConfig = {
  enabled: false,
  color: '#000000',
  width: 2,
};

export const DEFAULT_SHADOW_CONFIG: TextShadowConfig = {
  enabled: false,
  color: 'rgba(0,0,0,0.6)',
  blur: 8,
  offsetX: 2,
  offsetY: 4,
};
