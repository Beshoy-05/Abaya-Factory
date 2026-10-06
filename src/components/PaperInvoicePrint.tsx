import React from 'react';
import type { InvoiceDto } from '../types/api';
import { Printer, X, CreditCard } from 'lucide-react';
import rawaaLogo from '../assets/rawaa-logo.png';
import abayaLogo from '../assets/abaya-logo.png';
import fatooraBadge from '../assets/fatoora-badge.png';
import { formatNumber } from '../utils/format';

interface PaperInvoicePrintProps {
  invoice: InvoiceDto;
  onClose: () => void;
  onRecordPayment?: (customerId: number) => void;
  isLatestInvoice?: boolean;
}

export const PaperInvoicePrint: React.FC<PaperInvoicePrintProps> = ({
  invoice,
  onClose,
  onRecordPayment,
  isLatestInvoice = true,
}) => {
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
            {isLatestInvoice && (
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                آخر فاتورة
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {onRecordPayment && isLatestInvoice && (
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
          <div className="paper-invoice-sheet" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* علامة مائية لشعار العباية في خلفية الورقة */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.035,
              pointerEvents: 'none',
              zIndex: 0
            }}>
              <img src={abayaLogo} alt="" style={{ height: '360px', objectFit: 'contain' }} />
            </div>

            {/* الترويسة الرئيسية المطابقة لدفتر فواتير رواء الخليج الحقيقي */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2.5px solid #0f172a',
              paddingBottom: '12px',
              marginBottom: '12px',
              position: 'relative',
              zIndex: 1,
              gap: '12px'
            }}>
              {/* يمين: خط وشعار "رواء الخليج للعباية الخليجي" الحقيقي المستخرج من الفاتورة */}
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
                <img
                  src={rawaaLogo}
                  alt="رواء الخليج للعباية الخليجي"
                  style={{
                    height: '62px',
                    maxWidth: '230px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>

              {/* وسط: شعار العباية الحقيقي + كلمة فاتورة الأصلية */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px'
              }}>
                <img
                  src={abayaLogo}
                  alt="لوجو العباية"
                  style={{
                    height: '64px',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />

                <div style={{ textAlign: 'center' }}>
                  <img
                    src={fatooraBadge}
                    alt="فاتورة"
                    style={{
                      height: '32px',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#0f172a',
                    marginTop: '2px'
                  }}>
                    رقم: #{invoice.id}
                  </div>
                </div>
              </div>

              {/* يسار: بيانات المسؤول ورقم الهاتف والواتساب */}
              <div style={{ textAlign: 'left', direction: 'ltr' }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
                  م / محمد صبري
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#15803d',
                  marginTop: '3px'
                }}>
                  <span style={{ fontSize: '15px' }}>📱</span>
                  <span>01031424301</span>
                  <span style={{
                    background: '#25d366',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 900
                  }}>✆</span>
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
                    <td style={{ fontWeight: 700 }}>{formatNumber(item.unitPrice)}</td>
                    <td style={{ fontWeight: 800 }}>{formatNumber(item.quantity)}</td>
                    <td style={{ fontWeight: 900, fontSize: '15px' }}>
                      {formatNumber(item.totalPrice)}
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
                      {formatNumber(invoice.grandTotalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', background: '#f8fafc' }}>
                      رصيــد سـابـق
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '6px 10px', textAlign: 'center', fontSize: '15px' }}>
                      {formatNumber(invoice.previousBalance)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '2px solid #0f172a', padding: '8px 10px', background: '#fef2f2', color: '#b91c1c' }}>
                      المجموع المستحق
                    </td>
                    <td style={{ border: '2px solid #0f172a', padding: '8px 10px', textAlign: 'center', fontSize: '18px', fontWeight: 900, color: '#b91c1c' }}>
                      {formatNumber(invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.totalDue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
