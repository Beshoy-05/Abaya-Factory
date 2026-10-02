import React, { useState } from 'react';
import {
  Sparkles,
  Receipt,
  Users,
  CreditCard,
  BarChart3,
  Plus,
  RefreshCw,
  Server,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { apiService, ApiConfig } from '../services/api';

interface NavbarProps {
  currentTab: 'customers' | 'invoices' | 'payments' | 'analytics';
  setCurrentTab: (tab: 'customers' | 'invoices' | 'payments' | 'analytics') => void;
  onOpenNewCustomer: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewPayment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewCustomer,
  onOpenNewInvoice,
  onOpenNewPayment,
}) => {
  const [config, setConfigState] = useState<ApiConfig>(apiService.getConfig());
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  const toggleMockMode = () => {
    const updated = !config.isMockMode;
    apiService.setConfig({ isMockMode: updated });
    setConfigState(apiService.getConfig());
  };

  const handleBaseUrlChange = (url: string) => {
    apiService.setConfig({ baseUrl: url });
    setConfigState(apiService.getConfig());
  };

  const handleResetData = () => {
    if (confirm('Reset demo atelier data back to initial boutique catalog?')) {
      apiService.resetMockData();
      setShowConfigMenu(false);
    }
  };

  return (
    <header className="no-print" style={{
      borderBottom: '1px solid var(--gold-border)',
      background: 'linear-gradient(180deg, #16120f 0%, #0e0c0a 100%)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand / Crest */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #e5bb77 0%, #9e7336 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(212, 163, 89, 0.35)',
            border: '1px solid #f3d7a0',
            color: '#0e0c0a'
          }}>
            <Sparkles size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-editorial" style={{
                fontSize: '19px',
                fontWeight: 800,
                color: 'var(--text-pure)',
                letterSpacing: '0.08em'
              }}>
                DAR AL-ABAYA
              </span>
              <span className="font-arabic" style={{
                fontSize: '14px',
                color: 'var(--gold-light)',
                opacity: 0.9,
                fontWeight: 600
              }}>
                دار العباية الملكية
              </span>
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Haute Couture Atelier & Manufactory Ledger
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(26, 22, 19, 0.7)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(212, 163, 89, 0.18)'
        }}>
          <button
            onClick={() => setCurrentTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: currentTab === 'customers' ? 'linear-gradient(135deg, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.1) 100%)' : 'transparent',
              color: currentTab === 'customers' ? 'var(--gold-light)' : 'var(--text-soft)',
              outline: currentTab === 'customers' ? '1px solid var(--gold-border)' : 'none'
            }}
          >
            <Users size={16} />
            <span>Boutiques & Clients</span>
          </button>

          <button
            onClick={() => setCurrentTab('invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: currentTab === 'invoices' ? 'linear-gradient(135deg, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.1) 100%)' : 'transparent',
              color: currentTab === 'invoices' ? 'var(--gold-light)' : 'var(--text-soft)',
              outline: currentTab === 'invoices' ? '1px solid var(--gold-border)' : 'none'
            }}
          >
            <Receipt size={16} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setCurrentTab('payments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: currentTab === 'payments' ? 'linear-gradient(135deg, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.1) 100%)' : 'transparent',
              color: currentTab === 'payments' ? 'var(--gold-light)' : 'var(--text-soft)',
              outline: currentTab === 'payments' ? '1px solid var(--gold-border)' : 'none'
            }}
          >
            <CreditCard size={16} />
            <span>Receipts</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: currentTab === 'analytics' ? 'linear-gradient(135deg, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.1) 100%)' : 'transparent',
              color: currentTab === 'analytics' ? 'var(--gold-light)' : 'var(--text-soft)',
              outline: currentTab === 'analytics' ? '1px solid var(--gold-border)' : 'none'
            }}
          >
            <BarChart3 size={16} />
            <span>Item Analytics</span>
          </button>
        </nav>

        {/* Actions & Connection Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Add Invoices */}
          <button
            onClick={onOpenNewInvoice}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>

          {/* Quick Record Payment */}
          <button
            onClick={onOpenNewPayment}
            className="btn-malachite"
            style={{ padding: '8px 12px' }}
          >
            <CreditCard size={15} />
            <span>Pay</span>
          </button>

          {/* API Server State & Settings Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 11px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--gold-border)',
                borderRadius: '8px',
                color: 'var(--text-soft)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: config.isMockMode ? '#d4a359' : '#3f9e70',
                boxShadow: config.isMockMode ? '0 0 8px #d4a359' : '0 0 8px #3f9e70'
              }} />
              <span>{config.isMockMode ? 'Demo Atelier' : 'Live ASP.NET API'}</span>
              <ChevronDown size={14} />
            </button>

            {showConfigMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '310px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--gold-border-bright)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg), var(--shadow-gold)',
                zIndex: 101,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-pure)' }}>
                    Backend Configuration
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--gold-light)' }}>
                    ASP.NET Core 8
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px', cursor: 'pointer' }}>
                    <span>Use Mock / Demo Mode</span>
                    <input
                      type="checkbox"
                      checked={config.isMockMode}
                      onChange={toggleMockMode}
                      style={{ cursor: 'pointer', accentColor: 'var(--gold-primary)' }}
                    />
                  </label>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Allows seamless previewing, calculations and printing without needing the C# backend active.
                  </p>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'block', marginBottom: '4px' }}>
                    API Base URL:
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleBaseUrlChange('https://localhost:7178')}
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '5px',
                        background: config.baseUrl === 'https://localhost:7178' ? 'rgba(212, 163, 89, 0.25)' : 'var(--bg-input)',
                        border: '1px solid var(--gold-border)',
                        color: 'var(--text-soft)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      HTTPS 7178
                    </button>
                    <button
                      onClick={() => handleBaseUrlChange('http://localhost:5159')}
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '5px',
                        background: config.baseUrl === 'http://localhost:5159' ? 'rgba(212, 163, 89, 0.25)' : 'var(--bg-input)',
                        border: '1px solid var(--gold-border)',
                        color: 'var(--text-soft)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      HTTP 5159
                    </button>
                  </div>
                </div>

                <a
                  href={`${config.baseUrl}/swagger`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--gold-light)',
                    textDecoration: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(212, 163, 89, 0.1)',
                    marginBottom: '10px'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Open Swagger UI</span>
                </a>

                {config.isMockMode && (
                  <button
                    onClick={handleResetData}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '11.5px',
                      color: 'var(--text-dim)',
                      background: 'transparent',
                      border: '1px dashed var(--gold-border)',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Reset Demo Ledger</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
