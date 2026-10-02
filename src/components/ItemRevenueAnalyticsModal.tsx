import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { POPULAR_ABAYA_CATALOG } from '../data/mockData';
import { Sparkles, Search, TrendingUp, X, Scissors, Layers, CheckCircle } from 'lucide-react';

interface ItemRevenueAnalyticsModalProps {
  onClose: () => void;
}

export const ItemRevenueAnalyticsModal: React.FC<ItemRevenueAnalyticsModalProps> = ({ onClose }) => {
  const [selectedCode, setSelectedCode] = useState<string>('ABY-001');
  const [customInput, setCustomInput] = useState<string>('ABY-001');
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevenue(selectedCode);
  }, [selectedCode]);

  const fetchRevenue = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const total = await apiService.getItemTotalSelling(code.trim());
      setRevenue(total);
    } catch {
      setRevenue(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setSelectedCode(customInput.trim().toUpperCase());
    }
  };

  const currentCatalogItem = POPULAR_ABAYA_CATALOG.find(
    (c) => c.code.toLowerCase() === selectedCode.toLowerCase()
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '680px' }}
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
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', color: 'var(--text-pure)' }}>
                  Model Revenue Analytics
                </h2>
                <span className="font-arabic" style={{ fontSize: '14px', color: 'var(--gold-light)' }}>
                  إجمالي مبيعات الموديل
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Direct API Integration: <code>GET /api/Invoices/total-selling/&#123;itemCode&#125;</code>
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Search by Code */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Enter Item or Fabric Code (e.g. ABY-001, ABY-105)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="atelier-input"
                style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
              Query Revenue
            </button>
          </form>

          {/* Quick Select Preset Buttons */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Or Select from Atelier Master Catalog:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_ABAYA_CATALOG.map((cat) => {
                const isActive = cat.code.toLowerCase() === selectedCode.toLowerCase();
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => {
                      setSelectedCode(cat.code);
                      setCustomInput(cat.code);
                    }}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: '1px solid',
                      background: isActive ? 'linear-gradient(135deg, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.1) 100%)' : 'var(--bg-surface-elevated)',
                      borderColor: isActive ? 'var(--gold-primary)' : 'rgba(212, 163, 89, 0.18)',
                      color: isActive ? 'var(--gold-light)' : 'var(--text-soft)',
                      fontWeight: isActive ? 700 : 500
                    }}
                  >
                    {cat.code} — {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revenue Result Card */}
          <div style={{
            background: 'linear-gradient(145deg, #1d1815 0%, #15110e 100%)',
            border: '2px solid rgba(212, 163, 89, 0.35)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Historical Factory Selling Revenue for Model:
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-light)', marginTop: '4px', letterSpacing: '0.05em' }}>
              {selectedCode}
            </div>

            <div style={{
              fontSize: '38px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: 'var(--gold-light)',
              marginTop: '12px',
              textShadow: '0 0 20px rgba(212, 163, 89, 0.3)'
            }}>
              {loading ? 'Calculating...' : revenue !== null ? `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Aggregated across all recorded client invoices and dispatch orders
            </div>
          </div>

          {/* Atelier Model Details */}
          {currentCatalogItem && (
            <div style={{
              background: 'rgba(23, 19, 16, 0.7)',
              border: '1px solid rgba(212, 163, 89, 0.15)',
              borderRadius: '10px',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <Layers size={13} />
                  <span>Fabric Specification</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)', marginTop: '4px' }}>
                  {currentCatalogItem.fabric}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <Scissors size={13} />
                  <span>Couture Needlework</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)', marginTop: '4px' }}>
                  {currentCatalogItem.embroidery}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <Sparkles size={13} />
                  <span>Base Wholesale Price</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-light)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  ${currentCatalogItem.defaultPrice.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
