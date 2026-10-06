import React, { useState } from 'react';
import type { InvoiceDto } from '../types/api';
import { Search, Plus, Printer, FileText, CheckCircle2, CreditCard, Boxes, Hash } from 'lucide-react';
import { formatCurrency, formatDateArabic, formatNumber } from '../utils/format';

interface LightInvoicesViewProps {
  invoices: InvoiceDto[];
  onOpenNewInvoice: () => void;
  onPrintInvoice: (invoice: InvoiceDto) => void;
  onDeleteInvoice?: (invoice: InvoiceDto) => void;
  onNewPaymentForCustomer?: (customerId: number) => void;
  onOpenAllQuantitiesModal?: () => void;
  onSelectCustomerInvoices?: (customerId: number) => void;
  onOpenSpecificCodeModal?: (code?: string) => void;
}

export const LightInvoicesView: React.FC<LightInvoicesViewProps> = ({
  invoices,
  onOpenNewInvoice,
  onPrintInvoice,
  onDeleteInvoice,
  onNewPaymentForCustomer,
  onOpenAllQuantitiesModal,
  onSelectCustomerInvoices,
  onOpenSpecificCodeModal,
}) => {
  const [search, setSearch] = useState('');

  // Map customerId -> latest invoice id (سداد أو دفعة تكون على آخر فاتورة بس)
  const latestInvoiceIdMap = React.useMemo(() => {
    const map = new Map<number, number>();
    invoices.forEach((inv) => {
      const currentLatestId = map.get(inv.customerId);
      if (!currentLatestId) {
        map.set(inv.customerId, inv.id);
      } else {
        const currentLatestInv = invoices.find((i) => i.id === currentLatestId);
        if (currentLatestInv) {
          const isNewer =
            new Date(inv.invoiceDate).getTime() > new Date(currentLatestInv.invoiceDate).getTime() ||
            (new Date(inv.invoiceDate).getTime() === new Date(currentLatestInv.invoiceDate).getTime() && inv.id > currentLatestInv.id);
          if (isNewer) {
            map.set(inv.customerId, inv.id);
          }
        }
      }
    });
    return map;
  }, [invoices]);

  // إجمالي عدد فواتير كل عميل
  const customerInvoicesCountMap = React.useMemo(() => {
    const map = new Map<number, number>();
    invoices.forEach((inv) => {
      map.set(inv.customerId, (map.get(inv.customerId) || 0) + 1);
    });
    return map;
  }, [invoices]);

  // إظهار آخر فاتورة فقط لكل عميل (استبعاد الفواتير السابقة تماماً من الجدول الرئيسي)
  const latestInvoicesOnly = React.useMemo(() => {
    return invoices.filter((inv) => latestInvoiceIdMap.get(inv.customerId) === inv.id);
  }, [invoices, latestInvoiceIdMap]);

  const filtered = latestInvoicesOnly.filter(
    (i) =>
      i.customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(i.id).includes(search) ||
      i.items.some((it) => it.itemName.toLowerCase().includes(search.toLowerCase()) || it.itemCode.includes(search))
  );

  return (
    <div className="card-clean" style={{ padding: '20px 24px' }}>
      {/* شريط البحث وزر إضافة فاتورة */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة أو اسم العميل أو الموديل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clean-input"
            style={{ paddingRight: '36px', fontSize: '13.5px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenAllQuantitiesModal && (
            <button
              onClick={onOpenAllQuantitiesModal}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="استعلام إجمالي كميات وقطع كل الفواتير"
            >
              <Boxes size={15} style={{ color: '#16a34a' }} />
              <span>إجمالي كميات الفواتير</span>
            </button>
          )}

          {onOpenSpecificCodeModal && (
            <button
              onClick={() => onOpenSpecificCodeModal()}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="استعلام إجمالي كميات كود موديل محدد (sum-specific-code/{itemCode})"
            >
              <Hash size={15} style={{ color: '#0f766e' }} />
              <span>كمية كود محدد</span>
            </button>
          )}

          <button
            onClick={onOpenNewInvoice}
            className="btn-main"
            style={{ padding: '8px 18px', fontSize: '14px' }}
          >
            <Plus size={16} />
            <span>عمل فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* تنبيه توضيحي بأن الجدول يعرض آخر فاتورة فقط لكل عميل */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '8px 14px',
          borderRadius: '6px',
          marginBottom: '14px',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', flexShrink: 0 }} />
        <span>
          يتم عرض <strong>آخر فاتورة فقط</strong> لكل عميل — اضغط على أي فاتورة لفتح سجل كافة فواتيره السابقة والمدفوعات بالكامل.
        </span>
      </div>

      {/* جدول الفواتير — يقتصر على آخر فاتورة لكل عميل */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <FileText size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>لا توجد فواتير مطابقة للبحث</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>رقم</th>
                <th>المطلوب من السيد (العميل)</th>
                <th>التاريخ</th>
                <th>الأصناف</th>
                <th>قيمة الفاتورة</th>
                <th>رصيد سابق</th>
                <th>المتبقي المستحق</th>
                <th style={{ textAlign: 'center', width: '200px' }}>طباعة وسداد</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const isPaid = inv.remainingAmount <= 0;
                const totalInvoicesForThisCustomer = customerInvoicesCountMap.get(inv.customerId) || 1;

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectCustomerInvoices && onSelectCustomerInvoices(inv.customerId)}
                    style={{
                      cursor: onSelectCustomerInvoices ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                    }}
                    title={onSelectCustomerInvoices ? `اضغط هنا لفتح سجل كافة فواتير ${inv.customerName} (${totalInvoicesForThisCustomer} فواتير)` : undefined}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                          #{inv.id}
                        </span>
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 800,
                          }}
                        >
                          آخر فاتورة
                        </span>
                      </div>
                    </td>

                    <td style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '14.5px',
                            color: 'var(--text-dark)',
                          }}
                        >
                          {inv.customerName}
                        </span>

                        {onSelectCustomerInvoices && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCustomerInvoices(inv.customerId);
                            }}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              color: '#1d4ed8',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                            title={`فتح جميع فواتير ${inv.customerName} (${totalInvoicesForThisCustomer} فواتير مسجلة بالكامل)`}
                          >
                            <FileText size={12} />
                            <span>جميع فواتيره ({totalInvoicesForThisCustomer})</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {formatDateArabic(inv.invoiceDate)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {inv.items.map((it) => (
                          <span
                            key={it.id}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span style={{ color: '#0f766e', fontWeight: 800 }}>{it.quantity} قطعة</span>
                            <span>{it.itemName}</span>
                            {it.itemCode && onOpenSpecificCodeModal && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenSpecificCodeModal(it.itemCode);
                                }}
                                style={{
                                  background: '#ccfbf1',
                                  color: '#0f766e',
                                  border: '1px solid #99f6e4',
                                  borderRadius: '3px',
                                  padding: '1px 5px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                                title={`استعلام إجمالي مبيعات كود #${it.itemCode} عبر السيرفر`}
                              >
                                #{it.itemCode}
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--text-dark)' }}>
                      {formatCurrency(inv.grandTotalAmount)}
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
                      {formatCurrency(inv.previousBalance)}
                    </td>

                    <td>
                      <span className={isPaid ? 'badge-paid' : 'badge-debt'} style={{ fontSize: '13px', fontWeight: 800, padding: '4px 10px' }}>
                        {isPaid ? 'خالص (0 ج)' : formatCurrency(inv.remainingAmount)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintInvoice(inv);
                          }}
                          title="طباعة الفاتورة الرسمية"
                          className="btn-main"
                          style={{ padding: '5px 10px', fontSize: '12.5px' }}
                        >
                          <Printer size={14} />
                          <span>طباعة</span>
                        </button>

                        {/* السداد متاح على آخر فاتورة للعميل */}
                        {onNewPaymentForCustomer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNewPaymentForCustomer(inv.customerId);
                            }}
                            title="تسجيل دفعة مسددة على آخر فاتورة لهذا العميل"
                            className="btn-success-outline"
                            style={{ padding: '5px 8px', fontSize: '12px' }}
                          >
                            <CreditCard size={13} />
                            <span>سداد دفعة</span>
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
  );
};
