import React, { useState, useEffect } from 'react';
import { FileText, Users, CreditCard, Plus, TrendingUp, Cloud } from 'lucide-react';
import { apiService } from '../services/api';

interface LightNavbarProps {
  currentTab: 'invoices' | 'customers' | 'payments' | 'new-invoice';
  setCurrentTab: (tab: 'invoices' | 'customers' | 'payments' | 'new-invoice') => void;
  onOpenNewInvoice: () => void;
  onOpenTotalSellingModal: () => void;
}

export const LightNavbar: React.FC<LightNavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewInvoice,
  onOpenTotalSellingModal,
}) => {
  const [config, setConfig] = useState(apiService.getConfig());

  useEffect(() => {
    const unsub = apiService.subscribe(() => {
      setConfig(apiService.getConfig());
    });
    return () => {
      unsub();
    };
  }, []);

  const toggleMockMode = () => {
    const nextMock = !config.isMockMode;
    apiService.setConfig({ isMockMode: nextMock });
  };

  return (
    <header className="no-print" style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* الشعار واسم المصنع */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '20px'
          }}>
            ر
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-dark)' }}>
                رواء الخليج
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                للعباية الخليجي
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>إدارة الفواتير والمديونيات</span>
              <span>•</span>
              <span style={{ direction: 'ltr', fontWeight: 600 }}>01031424301 ✆</span>
            </div>
          </div>
        </div>

        {/* أزرار التبويب الرئيسية الفاتحة والمريحة */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <button
            onClick={() => setCurrentTab('invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'invoices' ? '#ffffff' : 'transparent',
              color: currentTab === 'invoices' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'invoices' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <FileText size={16} />
            <span>سجل الفواتير</span>
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'customers' ? '#ffffff' : 'transparent',
              color: currentTab === 'customers' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'customers' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Users size={16} />
            <span>العملاء والمديونيات</span>
          </button>

          <button
            onClick={() => setCurrentTab('payments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'payments' ? '#ffffff' : 'transparent',
              color: currentTab === 'payments' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'payments' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <CreditCard size={16} />
            <span>سندات القبض</span>
          </button>
        </nav>

        {/* زر عمل فاتورة جديدة واستعلام مبيعات كود وحالة السيرفر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleMockMode}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: config.isMockMode ? '1px solid #fcd34d' : '1px solid #86efac',
              background: config.isMockMode ? '#fffbeb' : '#f0fdf4',
              color: config.isMockMode ? '#b45309' : '#15803d',
              transition: 'all 0.2s',
            }}
            title={
              config.isMockMode
                ? 'اضغط للتحويل إلى السيرفر السحابي (Live API)'
                : `متصل بالسيرفر: ${config.baseUrl} (اضغط للتحويل إلى الوضع التجريبي)`
            }
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: config.isMockMode ? '#f59e0b' : '#22c55e',
                boxShadow: config.isMockMode ? '0 0 6px #f59e0b' : '0 0 6px #22c55e',
              }}
            />
            {config.isMockMode ? (
              <span>وضع تجريبي (Mock)</span>
            ) : (
              <span>سيرفر حي (Live API)</span>
            )}
          </button>

          <button
            onClick={onOpenTotalSellingModal}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="استعلام إجمالي مبيعات كود موديل عبر الـ API"
          >
            <TrendingUp size={15} style={{ color: 'var(--primary)' }} />
            <span>مبيعات كود موديل</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="btn-main"
            style={{ padding: '9px 18px', fontSize: '14px' }}
          >
            <Plus size={17} />
            <span>عمل فاتورة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
