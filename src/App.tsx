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
import { CustomerInvoicesModal } from './components/CustomerInvoicesModal';
import { QuantitiesModal } from './components/QuantitiesModal';
import { SpecificCodeModal } from './components/SpecificCodeModal';
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
  const [customerForInvoicesModal, setCustomerForInvoicesModal] = useState<CustomerDto | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalCustomerId, setPaymentModalCustomerId] = useState<number | undefined>(undefined);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto | null>(null);
  const [totalSellingModalOpen, setTotalSellingModalOpen] = useState(false);
  const [quantitiesModalOpen, setQuantitiesModalOpen] = useState(false);
  const [quantitiesModalTab, setQuantitiesModalTab] = useState<'all' | 'customer' | 'code'>('all');
  const [quantitiesModalCustomerId, setQuantitiesModalCustomerId] = useState<number | undefined>(undefined);
  const [specificCodeModalOpen, setSpecificCodeModalOpen] = useState(false);
  const [specificCodeToQuery, setSpecificCodeToQuery] = useState<string>('117');

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
      if (customerForInvoicesModal && customerForInvoicesModal.id === inv.customerId) {
        const updatedCusts = await apiService.getCustomers();
        const updatedCust = updatedCusts.find((c) => c.id === inv.customerId);
        if (updatedCust) {
          setCustomerForInvoicesModal(updatedCust);
        }
      }
    } catch (err: any) {
      addToast('warning', 'فشل الحذف', err.message || 'حدث خطأ أثناء حذف الفاتورة');
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

  const handleOpenCustomerInvoices = (customer: CustomerDto) => {
    setCustomerForInvoicesModal(customer);
  };

  const handleOpenCustomerInvoicesById = (customerId: number) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setCustomerForInvoicesModal(cust);
    }
  };

  const handleOpenAllQuantities = () => {
    setQuantitiesModalTab('all');
    setQuantitiesModalOpen(true);
  };

  const handleOpenCustomerQuantities = (customerId?: number) => {
    setQuantitiesModalTab('customer');
    setQuantitiesModalCustomerId(customerId);
    setQuantitiesModalOpen(true);
  };

  const handleOpenSpecificCode = (code?: string) => {
    if (code) {
      setSpecificCodeToQuery(code);
    }
    setSpecificCodeModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* شريط التنقل العلوي الفاتح والأنيق مع أزرار استعلام الكميات */}
      <LightNavbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewInvoice={() => {
          setPreselectedCustomerId(undefined);
          setCurrentTab('new-invoice');
        }}
        onOpenTotalSellingModal={() => setTotalSellingModalOpen(true)}
        onOpenAllQuantitiesModal={handleOpenAllQuantities}
        onOpenCustomerQuantitiesModal={() => handleOpenCustomerQuantities()}
        onOpenSpecificCodeModal={() => handleOpenSpecificCode()}
      />

      {/* المحتوى الرئيسي */}
      <main className="no-print" style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* ملخص إحصائي خفيف ومريح للعين مع بطاقة إجمالي قطع الفواتير */}
        {currentTab !== 'new-invoice' && (
          <LightStats
            customers={customers}
            invoices={invoices}
            payments={payments}
            onOpenAllQuantities={handleOpenAllQuantities}
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

        {/* عرض سجل الفواتير مع أزرار الطباعة وزر إجمالي كميات الفواتير */}
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
            onOpenAllQuantitiesModal={handleOpenAllQuantities}
            onSelectCustomerInvoices={handleOpenCustomerInvoicesById}
            onOpenSpecificCodeModal={handleOpenSpecificCode}
          />
        )}

        {/* عرض العملاء والمديونيات مع عمود آخر فاتورة وزر إجمالي كميات عميل */}
        {currentTab === 'customers' && (
          <LightCustomersView
            customers={customers}
            invoices={invoices}
            onOpenNewCustomer={() => {
              setCustomerToEdit(null);
              setCustomerModalOpen(true);
            }}
            onSelectCustomerStatement={(c) => setStatementCustomer(c)}
            onSelectCustomerInvoices={handleOpenCustomerInvoices}
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
            onOpenCustomerQuantitiesModal={handleOpenCustomerQuantities}
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
            نظام إصدار الفواتير الورقية والمديونيات • مصنع رواء الخليج
          </div>
        </div>
      </footer>

      {/* نافذة الفاتورة الورقية الحقيقية الجاهزة للطباعة بنقرة واحدة */}
      {invoiceToPrint && (
        <PaperInvoicePrint
          invoice={invoiceToPrint}
          isLatestInvoice={
            !invoices.some(
              (i) =>
                i.customerId === invoiceToPrint.customerId &&
                (new Date(i.invoiceDate).getTime() > new Date(invoiceToPrint.invoiceDate).getTime() ||
                  (new Date(i.invoiceDate).getTime() === new Date(invoiceToPrint.invoiceDate).getTime() && i.id > invoiceToPrint.id))
            )
          }
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

      {/* نافذة تسجيل دفعة نقدية (سند قبض) — السداد يكون على آخر فاتورة */}
      {paymentModalOpen && (
        <LightPaymentModal
          customers={customers}
          invoices={invoices}
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

      {/* نافذة عرض جميع فواتير العميل في مكان واحد عند النقر على آخر فاتورة */}
      {customerForInvoicesModal && (
        <CustomerInvoicesModal
          customer={customerForInvoicesModal}
          invoices={invoices}
          onClose={() => setCustomerForInvoicesModal(null)}
          onPrintInvoice={(inv) => setInvoiceToPrint(inv)}
          onDeleteInvoice={handleDeleteInvoice}
          onNewInvoice={(c) => {
            setCustomerForInvoicesModal(null);
            setPreselectedCustomerId(c.id);
            setCurrentTab('new-invoice');
          }}
          onNewPayment={(custId) => {
            setPaymentModalCustomerId(custId);
            setPaymentModalOpen(true);
          }}
          onOpenStatement={(c) => {
            setCustomerForInvoicesModal(null);
            setStatementCustomer(c);
          }}
        />
      )}

      {/* نافذة استعلام إجمالي الكميات (لجميع الفواتير ولعميل محدد عبر الـ API) */}
      {quantitiesModalOpen && (
        <QuantitiesModal
          initialTab={quantitiesModalTab}
          initialCustomerId={quantitiesModalCustomerId}
          initialCode={specificCodeToQuery}
          customers={customers}
          invoices={invoices}
          onClose={() => setQuantitiesModalOpen(false)}
          onOpenCustomerInvoices={(c) => {
            setQuantitiesModalOpen(false);
            handleOpenCustomerInvoices(c);
          }}
        />
      )}

      {/* نافذة استعلام إجمالي كميات كود محدد عبر السيرفر (sum-specific-code/{itemCode}) */}
      {specificCodeModalOpen && (
        <SpecificCodeModal
          initialCode={specificCodeToQuery}
          invoices={invoices}
          onClose={() => setSpecificCodeModalOpen(false)}
          onOpenInvoice={(inv) => setInvoiceToPrint(inv)}
        />
      )}

      {/* التنبيهات المنبثقة */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
export default App;
