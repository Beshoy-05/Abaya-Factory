import React, { useState, useEffect } from 'react';
import type { CustomerDto, InvoiceDto } from '../types/api';
import { apiService } from '../services/api';
import {
  Boxes,
  UserCheck,
  X,
  RefreshCw,
  Search,
  FileText,
  TrendingUp,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
  PackageCheck,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPieces, formatDateArabic } from '../utils/format';

interface QuantitiesModalProps {
  initialTab?: 'all' | 'customer' | 'code';
  initialCustomerId?: number;
  initialCode?: string;
  customers: CustomerDto[];
  invoices: InvoiceDto[];
  onClose: () => void;
  onOpenCustomerInvoices: (customer: CustomerDto) => void;
}

export const QuantitiesModal: React.FC<QuantitiesModalProps> = ({
  initialTab = 'all',
  initialCustomerId,
  initialCode = '117',
  customers,
  invoices,
  onClose,
  onOpenCustomerInvoices,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'code'>(initialTab);

  // State for All Invoices Quantities
  const [allSum, setAllSum] = useState<number | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);

  // State for Customer Quantities
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    initialCustomerId || (customers[0]?.id ?? 1)
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSum, setCustomerSum] = useState<number | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [errorCustomer, setErrorCustomer] = useState<string | null>(null);

  // State for Specific Code Quantities (sum-specific-code/{itemCode})
  const [itemCodeInput, setItemCodeInput] = useState<string>(initialCode);
  const [queriedCode, setQueriedCode] = useState<string>(initialCode);
  const [codeSum, setCodeSum] = useState<number | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Fetch All Invoices Quantities: GET /api/Invoices/sum-quantities
  const fetchAllQuantities = async () => {
    setLoadingAll(true);
    setErrorAll(null);
    try {
      const sum = await apiService.getSumOfQuantitiesOfAllInvoices();
      setAllSum(sum);
    } catch (err: any) {
      console.warn('sum-quantities error:', err);
      // fallback to calculation from invoices
      const fallbackSum = invoices.reduce(
        (acc, inv) => acc + inv.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
        0
      );
      setAllSum(fallbackSum);
    } finally {
      setLoadingAll(false);
    }
  };

  // Fetch Customer Quantities: GET /api/Invoices/sum-quantities/{customerId}
  const fetchCustomerQuantities = async (custId: number) => {
    setLoadingCustomer(true);
    setErrorCustomer(null);
    try {
      const sum = await apiService.getSumOfQuantitiesOfOneCustomer(custId);
      setCustomerSum(sum);
    } catch (err: any) {
      console.warn('customer sum-quantities error:', err);
      // fallback to calculation from customer's invoices
      const fallbackSum = invoices
        .filter((inv) => inv.customerId === custId)
        .reduce((acc, inv) => acc + inv.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0), 0);
      setCustomerSum(fallbackSum);
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Fetch Specific Code Quantities: GET /api/Invoices/sum-specific-code/{itemCode}
  const fetchSpecificCodeQuantities = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    setLoadingCode(true);
    setErrorCode(null);
    try {
      const sum = await apiService.getSumOfSpecificCode(clean);
      setCodeSum(sum);
      setQueriedCode(clean);
    } catch (err: any) {
      console.warn('specific-code sum error:', err);
      const fallbackSum = invoices.reduce((acc, inv) => {
        return (
          acc +
          (inv.items || []).reduce((s, it) => {
            if (it.itemCode && it.itemCode.toLowerCase().trim() === clean.toLowerCase()) {
              return s + (Number(it.quantity) || 0);
            }
            return s;
          }, 0)
        );
      }, 0);
      setCodeSum(fallbackSum);
      setQueriedCode(clean);
    } finally {
      setLoadingCode(false);
    }
  };

  useEffect(() => {
    fetchAllQuantities();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerQuantities(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (initialCode) {
      fetchSpecificCodeQuantities(initialCode);
    }
  }, [initialCode]);

  const existingCodes = React.useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((inv) => {
      (inv.items || []).forEach((it) => {
        if (it.itemCode && it.itemCode.trim()) {
          map.set(it.itemCode.trim(), it.itemName);
        }
      });
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [invoices]);

  const matchingInvoicesForCode = React.useMemo(() => {
    if (!queriedCode) return [];
    return invoices
      .map((inv) => {
        const matching = (inv.items || []).filter(
          (it) => it.itemCode && it.itemCode.toLowerCase().trim() === queriedCode.toLowerCase().trim()
        );
        const qty = matching.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        return { invoice: inv, qty };
      })
      .filter((x) => x.qty > 0)
      .sort((a, b) => new Date(b.invoice.invoiceDate).getTime() - new Date(a.invoice.invoiceDate).getTime());
  }, [invoices, queriedCode]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerInvoicesCount = invoices.filter((i) => i.customerId === selectedCustomerId).length;

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '720px',
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
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Boxes size={22} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-dark)' }}>
                إحصائيات واستعلام كميات الفواتير
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                إجمالي كميات وقطع العبايات لجميع فواتير المصنع ولعميل محدد
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

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            margin: '16px 20px 0',
            borderRadius: '8px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'all' ? '#ffffff' : 'transparent',
              color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={16} />
            <span>1. إجمالي كميات كل الفواتير</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'customer' ? '#ffffff' : 'transparent',
              color: activeTab === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'customer' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={16} />
            <span>2. إجمالي كميات عميل</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'code' ? '#ffffff' : 'transparent',
              color: activeTab === 'code' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'code' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Hash size={16} />
            <span>3. إجمالي كمية كود محدد</span>
          </button>
        </div>

        {/* Tab 1: All Invoices Quantities */}
        {activeTab === 'all' && (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <button
                onClick={fetchAllQuantities}
                disabled={loadingAll}
                title="تحديث من السيرفر"
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: '#ffffff',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#15803d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} className={loadingAll ? 'animate-spin' : ''} />
                <span>تحديث</span>
              </button>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                المجموع الكلي لكميات وقطع جميع الفواتير المسجلة
              </div>

              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '8px 0',
                }}
              >
                <span>{loadingAll ? '...' : (allSum ?? 0).toLocaleString('ar-EG')}</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>قطعة عباية</span>
              </div>

              <div style={{ fontSize: '12.5px', color: '#166534', fontWeight: 600 }}>
                موزعة على إجمالي {invoices.length} فاتورة في سجلات المصنع
              </div>

              {errorAll && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#b45309',
                    background: '#fffbeb',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertCircle size={13} />
                  <span>{errorAll}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Customer Quantities */}
        {activeTab === 'customer' && (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {/* اختيار العميل */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)' }}>
                اختر العميل أو المكتب:
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                  <Search
                    size={15}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="بحث سريع باسم العميل..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="clean-input"
                    style={{ paddingRight: '32px', fontSize: '13px' }}
                  />
                </div>

                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="clean-input"
                  style={{ flex: '2 1 240px', fontSize: '13px', fontWeight: 700 }}
                >
                  {filteredCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id} - {c.name} (الرصيد: {c.balance.toFixed(0)} ج)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* بطاقة كميات العميل المحدد */}
            {selectedCustomer && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #93c5fd',
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => fetchCustomerQuantities(selectedCustomerId)}
                  disabled={loadingCustomer}
                  title="إعادة الاستعلام من السيرفر"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#ffffff',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RefreshCw size={12} className={loadingCustomer ? 'animate-spin' : ''} />
                  <span>تحديث</span>
                </button>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>
                  إجمالي قطع العميل: {selectedCustomer.name}
                </div>

                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: 900,
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    margin: '8px 0',
                  }}
                >
                  <span>{loadingCustomer ? '...' : (customerSum ?? 0).toLocaleString('ar-EG')}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>قطعة عباية</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ fontSize: '12.5px', color: '#1e40af' }}>
                    عدد الفواتير المسجلة: <strong>{customerInvoicesCount}</strong> • الرصيد:{' '}
                    <strong>{selectedCustomer.balance.toFixed(0)} ج</strong>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCustomerInvoices(selectedCustomer);
                    }}
                    className="btn-main"
                    style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  >
                    <FileText size={14} />
                    <span>عرض جميع فواتير {selectedCustomer.name}</span>
                  </button>
                </div>

                {errorCustomer && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#b45309',
                      background: '#fffbeb',
                      padding: '5px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {errorCustomer}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Specific Code Quantities */}
        {activeTab === 'code' && (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {/* إدخال كود الموديل */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchSpecificCodeQuantities(itemCodeInput);
              }}
              style={{ marginBottom: '16px' }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '6px',
                  color: 'var(--text-dark)',
                }}
              >
                أدخل كود الموديل للاستعلام عن إجمالي قطعه المباعة:
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
                    placeholder="اكتب كود الموديل (مثال: 117)..."
                    value={itemCodeInput}
                    onChange={(e) => setItemCodeInput(e.target.value)}
                    className="clean-input"
                    style={{ paddingRight: '36px', fontSize: '13.5px', fontWeight: 700 }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-main"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                  disabled={loadingCode}
                >
                  {loadingCode ? 'جاري الاستعلام...' : 'استعلام الكمية'}
                </button>
              </div>
            </form>

            {/* الأكواد المسجلة للاختيار السريع */}
            {existingCodes.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={13} />
                  <span>أكواد مسجلة في الفواتير (اضغط للاستعلام السريع):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {existingCodes.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setItemCodeInput(c.code);
                        fetchSpecificCodeQuantities(c.code);
                      }}
                      style={{
                        background: queriedCode.toLowerCase() === c.code.toLowerCase() ? 'var(--primary)' : '#f1f5f9',
                        color: queriedCode.toLowerCase() === c.code.toLowerCase() ? '#ffffff' : 'var(--text-dark)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      #{c.code} {c.name ? `(${c.name})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* بطاقة عرض إجمالي كمية الكود */}
            {codeSum !== null && !loadingCode && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                  border: '1px solid #99f6e4',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  position: 'relative',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={() => fetchSpecificCodeQuantities(queriedCode)}
                  disabled={loadingCode}
                  title="إعادة الاستعلام من السيرفر"
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
                  <RefreshCw size={12} className={loadingCode ? 'animate-spin' : ''} />
                  <span>تحديث</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                  <PackageCheck size={18} style={{ color: '#0f766e' }} />
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#115e59' }}>
                    إجمالي قطع كود الموديل:
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
                    fontSize: '40px',
                    fontWeight: 900,
                    color: '#0f766e',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '8px 0',
                  }}
                >
                  <span>{codeSum.toLocaleString('ar-EG')}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>قطعة عباية</span>
                </div>

                <div style={{ fontSize: '12px', color: '#134e4a', fontWeight: 600 }}>
                  عبر Endpoint السيرفر: <code>GET /api/Invoices/sum-specific-code/{queriedCode}</code>
                </div>

                {errorCode && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#b91c1c',
                      background: '#fef2f2',
                      padding: '5px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {errorCode}
                  </div>
                )}
              </div>
            )}

            {/* تفصيل الفواتير التي ورد فيها هذا الكود */}
            {matchingInvoicesForCode.length > 0 && (
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
                  الفواتير المسجل بها كود #{queriedCode} ({matchingInvoicesForCode.length} فاتورة):
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>رقم الفاتورة</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>العميل</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>التاريخ</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center' }}>الكمية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchingInvoicesForCode.map(({ invoice, qty }) => (
                        <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 800, color: 'var(--primary)' }}>
                            #{invoice.id}
                          </td>
                          <td style={{ padding: '6px 10px', fontWeight: 700 }}>{invoice.customerName}</td>
                          <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                            {new Date(invoice.invoiceDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>
                            {qty} قطعة
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
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
