import React, { useState } from 'react';
import type { InvoiceDto } from '../types/api';
import { Search, Plus, Printer, Trash2, FileText, CheckCircle2, CreditCard } from 'lucide-react';

interface LightInvoicesViewProps {
  invoices: InvoiceDto[];
  onOpenNewInvoice: () => void;
  onPrintInvoice: (invoice: InvoiceDto) => void;
  onDeleteInvoice: (invoice: InvoiceDto) => void;
  onNewPaymentForCustomer?: (customerId: number) => void;
}

export const LightInvoicesView: React.FC<LightInvoicesViewProps> = ({
  invoices,
  onOpenNewInvoice,
  onPrintInvoice,
  onDeleteInvoice,
  onNewPaymentForCustomer,
}) => {
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(
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

        <button
          onClick={onOpenNewInvoice}
          className="btn-main"
          style={{ padding: '8px 18px', fontSize: '14px' }}
        >
          <Plus size={16} />
          <span>عمل فاتورة جديدة</span>
        </button>
      </div>

      {/* جدول الفواتير */}
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
                <th style={{ width: '70px', textAlign: 'center' }}>رقم</th>
                <th>المطلوب من السيد (العميل)</th>
                <th>التاريخ</th>
                <th>الأصناف</th>
                <th>قيمة الفاتورة</th>
                <th>رصيد سابق</th>
                <th>الدفعة المسددة</th>
                <th>المتبقي المستحق</th>
                <th style={{ textAlign: 'center', width: '200px' }}>طباعة وإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const isPaid = inv.remainingAmount <= 0;
                return (
                  <tr key={inv.id}>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                      #{inv.id}
                    </td>

                    <td style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                      {inv.customerName}
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(inv.invoiceDate).toLocaleDateString('ar-EG')}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {inv.items.map((it) => (
                          <span
                            key={it.id}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              fontWeight: 600
                            }}
                          >
                            {it.quantity}x {it.itemName}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ fontWeight: 800 }}>
                      {inv.grandTotalAmount.toFixed(0)} ج
                    </td>

                    <td style={{ color: 'var(--text-muted)' }}>
                      {inv.previousBalance.toFixed(0)} ج
                    </td>

                    <td style={{ color: 'var(--paid-color)', fontWeight: 700 }}>
                      {inv.paidAmount > 0 ? `${inv.paidAmount.toFixed(0)} ج` : '—'}
                    </td>

                    <td>
                      <span className={isPaid ? 'badge-paid' : 'badge-debt'}>
                        {inv.remainingAmount.toFixed(0)} جنيه
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => onPrintInvoice(inv)}
                          title="طباعة الفاتورة الرسمية"
                          className="btn-main"
                          style={{ padding: '5px 10px', fontSize: '12.5px' }}
                        >
                          <Printer size={14} />
                          <span>طباعة</span>
                        </button>

                        {onNewPaymentForCustomer && (
                          <button
                            onClick={() => onNewPaymentForCustomer(inv.customerId)}
                            title="تسجيل دفعة مسددة لهذا العميل"
                            className="btn-success-outline"
                            style={{ padding: '5px 8px', fontSize: '12px' }}
                          >
                            <CreditCard size={13} />
                            <span>سداد دفعة</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteInvoice(inv)}
                          title="حذف الفاتورة"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
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
