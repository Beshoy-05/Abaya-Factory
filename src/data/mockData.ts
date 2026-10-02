import type { CustomerDto, InvoiceDto, PaymentDto } from '../types/api';

export const INITIAL_CUSTOMERS: CustomerDto[] = [
  { id: 1, name: 'مكتب سدره', balance: 1660.00 }, // From the real paper invoice in photo!
  { id: 2, name: 'بوتيك الأميرات للعبايات', balance: 1450.00 },
  { id: 3, name: 'مشغل زهرة الخليج', balance: 0.00 },
  { id: 4, name: 'أتيليه دار الملكة', balance: 3200.00 },
  { id: 5, name: 'الروضة للأزياء الخليجية', balance: 850.00 },
];

export const INITIAL_INVOICES: InvoiceDto[] = [
  {
    id: 101,
    customerId: 1,
    customerName: 'مكتب سدره',
    invoiceDate: '2026-03-03T10:00:00Z',
    previousBalance: 1660.00,
    grandTotalAmount: 1900.00,
    totalDue: 3560.00,
    paidAmount: 1000.00,
    remainingAmount: 2560.00,
    items: [
      {
        id: 1,
        itemName: 'موديل 117 تطريز خليجي',
        itemCode: '117',
        quantity: 20,
        unitPrice: 95.00,
        totalPrice: 1900.00,
      },
    ],
  },
  {
    id: 102,
    customerId: 2,
    customerName: 'بوتيك الأميرات للعبايات',
    invoiceDate: '2026-03-02T14:30:00Z',
    previousBalance: 0.00,
    grandTotalAmount: 2450.00,
    totalDue: 2450.00,
    paidAmount: 1000.00,
    remainingAmount: 1450.00,
    items: [
      {
        id: 2,
        itemName: 'عباية حرير ملكي اسود',
        itemCode: 'ABY-001',
        quantity: 10,
        unitPrice: 150.00,
        totalPrice: 1500.00,
      },
      {
        id: 3,
        itemName: 'عباية كتان صيفية',
        itemCode: 'ABY-002',
        quantity: 5,
        unitPrice: 190.00,
        totalPrice: 950.00,
      },
    ],
  },
];

export const INITIAL_PAYMENTS: PaymentDto[] = [
  {
    id: 15,
    customerId: 1,
    customerName: 'مكتب سدره',
    amount: 1000.00,
    paymentDate: '2026-03-03T11:00:00Z',
  },
  {
    id: 16,
    customerId: 2,
    customerName: 'بوتيك الأميرات للعبايات',
    amount: 1000.00,
    paymentDate: '2026-03-02T15:00:00Z',
  },
];

export const POPULAR_MODELS = [
  { code: '117', name: 'موديل 117 تطريز كويتي', price: 95.00 },
  { code: '120', name: 'موديل 120 بشت حرير', price: 120.00 },
  { code: '105', name: 'موديل فراشة تطريز يدوي', price: 150.00 },
  { code: '201', name: 'عباية كريب دبي ملكي', price: 180.00 },
  { code: '304', name: 'كاجوال دانتيل وشيفون', price: 110.00 },
];

export const POPULAR_ABAYA_CATALOG = [
  { code: '117', name: 'موديل 117 تطريز كويتي', defaultPrice: 95.00, fabric: 'كتان معالج', embroidery: 'تطريز كمبيوتر' },
  { code: 'ABY-001', name: 'Royal Silk Black Abaya', defaultPrice: 150.00, fabric: 'Japanese Pure Silk', embroidery: 'Gold Needle' },
  { code: 'ABY-002', name: 'Linen Summer Abaya', defaultPrice: 190.00, fabric: 'Italian Washed Linen', embroidery: 'Minimalist Thread' },
  { code: 'ABY-105', name: 'Butterfly Embroidered Abaya', defaultPrice: 250.00, fabric: 'Crepe De Chine', embroidery: 'Zari Metallic Gold' },
  { code: 'ABY-201', name: 'Bisht Cut Dubai Silk Crepe', defaultPrice: 200.00, fabric: 'Salona Royal Crepe', embroidery: 'Bespoke Cuff Trim' },
  { code: 'ABY-304', name: 'French Chantilly Lace Kaftan', defaultPrice: 300.00, fabric: 'Chantilly & Velvet', embroidery: 'Hand-sewn Pearls' },
];
