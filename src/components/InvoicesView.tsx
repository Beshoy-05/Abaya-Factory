import React, { useState } from 'react';
import { InvoiceDto } from '../types/api';
import {
  Search,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Receipt,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: InvoiceDto[];
  onOpenNewInvoice: () => void;
  onViewInvoiceSlip: (invoice: InvoiceDto) => void;
  onEditInvoice: (invoice: InvoiceDto) => void;
  onDeleteInvoice: (invoice: InvoiceDto) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onOpenNewInvoice,
  onViewInvoiceSlip,
  onEditInvoice,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const filtered = invoices.filter((inv) => {
    const matchesQuery =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inv.id).includes(searchTerm) ||
      inv.items.some(
        (it) =>
          it.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          it.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (!matchesQuery) return false;
    if (statusFilter === 'unpaid') return inv.remainingAmount > 0;
    if (statusFilter === 'paid') return inv.remainingAmount <= 0;
    return true;
  });

  return (
    <div>
      {/* Top Controls Toolbar */}
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
            placeholder="Search by invoice #, boutique, item code (e.g. ABY-001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="atelier-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: statusFilter === 'all' ? 'var(--gold-subtle)' : 'transparent',
              borderColor: statusFilter === 'all' ? 'var(--gold-primary)' : 'rgba(212, 163, 89, 0.2)',
              color: statusFilter === 'all' ? 'var(--gold-light)' : 'var(--text-soft)'
            }}
          >
            All Orders ({invoices.length})
          </button>

          <button
            onClick={() => setStatusFilter('unpaid')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: statusFilter === 'unpaid' ? 'var(--terracotta-bg)' : 'transparent',
              borderColor: statusFilter === 'unpaid' ? 'var(--terracotta-accent)' : 'rgba(196, 93, 62, 0.25)',
              color: statusFilter === 'unpaid' ? 'var(--terracotta-light)' : 'var(--text-soft)'
            }}
          >
            Unpaid / Partial ({invoices.filter((i) => i.remainingAmount > 0).length})
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: statusFilter === 'paid' ? 'var(--malachite-bg)' : 'transparent',
              borderColor: statusFilter === 'paid' ? 'var(--malachite-accent)' : 'rgba(46, 128, 87, 0.25)',
              color: statusFilter === 'paid' ? 'var(--malachite-light)' : 'var(--text-soft)'
            }}
          >
            Fully Settled ({invoices.filter((i) => i.remainingAmount <= 0).length})
          </button>
        </div>

        {/* New Invoice Button */}
        <button
          onClick={onOpenNewInvoice}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={16} />
          <span>New Couture Invoice</span>
        </button>
      </div>

      {/* Invoices Table Card */}
      <div className="atelier-card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
            <Receipt size={36} style={{ marginBottom: '10px', color: 'var(--text-dim)' }} />
            <h3 style={{ fontSize: '17px', color: 'var(--text-pure)', marginBottom: '4px' }}>
              No Invoices Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No production invoices matched your query.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="atelier-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Inv #</th>
                  <th>Boutique Client</th>
                  <th>Date & Time</th>
                  <th>Garment Lines</th>
                  <th>Prev Debt</th>
                  <th>Grand Total</th>
                  <th>Paid</th>
                  <th>Remaining Due</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const isFullyPaid = invoice.remainingAmount <= 0;

                  return (
                    <tr key={invoice.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                        #{invoice.id}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-pure)' }}>
                          {invoice.customerName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Account #{invoice.customerId}
                        </div>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {new Date(invoice.invoiceDate).toLocaleDateString()}{' '}
                        <span style={{ color: 'var(--text-dim)' }}>
                          {new Date(invoice.invoiceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {invoice.items.slice(0, 2).map((item) => (
                            <span
                              key={item.id}
                              style={{
                                fontSize: '11px',
                                background: 'rgba(212, 163, 89, 0.08)',
                                border: '1px solid rgba(212, 163, 89, 0.16)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: 'var(--gold-light)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.quantity}x {item.itemCode}
                            </span>
                          ))}
                          {invoice.items.length > 2 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center' }}>
                              +{invoice.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        ${invoice.previousBalance.toFixed(2)}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                        ${invoice.grandTotalAmount.toFixed(2)}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--malachite-light)' }}>
                        ${invoice.paidAmount.toFixed(2)}
                      </td>

                      <td>
                        <span className={isFullyPaid ? 'badge-settled' : 'badge-debt'} style={{ fontFamily: 'var(--font-mono)' }}>
                          ${invoice.remainingAmount.toFixed(2)}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => onViewInvoiceSlip(invoice)}
                            title="View / Print Couture Slip"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--gold-light)',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: '4px'
                            }}
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => onEditInvoice(invoice)}
                            title="Edit Invoice"
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
                            onClick={() => onDeleteInvoice(invoice)}
                            title="Delete Invoice"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
