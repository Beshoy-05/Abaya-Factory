import React, { useState } from 'react';
import { CustomerDto, PaymentDto, PaymentCreateDto, PaymentUpdateDto } from '../types/api';
import { X, CreditCard, Sparkles, AlertCircle, ArrowDownLeft } from 'lucide-react';

interface PaymentModalProps {
  initialCustomer?: CustomerDto | null;
  paymentToEdit?: PaymentDto | null;
  customers: CustomerDto[];
  onClose: () => void;
  onSubmit: (dto: PaymentCreateDto | PaymentUpdateDto, isEdit: boolean, paymentId?: number) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  initialCustomer,
  paymentToEdit,
  customers,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(paymentToEdit);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    paymentToEdit ? paymentToEdit.customerId : (initialCustomer?.id || (customers[0]?.id ?? 1))
  );

  const [amount, setAmount] = useState<number>(
    paymentToEdit ? paymentToEdit.amount : (initialCustomer && initialCustomer.balance > 0 ? initialCustomer.balance : 500)
  );

  const [paymentDate, setPaymentDate] = useState<string>(
    paymentToEdit
      ? new Date(paymentToEdit.paymentDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Simulated remaining balance after this payment
  const currentBalance = currentCustomer ? currentCustomer.balance : 0;
  const simulatedPostBalance = isEdit && paymentToEdit
    ? Number((currentBalance + paymentToEdit.amount - amount).toFixed(2))
    : Number((currentBalance - amount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amount <= 0) {
      setErrorMessage('Payment amount must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && paymentToEdit) {
        const payload: PaymentUpdateDto = {
          amount: Number(amount),
          paymentDate: new Date(paymentDate).toISOString(),
        };
        await onSubmit(payload, true, paymentToEdit.id);
      } else {
        const payload: PaymentCreateDto = {
          customerId: selectedCustomerId,
          amount: Number(amount),
          paymentDate: new Date(paymentDate).toISOString(),
        };
        await onSubmit(payload, false);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing payment voucher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '540px' }}
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
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'var(--malachite-bg)',
              border: '1px solid var(--malachite-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--malachite-light)'
            }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', color: 'var(--text-pure)' }}>
                {isEdit ? `Edit Receipt Voucher #${paymentToEdit?.id}` : 'Record Client Payment Receipt'}
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                سند قبض نقدي / تحويل بنكي
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
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--terracotta-bg)',
              border: '1px solid var(--terracotta-border)',
              borderRadius: '8px',
              color: 'var(--terracotta-light)',
              marginBottom: '16px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Boutique Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
              Boutique Client (العميل المسدد) *
            </label>
            {isEdit ? (
              <input
                type="text"
                disabled
                value={paymentToEdit?.customerName}
                className="atelier-input"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedCustomerId(id);
                  const cust = customers.find((c) => c.id === id);
                  if (cust && cust.balance > 0) {
                    setAmount(cust.balance);
                  }
                }}
                className="atelier-select"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Current Debt: ${c.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            )}
            {currentCustomer && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Current outstanding debt:{' '}
                <strong style={{ color: currentCustomer.balance > 0 ? 'var(--terracotta-light)' : 'var(--malachite-light)' }}>
                  ${currentCustomer.balance.toFixed(2)}
                </strong>
              </div>
            )}
          </div>

          {/* Payment Amount */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--gold-light)', fontWeight: 600 }}>
                Payment Received Amount ($) *
              </label>
              {currentCustomer && currentCustomer.balance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentCustomer.balance)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold-light)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Pay Full Balance (${currentCustomer.balance.toFixed(2)})
                </button>
              )}
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="atelier-input"
              style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          {/* Payment Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
              Payment Date & Time *
            </label>
            <input
              type="datetime-local"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="atelier-input"
              required
            />
          </div>

          {/* Accounting Deduction Live Preview */}
          <div style={{
            background: 'rgba(23, 19, 16, 0.95)',
            border: '1px solid rgba(212, 163, 89, 0.2)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              <ArrowDownLeft size={14} style={{ color: 'var(--malachite-light)' }} />
              <span>Balance Adjustment Preview</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer Debt After Voucher:</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: simulatedPostBalance > 0 ? 'var(--terracotta-light)' : simulatedPostBalance === 0 ? 'var(--malachite-light)' : 'var(--lapis-light)'
                }}>
                  ${simulatedPostBalance.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                {simulatedPostBalance === 0 ? 'Account will be fully settled!' : simulatedPostBalance < 0 ? 'Customer will have advance credit' : 'Remaining balance will be due'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
              className="btn-malachite"
              style={{ padding: '8px 18px', fontSize: '13px' }}
              disabled={isSubmitting}
            >
              <CreditCard size={15} />
              <span>{isSubmitting ? 'Recording Receipt...' : isEdit ? 'Update Receipt' : 'Confirm Receipt Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
