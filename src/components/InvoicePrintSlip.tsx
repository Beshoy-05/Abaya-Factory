import React from 'react';
import { InvoiceDto } from '../types/api';
import { X, Printer, Sparkles, Building2, Calendar, FileText } from 'lucide-react';

interface InvoicePrintSlipProps {
  invoice: InvoiceDto;
  onClose: () => void;
}

export const InvoicePrintSlip: React.FC<InvoicePrintSlipProps> = ({ invoice, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar (no-print) */}
        <div className="no-print" style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--gold-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} style={{ color: 'var(--gold-light)' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-pure)' }}>
              Haute Couture Invoice Slip Preview
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <Printer size={15} />
              <span>Print Official Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div style={{ padding: '36px', overflowY: 'auto', flex: 1, background: '#120f0d' }}>
          <div
            className="print-invoice-sheet"
            style={{
              background: '#191512',
              border: '2px solid rgba(212, 163, 89, 0.45)',
              borderRadius: '12px',
              padding: '36px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Watermark Crest */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.03,
              pointerEvents: 'none',
              fontSize: '320px',
              fontWeight: 900,
              fontFamily: 'var(--font-serif)',
              color: 'var(--gold-primary)'
            }}>
              عباية
            </div>

            {/* Atelier Crest and Invoice Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid rgba(212, 163, 89, 0.35)',
              paddingBottom: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: 'var(--gold-primary)' }} />
                  <span className="font-editorial" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-pure)', letterSpacing: '0.08em' }}>
                    DAR AL-ABAYA
                  </span>
                </div>
                <div className="font-arabic" style={{ fontSize: '15px', color: 'var(--gold-light)', marginTop: '2px' }}>
                  دار العباية للأزياء الراقية والإنتاج الحرفي
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Haute Couture Manufactory & Custom Embroidery Atelier
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  COMMERCIAL TAX INVOICE
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)', marginTop: '2px' }}>
                  #{invoice.id}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Date: {new Date(invoice.invoiceDate).toLocaleDateString()} {new Date(invoice.invoiceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Client Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '28px',
              background: 'rgba(26, 21, 18, 0.6)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(212, 163, 89, 0.15)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Client / Boutique Recipient (فاتورة صادرة إلى)
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-pure)', marginTop: '3px' }}>
                  {invoice.customerName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Client Account ID: #{invoice.customerId}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Payment Terms
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold-light)', marginTop: '3px' }}>
                  Net Debt Current Ledger Account
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Production Delivery Voucher
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="atelier-table" style={{ marginBottom: '24px' }}>
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th>Model / Item Description</th>
                  <th>Fabric Code</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-pure)' }}>{item.itemName}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-light)' }}>
                      {item.itemCode}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Breakdown & Accounting Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '32px'
            }}>
              <div style={{ width: '340px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(212, 163, 89, 0.12)', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Previous Balance (الرصيد السابق):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${invoice.previousBalance.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(212, 163, 89, 0.12)', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Grand Total (قيمة الفاتورة الحالية):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)' }}>${invoice.grandTotalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(212, 163, 89, 0.12)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-pure)', fontWeight: 600 }}>Total Due (المجموع المستحق):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${invoice.totalDue.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(212, 163, 89, 0.12)', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--malachite-light)' }}>Paid at Dispatch (المدفوع نقداً):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--malachite-light)' }}>-${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderTop: '2px solid var(--gold-border)',
                  fontSize: '15px'
                }}>
                  <span style={{ fontWeight: 800, color: 'var(--terracotta-light)' }}>
                    Remaining Net Debt (المتبقي):
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--terracotta-light)' }}>
                    ${invoice.remainingAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              paddingTop: '28px',
              borderTop: '1px dashed rgba(212, 163, 89, 0.25)',
              fontSize: '12px'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                  Authorized Atelier Master Tailor (توقيع وختم المصنع):
                </div>
                <div style={{ borderTop: '1px solid var(--gold-border)', paddingTop: '6px', color: 'var(--text-dim)' }}>
                  Dar Al-Abaya Master Craftsman & QC Sign-off
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                  Boutique Representative Receipt (توقيع المستلم بالبوتيك):
                </div>
                <div style={{ borderTop: '1px solid var(--gold-border)', paddingTop: '6px', color: 'var(--text-dim)' }}>
                  Authorized Boutique Representative
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
