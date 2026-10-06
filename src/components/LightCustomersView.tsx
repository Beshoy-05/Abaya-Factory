import React, { useState } from 'react';
import type { CustomerDto, InvoiceDto } from '../types/api';
import { Search, Plus, FileText, CreditCard, Edit2, Trash2, UserPlus, Users, Boxes, Receipt } from 'lucide-react';

interface LightCustomersViewProps {
  customers: CustomerDto[];
  invoices: InvoiceDto[];
  onOpenNewCustomer: () => void;
  onSelectCustomerStatement: (customer: CustomerDto) => void;
  onSelectCustomerInvoices: (customer: CustomerDto) => void;
  onNewInvoiceForCustomer: (customer: CustomerDto) => void;
  onNewPaymentForCustomer: (customer: CustomerDto) => void;
  onEditCustomer: (customer: CustomerDto) => void;
  onDeleteCustomer: (customer: CustomerDto) => void;
  onOpenCustomerQuantitiesModal?: (customerId?: number) => void;
}

export const LightCustomersView: React.FC<LightCustomersViewProps> = ({
  customers,
  invoices,
  onOpenNewCustomer,
  onSelectCustomerStatement,
  onSelectCustomerInvoices,
  onNewInvoiceForCustomer,
  onNewPaymentForCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onOpenCustomerQuantitiesModal,
}) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card-clean" style={{ padding: '20px 24px' }}>
      {/* شريط البحث وإضافة عميل وزر استعلام كميات عميل */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="بحث باسم العميل أو المكتب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clean-input"
            style={{ paddingRight: '36px', fontSize: '13.5px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenCustomerQuantitiesModal && (
            <button
              onClick={() => onOpenCustomerQuantitiesModal()}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="استعلام إجمالي كميات وقطع عميل محدد"
            >
              <Boxes size={15} style={{ color: '#2563eb' }} />
              <span>إجمالي كميات عميل</span>
            </button>
          )}

          <button
            onClick={onOpenNewCustomer}
            className="btn-main"
            style={{ padding: '8px 18px', fontSize: '14px' }}
          >
            <UserPlus size={16} />
            <span>إضافة عميل / مكتب جديد</span>
          </button>
        </div>
      </div>

      {/* جدول العملاء والمديونيات */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Users size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>لا يوجد عملاء مطابقين للبحث</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>#</th>
                <th>اسم العميل / المكتب</th>
                <th>الرصيد والمديونية الحالية</th>
                <th>الحالة الحسابية</th>
                <th>آخر فاتورة (اضغط لفتح جميع الفواتير)</th>
                <th style={{ textAlign: 'center', width: '310px' }}>إجراءات الحساب</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isDebt = c.balance > 0;
                const isSettled = c.balance === 0;

                // Find last invoice for this customer
                const cInvoices = invoices
                  .filter((inv) => inv.customerId === c.id)
                  .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime() || b.id - a.id);
                const lastInvoice = cInvoices.length > 0 ? cInvoices[0] : null;

                return (
                  <tr key={c.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-light)', fontWeight: 700 }}>
                      {c.id}
                    </td>

                    <td style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-dark)' }}>
                      {c.name}
                    </td>

                    <td style={{ fontWeight: 900, fontSize: '16px', color: isDebt ? 'var(--debt-color)' : isSettled ? 'var(--paid-color)' : '#0284c7' }}>
                      {Math.abs(c.balance).toFixed(0)} جنيه
                    </td>

                    <td>
                      {isDebt ? (
                        <span className="badge-debt">عليه مديونية</span>
                      ) : isSettled ? (
                        <span className="badge-paid">خالص الحساب</span>
                      ) : (
                        <span style={{
                          background: '#f0f9ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}>
                          له رصيد دائن
                        </span>
                      )}
                    </td>

                    {/* عمود آخر فاتورة: عند الضغط يفتح جميع فواتيره في مكان واحد */}
                    <td>
                      {lastInvoice ? (
                        <button
                          onClick={() => onSelectCustomerInvoices(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fffbeb',
                            color: '#92400e',
                            border: '1px solid #fcd34d',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            transition: 'all 0.15s ease',
                          }}
                          title={`اضغط لفتح جميع فواتير ${c.name} (${cInvoices.length} فاتورة)`}
                        >
                          <FileText size={13} style={{ color: '#d97706' }} />
                          <span>فاتورة #{lastInvoice.id}</span>
                          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                            ({new Date(lastInvoice.invoiceDate).toLocaleDateString('ar-EG')})
                          </span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                          لا توجد فواتير بعد
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* زر فتح جميع فواتير العميل */}
                        <button
                          onClick={() => onSelectCustomerInvoices(c)}
                          className="btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderColor: '#bfdbfe',
                            fontWeight: 700
                          }}
                          title="عرض جميع فواتير هذا العميل في مكان واحد"
                        >
                          <Receipt size={13} />
                          <span>الفواتير ({cInvoices.length})</span>
                        </button>

                        <button
                          onClick={() => onNewInvoiceForCustomer(c)}
                          className="btn-main"
                          style={{ padding: '4px 9px', fontSize: '12px' }}
                          title="عمل فاتورة لهذا العميل"
                        >
                          <Plus size={13} />
                          <span>فاتورة</span>
                        </button>

                        <button
                          onClick={() => onNewPaymentForCustomer(c)}
                          className="btn-success-outline"
                          style={{ padding: '4px 9px', fontSize: '12px' }}
                          title="تسجيل دفعة مسددة"
                        >
                          <CreditCard size={13} />
                          <span>دفعة</span>
                        </button>

                        <button
                          onClick={() => onSelectCustomerStatement(c)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="كشف حساب تفصيلي"
                        >
                          <FileText size={13} />
                          <span>كشف حساب</span>
                        </button>

                        {onOpenCustomerQuantitiesModal && (
                          <button
                            onClick={() => onOpenCustomerQuantitiesModal(c.id)}
                            className="btn-secondary"
                            style={{ padding: '4px 7px', fontSize: '12px' }}
                            title="استعلام مجموع كميات وقطع هذا العميل"
                          >
                            <Boxes size={13} style={{ color: '#2563eb' }} />
                          </button>
                        )}

                        <button
                          onClick={() => onEditCustomer(c)}
                          title="تعديل الاسم"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => onDeleteCustomer(c)}
                          title="حذف"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
