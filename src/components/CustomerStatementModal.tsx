import React, { useState, useEffect } from 'react';
import { CustomerDto, CustomerDetailDto } from '../types/api';
import { apiService } from '../services/api';
import {
  X,
  Printer,
  Calendar,
  Receipt,
  CreditCard,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  Plus
} from 'lucide-react';

interface CustomerStatementModalProps {
  customer: CustomerDto;
  onClose: () => void;
  onNewInvoice: (customer: CustomerDto) => void;
  onNewPayment: (customer: CustomerDto) => void;
  onViewInvoiceDetails: (invoiceId: number) => void;
}

export const CustomerStatementModal: React.FC<CustomerStatementModalProps> = ({
  customer,
  onClose,
  onNewInvoice,
  onNewPayment,
  onViewInvoiceDetails,
}) => {
  const [details, setDetails] = useState<CustomerDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'payments'>('all');

  useEffect(() => {
    loadDetails();
  }, [customer.id]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCustomerDetails(customer.id);
      setDetails(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer statement');
    } finally {
      setLoading(false);
    }
  };

  // Build unified chronological ledger
  const buildLedger = () => {
    if (!details) return [];

    const items: Array<{
      id: string;
      date: string;
      type: 'INVOICE' | 'PAYMENT';
      referenceId: number;
      label: string;
      debit: number;  // Increases debt (Net Invoice = GrandTotal - PaidAmount)
      credit: number; // Decreases debt (Payment)
      grandTotal?: number;
      paid?: number;
      remaining?: number;
      itemsCount?: number;
    }> = [];

    details.invoices.forEach((inv) => {
      items.push({
        id: `inv-${inv.id}`,
        date: inv.invoiceDate,
        type: 'INVOICE',
        referenceId: inv.id,
        label: `Couture Invoice #${inv.id}`,
        debit: inv.remainingAmount, // unpaid portion
        credit: 0,
        grandTotal: inv.grandTotalAmount,
        paid: inv.paidAmount,
        remaining: inv.remainingAmount,
        itemsCount: inv.itemsCount,
      });
    });

    details.payments.forEach((pay) => {
      items.push({
        id: `pay-${pay.id}`,
        date: pay.paymentDate,
        type: 'PAYMENT',
        referenceId: pay.id,
        label: `Payment Voucher #${pay.id}`,
        debit: 0,
        credit: pay.amount,
      });
    });

    // Sort by date ascending to calculate running balance accurately
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const ledger = buildLedger();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '880px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gold-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #171310 0%, #120f0d 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--gold-subtle)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', color: 'var(--text-pure)' }}>
                  Boutique Ledger & Statement
                </h2>
                <span className="font-arabic" style={{ fontSize: '14px', color: 'var(--gold-light)' }}>
                  كشف حساب العميل
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {customer.name} (Account #{customer.id})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              className="btn-secondary no-print"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Printer size={14} />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold-light)' }}>
              Loading account ledger from server...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', background: 'var(--terracotta-bg)', border: '1px solid var(--terracotta-border)', borderRadius: '8px', color: 'var(--terracotta-light)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          ) : (
            <>
              {/* Client Net Balance Overview Card */}
              <div style={{
                background: 'rgba(21, 17, 14, 0.95)',
                border: '1px solid var(--gold-border)',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '22px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Outstanding Balance (صافي المديونية الحالية)
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: details!.balance > 0 ? 'var(--terracotta-light)' : details!.balance === 0 ? 'var(--malachite-light)' : 'var(--lapis-light)',
                    marginTop: '2px'
                  }}>
                    ${details!.balance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {details!.balance > 0
                      ? 'Client owes this remaining debt to the manufactory'
                      : details!.balance === 0
                      ? 'Account is fully settled and cleared'
                      : 'Client holds advance credit balance'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onClose();
                      onNewInvoice(customer);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '12.5px', padding: '7px 14px' }}
                  >
                    <Plus size={14} />
                    <span>Issue Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNewPayment(customer);
                    }}
                    className="btn-malachite"
                    style={{ fontSize: '12.5px', padding: '7px 14px' }}
                  >
                    <CreditCard size={14} />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>

              {/* Subtabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid var(--gold-border)',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setActiveTab('all')}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'all' ? '2px solid var(--gold-primary)' : '2px solid transparent',
                    color: activeTab === 'all' ? 'var(--gold-light)' : 'var(--text-dim)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Unified Statement ({ledger.length})
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'invoices' ? '2px solid var(--gold-primary)' : '2px solid transparent',
                    color: activeTab === 'invoices' ? 'var(--gold-light)' : 'var(--text-dim)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Invoices ({details!.invoices.length})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'payments' ? '2px solid var(--gold-primary)' : '2px solid transparent',
                    color: activeTab === 'payments' ? 'var(--gold-light)' : 'var(--text-dim)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Payments ({details!.payments.length})
                </button>
              </div>

              {/* Tab: Unified Statement */}
              {activeTab === 'all' && (
                <div style={{ overflowX: 'auto' }}>
                  {ledger.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                      No transactions recorded for this client yet.
                    </div>
                  ) : (
                    <table className="atelier-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Transaction</th>
                          <th>Debit (New Debt)</th>
                          <th>Credit (Payment)</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((entry) => (
                          <tr key={entry.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                              {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {entry.type === 'INVOICE' ? (
                                  <span className="badge-debt" style={{ padding: '2px 8px', fontSize: '10.5px' }}>
                                    <Receipt size={11} /> Invoice #{entry.referenceId}
                                  </span>
                                ) : (
                                  <span className="badge-settled" style={{ padding: '2px 8px', fontSize: '10.5px' }}>
                                    <CreditCard size={11} /> Receipt #{entry.referenceId}
                                  </span>
                                )}
                                <span style={{ fontSize: '12.5px', color: 'var(--text-pure)' }}>
                                  {entry.type === 'INVOICE'
                                    ? `Total: $${entry.grandTotal?.toFixed(2)} (Paid: $${entry.paid?.toFixed(2)})`
                                    : `Cash / Wire Receipt Voucher`}
                                </span>
                              </div>
                            </td>
                            <td style={{
                              fontFamily: 'var(--font-mono)',
                              color: entry.debit > 0 ? 'var(--terracotta-light)' : 'var(--text-dim)',
                              fontWeight: entry.debit > 0 ? 700 : 400
                            }}>
                              {entry.debit > 0 ? `+$${entry.debit.toFixed(2)}` : '—'}
                            </td>
                            <td style={{
                              fontFamily: 'var(--font-mono)',
                              color: entry.credit > 0 ? 'var(--malachite-light)' : 'var(--text-dim)',
                              fontWeight: entry.credit > 0 ? 700 : 400
                            }}>
                              {entry.credit > 0 ? `-$${entry.credit.toFixed(2)}` : '—'}
                            </td>
                            <td>
                              {entry.type === 'INVOICE' && (
                                <button
                                  onClick={() => onViewInvoiceDetails(entry.referenceId)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  View Slip
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab: Invoices Only */}
              {activeTab === 'invoices' && (
                <div style={{ overflowX: 'auto' }}>
                  {details!.invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                      No invoices found for this boutique.
                    </div>
                  ) : (
                    <table className="atelier-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Paid Amount</th>
                          <th>Remaining Debt</th>
                          <th>Items</th>
                          <th>Slip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details!.invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                              #{inv.id}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                              {new Date(inv.invoiceDate).toLocaleDateString()}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              ${inv.grandTotalAmount.toFixed(2)}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--malachite-light)' }}>
                              ${inv.paidAmount.toFixed(2)}
                            </td>
                            <td style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: inv.remainingAmount > 0 ? 'var(--terracotta-light)' : 'var(--malachite-light)'
                            }}>
                              ${inv.remainingAmount.toFixed(2)}
                            </td>
                            <td>
                              <span className="badge-gold">{inv.itemsCount} lines</span>
                            </td>
                            <td>
                              <button
                                onClick={() => onViewInvoiceDetails(inv.id)}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab: Payments Only */}
              {activeTab === 'payments' && (
                <div style={{ overflowX: 'auto' }}>
                  {details!.payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                      No payment receipts recorded for this boutique.
                    </div>
                  ) : (
                    <table className="atelier-table">
                      <thead>
                        <tr>
                          <th>Receipt #</th>
                          <th>Payment Date</th>
                          <th>Receipt Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details!.payments.map((pay) => (
                          <tr key={pay.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                              #{pay.id}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                              {new Date(pay.paymentDate).toLocaleDateString()} {new Date(pay.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--malachite-light)' }}>
                              ${pay.amount.toFixed(2)}
                            </td>
                            <td>
                              <span className="badge-settled">Verified Receipt</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
