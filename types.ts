
export enum TransactionType {
  PURCHASE = 'إدخال',
  SALE = 'توزيع',
  ADJUSTMENT = 'تعديل'
}

export enum PaymentMethod {
  CASH = 'نقدي',
  BANK = 'تحويل بنكي',
  E_WALLET = 'كاش (محفظة)'
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  currentBalance: number; // In Quantity (العدد)
  totalIn: number;
  totalOut: number;
  netDiff: number; // Balance status
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
}

export interface LedgerEntry {
  id: string;
  supplierId: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  amountIn: number;
  amountOut: number;
  balanceAfter: number;
  unitPrice: number;
  totalValue: number;
  timestamp: string;
  referenceId: string;
  imageUrl?: string;
  notes?: string;
  operator: string;
}

export interface PurchaseTransaction {
  id: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  date: string;
  imageUrl?: string;
}

export interface SalesTransaction {
  id: string;
  supplierId: string;
  clientId: string;
  quantity: number;
  unitPrice: number;
  purchasePriceAtTime: number; // For exact profit calculation
  totalPrice: number;
  profit: number;
  paymentMethod: PaymentMethod;
  date: string;
  imageUrl?: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  recordId: string;
  oldData?: any;
  newData?: any;
  operator: string;
  timestamp: string;
}
