import React, { useState, useEffect } from 'react';
import type { InvoiceDto } from '../types/api';
import { apiService } from '../services/api';
import { Hash, Search, RefreshCw, X, AlertCircle, PackageCheck, FileText, Calendar, User, Tag } from 'lucide-react';

interface SpecificCodeModalProps {
  initialCode?: string;
  invoices: InvoiceDto[];
  onClose: () => void;
  onOpenInvoice?: (invoice: InvoiceDto) => void;
}

export const SpecificCodeModal: React.FC<SpecificCodeModalProps> = ({
  initialCode = '117',
  invoices,
  onClose,
  onOpenInvoice,
}) => {
  const [itemCode, setItemCode] = useState(initialCode);
  const [queriedCode, setQueriedCode] = useState(initialCode);
  const [sum, setSum] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract all unique item codes available in invoices for quick suggestions
  const existingCodes = React.useMemo(() => {
    const codesMap = new Map<string, { count: number; name: string }>();
    invoices.forEach((inv) => {
      (inv.items || []).forEach((it) => {
        if (it.itemCode && it.itemCode.trim()) {
          const trimmed = it.itemCode.trim();
          const existing = codesMap.get(trimmed);
          if (existing) {
            existing.count += Number(it.quantity) || 0;
          } else {
            codesMap.set(trimmed, { count: Number(it.quantity) || 0, name: it.itemName });
          }
        }
      });
    });
    return Array.from(codesMap.entries()).map(([code, info]) => ({
      code,
      name: info.name,
      totalQty: info.count,
    }));
  }, [invoices]);

  const fetchSum = async (codeToQuery: string) => {
    const cleanCode = codeToQuery.trim();
    if (!cleanCode) {
      setError('يرجى إدخال كود الموديل أولاً');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getSumOfSpecificCode(cleanCode);
      setSum(result);
      setQueriedCode(cleanCode);
    } catch (err: any) {
      console.warn('sum-specific-code error:', err);
      // Fallback calculation from invoices
      const fallbackSum = invoices.reduce((acc, inv) => {
        return (
          acc +
          (inv.items || []).reduce((s, it) => {
            if (it.itemCode && it.itemCode.toLowerCase().trim() === cleanCode.toLowerCase()) {
              return s + (Number(it.quantity) || 0);
            }
            return s;
          }, 0)
        );
      }, 0);
      setSum(fallbackSum);
      setQueriedCode(cleanCode);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchSum(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSum(itemCode);
  };

  const handleSelectCode = (code: string) => {
    setItemCode(code);
    fetchSum(code);
  };

  // Find all invoices that contain this specific code
  const matchingInvoices = React.useMemo(() => {
    if (!queriedCode) return [];
    const list: {
      invoice: InvoiceDto;
      matchingItems: { itemName: string; quantity: number; unitPrice: number; totalPrice: number }[];
    }[] = [];

    invoices.forEach((inv) => {
      const matchingItems = (inv.items || []).filter(
        (it) => it.itemCode && it.itemCode.toLowerCase().trim() === queriedCode.toLowerCase().trim()
      );
      if (matchingItems.length > 0) {
        list.push({ invoice: inv, matchingItems });
      }
    });

    return list.sort(
      (a, b) => new Date(b.invoice.invoiceDate).getTime() - new Date(a.invoice.invoiceDate).getTime()
    );
  }, [invoices, queriedCode]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f0fdfa, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#ccfbf1',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hash size={22} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-dark)' }}>
                استعلام إجمالي كميات كود محدد
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                API Endpoint: <code>GET /api/Invoices/sum-specific-code/{'{itemCode}'}</code>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Search Bar */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '6px',
                color: 'var(--text-dark)',
              }}
            >
              أدخل كود الموديل المراد استعلام إجمالي قطعه:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                  }}
                />
                <input
                  type="text"
                  placeholder="اكتب كود الموديل (مثال: 117 أو ABY-001)..."
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="clean-input"
                  style={{
                    paddingRight: '36px',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-main"
                style={{ padding: '8px 20px', fontSize: '13.5px', whiteSpace: 'nowrap' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>جاري الحساب...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>استعلام الكمية</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick suggestions badges */}
          {existingCodes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Tag size={13} />
                <span>أكواد مسجلة بالفواتير (اضغط للاستعلام السريع):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {existingCodes.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectCode(item.code)}
                    style={{
                      background: queriedCode.toLowerCase() === item.code.toLowerCase() ? '#0f766e' : '#f0fdfa',
                      color: queriedCode.toLowerCase() === item.code.toLowerCase() ? '#ffffff' : '#0f766e',
                      border: '1px solid #99f6e4',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>#{item.code}</span>
                    <span style={{ opacity: 0.8, fontSize: '11px' }}>({item.name})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Result Card */}
          {sum !== null && !loading && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                border: '1px solid #99f6e4',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => fetchSum(queriedCode)}
                disabled={loading}
                title="تحديث من السيرفر"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: '#ffffff',
                  border: '1px solid #99f6e4',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#0f766e',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>تحديث</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                <PackageCheck size={18} style={{ color: '#0f766e' }} />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#115e59' }}>
                  إجمالي قطع الموديل كود
                </span>
                <span
                  style={{
                    background: '#0f766e',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    fontWeight: 900,
                    fontSize: '13.5px',
                  }}
                >
                  #{queriedCode}
                </span>
              </div>

              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '8px 0',
                }}
              >
                <span>{sum.toLocaleString('ar-EG')}</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>قطعة عباية</span>
              </div>

              <div style={{ fontSize: '12px', color: '#134e4a', fontWeight: 600 }}>
                مجموع الكميات المباعة لهذا الكود في سجل كافة فواتير المصنع
              </div>
            </div>
          )}

          {/* Invoices Breakdown Table */}
          {matchingInvoices.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-dark)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: 'var(--primary)' }} />
                  <span>الفواتير التي تحتوي على كود #{queriedCode} ({matchingInvoices.length} فاتورة):</span>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>رقم الفاتورة</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>العميل</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>التاريخ</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>الكمية</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingInvoices.map(({ invoice, matchingItems }) => {
                      const totalQtyInInv = matchingItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                      return (
                        <tr
                          key={invoice.id}
                          style={{ borderBottom: '1px solid #f1f5f9' }}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--primary)' }}>
                            #{invoice.id}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-dark)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} style={{ color: 'var(--text-muted)' }} />
                              <span>{invoice.customerName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              <span>{new Date(invoice.invoiceDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span
                              style={{
                                background: '#ccfbf1',
                                color: '#0f766e',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}
                            >
                              {totalQtyInInv} قطعة
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'left' }}>
                            {onOpenInvoice && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenInvoice(invoice);
                                }}
                                className="btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '11.5px' }}
                              >
                                معاينة / طباعة
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sum === 0 && !loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              لم يتم العثور على أي مبيعات مسجلة لكود الموديل #{queriedCode} في الفواتير الحالية.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            استعلام مباشر عبر خادم الـ API
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
