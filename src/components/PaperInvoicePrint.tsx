import React from 'react';
import type { InvoiceDto } from '../types/api';
import { Printer, X, CreditCard } from 'lucide-react';

interface PaperInvoicePrintProps {
  invoice: InvoiceDto;
  onClose: () => void;
  onRecordPayment?: (customerId: number) => void;
}

export const PaperInvoicePrint: React.FC<PaperInvoicePrintProps> = ({ invoice, onClose, onRecordPayment }) => {
  const handlePrint = () => {
    window.print();
  };

  // Format date in Arabic standard (يوم / شهر / سنة)
  const dateObj = new Date(invoice.invoiceDate);
  const formattedDate = `${dateObj.getFullYear()} / ${dateObj.getMonth() + 1} / ${dateObj.getDate()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '780px', padding: '0', background: '#f8fafc' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط الإجراءات العلوي (لا يظهر في الطباعة) */}
        <div className="no-print" style={{
          padding: '12px 20px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '15px' }}>
              معاينة الفاتورة الجاهزة للطباعة
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              (فاتورة رقم #{invoice.id})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {onRecordPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice.customerId);
                }}
                className="btn-success-outline"
                style={{ padding: '8px 14px', fontSize: '13.5px' }}
                title="تسجيل ما دفعه العميل لهذه الفاتورة"
              >
                <CreditCard size={15} />
                <span>تسجيل دفعة للعميل</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="btn-main"
              style={{ padding: '8px 20px', fontSize: '14px' }}
            >
              <Printer size={16} />
              <span>طباعة الفاتورة الآن</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 14px' }}
            >
              <X size={16} />
              <span>إغلاق</span>
            </button>
          </div>
        </div>

        {/* جسم الفاتورة الورقية الحقيقية كما في الصورة */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          <div className="paper-invoice-sheet">
            {/* الترويسة الرئيسية */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #0f172a',
              paddingBottom: '14px',
              marginBottom: '12px'
            }}>
              {/* يمين: اسم المصنع */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  رواء الخليج
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                  للعباية الخليجي
                </div>
              </div>

              {/* وسط: كلمة فاتورة وأيقونة العباية */}
              <div style={{ textAlign: 'center' }}>
                {/* رسم توضيحي لعباية خليجية أنيقة مطابق للرسم في الفاتورة */}
                <svg width="42" height="52" viewBox="0 0 100 120" fill="#0f172a" style={{ display: 'inline-block' }}>
                  <circle cx="50" cy="18" r="12" />
                  <path d="M35,32 L65,32 L85,115 L15,115 Z" />
                  <path d="M48,32 L48,115" stroke="#ffffff" strokeWidth="2.5" />
                </svg>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                  فـــاتـورة
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  رقم: {invoice.id}
                </div>
              </div>

              {/* يسار: بيانات المسؤول ورقم الهاتف */}
              <div style={{ textAlign: 'left', direction: 'ltr' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  م / محمد صبري
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e', marginTop: '3px' }}>
                  01031424301 ✆
                </div>
              </div>
            </div>

            {/* سطر المطلوب من السيد والتاريخ */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              fontWeight: 700,
              padding: '6px 0',
              borderBottom: '1px dashed #cbd5e1',
              marginBottom: '10px'
            }}>
              <div>
                <span>المطلوب من السيد / </span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', textDecoration: 'underline' }}>
                  {invoice.customerName}
                </span>
              </div>

              <div>
                <span>تحريراً في: </span>
                <span style={{ fontWeight: 800 }}>{formattedDate}</span>
              </div>
            </div>

            {/* جدول الأصناف المطابق تماماً لدفتر الفواتير */}
            <table className="paper-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>م</th>
                  <th style={{ width: '75px' }}>الكود</th>
                  <th>الصــــنــف</th>
                  <th style={{ width: '70px' }}>فئة</th>
                  <th style={{ width: '65px' }}>عدد</th>
                  <th style={{ width: '90px' }}>جنيه</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{item.itemCode}</td>
                    <td style={{ textAlign: 'right', paddingRight: '12px', fontWeight: 700 }}>
                      {item.itemName}
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.unitPrice}</td>
                    <td style={{ fontWeight: 800 }}>{item.quantity}</td>
                    <td style={{ fontWeight: 900, fontSize: '15px' }}>
                      {item.totalPrice.toFixed(0)}
                    </td>
                  </tr>
                ))}

                {/* أسطر فارغة لملء شكل الدفتر الورقي إذا كانت البنود قليلة */}
                {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: '32px' }}>
                    <td>{invoice.items.length + i + 1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* جدول الحسابات والإجماليات في أسفل الفاتورة المطابق للصورة */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
              <table style={{
                width: '320px',
                borderCollapse: 'collapse',
                border: '2px solid #0f172a',
                fontSize: '14px',
                fontWeight: 800
              }}>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', background: '#f8fafc' }}>
                      اجمالي الفاتورة
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', textAlign: 'center', fontSize: '15px' }}>
                      {invoice.grandTotalAmount.toFixed(0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', background: '#f8fafc' }}>
                      رصيــد سـابـق
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', textAlign: 'center', fontSize: '15px' }}>
                      {invoice.previousBalance.toFixed(0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', background: '#f8fafc' }}>
                      المجموع المستحق
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', textAlign: 'center', fontSize: '16px', fontWeight: 900 }}>
                      {invoice.totalDue.toFixed(0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', color: '#15803d', background: '#f0fdf4' }}>
                      الدفعة (المسدد)
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', textAlign: 'center', color: '#15803d', fontSize: '15px' }}>
                      {invoice.paidAmount > 0 ? invoice.paidAmount.toFixed(0) : '0'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '2px solid #0f172a', padding: '8px 10px', background: '#fef2f2', color: '#b91c1c' }}>
                      اجمالي المتبقي
                    </td>
                    <td style={{ border: '2px solid #0f172a', padding: '8px 10px', textAlign: 'center', fontSize: '18px', fontWeight: 900, color: '#b91c1c' }}>
                      {invoice.remainingAmount.toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* توقيع وملاحظات في أسفل الورقة */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '30px',
              paddingTop: '16px',
              borderTop: '1px solid #cbd5e1',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#475569'
            }}>
              <div>
                توقيع المستلم: .......................................
              </div>
              <div>
                إدارة المصنع: م / محمد صبري
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
