import React, { useState } from 'react';
import type { PaymentDto } from '../types/api';
import { Search, Plus, CreditCard, Trash2, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDateArabic } from '../utils/format';

interface LightPaymentsViewProps {
  payments: PaymentDto[];
  onOpenNewPayment: () => void;
  onDeletePayment: (payment: PaymentDto) => void;
}

export const LightPaymentsView: React.FC<LightPaymentsViewProps> = ({
  payments,
  onOpenNewPayment,
  onDeletePayment,
}) => {
  const [search, setSearch] = useState('');

  const filtered = payments.filter(
    (p) =>
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search)
  );

  return (
    <div className="card-clean" style={{ padding: '20px 24px' }}>
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
            placeholder="بحث برقم السند أو اسم العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clean-input"
            style={{ paddingRight: '36px', fontSize: '13.5px' }}
          />
        </div>

        <button
          onClick={onOpenNewPayment}
          className="btn-main"
          style={{ padding: '8px 18px', fontSize: '14px', backgroundColor: 'var(--paid-color)' }}
        >
          <Plus size={16} />
          <span>تسجيل دفعة مسددة (سند قبض)</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <CreditCard size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>لا توجد سندات قبض مسجلة</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>رقم السند</th>
                <th>اسم العميل / المكتب</th>
                <th>تاريخ الدفعة</th>
                <th>المبلغ المسدد</th>
                <th>الحالة</th>
                <th style={{ textAlign: 'center', width: '80px' }}>حذف</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                    #{p.id}
                  </td>

                  <td style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                    {p.customerName}
                  </td>

                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {formatDateArabic(p.paymentDate)}
                  </td>

                  <td style={{ fontWeight: 900, fontSize: '16px', color: 'var(--paid-color)' }}>
                    {formatCurrency(p.amount)}
                  </td>

                  <td>
                    <span className="badge-paid">
                      <CheckCircle size={12} />
                      <span>تم الخصم من المديونية</span>
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onDeletePayment(p)}
                      title="حذف سند القبض"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
