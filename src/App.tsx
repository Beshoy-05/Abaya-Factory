import React, { useState, useEffect, useCallback } from 'react';
import type {
  CustomerDto,
  InvoiceDto,
  PaymentDto,
  InvoiceCreateDto,
  PaymentCreateDto,
  CustomerCreateDto,
  CustomerUpdateDto
} from './types/api';
import { apiService } from './services/api';
import { LightNavbar } from './components/LightNavbar';
import { LightStats } from './components/LightStats';
import { LightInvoicesView } from './components/LightInvoicesView';
import { LightCustomersView } from './components/LightCustomersView';
import { LightPaymentsView } from './components/LightPaymentsView';
import { SimpleInvoiceForm } from './components/SimpleInvoiceForm';
import { PaperInvoicePrint } from './components/PaperInvoicePrint';
import { LightStatementModal } from './components/LightStatementModal';
import { LightPaymentModal } from './components/LightPaymentModal';
import { LightCustomerModal } from './components/LightCustomerModal';
import { TotalSellingWidget } from './components/TotalSellingWidget';
import { ToastContainer, type ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'invoices' | 'customers' | 'payments' | 'new-invoice'>('invoices');

  // Main entity states
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<number | undefined>(undefined);

  // Modals
  const [invoiceToPrint, setInvoiceToPrint] = useState<InvoiceDto | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<CustomerDto | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalCustomerId, setPaymentModalCustomerId] = useState<number | undefined>(undefined);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto | null>(null);
  const [totalSellingModalOpen, setTotalSellingModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [custData, invData, payData] = await Promise.all([
        apiService.getCustomers(),
        apiService.getInvoices(),
        apiService.getPayments(),
      ]);
      setCustomers(custData);
      setInvoices(invData);
      setPayments(payData);
    } catch (err: any) {
      console.error('API load error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = apiService.subscribe(() => {
      fetchData();
    });
    return () => {
      unsubscribe();
    };
  }, [fetchData]);

  // Invoice Handlers
  const handleSaveAndPrintInvoice = async (dto: InvoiceCreateDto) => {
    const created = await apiService.createInvoice(dto);
    addToast('success', 'تم حفظ الفاتورة بنجاح', `فاتورة رقم #${created.id} مسجلة الآن بالدفتر`);
    await fetchData();
    // Open printable paper invoice immediately
    setInvoiceToPrint(created);
    setCurrentTab('invoices');
  };

  const handleDeleteInvoice = async (inv: InvoiceDto) => {
    if (!confirm(`هل أنت متأكد من حذف فاتورة رقم #${inv.id} الخاصة بـ "${inv.customerName}"؟ سيتم إعادة تسوية الرصيد تلقائياً.`)) return;
    try {
      await apiService.deleteInvoice(inv.id);
      addToast('success', 'تم حذف الفاتورة', `تم حذف الفاتورة #${inv.id} وتعديل رصيد العميل.`);
      await fetchData();
    } catch (err: any) {
      addToast('warning', 'فشل الحذف', err.message);
    }
  };

  // Customer Handlers
  const handleQuickAddCustomer = async (name: string): Promise<CustomerDto> => {
    const created = await apiService.createCustomer({ name });
    addToast('success', 'تم تسجيل العميل', `تمت إضافة "${created.name}" بنجاح.`);
    await fetchData();
    return created;
  };

  const handleSaveCustomer = async (
    dto: CustomerCreateDto | CustomerUpdateDto,
    isEdit: boolean,
    customerId?: number
  ) => {
    if (isEdit && customerId) {
      await apiService.updateCustomer(customerId, dto as CustomerUpdateDto);
      addToast('success', 'تم التعديل', `تم تحديث اسم العميل إلى "${dto.name}"`);
    } else {
      const created = await apiService.createCustomer(dto as CustomerCreateDto);
      addToast('success', 'تم التسجيل', `تمت إضافة العميل "${created.name}" ورصيده الابتدائي 0.00 ج.`);
    }
    await fetchData();
  };

  const handleDeleteCustomer = async (customer: CustomerDto) => {
    if (!confirm(`هل تريد حذف حساب العميل "${customer.name}"؟`)) return;
    try {
      await apiService.deleteCustomer(customer.id);
      addToast('success', 'تم حذف العميل', `تم حذف العميل #${customer.id}.`);
      await fetchData();
    } catch (err: any) {
      addToast('warning', 'لا يمكن الحذف', err.message || 'العميل لديه فواتير أو دفعات مسجلة.');
    }
  };

  // Payment Handlers
  const handleSavePayment = async (dto: PaymentCreateDto) => {
    const created = await apiService.createPayment(dto);
    addToast('success', 'تم تسجيل سند القبض', `تم تسجيل دفعة بمبلغ ${created.amount.toFixed(0)} جنيه وخصمها من مديونية العميل.`);
    await fetchData();
  };

  const handleDeletePayment = async (payment: PaymentDto) => {
    if (!confirm(`هل تريد حذف سند القبض رقم #${payment.id} بمبلغ ${payment.amount.toFixed(0)} ج؟ سيتم إعادة المبلغ لمديونية العميل.`)) return;
    try {
      await apiService.deletePayment(payment.id);
      addToast('success', 'تم حذف السند', `تم حذف سند القبض #${payment.id}.`);
      await fetchData();
    } catch (err: any) {
      addToast('warning', 'فشل الحذف', err.message);
    }
  };

  const handlePrintInvoiceById = (invoiceId: number) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) setInvoiceToPrint(inv);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* شريط التنقل العلوي الفاتح والأنيق */}
      <LightNavbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewInvoice={() => {
          setPreselectedCustomerId(undefined);
          setCurrentTab('new-invoice');
        }}
        onOpenTotalSellingModal={() => setTotalSellingModalOpen(true)}
      />

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* ملخص إحصائي خفيف ومريح للعين */}
        {currentTab !== 'new-invoice' && (
          <LightStats
            customers={customers}
            invoices={invoices}
            payments={payments}
          />
        )}

        {/* نموذج عمل فاتورة جديدة بسيطة ومباشرة */}
        {currentTab === 'new-invoice' && (
          <SimpleInvoiceForm
            customers={customers}
            initialCustomerId={preselectedCustomerId}
            onSaveAndPrint={handleSaveAndPrintInvoice}
            onCancel={() => setCurrentTab('invoices')}
            onQuickAddCustomer={handleQuickAddCustomer}
          />
        )}

        {/* عرض سجل الفواتير مع أزرار الطباعة */}
        {currentTab === 'invoices' && (
          <LightInvoicesView
            invoices={invoices}
            onOpenNewInvoice={() => {
              setPreselectedCustomerId(undefined);
              setCurrentTab('new-invoice');
            }}
            onPrintInvoice={(inv) => setInvoiceToPrint(inv)}
            onDeleteInvoice={handleDeleteInvoice}
            onNewPaymentForCustomer={(custId) => {
              setPaymentModalCustomerId(custId);
              setPaymentModalOpen(true);
            }}
          />
        )}

        {/* عرض العملاء والمديونيات */}
        {currentTab === 'customers' && (
          <LightCustomersView
            customers={customers}
            onOpenNewCustomer={() => {
              setCustomerToEdit(null);
              setCustomerModalOpen(true);
            }}
            onSelectCustomerStatement={(c) => setStatementCustomer(c)}
            onNewInvoiceForCustomer={(c) => {
              setPreselectedCustomerId(c.id);
              setCurrentTab('new-invoice');
            }}
            onNewPaymentForCustomer={(c) => {
              setPaymentModalCustomerId(c.id);
              setPaymentModalOpen(true);
            }}
            onEditCustomer={(c) => {
              setCustomerToEdit(c);
              setCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {/* عرض سندات القبض والدفعات */}
        {currentTab === 'payments' && (
          <LightPaymentsView
            payments={payments}
            onOpenNewPayment={() => {
              setPaymentModalCustomerId(undefined);
              setPaymentModalOpen(true);
            }}
            onDeletePayment={handleDeletePayment}
          />
        )}
      </main>

      {/* تذييل الصفحة الفاتح والبسيط */}
      <footer className="no-print" style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 20px',
        textAlign: 'center',
        fontSize: '12.5px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>رواء الخليج للعباية الخليجي</strong> • م / محمد صبري (01031424301)
          </div>
          <div>
            نظام إصدار الفواتير الورقية والمديونيات • متصل مع ASP.NET Core 8 Web API
          </div>
        </div>
      </footer>

      {/* نافذة الفاتورة الورقية الحقيقية الجاهزة للطباعة بنقرة واحدة */}
      {invoiceToPrint && (
        <PaperInvoicePrint
          invoice={invoiceToPrint}
          onClose={() => setInvoiceToPrint(null)}
          onRecordPayment={(custId) => {
            setPaymentModalCustomerId(custId);
            setPaymentModalOpen(true);
          }}
        />
      )}

      {/* نافذة كشف حساب العميل */}
      {statementCustomer && (
        <LightStatementModal
          customer={statementCustomer}
          onClose={() => setStatementCustomer(null)}
          onPrintInvoiceById={handlePrintInvoiceById}
        />
      )}

      {/* نافذة تسجيل دفعة نقدية (سند قبض) */}
      {paymentModalOpen && (
        <LightPaymentModal
          customers={customers}
          initialCustomerId={paymentModalCustomerId}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handleSavePayment}
        />
      )}

      {/* نافذة تسجيل عميل جديد أو تعديل الاسم */}
      {customerModalOpen && (
        <LightCustomerModal
          customerToEdit={customerToEdit}
          onClose={() => {
            setCustomerModalOpen(false);
            setCustomerToEdit(null);
          }}
          onSubmit={handleSaveCustomer}
        />
      )}

      {/* نافذة استعلام مبيعات كود موديل */}
      {totalSellingModalOpen && (
        <div className="modal-overlay" onClick={() => setTotalSellingModalOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: '640px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>
                استعلام إجمالي مبيعات كود موديل
              </div>
              <button
                onClick={() => setTotalSellingModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>
            <TotalSellingWidget />
          </div>
        </div>
      )}

      {/* التنبيهات المنبثقة */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
export default App;
