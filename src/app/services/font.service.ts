import { Injectable, signal } from '@angular/core';
import { FontDefinition } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class FontService {
  private readonly _fonts = signal<FontDefinition[]>([
    { name: 'Không chân cơ bản', fontFamily: 'Arial', category: 'Sans-serif', isVietnameseSupported: true },
    { name: 'Times New Roman', fontFamily: '"Times New Roman"', category: 'Serif', isVietnameseSupported: true },
    { name: 'Montserrat (Đậm)', fontFamily: 'Montserrat-Bold', category: 'Sans-serif', isVietnameseSupported: true },
    { name: 'Be Vietnam Pro', fontFamily: 'BeVietnamPro', category: 'Sans-serif', isVietnameseSupported: true },
    { name: 'In hoa Trang trọng', fontFamily: 'BeVietnamPro-Bold', category: 'Sans-serif', isVietnameseSupported: true },
  ]);

  get fonts() {
    return this._fonts.asReadonly();
  }
}
