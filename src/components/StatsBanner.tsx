import React from 'react';
import { CustomerDto, InvoiceDto, PaymentDto } from '../types/api';
import { TrendingUp, Landmark, ShieldCheck, Scale, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  customers: CustomerDto[];
  invoices: InvoiceDto[];
  payments: PaymentDto[];
  onOpenItemAnalytics: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  customers,
  invoices,
  payments,
  onOpenItemAnalytics,
}) => {
  // Total Net Debt (Balance > 0)
  const totalDebt = customers
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  // Total Credit / Overpaid (Balance < 0)
  const totalCredit = Math.abs(
    customers
      .filter((c) => c.balance < 0)
      .reduce((sum, c) => sum + c.balance, 0)
  );

  // Total Invoiced Grand Total
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.grandTotalAmount, 0);

  // Total Payments Collected
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {/* Total Client Net Debt */}
      <div className="atelier-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Outstanding Receivables
            </div>
            <div className="font-arabic" style={{ fontSize: '13px', color: 'var(--terracotta-light)', marginTop: '2px' }}>
              إجمالي مديونية العملاء
            </div>
          </div>
          <div style={{
            background: 'var(--terracotta-bg)',
            border: '1px solid var(--terracotta-border)',
            color: 'var(--terracotta-light)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            <Landmark size={20} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--terracotta-light)', fontFamily: 'var(--font-mono)' }}>
          ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Owed to the atelier across {customers.filter((c) => c.balance > 0).length} active client accounts
        </div>
      </div>

      {/* Total Invoiced Volume */}
      <div className="atelier-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Gross Factory Invoicing
            </div>
            <div className="font-arabic" style={{ fontSize: '13px', color: 'var(--gold-light)', marginTop: '2px' }}>
              إجمالي قيمة الفواتير المصدرة
            </div>
          </div>
          <div style={{
            background: 'var(--gold-subtle)',
            border: '1px solid var(--gold-border)',
            color: 'var(--gold-light)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--gold-light)', fontFamily: 'var(--font-mono)' }}>
          ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Across {invoices.length} couture production orders
        </div>
      </div>

      {/* Total Cash Receipts Collected */}
      <div className="atelier-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Settled Collections
            </div>
            <div className="font-arabic" style={{ fontSize: '13px', color: 'var(--malachite-light)', marginTop: '2px' }}>
              المقبوضات المحصلة نقدياً
            </div>
          </div>
          <div style={{
            background: 'var(--malachite-bg)',
            border: '1px solid var(--malachite-border)',
            color: 'var(--malachite-light)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--malachite-light)', fontFamily: 'var(--font-mono)' }}>
          ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Recorded in {payments.length} verified payment vouchers
        </div>
      </div>

      {/* Credit / Overpaid & Model Revenue Action */}
      <div className="atelier-card" style={{ padding: '20px', background: 'linear-gradient(145deg, #1b1612 0%, #13100e 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Client Advance Credit
            </div>
            <div className="font-arabic" style={{ fontSize: '13px', color: 'var(--lapis-light)', marginTop: '2px' }}>
              رصيد العملاء الدائن
            </div>
          </div>
          <div style={{
            background: 'var(--lapis-bg)',
            border: '1px solid var(--lapis-border)',
            color: 'var(--lapis-light)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            <Scale size={20} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--lapis-light)', fontFamily: 'var(--font-mono)' }}>
          ${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <button
          onClick={onOpenItemAnalytics}
          style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            color: 'var(--gold-light)',
            background: 'rgba(212, 163, 89, 0.12)',
            border: '1px solid var(--gold-border)',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={12} />
          <span>Lookup Fabric Code Revenue</span>
        </button>
      </div>
    </div>
  );
};
