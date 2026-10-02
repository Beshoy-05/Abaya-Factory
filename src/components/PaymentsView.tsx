import React, { useState } from 'react';
import { PaymentDto } from '../types/api';
import { Search, Plus, CreditCard, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface PaymentsViewProps {
  payments: PaymentDto[];
  onOpenNewPayment: () => void;
  onEditPayment: (payment: PaymentDto) => void;
  onDeletePayment: (payment: PaymentDto) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  onOpenNewPayment,
  onEditPayment,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = payments.filter(
    (p) =>
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).includes(searchTerm)
  );

  return (
    <div>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search payment receipt # or boutique name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="atelier-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Total Summary */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Total Vouchers: <strong style={{ color: 'var(--gold-light)' }}>{payments.length}</strong> | Total Value:{' '}
          <strong style={{ color: 'var(--malachite-light)' }}>
            ${payments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </strong>
        </div>

        {/* Record Payment Button */}
        <button
          onClick={onOpenNewPayment}
          className="btn-malachite"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={16} />
          <span>Record Payment Receipt</span>
        </button>
      </div>

      {/* Payments Table Card */}
      <div className="atelier-card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
            <CreditCard size={36} style={{ marginBottom: '10px', color: 'var(--text-dim)' }} />
            <h3 style={{ fontSize: '17px', color: 'var(--text-pure)', marginBottom: '4px' }}>
              No Payment Receipts Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No receipt records match your current filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="atelier-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Receipt #</th>
                  <th>Boutique Client</th>
                  <th>Payment Date</th>
                  <th>Voucher Amount</th>
                  <th>Verification</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                      #{payment.id}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-pure)' }}>
                        {payment.customerName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Client Account #{payment.customerId}
                      </div>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {new Date(payment.paymentDate).toLocaleDateString()}{' '}
                      <span style={{ color: 'var(--text-dim)' }}>
                        {new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '15px',
                      color: 'var(--malachite-light)'
                    }}>
                      +${payment.amount.toFixed(2)}
                    </td>

                    <td>
                      <span className="badge-settled">
                        <CheckCircle2 size={12} />
                        <span>Posted to Ledger</span>
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => onEditPayment(payment)}
                          title="Edit Payment"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-soft)',
                            cursor: 'pointer',
                            padding: '5px',
                            borderRadius: '4px'
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onDeletePayment(payment)}
                          title="Delete Payment Voucher"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--terracotta-light)',
                            cursor: 'pointer',
                            padding: '5px',
                            borderRadius: '4px'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
