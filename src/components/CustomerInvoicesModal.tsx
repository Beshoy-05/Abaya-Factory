import React, { useState, useEffect } from 'react';
import type { CustomerDto, InvoiceDto } from '../types/api';
import { apiService } from '../services/api';
import {
  X,
  Printer,
  FileText,
  Boxes,
  Plus,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPieces, formatDateArabic } from '../utils/format';

interface CustomerInvoicesModalProps {
  customer: CustomerDto;
  invoices: InvoiceDto[];
  onClose: () => void;
  onPrintInvoice: (invoice: InvoiceDto) => void;
  onDeleteInvoice?: (invoice: InvoiceDto) => void;
  onNewInvoice: (customer: CustomerDto) => void;
  onNewPayment: (customerId: number) => void;
  onOpenStatement?: (customer: CustomerDto) => void;
}

export const CustomerInvoicesModal: React.FC<CustomerInvoicesModalProps> = ({
  customer,
  invoices,
  onClose,
  onPrintInvoice,
  onDeleteInvoice,
  onNewInvoice,
  onNewPayment,
  onOpenStatement,
}) => {
  const [customerSumQuantities, setCustomerSumQuantities] = useState<number | null>(null);
  const [loadingQty, setLoadingQty] = useState(false);
  const [search, setSearch] = useState('');

  // Filter and sort customer invoices (newest first)
  const customerInvoices = invoices
    .filter((inv) => inv.customerId === customer.id)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime() || b.id - a.id);

  const lastInvoice = customerInvoices.length > 0 ? customerInvoices[0] : null;

  // Filter by search query
  const filteredInvoices = customerInvoices.filter((inv) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(inv.id).includes(term) ||
      inv.invoiceDate.includes(term) ||
      inv.items.some((it) => it.itemName.toLowerCase().includes(term) || it.itemCode.toLowerCase().includes(term))
    );
  });

  // Calculate totals
  const totalInvoicesAmount = customerInvoices.reduce((sum, inv) => sum + inv.grandTotalAmount, 0);
  const totalPaidInInvoices = customerInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalRemainingInInvoices = customerInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const localSumQuantities = customerInvoices.reduce(
    (sum, inv) => sum + inv.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    0
  );

  // Fetch sum of quantities from backend endpoint: GET /api/Invoices/sum-quantities/{customerId}
  const fetchCustomerSumQuantities = async () => {
    setLoadingQty(true);
    try {
      const sum = await apiService.getSumOfQuantitiesOfOneCustomer(customer.id);
      setCustomerSumQuantities(sum);
    } catch (err) {
      console.warn('Could not fetch sum-quantities for customer from API, fallback to local calculation', err);
      setCustomerSumQuantities(localSumQuantities);
    } finally {
      setLoadingQty(false);
    }
  };

  useEffect(() => {
    fetchCustomerSumQuantities();
  }, [customer.id]);

  const displayQuantity = customerSumQuantities !== null ? customerSumQuantities : localSumQuantities;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: 'var(--text-dark)' }}>
                  جميع فواتير العميل: {customer.name}
                </h3>
                <span
                  style={{
                    background: '#f1f5f9',
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  كود العميل #{customer.id}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                سجل متكامل لجميع الفواتير الصادرة للعميل والبنود وطباعتها بنقرة واحدة
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                onClose();
                onNewInvoice(customer);
              }}
              className="btn-main"
              style={{ padding: '7px 14px', fontSize: '13px' }}
            >
              <Plus size={15} />
              <span>فاتورة جديدة</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* إحصائيات سريعة للعميل متضمنة مجموع الكميات للعميل */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* 1. إجمالي عدد القطع (GET sum-quantities/{customerId}) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700 }}>
                  إجمالي القطع المطلوبة
                </span>
                <Boxes size={18} style={{ color: '#2563eb' }} />
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#1d4ed8',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                }}
              >
                <span>{loadingQty ? '...' : formatPieces(displayQuantity)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', fontWeight: 600 }}>
                إجمالي القطع المسجلة للعميل
              </div>
            </div>

            {/* 2. عدد الفواتير */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  إجمالي الفواتير
                </span>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '4px' }}>
                {formatNumber(customerInvoices.length)}{' '}
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>فاتورة</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                {lastInvoice ? `آخرها رقم #${lastInvoice.id}` : 'لا توجد فواتير'}
              </div>
            </div>

            {/* 3. إجمالي مبيعات الفواتير */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  إجمالي قيمة الفواتير
                </span>
                <TrendingUp size={18} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '4px' }}>
                {formatCurrency(totalInvoicesAmount)}
              </div>
              {totalPaidInInvoices > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                  سدد منها {formatCurrency(totalPaidInInvoices)}
                </div>
              )}
            </div>

            {/* 4. رصيد المديونية الحالية */}
            <div
              style={{
                background: customer.balance > 0 ? 'var(--debt-bg)' : 'var(--paid-bg)',
                border: '1px solid',
                borderColor: customer.balance > 0 ? 'var(--debt-border)' : 'var(--paid-border)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    color: customer.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)',
                    fontWeight: 700,
                  }}
                >
                  الرصيد الحالي
                </span>
                <CreditCard
                  size={18}
                  style={{ color: customer.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)' }}
                />
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: customer.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)',
                  marginTop: '4px',
                }}
              >
                {formatCurrency(Math.abs(customer.balance))}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: customer.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)',
                  marginTop: '4px',
                  fontWeight: 700,
                }}
              >
                {customer.balance > 0 ? 'مديونية مستحقة' : 'خالص الحساب تماماً'}
              </div>
            </div>
          </div>

          {/* شريط البحث وتصفية الفواتير */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
              سجل فواتير العميل بالكامل ({customerInvoices.length})
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="بحث برقم الفاتورة أو اسم الموديل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clean-input"
                style={{ width: '240px', padding: '6px 12px', fontSize: '13px' }}
              />

              {onOpenStatement && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStatement(customer);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12.5px' }}
                  title="عرض كشف الحساب التفصيلي مع سندات القبض"
                >
                  <FileText size={14} />
                  <span>كشف حساب شامل</span>
                </button>
              )}
            </div>
          </div>

          {/* جدول الفواتير */}
          {customerInvoices.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                background: '#f8fafc',
                borderRadius: '8px',
                color: 'var(--text-muted)',
              }}
            >
              <FileText size={40} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 800 }}>لا توجد أي فواتير مسجلة لهذا العميل حتى الآن</div>
              <p style={{ fontSize: '13px', margin: '6px 0 16px' }}>
                يمكنك إصدار أول فاتورة ورقية للعميل بنقرة واحدة
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewInvoice(customer);
                }}
                className="btn-main"
                style={{ padding: '8px 18px' }}
              >
                <Plus size={16} />
                <span>إصدار فاتورة أولى</span>
              </button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              لا توجد فواتير مطابقة لكلمة البحث
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>رقم</th>
                    <th>التاريخ</th>
                    <th>الأصناف والموديلات</th>
                    <th style={{ textAlign: 'center' }}>عدد القطع</th>
                    <th>قيمة الفاتورة</th>
                    <th>رصيد سابق</th>
                    <th>المطلوب المستحق</th>
                    <th style={{ textAlign: 'center', width: '160px' }}>طباعة وسداد</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => {
                    const isLatest = idx === 0;
                    const invoicePieces = inv.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                    const isFullyPaid = inv.remainingAmount <= 0;

                    return (
                      <tr
                        key={inv.id}
                        style={{
                          background: isLatest ? '#fffbeb' : undefined,
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                              #{inv.id}
                            </span>
                            {isLatest && (
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Sparkles size={10} />
                                <span>آخر فاتورة</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} style={{ color: 'var(--text-light)' }} />
                            <span>{formatDateArabic(inv.invoiceDate)}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                            {inv.items.map((it) => (
                              <span
                                key={it.id}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: 'var(--text-dark)',
                                }}
                              >
                                <span style={{ color: '#0f766e', fontWeight: 800 }}>{it.quantity} قطعة</span> • {it.itemName} ({formatCurrency(it.unitPrice)})
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e40af' }}>
                          {formatPieces(invoicePieces)}
                        </td>

                        <td style={{ fontWeight: 800, fontSize: '14px' }}>
                          {formatCurrency(inv.grandTotalAmount)}
                        </td>

                        <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                          {formatCurrency(inv.previousBalance)}
                        </td>

                        <td>
                          <span className={isFullyPaid ? 'badge-paid' : 'badge-debt'} style={{ fontWeight: 800 }}>
                            {isFullyPaid ? 'خالص (0 ج)' : formatCurrency(inv.remainingAmount)}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                onClose();
                                onPrintInvoice(inv);
                              }}
                              className="btn-main"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              title="طباعة الفاتورة الرسمية الورقية"
                            >
                              <Printer size={13} />
                              <span>طباعة</span>
                            </button>

                            {/* السداد متاح فقط على آخر فاتورة للعميل */}
                            {isLatest ? (
                              <button
                                onClick={() => {
                                  onClose();
                                  onNewPayment(customer.id);
                                }}
                                className="btn-success-outline"
                                style={{ padding: '5px 8px', fontSize: '12px' }}
                                title="تسجيل دفعة مسددة على آخر فاتورة لهذا العميل"
                              >
                                <CreditCard size={13} />
                                <span>سداد</span>
                              </button>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--text-light)',
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                                title="السداد متاح على آخر فاتورة صادرة للعميل فقط"
                              >
                                فاتورة سابقة
                              </span>
                            )}

                            {onDeleteInvoice && (
                              <button
                                onClick={() => onDeleteInvoice(inv)}
                                title={`حذف فاتورة رقم #${inv.id}`}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            إجمالي عدد فواتير العميل: <strong>{customerInvoices.length}</strong> • إجمالي كميات القطع:{' '}
            <strong>{displayQuantity} قطعة</strong>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 18px', fontSize: '13px' }}
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
