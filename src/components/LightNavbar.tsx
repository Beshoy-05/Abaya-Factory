import { useState, useEffect } from 'react';
import { FileText, Users, CreditCard, Plus, TrendingUp, Boxes, UserCheck, Hash, Wifi, WifiOff, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import abayaLogo from '../assets/abaya-logo.png';

interface LightNavbarProps {
  currentTab: 'invoices' | 'customers' | 'payments' | 'new-invoice';
  setCurrentTab: (tab: 'invoices' | 'customers' | 'payments' | 'new-invoice') => void;
  onOpenNewInvoice: () => void;
  onOpenTotalSellingModal: () => void;
  onOpenAllQuantitiesModal: () => void;
  onOpenCustomerQuantitiesModal: () => void;
  onOpenSpecificCodeModal: () => void;
}

export const LightNavbar: React.FC<LightNavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewInvoice,
  onOpenTotalSellingModal,
  onOpenAllQuantitiesModal,
  onOpenCustomerQuantitiesModal,
  onOpenSpecificCodeModal,
}) => {
  const [isOffline, setIsOffline] = useState(apiService.isOperatingOffline());
  const [pendingCount, setPendingCount] = useState(apiService.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(apiService.isSyncInProgress());

  useEffect(() => {
    const unsub = apiService.subscribe(() => {
      setIsOffline(apiService.isOperatingOffline());
      setPendingCount(apiService.getPendingCount());
      setIsSyncing(apiService.isSyncInProgress());
    });
    return unsub;
  }, []);

  const handleSync = async () => {
    const result = await apiService.syncPendingQueue();
    if (result.syncedCount > 0) {
      alert(`تمت مزامنة ورفع ${result.syncedCount} عملية إلى السيرفر بنجاح ✅`);
    } else if (result.errors.length > 0) {
      alert(`تعذرت المزامنة: تأكد من اتصال الإنترنت بالسيرفر أولاً.`);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = apiService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_رواء_الخليج_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleOfflineMode = () => {
    const next = !isOffline;
    apiService.setOfflineMode(next);
    setIsOffline(next);
  };

  return (
    <header className="no-print" style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* الشعار واسم المصنع وحالة الاتصال */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#ffffff',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <img src={abayaLogo} alt="لوجو العباية" style={{ height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-dark)' }}>
                رواء الخليج
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                للعباية الخليجي
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>إدارة الفواتير والمديونيات</span>
              <span>•</span>
              <span style={{ direction: 'ltr', fontWeight: 600 }}>01031424301 ✆</span>
            </div>
          </div>

          {/* شارة حالة الاتصال (أونلاين / أوفلاين) */}
          <button
            onClick={toggleOfflineMode}
            title={isOffline ? 'يعمل بدون إنترنت (محلياً على الكمبيوتر). اضغط للمحاولة عبر السيرفر' : 'متصل بالسيرفر المركزي. اضغط للتحويل إلى الوضع المحلي بدون نت'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: isOffline ? '1px solid #fed7aa' : '1px solid #bbf7d0',
              background: isOffline ? '#fff7ed' : '#f0fdf4',
              color: isOffline ? '#c2410c' : '#15803d',
              transition: 'all 0.2s ease',
            }}
          >
            {isOffline ? (
              <>
                <WifiOff size={13} style={{ color: '#ea580c' }} />
                <span>وضع محلي (أوفلاين)</span>
              </>
            ) : (
              <>
                <Wifi size={13} style={{ color: '#16a34a' }} />
                <span>متصل بالسيرفر (أونلاين)</span>
              </>
            )}
          </button>

          {/* زر مزامنة العمليات المعلقة (لو عمل فواتير بدون نت) */}
          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="توجد عمليات تم إجراؤها بدون نت. اضغط لرفعها وحفظها على السيرفر الآن"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 11px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                border: '1px solid #93c5fd',
                background: '#eff6ff',
                color: '#1d4ed8',
                boxShadow: '0 1px 3px rgba(29, 78, 216, 0.15)',
              }}
            >
              <RefreshCw size={12} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSyncing ? 'جاري المزامنة...' : `مزامنة للسيرفر (${pendingCount})`}</span>
            </button>
          )}
        </div>

        {/* أزرار التبويب الرئيسية الفاتحة والمريحة */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <button
            onClick={() => setCurrentTab('invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'invoices' ? '#ffffff' : 'transparent',
              color: currentTab === 'invoices' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'invoices' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <FileText size={16} />
            <span>سجل الفواتير</span>
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'customers' ? '#ffffff' : 'transparent',
              color: currentTab === 'customers' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'customers' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Users size={16} />
            <span>العملاء والمديونيات</span>
          </button>

          <button
            onClick={() => setCurrentTab('payments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '7px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: currentTab === 'payments' ? '#ffffff' : 'transparent',
              color: currentTab === 'payments' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentTab === 'payments' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <CreditCard size={16} />
            <span>سندات القبض</span>
          </button>
        </nav>

        {/* أزرار الإحصائيات وعمل فاتورة جديدة */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenAllQuantitiesModal}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="استعلام إجمالي كميات وقطع كل الفواتير"
          >
            <Boxes size={15} style={{ color: '#16a34a' }} />
            <span>إجمالي كميات الفواتير</span>
          </button>

          <button
            onClick={onOpenCustomerQuantitiesModal}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="استعلام إجمالي كميات وقطع عميل محدد"
          >
            <UserCheck size={15} style={{ color: '#2563eb' }} />
            <span>إجمالي كميات عميل</span>
          </button>

          <button
            onClick={onOpenTotalSellingModal}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="استعلام إجمالي مبيعات كود موديل"
          >
            <TrendingUp size={15} style={{ color: 'var(--primary)' }} />
            <span>مبيعات كود موديل</span>
          </button>

          <button
            onClick={onOpenSpecificCodeModal}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="استعلام إجمالي كميات كود موديل محدد عبر السيرفر (sum-specific-code/{itemCode})"
          >
            <Hash size={15} style={{ color: '#0f766e' }} />
            <span>كمية كود محدد</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="حفظ نسخة احتياطية من كل الحسابات والفواتير والعملاء على جهازك"
          >
            <Download size={15} style={{ color: '#0284c7' }} />
            <span>نسخ احتياطي</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="btn-main"
            style={{ padding: '9px 18px', fontSize: '14px' }}
          >
            <Plus size={17} />
            <span>عمل فاتورة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
