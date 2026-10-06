import {
  CustomerDto,
  CustomerCreateDto,
  CustomerUpdateDto,
  CustomerDetailDto,
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
  PaymentDto,
  PaymentCreateDto,
  PaymentUpdateDto,
} from '../types/api';
import { INITIAL_CUSTOMERS, INITIAL_INVOICES, INITIAL_PAYMENTS } from '../data/mockData';

// Configuration state
const STORAGE_PREFIX = 'abaya_atelier_';

export interface ApiConfig {
  baseUrl: string;
  isMockMode: boolean;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://rawaa-elkhaleeg.runasp.net',
  isMockMode: false,
};

class ApiService {
  private config: ApiConfig;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.config = {
      baseUrl: DEFAULT_CONFIG.baseUrl,
      isMockMode: false,
    };
    this.config.baseUrl = this.config.baseUrl.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_PREFIX + 'config', JSON.stringify(this.config));
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public setConfig(newConfig: Partial<ApiConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(STORAGE_PREFIX + 'config', JSON.stringify(this.config));
    this.notifyChange();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyChange() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Local mock storage management with Zero-Conflict Accounting ---
  private initMockStore() {
    if (!localStorage.getItem(STORAGE_PREFIX + 'customers')) {
      localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'invoices')) {
      localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(INITIAL_INVOICES));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'payments')) {
      localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(INITIAL_PAYMENTS));
    }
  }

  public resetMockData() {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(INITIAL_PAYMENTS));
    this.notifyChange();
  }

  private getMockCustomers(): CustomerDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'customers');
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  }

  private saveMockCustomers(customers: CustomerDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }

  private getMockInvoices(): InvoiceDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'invoices');
    return data ? JSON.parse(data) : INITIAL_INVOICES;
  }

  private saveMockInvoices(invoices: InvoiceDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
  }

  private getMockPayments(): PaymentDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'payments');
    return data ? JSON.parse(data) : INITIAL_PAYMENTS;
  }

  private saveMockPayments(payments: PaymentDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(payments));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const base = (this.config.baseUrl || '').replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${base}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorMsg = `Server error ${response.status}: ${response.statusText}`;
        try {
          const errText = await response.text();
          if (errText) {
            try {
              const errData = JSON.parse(errText);
              if (errData.errors) {
                errorMsg = Object.values(errData.errors).flat().join(', ');
              } else if (errData.message) {
                errorMsg = errData.message;
              } else if (errData.title) {
                errorMsg = errData.title;
              }
            } catch {
              errorMsg = errText;
            }
          }
        } catch {
          // fallback text
        }
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      const text = await response.text();
      if (!text || !text.trim()) {
        return null as unknown as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (err: unknown) {
      if (!this.config.isMockMode) {
        console.warn(`[API fetch failed on ${endpoint}], you may switch to Demo Mode`, err);
      }
      throw err;
    }
  }

  // ===================== CUSTOMERS API =====================

  async getCustomers(): Promise<CustomerDto[]> {
    if (this.config.isMockMode) {
      return this.getMockCustomers();
    }
    return this.request<CustomerDto[]>('/api/Customers');
  }

  async getCustomer(id: number): Promise<CustomerDto> {
    if (this.config.isMockMode) {
      const c = this.getMockCustomers().find((item) => item.id === id);
      if (!c) throw new Error(`Customer with ID ${id} not found.`);
      return c;
    }
    return this.request<CustomerDto>(`/api/Customers/${id}`);
  }

  async getCustomerDetails(id: number): Promise<CustomerDetailDto> {
    if (this.config.isMockMode) {
      const customer = this.getMockCustomers().find((item) => item.id === id);
      if (!customer) throw new Error(`Customer with ID ${id} not found.`);

      const invoices = this.getMockInvoices()
        .filter((inv) => inv.customerId === id)
        .map((inv) => ({
          id: inv.id,
          invoiceDate: inv.invoiceDate,
          grandTotalAmount: inv.grandTotalAmount,
          paidAmount: inv.paidAmount,
          remainingAmount: inv.remainingAmount,
          itemsCount: inv.items.length,
        }));

      const payments = this.getMockPayments().filter((p) => p.customerId === id);

      return {
        id: customer.id,
        name: customer.name,
        balance: customer.balance,
        invoices,
        payments,
      };
    }
    return this.request<CustomerDetailDto>(`/api/Customers/${id}/details`);
  }

  async createCustomer(dto: CustomerCreateDto): Promise<CustomerDto> {
    if (this.config.isMockMode) {
      const customers = this.getMockCustomers();
      const newCustomer: CustomerDto = {
        id: customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1,
        name: dto.name.trim(),
        balance: 0.0,
      };
      customers.push(newCustomer);
      this.saveMockCustomers(customers);
      this.notifyChange();
      return newCustomer;
    }

    const created = await this.request<CustomerDto>('/api/Customers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
    return created;
  }

  async updateCustomer(id: number, dto: CustomerUpdateDto): Promise<void> {
    if (this.config.isMockMode) {
      const customers = this.getMockCustomers();
      const index = customers.findIndex((c) => c.id === id);
      if (index === -1) throw new Error(`Customer with ID ${id} not found.`);
      customers[index].name = dto.name.trim();
      this.saveMockCustomers(customers);

      // also sync customer name across invoices & payments
      const invoices = this.getMockInvoices().map((inv) =>
        inv.customerId === id ? { ...inv, customerName: dto.name.trim() } : inv
      );
      this.saveMockInvoices(invoices);

      const payments = this.getMockPayments().map((p) =>
        p.customerId === id ? { ...p, customerName: dto.name.trim() } : p
      );
      this.saveMockPayments(payments);

      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
  }

  async deleteCustomer(id: number): Promise<void> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices().filter((inv) => inv.customerId === id);
      const payments = this.getMockPayments().filter((p) => p.customerId === id);
      if (invoices.length > 0 || payments.length > 0) {
        throw new Error('Cannot delete customer with existing invoices or payments.');
      }

      let customers = this.getMockCustomers();
      customers = customers.filter((c) => c.id !== id);
      this.saveMockCustomers(customers);
      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Customers/${id}`, {
      method: 'DELETE',
    });
    this.notifyChange();
  }

  // ===================== INVOICES API =====================

  async getInvoices(): Promise<InvoiceDto[]> {
    if (this.config.isMockMode) {
      const list = this.getMockInvoices();
      return [...list].sort(
        (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
    }
    return this.request<InvoiceDto[]>('/api/Invoices');
  }

  async getInvoice(id: number): Promise<InvoiceDto> {
    if (this.config.isMockMode) {
      const inv = this.getMockInvoices().find((item) => item.id === id);
      if (!inv) throw new Error(`Invoice with ID ${id} not found.`);
      return inv;
    }
    return this.request<InvoiceDto>(`/api/Invoices/${id}`);
  }

  async getInvoicesByCustomer(customerId: number): Promise<InvoiceDto[]> {
    if (this.config.isMockMode) {
      return this.getMockInvoices()
        .filter((inv) => inv.customerId === customerId)
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }
    return this.request<InvoiceDto[]>(`/api/Invoices/customer/${customerId}`);
  }

  async getItemTotalSelling(itemCode: string): Promise<number> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices();
      let total = 0;
      for (const inv of invoices) {
        for (const item of inv.items) {
          if (item.itemCode.toLowerCase().trim() === itemCode.toLowerCase().trim()) {
            total += item.totalPrice;
          }
        }
      }
      return total;
    }
    return this.request<number>(`/api/Invoices/total-selling/${encodeURIComponent(itemCode)}`);
  }

  async getSumOfQuantitiesOfAllInvoices(): Promise<number> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices();
      return invoices.reduce((sum, inv) => {
        return sum + (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      }, 0);
    }
    return this.request<number>('/api/Invoices/sum-quantities');
  }

  async getSumOfQuantitiesOfOneCustomer(customerId: number): Promise<number> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices().filter((inv) => inv.customerId === customerId);
      return invoices.reduce((sum, inv) => {
        return sum + (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      }, 0);
    }
    return this.request<number>(`/api/Invoices/sum-quantities/${customerId}`);
  }

  async getSumOfSpecificCode(itemCode: string): Promise<number> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices();
      let total = 0;
      for (const inv of invoices) {
        for (const item of inv.items || []) {
          if (item.itemCode && item.itemCode.toLowerCase().trim() === itemCode.toLowerCase().trim()) {
            total += Number(item.quantity) || 0;
          }
        }
      }
      return total;
    }
    return this.request<number>(`/api/Invoices/sum-specific-code/${encodeURIComponent(itemCode.trim())}`);
  }

  async createInvoice(dto: InvoiceCreateDto): Promise<InvoiceDto> {
    if (this.config.isMockMode) {
      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === dto.customerId);
      if (!customer) throw new Error(`Customer with ID ${dto.customerId} not found.`);

      const previousBalance = customer.balance;
      const itemsWithTotals = dto.items.map((item, idx) => ({
        id: Date.now() + idx,
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: Number((item.quantity * item.unitPrice).toFixed(2)),
      }));

      const grandTotalAmount = Number(
        itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
      );
      const totalDue = Number((previousBalance + grandTotalAmount).toFixed(2));
      const paidAmount = Number(dto.paidAmount.toFixed(2));
      const remainingAmount = Number((totalDue - paidAmount).toFixed(2));

      // Business Rule 2.1: customer.Balance += (GrandTotalAmount - PaidAmount)
      customer.balance = Number((customer.balance + (grandTotalAmount - paidAmount)).toFixed(2));
      this.saveMockCustomers(customers);

      const invoices = this.getMockInvoices();
      const newInvoice: InvoiceDto = {
        id: invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 101,
        customerId: customer.id,
        customerName: customer.name,
        invoiceDate: dto.invoiceDate || new Date().toISOString(),
        previousBalance,
        grandTotalAmount,
        totalDue,
        paidAmount,
        remainingAmount,
        items: itemsWithTotals,
      };

      invoices.unshift(newInvoice);
      this.saveMockInvoices(invoices);
      this.notifyChange();
      return newInvoice;
    }

    const created = await this.request<InvoiceDto>('/api/Invoices', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
    return created;
  }

  async updateInvoice(id: number, dto: InvoiceUpdateDto): Promise<void> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices();
      const invIndex = invoices.findIndex((i) => i.id === id);
      if (invIndex === -1) throw new Error(`Invoice with ID ${id} not found.`);
      const oldInv = invoices[invIndex];

      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === oldInv.customerId);
      if (!customer) throw new Error(`Customer not found for invoice.`);

      const itemsWithTotals = dto.items.map((item, idx) => ({
        id: Date.now() + idx,
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: Number((item.quantity * item.unitPrice).toFixed(2)),
      }));

      const grandTotalAmount = Number(
        itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
      );
      const paidAmount = Number(dto.paidAmount.toFixed(2));
      const totalDue = Number((oldInv.previousBalance + grandTotalAmount).toFixed(2));
      const remainingAmount = Number((totalDue - paidAmount).toFixed(2));

      // Business Rule 2.1: customer.Balance += (NewNet - OldNet)
      const oldNet = oldInv.grandTotalAmount - oldInv.paidAmount;
      const newNet = grandTotalAmount - paidAmount;
      customer.balance = Number((customer.balance + (newNet - oldNet)).toFixed(2));
      this.saveMockCustomers(customers);

      invoices[invIndex] = {
        ...oldInv,
        invoiceDate: dto.invoiceDate,
        paidAmount,
        grandTotalAmount,
        totalDue,
        remainingAmount,
        items: itemsWithTotals,
      };
      this.saveMockInvoices(invoices);
      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
  }

  async deleteInvoice(id: number): Promise<void> {
    if (this.config.isMockMode) {
      const invoices = this.getMockInvoices();
      const inv = invoices.find((i) => i.id === id);
      if (!inv) throw new Error(`Invoice with ID ${id} not found.`);

      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === inv.customerId);
      if (customer) {
        // Business Rule 2.1: customer.Balance -= (GrandTotalAmount - PaidAmount)
        const net = inv.grandTotalAmount - inv.paidAmount;
        customer.balance = Number((customer.balance - net).toFixed(2));
        this.saveMockCustomers(customers);
      }

      const filtered = invoices.filter((i) => i.id !== id);
      this.saveMockInvoices(filtered);
      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Invoices/${id}`, {
      method: 'DELETE',
    });
    this.notifyChange();
  }

  // ===================== PAYMENTS API =====================

  async getPayments(): Promise<PaymentDto[]> {
    if (this.config.isMockMode) {
      const list = this.getMockPayments();
      return [...list].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
    }
    return this.request<PaymentDto[]>('/api/Payments');
  }

  async getPayment(id: number): Promise<PaymentDto> {
    if (this.config.isMockMode) {
      const p = this.getMockPayments().find((item) => item.id === id);
      if (!p) throw new Error(`Payment with ID ${id} not found.`);
      return p;
    }
    return this.request<PaymentDto>(`/api/Payments/${id}`);
  }

  async getPaymentsByCustomer(customerId: number): Promise<PaymentDto[]> {
    if (this.config.isMockMode) {
      return this.getMockPayments()
        .filter((p) => p.customerId === customerId)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    }
    return this.request<PaymentDto[]>(`/api/Payments/customer/${customerId}`);
  }

  async createPayment(dto: PaymentCreateDto): Promise<PaymentDto> {
    if (this.config.isMockMode) {
      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === dto.customerId);
      if (!customer) throw new Error(`Customer with ID ${dto.customerId} not found.`);

      const amount = Number(dto.amount.toFixed(2));
      // Business Rule 2.1: customer.Balance -= payment.Amount
      customer.balance = Number((customer.balance - amount).toFixed(2));
      this.saveMockCustomers(customers);

      const payments = this.getMockPayments();
      const newPayment: PaymentDto = {
        id: payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1,
        customerId: customer.id,
        customerName: customer.name,
        amount,
        paymentDate: dto.paymentDate || new Date().toISOString(),
      };

      payments.unshift(newPayment);
      this.saveMockPayments(payments);

      // Apply payment to latest invoice of this customer in mock mode
      const invoices = this.getMockInvoices();
      const customerInvoices = invoices.filter((i) => i.customerId === dto.customerId);
      if (customerInvoices.length > 0) {
        customerInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime() || b.id - a.id);
        const latest = customerInvoices[0];
        const invIndex = invoices.findIndex((i) => i.id === latest.id);
        if (invIndex !== -1) {
          invoices[invIndex].paidAmount = Number((invoices[invIndex].paidAmount + amount).toFixed(2));
          invoices[invIndex].remainingAmount = Number((invoices[invIndex].totalDue - invoices[invIndex].paidAmount).toFixed(2));
          this.saveMockInvoices(invoices);
        }
      }

      this.notifyChange();
      return newPayment;
    }

    const created = await this.request<PaymentDto>('/api/Payments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
    return created;
  }

  async updatePayment(id: number, dto: PaymentUpdateDto): Promise<void> {
    if (this.config.isMockMode) {
      const payments = this.getMockPayments();
      const pIndex = payments.findIndex((p) => p.id === id);
      if (pIndex === -1) throw new Error(`Payment with ID ${id} not found.`);
      const oldPayment = payments[pIndex];

      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === oldPayment.customerId);
      if (customer) {
        // Business Rule 2.1: customer.Balance += (OldAmount - NewAmount)
        const oldAmount = oldPayment.amount;
        const newAmount = Number(dto.amount.toFixed(2));
        customer.balance = Number((customer.balance + (oldAmount - newAmount)).toFixed(2));
        this.saveMockCustomers(customers);
      }

      payments[pIndex] = {
        ...oldPayment,
        amount: Number(dto.amount.toFixed(2)),
        paymentDate: dto.paymentDate,
      };
      this.saveMockPayments(payments);
      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    this.notifyChange();
  }

  async deletePayment(id: number): Promise<void> {
    if (this.config.isMockMode) {
      const payments = this.getMockPayments();
      const p = payments.find((item) => item.id === id);
      if (!p) throw new Error(`Payment with ID ${id} not found.`);

      const customers = this.getMockCustomers();
      const customer = customers.find((c) => c.id === p.customerId);
      if (customer) {
        // Business Rule 2.1: customer.Balance += payment.Amount (Re-adds payment to debt)
        customer.balance = Number((customer.balance + p.amount).toFixed(2));
        this.saveMockCustomers(customers);
      }

      const filtered = payments.filter((item) => item.id !== id);
      this.saveMockPayments(filtered);
      this.notifyChange();
      return;
    }

    await this.request<void>(`/api/Payments/${id}`, {
      method: 'DELETE',
    });
    this.notifyChange();
  }
}

export const apiService = new ApiService();
