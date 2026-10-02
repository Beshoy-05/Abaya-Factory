import React, { useState } from 'react';
import type { CustomerDto } from '../types/api';
import { Search, Plus, FileText, CreditCard, Edit2, Trash2, UserPlus, Users } from 'lucide-react';

interface LightCustomersViewProps {
  customers: CustomerDto[];
  onOpenNewCustomer: () => void;
  onSelectCustomerStatement: (customer: CustomerDto) => void;
  onNewInvoiceForCustomer: (customer: CustomerDto) => void;
  onNewPaymentForCustomer: (customer: CustomerDto) => void;
  onEditCustomer: (customer: CustomerDto) => void;
  onDeleteCustomer: (customer: CustomerDto) => void;
}

export const LightCustomersView: React.FC<LightCustomersViewProps> = ({
  customers,
  onOpenNewCustomer,
  onSelectCustomerStatement,
  onNewInvoiceForCustomer,
  onNewPaymentForCustomer,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card-clean" style={{ padding: '20px 24px' }}>
      {/* شريط البحث وإضافة عميل */}
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

        <button
          onClick={onOpenNewCustomer}
          className="btn-main"
          style={{ padding: '8px 18px', fontSize: '14px' }}
        >
          <UserPlus size={16} />
          <span>إضافة عميل / مكتب جديد</span>
        </button>
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
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th>اسم العميل / المكتب</th>
                <th>الرصيد والمديونية الحالية</th>
                <th>الحالة الحسابية</th>
                <th style={{ textAlign: 'center', width: '280px' }}>إجراءات الحساب</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isDebt = c.balance > 0;
                const isSettled = c.balance === 0;

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

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => onNewInvoiceForCustomer(c)}
                          className="btn-main"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          title="عمل فاتورة لهذا العميل"
                        >
                          <Plus size={13} />
                          <span>فاتورة</span>
                        </button>

                        <button
                          onClick={() => onNewPaymentForCustomer(c)}
                          className="btn-success-outline"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
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

                        <button
                          onClick={() => onEditCustomer(c)}
                          title="تعديل الاسم"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => onDeleteCustomer(c)}
                          title="حذف"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={15} />
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
