import { Injectable, signal } from '@angular/core';
import { FontDefinition } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class FontService {
  private readonly _fonts = signal<FontDefinition[]>([
    {
      name: 'Arial (Mặc định)',
      fontFamily: 'Arial, sans-serif',
      category: 'modern',
      description: 'Phông chữ mặc định rõ ràng, an toàn trên mọi máy.',
      isVietnameseSupported: true
    },
    {
      name: 'Be Vietnam Pro',
      fontFamily: '"Be Vietnam Pro", sans-serif',
      category: 'modern',
      description: 'Được thiết kế riêng cho tiếng Việt, hiện đại và chuẩn mực.',
      isVietnameseSupported: true
    },
    {
      name: 'Montserrat',
      fontFamily: '"Montserrat", sans-serif',
      category: 'impact',
      description: 'Hiện đại, sang trọng, rất phù hợp làm tiêu đề nổi bật.',
      isVietnameseSupported: true
    },
    {
      name: 'Anton',
      fontFamily: '"Anton", sans-serif',
      category: 'impact',
      description: 'Siêu đậm, dứt khoát, chuyên dùng cho banner giảm giá.',
      isVietnameseSupported: true
    },
    {
      name: 'Playfair Display',
      fontFamily: '"Playfair Display", serif',
      category: 'formal',
      description: 'Chân phương, cổ điển, rất sang trọng và quý phái.',
      isVietnameseSupported: true
    },
    {
      name: 'Lora',
      fontFamily: '"Lora", serif',
      category: 'classic',
      description: 'Phông chữ có chân thanh lịch, thích hợp cho trích dẫn thơ văn.',
      isVietnameseSupported: true
    },
    {
      name: 'Comfortaa',
      fontFamily: '"Comfortaa", sans-serif',
      category: 'friendly',
      description: 'Tròn trịa, đáng yêu, thân thiện với trẻ em hoặc đồ ăn.',
      isVietnameseSupported: true
    },
    {
      name: 'Roboto Condensed',
      fontFamily: '"Roboto Condensed", sans-serif',
      category: 'modern',
      description: 'Gọn gàng, tiết kiệm không gian, dễ đọc.',
      isVietnameseSupported: true
    },
    {
      name: 'Charm',
      fontFamily: '"Charm", cursive',
      category: 'handwriting',
      description: 'Mềm mại, bay bướm, thích hợp cho thiệp mời, chữ ký.',
      isVietnameseSupported: true
    }
  ]);

  get fonts() {
    return this._fonts.asReadonly();
  }
}
