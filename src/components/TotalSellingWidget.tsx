import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Search, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface TotalSellingWidgetProps {
  initialCode?: string;
  onCodeQueried?: (code: string, amount: number) => void;
}

export const TotalSellingWidget: React.FC<TotalSellingWidgetProps> = ({
  initialCode = '',
  onCodeQueried,
}) => {
  const [itemCode, setItemCode] = useState(initialCode);
  const [totalSelling, setTotalSelling] = useState<number | null>(null);
  const [queriedCode, setQueriedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = itemCode.trim();
    if (!code) {
      setError('يرجى كتابة كود الصنف أولاً (مثال: 117)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getItemTotalSelling(code);
      setTotalSelling(result);
      setQueriedCode(code);
      if (onCodeQueried) onCodeQueried(code, result);
    } catch (err: any) {
      setError(err.message || 'فشل استعلام مبيعات الكود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '6px',
            borderRadius: '6px'
          }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-dark)' }}>
              استعلام إجمالي مبيعات كود موديل
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
             حساب إجمالي مبيعات المصنع لكود معين
            </div>
          </div>
        </div>

        {/* نموذج البحث */}
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="اكتب كود الموديل (مثال: 117)..."
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="clean-input"
              style={{
                paddingRight: '32px',
                paddingTop: '6px',
                paddingBottom: '6px',
                width: '210px',
                fontSize: '13px',
                fontWeight: 700
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-main"
            style={{ padding: '7px 16px', fontSize: '13px' }}
            disabled={loading}
          >
            <Search size={14} />
            <span>{loading ? 'جاري الاستعلام...' : 'استعلام المبيعات'}</span>
          </button>
        </form>
      </div>

      {/* رسالة الخطأ إن وجدت */}
      {error && (
        <div style={{
          marginTop: '10px',
          color: 'var(--debt-color)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* نتيجة الاستعلام */}
      {totalSelling !== null && !loading && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid var(--primary-border)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              إجمالي مبيعات كود
            </span>
            <span style={{
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '13px'
            }}>
              #{queriedCode}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              في تاريخ المصنع:
            </span>
          </div>

          <div style={{
            fontSize: '20px',
            fontWeight: 900,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{formatCurrency(totalSelling)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
