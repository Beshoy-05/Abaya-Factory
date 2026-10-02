// AbayaFactory - TypeScript Interfaces Matching API Contract Spec

// Customer Interfaces
export interface CustomerDto {
  id: number;
  name: string;
  balance: number;
}

export interface CustomerCreateDto {
  name: string; // Required, 1-100 characters
}

export interface CustomerUpdateDto {
  name: string; // Required, 1-100 characters
}

export interface CustomerDetailDto {
  id: number;
  name: string;
  balance: number;
  invoices: InvoiceSummaryDto[];
  payments: PaymentDto[];
}

// Invoice Interfaces
export interface InvoiceItemDto {
  id: number;
  itemName: string;
  itemCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceItemCreateDto {
  itemName: string;  // Required
  itemCode: string;  // Required
  quantity: number;  // Required, Integer >= 1
  unitPrice: number; // Required, Number > 0
}

export interface InvoiceDto {
  id: number;
  customerId: number;
  customerName: string;
  invoiceDate: string; // ISO 8601 string
  previousBalance: number;
  grandTotalAmount: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  items: InvoiceItemDto[];
}

export interface InvoiceSummaryDto {
  id: number;
  invoiceDate: string;
  grandTotalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  itemsCount: number;
}

export interface InvoiceCreateDto {
  customerId: number;
  invoiceDate?: string;          // Optional, defaults to UTC now
  paidAmount: number;            // Number >= 0, default 0
  items: InvoiceItemCreateDto[]; // Required, at least 1 item
}

export interface InvoiceUpdateDto {
  invoiceDate: string;
  paidAmount: number;            // Number >= 0
  items: InvoiceItemCreateDto[]; // Required, at least 1 item
}

// Payment Interfaces
export interface PaymentDto {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  paymentDate: string; // ISO 8601 string
}

export interface PaymentCreateDto {
  customerId: number;
  amount: number;       // Number > 0
  paymentDate?: string; // Optional, defaults to UTC now
}

export interface PaymentUpdateDto {
  amount: number;       // Number > 0
  paymentDate: string;
}

// Ledger entry helper for unified customer statement
export interface LedgerEntry {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  referenceId: number;
  description: string;
  debit: number;   // Adds to customer debt (GrandTotal - PaidAmount)
  credit: number;  // Reduces customer debt (Payment amount)
  runningBalance?: number;
  rawDetails?: InvoiceDto | InvoiceSummaryDto | PaymentDto;
}
