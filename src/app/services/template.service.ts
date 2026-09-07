import { Injectable, signal } from '@angular/core';
import { LayoutMaster } from '../models/project.model';

export const DEFAULT_LAYOUT_MASTERS: LayoutMaster[] = [
  {
    id: 'header_top',
    name: 'Tiêu đề trên đỉnh',
    description: 'Bố cục chữ ở phía trên, nhường không gian cho chủ thể ảnh',
    category: 'header',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'CHÀO ĐÓN SỰ KIỆN MỚI',
        x: 540,
        y: 180,
        width: 800,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 56,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'stroke',
        strokeColor: '#000000',
        strokeWidth: 3
      },
      {
        text: 'Thời gian & Địa điểm diễn ra chương trình',
        x: 540,
        y: 260,
        width: 700,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 30,
        color: '#facc15',
        textAlign: 'center',
        bold: false,
        italic: true,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    ]
  },
  {
    id: 'bottom_banner',
    name: 'Khung chữ dưới chân',
    description: 'Tiêu đề lớn nổi bật kèm thông điệp ở phần chân trang',
    category: 'banner',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'TIÊU ĐỀ NỔI BẬT NHẤT',
        x: 540,
        y: 1100,
        width: 900,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 64,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'deep-shadow',
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        strokeColor: '#000000',
        strokeWidth: 2
      },
      {
        text: 'Thông điệp hành động hoặc đường link trang web',
        x: 540,
        y: 1200,
        width: 800,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 32,
        color: '#fef08a',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    ]
  },
  {
    id: 'center_ribbon',
    name: 'Băng rôn trung tâm (Ribbon)',
    description: 'Hộp chữ có nền màu tương phản ngay giữa bức ảnh',
    category: 'banner',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: 'KHUYẾN MÃI ĐẶC BIỆT',
        x: 540,
        y: 640,
        width: 850,
        fontFamily: '"Anton", sans-serif',
        fontSize: 68,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        uppercase: true,
        effect: 'background',
        backgroundColor: 'rgba(220, 38, 38, 0.9)'
      },
      {
        text: 'Dành riêng cho khách hàng thân thiết trong hôm nay',
        x: 540,
        y: 730,
        width: 750,
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 28,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    ]
  },
  {
    id: 'quote_author',
    name: 'Trích dẫn & Tác giả',
    description: 'Phong cách thơ văn trang nhã, mềm mại và ý nghĩa',
    category: 'quote',
    canvasWidth: 1080,
    canvasHeight: 1350,
    blocks: [
      {
        text: '"Hạnh phúc không phải đích đến, mà là một hành trình."',
        x: 540,
        y: 950,
        width: 800,
        fontFamily: '"Playfair Display", serif',
        fontSize: 48,
        color: '#ffffff',
        textAlign: 'center',
        bold: true,
        italic: true,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 6,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      {
        text: '— DANH NGÔN CUỘC SỐNG —',
        x: 540,
        y: 1050,
        width: 500,
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 26,
        color: '#fde047',
        textAlign: 'center',
        bold: true,
        italic: false,
        effect: 'shadow',
        shadowColor: '#000000',
        shadowBlur: 3,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly _layoutMasters = signal<LayoutMaster[]>(DEFAULT_LAYOUT_MASTERS);

  get layoutMasters() {
    return this._layoutMasters.asReadonly();
  }
}
