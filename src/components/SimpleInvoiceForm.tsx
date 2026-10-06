import React, { useState } from 'react';
import type { CustomerDto, InvoiceCreateDto, InvoiceItemCreateDto } from '../types/api';
import { Plus, Trash2, Printer, ArrowRight, UserPlus, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPieces } from '../utils/format';

interface SimpleInvoiceFormProps {
  customers: CustomerDto[];
  initialCustomerId?: number;
  onSaveAndPrint: (dto: InvoiceCreateDto) => Promise<void>;
  onCancel: () => void;
  onQuickAddCustomer: (name: string) => Promise<CustomerDto>;
}

export const SimpleInvoiceForm: React.FC<SimpleInvoiceFormProps> = ({
  customers,
  initialCustomerId,
  onSaveAndPrint,
  onCancel,
  onQuickAddCustomer,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    initialCustomerId || (customers[0]?.id ?? 1)
  );

  const [newCustomerName, setNewCustomerName] = useState('');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);

  // Items table
  const [items, setItems] = useState<InvoiceItemCreateDto[]>([
    {
      itemName: 'موديل 117',
      itemCode: '117',
      quantity: 20,
      unitPrice: 95,
    },
  ]);

  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find selected customer
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const previousBalance = currentCustomer ? currentCustomer.balance : 0;

  // Real-time live calculations (matching Section 2.2 of API Guide)
  const grandTotalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const totalDue = previousBalance + grandTotalAmount;
  const remainingAmount = totalDue - (Number(paidAmount) || 0);

  const handleItemChange = (index: number, field: keyof InvoiceItemCreateDto, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : field === 'unitPrice' ? Math.max(0, parseFloat(value) || 0) : value,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        itemCode: '',
        quantity: 1,
        unitPrice: 100,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMsg('يجب أن تحتوي الفاتورة على صنف واحد على الأقل.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateCustomerSubmit = async () => {
    if (!newCustomerName.trim()) return;
    try {
      const created = await onQuickAddCustomer(newCustomerName.trim());
      setSelectedCustomerId(created.id);
      setIsAddingNewCustomer(false);
      setNewCustomerName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إضافة العميل');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg('برجاء اختيار العميل أولاً.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('يجب إضافة صنف واحد على الأقل في الفاتورة.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemName.trim() || !items[i].itemCode.trim()) {
        setErrorMsg(`يرجى كتابة اسم وكود الصنف في السطر رقم ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: InvoiceCreateDto = {
        customerId: selectedCustomerId,
        invoiceDate: new Date().toISOString(),
        paidAmount: Number(paidAmount) || 0,
        items,
      };
      await onSaveAndPrint(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الفاتورة');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-clean" style={{ padding: '24px 28px', maxWidth: '960px', margin: '0 auto' }}>
      {/* رأس الصفحة مع زر العودة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)' }}>
            عمل فاتورة جديدة لمصنع رواء الخليج
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            فاتورة بسيطة مع حساب الرصيد السابق والمتبقي فورياً وإمكانية الطباعة بنقرة واحدة
          </div>
        </div>

        <button onClick={onCancel} className="btn-secondary" style={{ padding: '6px 14px' }}>
          <ArrowRight size={16} />
          <span>رجوع للقائمة</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--debt-bg)',
          border: '1px solid var(--debt-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: 'var(--debt-color)',
          fontSize: '13px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* اختيار العميل مع إمكانية إضافة عميل سريعاً */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>
              المطلوب من السيد (العميل / المكتب):
            </label>
            <button
              type="button"
              onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <UserPlus size={15} />
              <span>{isAddingNewCustomer ? 'إلغاء' : '+ تسجيل عميل جديد'}</span>
            </button>
          </div>

          {isAddingNewCustomer ? (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="اكتب اسم العميل الجديد (مثال: مكتب سدره)..."
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="clean-input"
                style={{ flex: 1 }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleCreateCustomerSubmit}
                className="btn-main"
                style={{ padding: '8px 16px' }}
              >
                حفظ العميل
              </button>
            </div>
          ) : (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="clean-select"
              style={{ fontSize: '15px', fontWeight: 700 }}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — رصيده السابق: {formatCurrency(c.balance)}
                </option>
              ))}
            </select>
          )}

          {currentCustomer && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>
                رصيد العميل الحالي (المديونية السابقة):{' '}
                <strong style={{ color: currentCustomer.balance > 0 ? 'var(--debt-color)' : 'var(--paid-color)', fontSize: '14px' }}>
                  {formatCurrency(currentCustomer.balance)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* جدول بنود وأصناف الفاتورة المطابق للدفتر */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
              بنود الفاتورة والأصناف:
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <Plus size={15} />
              <span>إضافة سطر صنف جديد</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>م</th>
                  <th style={{ width: '110px' }}>الكود</th>
                  <th>الصــــنــف</th>
                  <th style={{ width: '100px' }}>فئة (السعر)</th>
                  <th style={{ width: '90px' }}>عدد (الكمية)</th>
                  <th style={{ width: '110px' }}>جنيه (الإجمالي)</th>
                  <th style={{ width: '45px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 800, textAlign: 'center' }}>{idx + 1}</td>

                    {/* الكود */}
                    <td>
                      <input
                        type="text"
                        placeholder="117"
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                        className="clean-input"
                        style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}
                        required
                      />
                    </td>

                    {/* الصنف */}
                    <td>
                      <input
                        type="text"
                        placeholder="اسم الموديل (مثال: موديل 117 تطريز كويتي)"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        className="clean-input"
                        style={{ padding: '6px 10px', fontWeight: 600 }}
                        required
                      />
                    </td>

                    {/* فئة (سعر القطعة) */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="95"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="clean-input"
                        style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}
                        required
                      />
                    </td>

                    {/* عدد (الكمية) */}
                    <td>
                      <input
                        type="number"
                        min="1"
                        placeholder="20"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="clean-input"
                        style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800 }}
                        required
                      />
                    </td>

                    {/* جنيه (الإجمالي) */}
                    <td style={{ fontWeight: 900, fontSize: '15px', color: 'var(--text-dark)', textAlign: 'center' }}>
                      {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                    </td>

                    {/* حذف */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: items.length > 1 ? 'pointer' : 'not-allowed',
                          opacity: items.length > 1 ? 1 : 0.3,
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* خانة الدفعة والملخص الحسابي المطابق للصورة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          {/* إدخال الدفعة المسددة */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>
              الدفعة المسددة نقداً مع الفاتورة (جنيه):
            </label>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              (اختياري — اتركها 0 إذا أردت حفظ الفاتورة أولاً ثم إدخال ما دفعه العميل لاحقاً كسند قبض)
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={paidAmount === 0 ? '' : paidAmount}
              onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="clean-input"
              style={{ fontSize: '20px', fontWeight: 900, color: 'var(--paid-color)', maxWidth: '240px' }}
              placeholder="0 جنيه"
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPaidAmount(0)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px', background: paidAmount === 0 ? '#e2e8f0' : undefined }}
              >
                بدون دفعة الآن (0 ج)
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount(grandTotalAmount)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                سداد الفاتورة بالكامل ({grandTotalAmount}ج)
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount(totalDue)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                سداد كل المستحق ({totalDue}ج)
              </button>
            </div>
          </div>

          {/* جدول الملخص الحسابي المباشر */}
          <div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '2px solid #0f172a',
              background: '#ffffff',
              fontSize: '14px',
              fontWeight: 800
            }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', background: '#f8fafc' }}>
                    اجمالي الفاتورة
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', textAlign: 'center', fontSize: '16px' }}>
                    {formatCurrency(grandTotalAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', background: '#f8fafc' }}>
                    رصيــد سـابـق
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', textAlign: 'center', fontSize: '16px' }}>
                    {formatCurrency(previousBalance)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', background: '#f8fafc' }}>
                    المجموع المستحق
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', textAlign: 'center', fontSize: '17px', fontWeight: 900 }}>
                    {formatCurrency(totalDue)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', color: 'var(--paid-color)', background: '#f0fdf4' }}>
                    الدفعة (المسدد)
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '7px 12px', textAlign: 'center', color: 'var(--paid-color)', fontSize: '16px' }}>
                    {paidAmount > 0 ? formatCurrency(paidAmount) : '0 ج'}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '2px solid #0f172a', padding: '9px 12px', background: '#fef2f2', color: 'var(--debt-color)' }}>
                    اجمالي المتبقي
                  </td>
                  <td style={{ border: '2px solid #0f172a', padding: '9px 12px', textAlign: 'center', fontSize: '19px', fontWeight: 900, color: 'var(--debt-color)' }}>
                    {formatCurrency(remainingAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* أزرار الحفظ والطباعة */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '14px', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn-main"
            style={{ padding: '12px 28px', fontSize: '16px' }}
            disabled={isSubmitting}
          >
            <Printer size={18} />
            <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة وعرضها للطباعة'}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            style={{ padding: '12px 20px', fontSize: '15px' }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};
