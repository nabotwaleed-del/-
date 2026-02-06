
import { Supplier, Client, LedgerEntry, PurchaseTransaction, SalesTransaction, TransactionType, PaymentMethod, AuditLog } from '../types';

// Initial Mock Data
let suppliers: Supplier[] = [
  { id: '1', name: 'شركة السلام للصرافة', phone: '0501234567', currentBalance: 50000, totalIn: 100000, totalOut: 50000, netDiff: 0, createdAt: new Date().toISOString() },
  { id: '2', name: 'مكتب الرياض للعملات', phone: '0507654321', currentBalance: 12000, totalIn: 20000, totalOut: 8000, netDiff: 0, createdAt: new Date().toISOString() },
];

let clients: Client[] = [
  { id: '101', name: 'العميل أحمد علي', phone: '0555111222' },
  { id: '102', name: 'معرض النخبة', phone: '0555999888' },
];

let ledger: LedgerEntry[] = [
  { 
    id: 'l1', 
    supplierId: '1', 
    type: TransactionType.PURCHASE, 
    paymentMethod: PaymentMethod.CASH,
    amountIn: 100000, 
    amountOut: 0, 
    balanceAfter: 100000, 
    unitPrice: 3.75, 
    totalValue: 375000, 
    timestamp: new Date(Date.now() - 86400000).toISOString(), 
    referenceId: 'p1', 
    operator: 'أدمن' 
  },
  { 
    id: 'l2', 
    supplierId: '1', 
    type: TransactionType.SALE, 
    paymentMethod: PaymentMethod.BANK,
    amountIn: 0, 
    amountOut: 50000, 
    balanceAfter: 50000, 
    unitPrice: 3.80, 
    totalValue: 190000, 
    timestamp: new Date().toISOString(), 
    referenceId: 's1', 
    operator: 'أدمن' 
  }
];

let sales: SalesTransaction[] = [
  {
    id: 's1',
    supplierId: '1',
    clientId: '101',
    quantity: 50000,
    unitPrice: 3.80,
    purchasePriceAtTime: 3.75,
    totalPrice: 190000,
    profit: 2500,
    paymentMethod: PaymentMethod.BANK,
    date: new Date().toISOString()
  }
];

let purchases: PurchaseTransaction[] = [
  {
    id: 'p1',
    supplierId: '1',
    quantity: 100000,
    unitPrice: 3.75,
    totalPrice: 375000,
    paymentMethod: PaymentMethod.CASH,
    date: new Date(Date.now() - 86400000).toISOString()
  }
];

let auditLogs: AuditLog[] = [];

// Simulation Logic
export const db = {
  getSuppliers: () => [...suppliers],
  getClients: () => [...clients],
  getLedger: (supplierId?: string) => supplierId ? ledger.filter(l => l.supplierId === supplierId) : [...ledger],
  getSales: () => [...sales],
  getPurchases: () => [...purchases],
  getAuditLogs: () => [...auditLogs],

  addPurchase: (data: Omit<PurchaseTransaction, 'id'>) => {
    const id = `p${Date.now()}`;
    const newPurchase = { ...data, id };
    purchases.push(newPurchase);

    // Trigger Update
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (supplier) {
      supplier.currentBalance += data.quantity;
      supplier.totalIn += data.quantity;
      
      ledger.push({
        id: `l${Date.now()}`,
        supplierId: data.supplierId,
        type: TransactionType.PURCHASE,
        paymentMethod: data.paymentMethod,
        amountIn: data.quantity,
        amountOut: 0,
        balanceAfter: supplier.currentBalance,
        unitPrice: data.unitPrice,
        totalValue: data.totalPrice,
        timestamp: data.date,
        referenceId: id,
        operator: 'أدمن',
        imageUrl: data.imageUrl
      });
    }
    return newPurchase;
  },

  addSale: (data: Omit<SalesTransaction, 'id' | 'profit' | 'purchasePriceAtTime'>) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (!supplier || supplier.currentBalance < data.quantity) {
      throw new Error('رصيد المورد غير كافٍ');
    }

    // Logic for profit calculation using a simplified average cost basis for demo
    const lastPurchase = purchases.filter(p => p.supplierId === data.supplierId).slice(-1)[0];
    const purchasePriceAtTime = lastPurchase ? lastPurchase.unitPrice : data.unitPrice * 0.95;
    const profit = (data.unitPrice - purchasePriceAtTime) * data.quantity;

    const id = `s${Date.now()}`;
    const newSale: SalesTransaction = { ...data, id, profit, purchasePriceAtTime };
    sales.push(newSale);

    // Trigger Update
    supplier.currentBalance -= data.quantity;
    supplier.totalOut += data.quantity;

    ledger.push({
      id: `l${Date.now()}`,
      supplierId: data.supplierId,
      type: TransactionType.SALE,
      paymentMethod: data.paymentMethod,
      amountIn: 0,
      amountOut: data.quantity,
      balanceAfter: supplier.currentBalance,
      unitPrice: data.unitPrice,
      totalValue: data.totalPrice,
      timestamp: data.date,
      referenceId: id,
      operator: 'أدمن',
      imageUrl: data.imageUrl
    });

    return newSale;
  },

  addSupplier: (name: string, phone: string) => {
    const newSupplier: Supplier = {
      id: `${Date.now()}`,
      name,
      phone,
      currentBalance: 0,
      totalIn: 0,
      totalOut: 0,
      netDiff: 0,
      createdAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    return newSupplier;
  },

  addClient: (name: string, phone: string) => {
    const newClient: Client = {
      id: `${Date.now()}`,
      name,
      phone
    };
    clients.push(newClient);
    return newClient;
  }
};
