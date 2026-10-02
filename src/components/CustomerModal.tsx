import React, { useState } from 'react';
import { CustomerDto, CustomerCreateDto, CustomerUpdateDto } from '../types/api';
import { X, Building2, Sparkles, AlertCircle } from 'lucide-react';

interface CustomerModalProps {
  customerToEdit?: CustomerDto | null;
  onClose: () => void;
  onSubmit: (dto: CustomerCreateDto | CustomerUpdateDto, isEdit: boolean, customerId?: number) => Promise<void>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customerToEdit,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(customerToEdit);
  const [name, setName] = useState<string>(customerToEdit?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Customer name is required.');
      return;
    }
    if (trimmed.length > 100) {
      setErrorMessage('Customer name cannot exceed 100 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && customerToEdit) {
        await onSubmit({ name: trimmed }, true, customerToEdit.id);
      } else {
        await onSubmit({ name: trimmed }, false);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
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
              background: 'var(--gold-subtle)',
              border: '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light)'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', color: 'var(--text-pure)' }}>
                {isEdit ? 'Edit Boutique Account' : 'Register New Boutique'}
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {isEdit ? `Account #${customerToEdit?.id}` : 'Initial balance starts automatically at $0.00'}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--gold-light)', marginBottom: '6px', fontWeight: 600 }}>
              Boutique / Atelier Name (اسم المشغل أو البوتيك) *
            </label>
            <input
              type="text"
              placeholder="e.g. Al-Amira Fashion Boutique"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="atelier-input"
              maxLength={100}
              required
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>Max 100 characters</span>
              <span>{name.length}/100</span>
            </div>
          </div>

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
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Sparkles size={15} />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Boutique'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
