import React, { useState } from 'react';
import type { CustomerDto, PaymentCreateDto, InvoiceDto } from '../types/api';
import { X, CreditCard, AlertCircle, FileText } from 'lucide-react';

interface LightPaymentModalProps {
  customers: CustomerDto[];
  invoices?: InvoiceDto[];
  initialCustomerId?: number;
  onClose: () => void;
  onSubmit: (dto: PaymentCreateDto) => Promise<void>;
}

export const LightPaymentModal: React.FC<LightPaymentModalProps> = ({
  customers,
  invoices,
  initialCustomerId,
  onClose,
  onSubmit,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    initialCustomerId || (customers[0]?.id ?? 1)
  );

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Find latest invoice for this customer (السداد يكون على آخر فاتورة بس)
  const customerInvoices = (invoices || [])
    .filter((inv) => inv.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime() || b.id - a.id);
  const lastInvoice = customerInvoices.length > 0 ? customerInvoices[0] : null;

  const [amount, setAmount] = useState<number>(
    currentCustomer && currentCustomer.balance > 0 ? currentCustomer.balance : 1000
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('يجب أن يكون مبلغ الدفعة أكبر من صفر.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        customerId: selectedCustomerId,
        amount: Number(amount),
        paymentDate: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)' }}>
            تسجيل دفعة مسددة (سند قبض)
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {errorMsg && (
            <div style={{
              background: 'var(--debt-bg)',
              color: 'var(--debt-color)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
              العميل / المكتب المسدد:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedCustomerId(id);
                const cust = customers.find((c) => c.id === id);
                if (cust && cust.balance > 0) setAmount(cust.balance);
              }}
              className="clean-select"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — المديونية الحالية: {c.balance.toFixed(0)} جنيه
                </option>
              ))}
            </select>

            {/* إشعار بأن السداد يخص آخر فاتورة فقط */}
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FileText size={14} style={{ color: '#16a34a' }} />
              <div>
                <strong>تطبيق السداد:</strong> {lastInvoice ? `على آخر فاتورة صادرة (فاتورة #${lastInvoice.id} — المتبقي عليها: ${lastInvoice.remainingAmount.toFixed(0)} ج)` : 'سداد مباشر يخصم من رصيد العميل'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)' }}>
                المبلغ المسدد (جنيه):
              </label>
              {currentCustomer && currentCustomer.balance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentCustomer.balance)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  سداد كامل المديونية ({currentCustomer.balance.toFixed(0)} ج)
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="clean-input"
              style={{ fontSize: '18px', fontWeight: 900, color: 'var(--paid-color)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
            <button
              type="submit"
              className="btn-main"
              style={{ backgroundColor: 'var(--paid-color)' }}
              disabled={isSubmitting}
            >
              <CreditCard size={15} />
              <span>{isSubmitting ? 'جاري التسجيل...' : 'تأكيد وحفظ سند القبض'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
