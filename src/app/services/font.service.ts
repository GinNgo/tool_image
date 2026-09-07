import { Injectable } from '@angular/core';
import { FontPreset } from '../models/template.model';

export const CURATED_FONTS: FontPreset[] = [
  {
    id: 'solemn',
    name: 'In hoa Trang trọng',
    fontFamily: 'Montserrat-Bold',
    description: 'Chữ in đậm, uy nghiêm, chuẩn phong cách thiết kế chuyên nghiệp',
    category: 'formal',
  },
  {
    id: 'impact',
    name: 'Nổi bật Báo chí',
    fontFamily: 'BeVietnamPro-Bold',
    description: 'Nét dày dặn, tối ưu hiển thị tiếng Việt, đọc rõ ràng từ xa',
    category: 'impact',
  },
  {
    id: 'anton',
    name: 'Áp phích Mạnh mẽ (Anton)',
    fontFamily: 'Anton, Montserrat-Bold, sans-serif',
    description: 'Chữ đậm cao phóng khoáng kiểu poster cổ động hiện đại',
    category: 'impact',
  },
  {
    id: 'modern',
    name: 'Hiện đại Tinh tế',
    fontFamily: 'BeVietnamPro',
    description: 'Nét thanh thoát, hài hòa, phù hợp phụ đề hoặc nội dung chi tiết',
    category: 'modern',
  },
  {
    id: 'classic',
    name: 'Thơ ca & Lịch sử (Lora)',
    fontFamily: 'Lora, Times New Roman, serif',
    description: 'Chữ có chân trang nhã, hoài niệm, chuẩn mực xuất bản',
    category: 'classic',
  },
  {
    id: 'playfair',
    name: 'Sang trọng (Playfair)',
    fontFamily: 'Playfair Display, Georgia, serif',
    description: 'Nét thanh nét đậm hoàng gia, quý phái',
    category: 'classic',
  },
  {
    id: 'roboto-cond',
    name: 'Dứt khoát (Condensed)',
    fontFamily: 'Roboto Condensed, Arial, sans-serif',
    description: 'Tiết kiệm diện tích ngang, cô đọng nội dung nhiều chữ',
    category: 'dynamic',
  },
  {
    id: 'charm',
    name: 'Nghệ thuật Viết tay (Charm)',
    fontFamily: 'Charm, cursive, serif',
    description: 'Uốn lượn thư pháp, mềm mại và giàu tính biểu cảm',
    category: 'friendly',
  },
  {
    id: 'comfortaa',
    name: 'Bo tròn Thân thiện',
    fontFamily: 'Comfortaa, Segoe UI, sans-serif',
    description: 'Đường nét bo cong trẻ trung, thân thiện thông điệp cộng đồng',
    category: 'friendly',
  },
  {
    id: 'system-sans',
    name: 'Không chân cơ bản',
    fontFamily: 'Arial, Helvetica, sans-serif',
    description: 'Font chữ hệ thống quen thuộc, rõ ràng, trung tính',
    category: 'dynamic',
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
