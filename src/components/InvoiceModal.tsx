import React, { useState, useEffect } from 'react';
import { CustomerDto, InvoiceDto, InvoiceCreateDto, InvoiceUpdateDto, InvoiceItemCreateDto } from '../types/api';
import { POPULAR_ABAYA_CATALOG } from '../data/mockData';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Calculator,
  AlertCircle,
  Receipt
} from 'lucide-react';

interface InvoiceModalProps {
  initialCustomer?: CustomerDto | null;
  invoiceToEdit?: InvoiceDto | null;
  customers: CustomerDto[];
  onClose: () => void;
  onSubmit: (dto: InvoiceCreateDto | InvoiceUpdateDto, isEdit: boolean, invoiceId?: number) => Promise<void>;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  initialCustomer,
  invoiceToEdit,
  customers,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(invoiceToEdit);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    invoiceToEdit ? invoiceToEdit.customerId : (initialCustomer?.id || (customers[0]?.id ?? 1))
  );

  const [invoiceDate, setInvoiceDate] = useState<string>(
    invoiceToEdit
      ? new Date(invoiceToEdit.invoiceDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  const [paidAmount, setPaidAmount] = useState<number>(
    invoiceToEdit ? invoiceToEdit.paidAmount : 0
  );

  const [items, setItems] = useState<InvoiceItemCreateDto[]>(
    invoiceToEdit
      ? invoiceToEdit.items.map((i) => ({
          itemName: i.itemName,
          itemCode: i.itemCode,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      : [
          {
            itemName: POPULAR_ABAYA_CATALOG[0].name,
            itemCode: POPULAR_ABAYA_CATALOG[0].code,
            quantity: 5,
            unitPrice: POPULAR_ABAYA_CATALOG[0].defaultPrice,
          },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Identify current customer
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Snapshot previous balance: If editing, use the historical previous balance; if creating, use the customer's current balance
  const previousBalance = isEdit && invoiceToEdit
    ? invoiceToEdit.previousBalance
    : (currentCustomer?.balance ?? 0);

  // LIVE FORM CALCULATIONS (Zero-Conflict Server Preview)
  const grandTotalAmount = Number(
    items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0).toFixed(2)
  );
  const totalDue = Number((previousBalance + grandTotalAmount).toFixed(2));
  const remainingAmount = Number((totalDue - (Number(paidAmount) || 0)).toFixed(2));

  // Item row operations
  const handleItemChange = (index: number, field: keyof InvoiceItemCreateDto, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : field === 'unitPrice' ? Math.max(0, parseFloat(value) || 0) : value,
    };
    setItems(updated);
  };

  const handleQuickCatalogPick = (index: number, catalogCode: string) => {
    const found = POPULAR_ABAYA_CATALOG.find((c) => c.code === catalogCode);
    if (!found) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      itemName: found.name,
      itemCode: found.code,
      unitPrice: found.defaultPrice,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        itemCode: '',
        quantity: 1,
        unitPrice: 150.00,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMessage('An invoice must contain at least 1 line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validations per Section 5 of contract:
    if (!selectedCustomerId) {
      setErrorMessage('Please select a boutique client.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('At least one item is required.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.itemName.trim()) {
        setErrorMessage(`Item #${i + 1} name is required.`);
        return;
      }
      if (!it.itemCode.trim()) {
        setErrorMessage(`Item #${i + 1} code is required.`);
        return;
      }
      if (it.quantity < 1) {
        setErrorMessage(`Item #${i + 1} quantity must be at least 1.`);
        return;
      }
      if (it.unitPrice <= 0) {
        setErrorMessage(`Item #${i + 1} unit price must be greater than 0.`);
        return;
      }
    }
    if (paidAmount < 0) {
      setErrorMessage('Paid amount cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && invoiceToEdit) {
        const payload: InvoiceUpdateDto = {
          invoiceDate: new Date(invoiceDate).toISOString(),
          paidAmount: Number(paidAmount),
          items,
        };
        await onSubmit(payload, true, invoiceToEdit.id);
      } else {
        const payload: InvoiceCreateDto = {
          customerId: selectedCustomerId,
          invoiceDate: new Date(invoiceDate).toISOString(),
          paidAmount: Number(paidAmount),
          items,
        };
        await onSubmit(payload, false);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--gold-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #171310 0%, #120f0d 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--gold-subtle)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)'
            }}>
              <Receipt size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-pure)' }}>
                {isEdit ? `Edit Haute Couture Invoice #${invoiceToEdit?.id}` : 'Issue New Couture Invoice'}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Zero-conflict live debt calculation & inventory line dispatch
              </div>
            </div>
          </div>

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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {errorMessage && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--terracotta-bg)',
                border: '1px solid var(--terracotta-border)',
                borderRadius: '8px',
                color: 'var(--terracotta-light)',
                marginBottom: '18px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer & Date Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
                  Boutique Client (العميل) *
                </label>
                {isEdit ? (
                  <input
                    type="text"
                    disabled
                    value={invoiceToEdit?.customerName}
                    className="atelier-input"
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                    className="atelier-select"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — Current Net Debt: ${c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
                {currentCustomer && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Current ledger balance: <strong style={{ color: currentCustomer.balance > 0 ? 'var(--terracotta-light)' : 'var(--malachite-light)' }}>
                      ${currentCustomer.balance.toFixed(2)}
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
                  Invoice Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="atelier-input"
                  required
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-pure)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Couture Items & Garment Lines ({items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(23, 19, 16, 0.85)',
                      border: '1px solid rgba(212, 163, 89, 0.18)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 110px 100px 40px', gap: '10px', alignItems: 'center' }}>
                      {/* Item Name */}
                      <div>
                        <input
                          type="text"
                          placeholder="Abaya Design / Model Name"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          className="atelier-input"
                          style={{ fontSize: '13px' }}
                          required
                        />
                      </div>

                      {/* Item Code */}
                      <div>
                        <input
                          type="text"
                          placeholder="Code (e.g. ABY-001)"
                          value={item.itemCode}
                          onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                          className="atelier-input"
                          style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                          required
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="atelier-input"
                          style={{ fontSize: '13px', textAlign: 'center' }}
                          required
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Price $"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="atelier-input"
                          style={{ fontSize: '13px', textAlign: 'right' }}
                          required
                        />
                      </div>

                      {/* Row Total */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-light)', fontSize: '14px' }}>
                        ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                      </div>

                      {/* Remove */}
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--terracotta-light)',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: items.length > 1 ? 1 : 0.3,
                          }}
                          disabled={items.length <= 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Pick Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Presets:</span>
                      {POPULAR_ABAYA_CATALOG.slice(0, 4).map((cat) => (
                        <button
                          key={cat.code}
                          type="button"
                          onClick={() => handleQuickCatalogPick(index, cat.code)}
                          style={{
                            fontSize: '10.5px',
                            background: 'rgba(212, 163, 89, 0.08)',
                            border: '1px solid rgba(212, 163, 89, 0.2)',
                            color: 'var(--gold-light)',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {cat.code} ({cat.name.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paid Amount Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
                Immediate Cash / Wire Payment Paid Upon Issuance ($)
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="atelier-input"
                  style={{ maxWidth: '240px', fontSize: '16px', fontWeight: 700 }}
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(grandTotalAmount)}
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '6px 10px' }}
                >
                  Pay Current Invoice Full (${grandTotalAmount.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => setPaidAmount(totalDue)}
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '6px 10px' }}
                >
                  Pay Total Due Full (${totalDue.toFixed(2)})
                </button>
              </div>
            </div>

            {/* Live Calculations Preview (Zero-Conflict Business Logic Contract) */}
            <div className="live-calc-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Calculator size={18} style={{ color: 'var(--gold-primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Accounting Preview (Backend Sync Simulation)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(15, 12, 10, 0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(212, 163, 89, 0.12)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Previous Balance</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-soft)', marginTop: '2px' }}>
                    ${previousBalance.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 12, 10, 0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(212, 163, 89, 0.12)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Grand Total Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)', marginTop: '2px' }}>
                    ${grandTotalAmount.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 12, 10, 0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(212, 163, 89, 0.12)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Due</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-pure)', marginTop: '2px' }}>
                    ${totalDue.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 12, 10, 0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(212, 163, 89, 0.12)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>New Remaining Debt</div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: remainingAmount > 0 ? 'var(--terracotta-light)' : remainingAmount === 0 ? 'var(--malachite-light)' : 'var(--lapis-light)',
                    marginTop: '2px'
                  }}>
                    ${remainingAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--gold-border)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Recording on Ledger...' : isEdit ? 'Update Invoice' : 'Issue Couture Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
