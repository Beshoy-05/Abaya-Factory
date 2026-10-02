import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid',
        borderColor: isSuccess ? 'var(--malachite-accent)' : isWarning ? 'var(--terracotta-accent)' : 'var(--gold-border)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideUp 0.25s ease'
      }}
    >
      <div style={{
        color: isSuccess ? 'var(--malachite-light)' : isWarning ? 'var(--terracotta-light)' : 'var(--gold-light)',
        marginTop: '2px'
      }}>
        {isSuccess ? <CheckCircle2 size={18} /> : isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-pure)' }}>
          {toast.title}
        </div>
        {toast.description && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {toast.description}
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
