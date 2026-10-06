import React, { useState, useEffect } from 'react';
import type { CustomerDto, CustomerDetailDto } from '../types/api';
import { apiService } from '../services/api';
import { X, Printer, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/format';

interface LightStatementModalProps {
  customer: CustomerDto;
  onClose: () => void;
  onPrintInvoiceById: (invoiceId: number) => void;
}

export const LightStatementModal: React.FC<LightStatementModalProps> = ({
  customer,
  onClose,
  onPrintInvoiceById,
}) => {
  const [details, setDetails] = useState<CustomerDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [customer.id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCustomerDetails(customer.id);
      setDetails(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>
              كشف حساب تفصيلي: {customer.name}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              حساب رقم #{customer.id} • مصنع رواء الخليج للعباية الخليجي
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              className="btn-main no-print"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              <Printer size={15} />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              جاري تحميل كشف الحساب...
            </div>
          ) : details ? (
            <>
              {/* بطاقة الرصيد الصافي */}
              <div style={{
                background: details.balance > 0 ? 'var(--debt-bg)' : 'var(--paid-bg)',
                border: '1px solid',
                borderColor: details.balance > 0 ? 'var(--debt-border)' : 'var(--paid-border)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: details.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)' }}>
                    صافي المديونية الحالية المستحقة:
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: details.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)' }}>
                    {formatCurrency(details.balance)}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {details.balance > 0 ? 'العميل مدين للمصنع بهذا المبلغ' : 'الحساب خالص بالكامل'}
                </div>
              </div>

              {/* فواتير العميل */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-dark)' }}>
                  سجل الفواتير الصادرة ({details.invoices.length})
                </h4>
                {details.invoices.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>لا توجد فواتير مسجلة</div>
                ) : (
                  <table className="clean-table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <thead>
                      <tr>
                        <th>رقم الفاتورة</th>
                        <th>التاريخ</th>
                        <th>قيمة الفاتورة</th>
                        <th>الدفعة المسددة</th>
                        <th>المتبقي</th>
                        <th style={{ textAlign: 'center' }}>معاينة وطباعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 800 }}>#{inv.id}</td>
                          <td>{formatDateArabic(inv.invoiceDate)}</td>
                          <td style={{ fontWeight: 800 }}>{formatCurrency(inv.grandTotalAmount)}</td>
                          <td style={{ color: 'var(--paid-color)', fontWeight: 700 }}>{inv.paidAmount > 0 ? formatCurrency(inv.paidAmount) : '0 ج'}</td>
                          <td style={{ fontWeight: 800, color: inv.remainingAmount > 0 ? 'var(--debt-color)' : 'var(--paid-color)' }}>
                            {formatCurrency(inv.remainingAmount)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                onClose();
                                onPrintInvoiceById(inv.id);
                              }}
                              className="btn-main"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              <Printer size={13} />
                              <span>طباعة الفاتورة</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* دفعات العميل */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-dark)' }}>
                  سندات القبض والدفعات المسددة ({details.payments.length})
                </h4>
                {details.payments.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>لا توجد دفعات نقدية مسجلة</div>
                ) : (
                  <table className="clean-table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <thead>
                      <tr>
                        <th>رقم السند</th>
                        <th>تاريخ السند</th>
                        <th>المبلغ المسدد</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.payments.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 800 }}>#{p.id}</td>
                          <td>{formatDateArabic(p.paymentDate)}</td>
                          <td style={{ fontWeight: 800, color: 'var(--paid-color)' }}>{formatCurrency(p.amount)}</td>
                          <td><span className="badge-paid">مخصوم من المديونية</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
