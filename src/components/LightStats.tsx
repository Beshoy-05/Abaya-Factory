import React from 'react';
import type { CustomerDto, InvoiceDto, PaymentDto } from '../types/api';
import { DollarSign, FileText, CheckCircle, Users, Boxes } from 'lucide-react';
import { formatCurrency, formatNumber, formatPieces } from '../utils/format';

interface LightStatsProps {
  customers: CustomerDto[];
  invoices: InvoiceDto[];
  payments: PaymentDto[];
  onOpenAllQuantities?: () => void;
}

export const LightStats: React.FC<LightStatsProps> = ({ customers, invoices, payments, onOpenAllQuantities }) => {
  const totalDebt = customers
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  const totalSales = invoices.reduce((sum, i) => sum + i.grandTotalAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPieces = invoices.reduce(
    (sum, i) => sum + (i.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    0
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: '14px',
      marginBottom: '24px'
    }}>
      {/* إجمالي المديونية على العملاء */}
      <div className="card-clean" style={{ padding: '16px 20px', borderRight: '4px solid var(--debt-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              إجمالي المديونية في السوق
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--debt-color)', marginTop: '4px' }}>
              {formatCurrency(totalDebt)}
            </div>
          </div>
          <div style={{
            background: 'var(--debt-bg)',
            color: 'var(--debt-color)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <DollarSign size={20} />
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '6px' }}>
          مستحقة لدى {formatNumber(customers.filter((c) => c.balance > 0).length)} عميل ومكتب
        </div>
      </div>

      {/* إجمالي مبيعات الفواتير */}
      <div className="card-clean" style={{ padding: '16px 20px', borderRight: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              إجمالي مبيعات الفواتير
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
              {formatCurrency(totalSales)}
            </div>
          </div>
          <div style={{
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <FileText size={20} />
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '6px' }}>
          إجمالي {formatNumber(invoices.length)} فاتورة مسجلة بالدفتر
        </div>
      </div>

      {/* إجمالي المقبوضات المسددة */}
      <div className="card-clean" style={{ padding: '16px 20px', borderRight: '4px solid var(--paid-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              إجمالي المقبوضات النقدية
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--paid-color)', marginTop: '4px' }}>
              {formatCurrency(totalCollected)}
            </div>
          </div>
          <div style={{
            background: 'var(--paid-bg)',
            color: 'var(--paid-color)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <CheckCircle size={20} />
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '6px' }}>
          تم تحصيلها في {formatNumber(payments.length)} سند قبض نقدي
        </div>
      </div>

      {/* إجمالي عدد العملاء */}
      <div className="card-clean" style={{ padding: '16px 20px', borderRight: '4px solid #64748b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              العملاء والمكاتب المسجلة
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', marginTop: '4px' }}>
              {formatNumber(customers.length)} <span style={{ fontSize: '14px', fontWeight: 700 }}>عميل</span>
            </div>
          </div>
          <div style={{
            background: '#f1f5f9',
            color: '#64748b',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <Users size={20} />
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '6px' }}>
          مكاتب وبوتيكات مسجلة بالمصنع
        </div>
      </div>

      {/* إجمالي كميات القطع المباعة (API: sum-quantities) */}
      <div
        className="card-clean"
        style={{
          padding: '16px 20px',
          borderRight: '4px solid #16a34a',
          cursor: onOpenAllQuantities ? 'pointer' : 'default',
        }}
        onClick={onOpenAllQuantities}
        title={onOpenAllQuantities ? 'اضغط لعرض تفاصيل واستعلام إجمالي الكميات' : undefined}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              إجمالي كميات القطع (الفواتير)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
              {formatPieces(totalPieces)}
            </div>
          </div>
          <div style={{
            background: '#dcfce7',
            color: '#16a34a',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <Boxes size={20} />
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '6px', fontWeight: 600 }}>
          {onOpenAllQuantities ? 'اضغط لعرض تفاصيل الكميات ↗' : `موزعة على ${formatNumber(invoices.length)} فاتورة`}
        </div>
      </div>
    </div>
  );
};

