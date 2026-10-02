import React, { useState } from 'react';
import { CustomerDto } from '../types/api';
import {
  Search,
  Plus,
  FileText,
  CreditCard,
  Receipt,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Building2
} from 'lucide-react';

interface CustomersViewProps {
  customers: CustomerDto[];
  onSelectCustomerDetails: (customer: CustomerDto) => void;
  onNewInvoiceForCustomer: (customer: CustomerDto) => void;
  onNewPaymentForCustomer: (customer: CustomerDto) => void;
  onEditCustomer: (customer: CustomerDto) => void;
  onDeleteCustomer: (customer: CustomerDto) => void;
  onOpenNewCustomerModal: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomerDetails,
  onNewInvoiceForCustomer,
  onNewPaymentForCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onOpenNewCustomerModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebt, setFilterDebt] = useState<'all' | 'debt' | 'settled' | 'credit'>('all');
  const [sortBy, setSortBy] = useState<'balance-desc' | 'balance-asc' | 'name'>('balance-desc');

  const filtered = customers
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterDebt === 'debt') return c.balance > 0;
      if (filterDebt === 'settled') return c.balance === 0;
      if (filterDebt === 'credit') return c.balance < 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'balance-desc') return b.balance - a.balance;
      if (sortBy === 'balance-asc') return a.balance - b.balance;
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      {/* Top Filter and Actions Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search boutique or atelier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="atelier-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterDebt('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: filterDebt === 'all' ? 'var(--gold-subtle)' : 'transparent',
              borderColor: filterDebt === 'all' ? 'var(--gold-primary)' : 'rgba(212, 163, 89, 0.2)',
              color: filterDebt === 'all' ? 'var(--gold-light)' : 'var(--text-soft)'
            }}
          >
            All Boutiques ({customers.length})
          </button>

          <button
            onClick={() => setFilterDebt('debt')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: filterDebt === 'debt' ? 'var(--terracotta-bg)' : 'transparent',
              borderColor: filterDebt === 'debt' ? 'var(--terracotta-accent)' : 'rgba(196, 93, 62, 0.25)',
              color: filterDebt === 'debt' ? 'var(--terracotta-light)' : 'var(--text-soft)'
            }}
          >
            In Debt ({customers.filter((c) => c.balance > 0).length})
          </button>

          <button
            onClick={() => setFilterDebt('settled')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: filterDebt === 'settled' ? 'var(--malachite-bg)' : 'transparent',
              borderColor: filterDebt === 'settled' ? 'var(--malachite-accent)' : 'rgba(46, 128, 87, 0.25)',
              color: filterDebt === 'settled' ? 'var(--malachite-light)' : 'var(--text-soft)'
            }}
          >
            Settled ({customers.filter((c) => c.balance === 0).length})
          </button>

          <button
            onClick={() => setFilterDebt('credit')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: filterDebt === 'credit' ? 'var(--lapis-bg)' : 'transparent',
              borderColor: filterDebt === 'credit' ? 'var(--lapis-accent)' : 'rgba(58, 117, 164, 0.25)',
              color: filterDebt === 'credit' ? 'var(--lapis-light)' : 'var(--text-soft)'
            }}
          >
            Credit Balance ({customers.filter((c) => c.balance < 0).length})
          </button>
        </div>

        {/* Sort & Register Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="atelier-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '12px' }}
          >
            <option value="balance-desc">Sort: Highest Debt</option>
            <option value="balance-asc">Sort: Lowest Debt</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          <button
            onClick={onOpenNewCustomerModal}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Register Client</span>
          </button>
        </div>
      </div>

      {/* Boutiques Grid */}
      {filtered.length === 0 ? (
        <div className="atelier-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Building2 size={38} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-pure)', marginBottom: '6px' }}>
            No Boutiques Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px', margin: '0 auto 18px auto' }}>
            No client accounts match the current filter or search criteria.
          </p>
          <button onClick={onOpenNewCustomerModal} className="btn-primary">
            <Plus size={16} />
            <span>Register New Client</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map((customer) => {
            const isDebt = customer.balance > 0;
            const isSettled = customer.balance === 0;
            const isCredit = customer.balance < 0;

            return (
              <div
                key={customer.id}
                className="atelier-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isDebt
                    ? '4px solid var(--terracotta-accent)'
                    : isSettled
                    ? '4px solid var(--malachite-accent)'
                    : '4px solid var(--lapis-accent)',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          #{customer.id}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--gold-deep)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Boutique Partner
                        </span>
                      </div>
                      <h3 style={{ fontSize: '17px', color: 'var(--text-pure)', marginTop: '3px' }}>
                        {customer.name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => onEditCustomer(customer)}
                        title="Edit Boutique Name"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(customer)}
                        title="Delete Boutique"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Net Debt Status Pill & Balance */}
                  <div style={{
                    background: 'rgba(18, 14, 12, 0.8)',
                    border: '1px solid rgba(212, 163, 89, 0.14)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Current Net Balance (المديونية)
                      </div>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        marginTop: '2px',
                        color: isDebt
                          ? 'var(--terracotta-light)'
                          : isSettled
                          ? 'var(--malachite-light)'
                          : 'var(--lapis-light)',
                      }}>
                        ${Math.abs(customer.balance).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      {isDebt && (
                        <span className="badge-debt">
                          <AlertTriangle size={12} />
                          <span>Debt Owed</span>
                        </span>
                      )}
                      {isSettled && (
                        <span className="badge-settled">
                          <CheckCircle2 size={12} />
                          <span>Account Clear</span>
                        </span>
                      )}
                      {isCredit && (
                        <span className="badge-credit">
                          <ArrowUpDown size={12} />
                          <span>Credit Overpaid</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid rgba(212, 163, 89, 0.12)',
                  paddingTop: '12px'
                }}>
                  <button
                    onClick={() => onSelectCustomerDetails(customer)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
                  >
                    <FileText size={14} />
                    <span>Statement</span>
                  </button>

                  <button
                    onClick={() => onNewInvoiceForCustomer(customer)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
                  >
                    <Receipt size={14} />
                    <span>Invoice</span>
                  </button>

                  <button
                    onClick={() => onNewPaymentForCustomer(customer)}
                    className="btn-malachite"
                    style={{ padding: '7px 10px', fontSize: '12px' }}
                  >
                    <CreditCard size={14} />
                    <span>Pay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
