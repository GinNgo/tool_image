import { Injectable } from '@angular/core';
import { FontPreset } from '../models/template.model';

export const CURATED_FONTS: FontPreset[] = [
  {
    id: 'solemn',
    name: 'Trang trọng',
    fontFamily: 'Montserrat-Bold',
    description: 'Chữ in đậm, uy nghiêm, chuẩn phong cách pano khẩu hiệu chính quy',
    category: 'formal',
  },
  {
    id: 'impact',
    name: 'Nổi bật',
    fontFamily: 'BeVietnamPro-Bold',
    description: 'Nét dày dặn, tối ưu hiển thị tiếng Việt, đọc rõ ràng từ xa',
    category: 'impact',
  },
  {
    id: 'modern',
    name: 'Hiện đại',
    fontFamily: 'BeVietnamPro',
    description: 'Nét thanh thoát, hài hòa, phù hợp phụ đề hoặc nội dung chi tiết',
    category: 'modern',
  },
  {
    id: 'classic',
    name: 'Cổ điển',
    fontFamily: 'Times New Roman',
    description: 'Chữ có chân chuẩn mực, đem lại cảm giác lịch sử, truyền thống',
    category: 'classic',
  },
  {
    id: 'strong',
    name: 'Mạnh mẽ',
    fontFamily: 'Arial',
    description: 'Nét chữ dày, dứt khoát, dễ đọc trong mọi kích thước',
    category: 'dynamic',
  },
  {
    id: 'friendly',
    name: 'Mềm mại',
    fontFamily: 'Segoe UI',
    description: 'Đường nét bo tròn nhẹ nhàng, thân thiện với thông điệp cộng đồng',
    category: 'friendly',
  },
];

@Injectable({ providedIn: 'root' })
export class FontService {
  getPresets(): FontPreset[] {
    return CURATED_FONTS;
  }

  getPresetById(id: string): FontPreset | undefined {
    return CURATED_FONTS.find((f) => f.id === id);
  }

  getPresetByFontFamily(fontFamily: string): FontPreset | undefined {
    return CURATED_FONTS.find((f) => f.fontFamily === fontFamily);
  }
}
