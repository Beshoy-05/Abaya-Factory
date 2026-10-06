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

export interface PendingAction {
  id: string;
  type: 'CREATE_CUSTOMER' | 'CREATE_INVOICE' | 'CREATE_PAYMENT';
  payload: any;
  tempId?: number;
  timestamp: string;
}

class ApiService {
  private config: ApiConfig;
  private listeners: Set<() => void> = new Set();
  private isAutoOffline: boolean = false;
  private isSyncing: boolean = false;

  constructor() {
    const savedConfig = localStorage.getItem(STORAGE_PREFIX + 'config');
    let parsedConfig: Partial<ApiConfig> = {};
    if (savedConfig) {
      try {
        parsedConfig = JSON.parse(savedConfig);
      } catch (e) {
        console.warn('Could not parse stored config', e);
      }
    }

    this.config = {
      baseUrl: parsedConfig.baseUrl || DEFAULT_CONFIG.baseUrl,
      isMockMode: parsedConfig.isMockMode ?? false,
    };
    this.config.baseUrl = this.config.baseUrl.replace(/\/+$/, '');
    this.initMockStore();

    // Listen to browser online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isAutoOffline = false;
        this.notifyChange();
        // Try auto-syncing any pending actions upon reconnect
        this.syncPendingQueue().catch(console.error);
      });
      window.addEventListener('offline', () => {
        this.isAutoOffline = true;
        this.notifyChange();
      });
    }
  }

  public isOperatingOffline(): boolean {
    return this.config.isMockMode || this.isAutoOffline || (typeof navigator !== 'undefined' && !navigator.onLine);
  }

  public setOfflineMode(enabled: boolean) {
    this.setConfig({ isMockMode: enabled });
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
    localStorage.removeItem(STORAGE_PREFIX + 'pending_queue');
    this.notifyChange();
  }

  public getMockCustomers(): CustomerDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'customers');
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  }

  public saveMockCustomers(customers: CustomerDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }

  public getMockInvoices(): InvoiceDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'invoices');
    return data ? JSON.parse(data) : INITIAL_INVOICES;
  }

  public saveMockInvoices(invoices: InvoiceDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
  }

  public getMockPayments(): PaymentDto[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'payments');
    return data ? JSON.parse(data) : INITIAL_PAYMENTS;
  }

  public saveMockPayments(payments: PaymentDto[]) {
    localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(payments));
  }

  // --- Offline Synchronization Queue (Sync Queue) ---
  public getPendingQueue(): PendingAction[] {
    const data = localStorage.getItem(STORAGE_PREFIX + 'pending_queue');
    return data ? JSON.parse(data) : [];
  }

  private savePendingQueue(queue: PendingAction[]) {
    localStorage.setItem(STORAGE_PREFIX + 'pending_queue', JSON.stringify(queue));
    this.notifyChange();
  }

  public addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>) {
    const queue = this.getPendingQueue();
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    queue.push(newAction);
    this.savePendingQueue(queue);
  }

  public getPendingCount(): number {
    return this.getPendingQueue().length;
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  public async syncPendingQueue(): Promise<{ syncedCount: number; errors: string[] }> {
    if (this.isSyncing) return { syncedCount: 0, errors: ['جاري المزامنة بالفعل'] };
    const queue = this.getPendingQueue();
    if (queue.length === 0) return { syncedCount: 0, errors: [] };

    this.isSyncing = true;
    this.notifyChange();

    let syncedCount = 0;
    const errors: string[] = [];
    const remainingQueue: PendingAction[] = [];
    const tempIdMap = new Map<number, number>();

    try {
      for (const item of queue) {
        try {
          if (item.type === 'CREATE_CUSTOMER') {
            const res = await this.request<CustomerDto>('/api/Customers', {
              method: 'POST',
              body: JSON.stringify(item.payload),
            });
            if (item.tempId && res?.id) {
              tempIdMap.set(item.tempId, res.id);
            }
            syncedCount++;
          } else if (item.type === 'CREATE_INVOICE') {
            const invoicePayload = { ...item.payload };
            if (tempIdMap.has(invoicePayload.customerId)) {
              invoicePayload.customerId = tempIdMap.get(invoicePayload.customerId)!;
            }
            await this.request<InvoiceDto>('/api/Invoices', {
              method: 'POST',
              body: JSON.stringify(invoicePayload),
            });
            syncedCount++;
          } else if (item.type === 'CREATE_PAYMENT') {
            const paymentPayload = { ...item.payload };
            if (tempIdMap.has(paymentPayload.customerId)) {
              paymentPayload.customerId = tempIdMap.get(paymentPayload.customerId)!;
            }
            await this.request<PaymentDto>('/api/Payments', {
              method: 'POST',
              body: JSON.stringify(paymentPayload),
            });
            syncedCount++;
          }
        } catch (err: any) {
          console.error('[Sync Error on item]', item, err);
          errors.push(err.message || 'فشل مزامنة أحد العناصر');
          remainingQueue.push(item);
        }
      }

      this.savePendingQueue(remainingQueue);

      // Refresh authoritative data from server once sync succeeds
      if (syncedCount > 0) {
        try {
          const [c, inv, p] = await Promise.all([
            this.request<CustomerDto[]>('/api/Customers'),
            this.request<InvoiceDto[]>('/api/Invoices'),
            this.request<PaymentDto[]>('/api/Payments'),
          ]);
          if (Array.isArray(c)) this.saveMockCustomers(c);
          if (Array.isArray(inv)) this.saveMockInvoices(inv);
          if (Array.isArray(p)) this.saveMockPayments(p);
        } catch (e) {
          console.warn('Failed to refresh data after sync', e);
        }
      }
    } finally {
      this.isSyncing = false;
      this.notifyChange();
    }

    return { syncedCount, errors };
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast offline fallback

    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

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

      // Mark back as online since remote request succeeded
      if (this.isAutoOffline) {
        this.isAutoOffline = false;
        this.notifyChange();
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
      clearTimeout(timeoutId);
      // Auto-fallback flag set
      this.isAutoOffline = true;
      console.warn(`[Network unreachable on ${endpoint} -> Switched to local offline mode]`, err);
      throw err;
    }
  }

  // ===================== CUSTOMERS API =====================

  private executeMockCreateCustomer(dto: CustomerCreateDto): CustomerDto {
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

  private executeMockUpdateCustomer(id: number, dto: CustomerUpdateDto): void {
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
  }

  private executeMockDeleteCustomer(id: number): void {
    const invoices = this.getMockInvoices().filter((inv) => inv.customerId === id);
    const payments = this.getMockPayments().filter((p) => p.customerId === id);
    if (invoices.length > 0 || payments.length > 0) {
      throw new Error('لا يمكن حذف عميل لديه فواتير أو دفعات مسجلة.');
    }

    let customers = this.getMockCustomers();
    customers = customers.filter((c) => c.id !== id);
    this.saveMockCustomers(customers);
    this.notifyChange();
  }

  async getCustomers(): Promise<CustomerDto[]> {
    if (this.isOperatingOffline()) {
      return this.getMockCustomers();
    }
    try {
      const data = await this.request<CustomerDto[]>('/api/Customers');
      if (Array.isArray(data) && data.length > 0) {
        this.saveMockCustomers(data);
      }
      return data;
    } catch {
      console.warn('[Offline Mode Active] Serving customers from local storage');
      return this.getMockCustomers();
    }
  }

  async getCustomer(id: number): Promise<CustomerDto> {
    if (this.isOperatingOffline()) {
      const c = this.getMockCustomers().find((item) => item.id === id);
      if (!c) throw new Error(`Customer with ID ${id} not found.`);
      return c;
    }
    try {
      return await this.request<CustomerDto>(`/api/Customers/${id}`);
    } catch {
      const c = this.getMockCustomers().find((item) => item.id === id);
      if (!c) throw new Error(`Customer with ID ${id} not found.`);
      return c;
    }
  }

  async getCustomerDetails(id: number): Promise<CustomerDetailDto> {
    if (this.isOperatingOffline()) {
      return this.getMockCustomerDetails(id);
    }
    try {
      return await this.request<CustomerDetailDto>(`/api/Customers/${id}/details`);
    } catch {
      return this.getMockCustomerDetails(id);
    }
  }

  private getMockCustomerDetails(id: number): CustomerDetailDto {
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

  async createCustomer(dto: CustomerCreateDto): Promise<CustomerDto> {
    if (this.isOperatingOffline()) {
      const created = this.executeMockCreateCustomer(dto);
      this.addPendingAction({ type: 'CREATE_CUSTOMER', tempId: created.id, payload: dto });
      return created;
    }
    try {
      const created = await this.request<CustomerDto>('/api/Customers', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      // Mirror locally
      const local = this.getMockCustomers();
      local.push(created);
      this.saveMockCustomers(local);
      this.notifyChange();
      return created;
    } catch {
      const created = this.executeMockCreateCustomer(dto);
      this.addPendingAction({ type: 'CREATE_CUSTOMER', tempId: created.id, payload: dto });
      return created;
    }
  }

  async updateCustomer(id: number, dto: CustomerUpdateDto): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockUpdateCustomer(id, dto);
    }
    try {
      await this.request<void>(`/api/Customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      this.executeMockUpdateCustomer(id, dto);
    } catch {
      this.executeMockUpdateCustomer(id, dto);
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockDeleteCustomer(id);
    }
    try {
      await this.request<void>(`/api/Customers/${id}`, {
        method: 'DELETE',
      });
      this.executeMockDeleteCustomer(id);
    } catch {
      this.executeMockDeleteCustomer(id);
    }
  }

  // ===================== INVOICES API =====================

  private executeMockCreateInvoice(dto: InvoiceCreateDto): InvoiceDto {
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

  private executeMockUpdateInvoice(id: number, dto: InvoiceUpdateDto): void {
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
  }

  private executeMockDeleteInvoice(id: number): void {
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
  }

  async getInvoices(): Promise<InvoiceDto[]> {
    if (this.isOperatingOffline()) {
      const list = this.getMockInvoices();
      return [...list].sort(
        (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
    }
    try {
      const list = await this.request<InvoiceDto[]>('/api/Invoices');
      if (Array.isArray(list) && list.length > 0) {
        this.saveMockInvoices(list);
      }
      return list;
    } catch {
      console.warn('[Offline Mode Active] Serving invoices from local storage');
      const list = this.getMockInvoices();
      return [...list].sort(
        (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
    }
  }

  async getInvoice(id: number): Promise<InvoiceDto> {
    if (this.isOperatingOffline()) {
      const inv = this.getMockInvoices().find((item) => item.id === id);
      if (!inv) throw new Error(`Invoice with ID ${id} not found.`);
      return inv;
    }
    try {
      return await this.request<InvoiceDto>(`/api/Invoices/${id}`);
    } catch {
      const inv = this.getMockInvoices().find((item) => item.id === id);
      if (!inv) throw new Error(`Invoice with ID ${id} not found.`);
      return inv;
    }
  }

  async getInvoicesByCustomer(customerId: number): Promise<InvoiceDto[]> {
    if (this.isOperatingOffline()) {
      return this.getMockInvoices()
        .filter((inv) => inv.customerId === customerId)
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }
    try {
      return await this.request<InvoiceDto[]>(`/api/Invoices/customer/${customerId}`);
    } catch {
      return this.getMockInvoices()
        .filter((inv) => inv.customerId === customerId)
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }
  }

  async getItemTotalSelling(itemCode: string): Promise<number> {
    if (this.isOperatingOffline()) {
      return this.calculateMockItemTotalSelling(itemCode);
    }
    try {
      return await this.request<number>(`/api/Invoices/total-selling/${encodeURIComponent(itemCode)}`);
    } catch {
      return this.calculateMockItemTotalSelling(itemCode);
    }
  }

  private calculateMockItemTotalSelling(itemCode: string): number {
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

  async getSumOfQuantitiesOfAllInvoices(): Promise<number> {
    if (this.isOperatingOffline()) {
      return this.calculateMockSumOfQuantities();
    }
    try {
      return await this.request<number>('/api/Invoices/sum-quantities');
    } catch {
      return this.calculateMockSumOfQuantities();
    }
  }

  private calculateMockSumOfQuantities(): number {
    const invoices = this.getMockInvoices();
    return invoices.reduce((sum, inv) => {
      return sum + (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    }, 0);
  }

  async getSumOfQuantitiesOfOneCustomer(customerId: number): Promise<number> {
    if (this.isOperatingOffline()) {
      return this.calculateMockCustomerQuantities(customerId);
    }
    try {
      return await this.request<number>(`/api/Invoices/sum-quantities/${customerId}`);
    } catch {
      return this.calculateMockCustomerQuantities(customerId);
    }
  }

  private calculateMockCustomerQuantities(customerId: number): number {
    const invoices = this.getMockInvoices().filter((inv) => inv.customerId === customerId);
    return invoices.reduce((sum, inv) => {
      return sum + (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    }, 0);
  }

  async getSumOfSpecificCode(itemCode: string): Promise<number> {
    if (this.isOperatingOffline()) {
      return this.calculateMockSpecificCode(itemCode);
    }
    try {
      return await this.request<number>(`/api/Invoices/sum-specific-code/${encodeURIComponent(itemCode.trim())}`);
    } catch {
      return this.calculateMockSpecificCode(itemCode);
    }
  }

  private calculateMockSpecificCode(itemCode: string): number {
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

  async createInvoice(dto: InvoiceCreateDto): Promise<InvoiceDto> {
    if (this.isOperatingOffline()) {
      const created = this.executeMockCreateInvoice(dto);
      this.addPendingAction({ type: 'CREATE_INVOICE', payload: dto });
      return created;
    }
    try {
      const created = await this.request<InvoiceDto>('/api/Invoices', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      // Synchronize into local storage mirror
      const invoices = this.getMockInvoices();
      invoices.unshift(created);
      this.saveMockInvoices(invoices);
      const custs = this.getMockCustomers();
      const cIdx = custs.findIndex((c) => c.id === dto.customerId);
      if (cIdx !== -1) {
        custs[cIdx].balance = Number((custs[cIdx].balance + (created.grandTotalAmount - created.paidAmount)).toFixed(2));
        this.saveMockCustomers(custs);
      }
      this.notifyChange();
      return created;
    } catch {
      const created = this.executeMockCreateInvoice(dto);
      this.addPendingAction({ type: 'CREATE_INVOICE', payload: dto });
      return created;
    }
  }

  async updateInvoice(id: number, dto: InvoiceUpdateDto): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockUpdateInvoice(id, dto);
    }
    try {
      await this.request<void>(`/api/Invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      this.executeMockUpdateInvoice(id, dto);
    } catch {
      this.executeMockUpdateInvoice(id, dto);
    }
  }

  async deleteInvoice(id: number): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockDeleteInvoice(id);
    }
    try {
      await this.request<void>(`/api/Invoices/${id}`, {
        method: 'DELETE',
      });
      this.executeMockDeleteInvoice(id);
    } catch {
      this.executeMockDeleteInvoice(id);
    }
  }

  // ===================== PAYMENTS API =====================

  private executeMockCreatePayment(dto: PaymentCreateDto): PaymentDto {
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

  private executeMockUpdatePayment(id: number, dto: PaymentUpdateDto): void {
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
  }

  private executeMockDeletePayment(id: number): void {
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
  }

  async getPayments(): Promise<PaymentDto[]> {
    if (this.isOperatingOffline()) {
      const list = this.getMockPayments();
      return [...list].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
    }
    try {
      const list = await this.request<PaymentDto[]>('/api/Payments');
      if (Array.isArray(list) && list.length > 0) {
        this.saveMockPayments(list);
      }
      return list;
    } catch {
      console.warn('[Offline Mode Active] Serving payments from local storage');
      const list = this.getMockPayments();
      return [...list].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
    }
  }

  async getPayment(id: number): Promise<PaymentDto> {
    if (this.isOperatingOffline()) {
      const p = this.getMockPayments().find((item) => item.id === id);
      if (!p) throw new Error(`Payment with ID ${id} not found.`);
      return p;
    }
    try {
      return await this.request<PaymentDto>(`/api/Payments/${id}`);
    } catch {
      const p = this.getMockPayments().find((item) => item.id === id);
      if (!p) throw new Error(`Payment with ID ${id} not found.`);
      return p;
    }
  }

  async getPaymentsByCustomer(customerId: number): Promise<PaymentDto[]> {
    if (this.isOperatingOffline()) {
      return this.getMockPayments()
        .filter((p) => p.customerId === customerId)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    }
    try {
      return await this.request<PaymentDto[]>(`/api/Payments/customer/${customerId}`);
    } catch {
      return this.getMockPayments()
        .filter((p) => p.customerId === customerId)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    }
  }

  async createPayment(dto: PaymentCreateDto): Promise<PaymentDto> {
    if (this.isOperatingOffline()) {
      const created = this.executeMockCreatePayment(dto);
      this.addPendingAction({ type: 'CREATE_PAYMENT', payload: dto });
      return created;
    }
    try {
      const created = await this.request<PaymentDto>('/api/Payments', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      // Synchronize into local storage mirror
      const payments = this.getMockPayments();
      payments.unshift(created);
      this.saveMockPayments(payments);
      const custs = this.getMockCustomers();
      const cIdx = custs.findIndex((c) => c.id === dto.customerId);
      if (cIdx !== -1) {
        custs[cIdx].balance = Number((custs[cIdx].balance - created.amount).toFixed(2));
        this.saveMockCustomers(custs);
      }
      this.notifyChange();
      return created;
    } catch {
      const created = this.executeMockCreatePayment(dto);
      this.addPendingAction({ type: 'CREATE_PAYMENT', payload: dto });
      return created;
    }
  }

  async updatePayment(id: number, dto: PaymentUpdateDto): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockUpdatePayment(id, dto);
    }
    try {
      await this.request<void>(`/api/Payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      this.executeMockUpdatePayment(id, dto);
    } catch {
      this.executeMockUpdatePayment(id, dto);
    }
  }

  async deletePayment(id: number): Promise<void> {
    if (this.isOperatingOffline()) {
      return this.executeMockDeletePayment(id);
    }
    try {
      await this.request<void>(`/api/Payments/${id}`, {
        method: 'DELETE',
      });
      this.executeMockDeletePayment(id);
    } catch {
      this.executeMockDeletePayment(id);
    }
  }

  // ===================== BACKUP & RESTORE =====================

  public exportBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      customers: this.getMockCustomers(),
      invoices: this.getMockInvoices(),
      payments: this.getMockPayments(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers && Array.isArray(data.customers)) {
        this.saveMockCustomers(data.customers);
      }
      if (data.invoices && Array.isArray(data.invoices)) {
        this.saveMockInvoices(data.invoices);
      }
      if (data.payments && Array.isArray(data.payments)) {
        this.saveMockPayments(data.payments);
      }
      this.notifyChange();
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }
}

export const apiService = new ApiService();
