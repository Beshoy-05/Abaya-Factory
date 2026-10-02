import React, { useState } from 'react';
import type { CustomerDto, CustomerCreateDto, CustomerUpdateDto } from '../types/api';
import { X, UserCheck, AlertCircle } from 'lucide-react';

interface LightCustomerModalProps {
  customerToEdit?: CustomerDto | null;
  onClose: () => void;
  onSubmit: (dto: CustomerCreateDto | CustomerUpdateDto, isEdit: boolean, customerId?: number) => Promise<void>;
}

export const LightCustomerModal: React.FC<LightCustomerModalProps> = ({
  customerToEdit,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(customerToEdit);
  const [name, setName] = useState(customerToEdit?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('اسم العميل أو المكتب مطلوب.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && customerToEdit) {
        await onSubmit({ name: name.trim() }, true, customerToEdit.id);
      } else {
        await onSubmit({ name: name.trim() }, false);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ بيانات العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '460px' }}
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
            {isEdit ? 'تعديل اسم العميل' : 'تسجيل عميل / مكتب جديد'}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
              اسم العميل أو المكتب (المطلوب من السيد):
            </label>
            <input
              type="text"
              placeholder="مثال: مكتب سدره"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="clean-input"
              autoFocus
              required
            />
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              الرصيد الابتدائي يبدأ تلقائياً بـ 0.00 جنيه
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
            <button
              type="submit"
              className="btn-main"
              disabled={isSubmitting}
            >
              <UserCheck size={16} />
              <span>{isSubmitting ? 'جاري الحفظ...' : isEdit ? 'تعديل العميل' : 'حفظ وتسجيل العميل'}</span>
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
