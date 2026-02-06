
import React, { useState } from 'react';
import { db } from '../services/mockDb';
import * as XLSX from 'xlsx';
import { Supplier, LedgerEntry, TransactionType, PaymentMethod } from '../types';
import { UserPlus, Search, Phone, MoreHorizontal, History, TrendingUp, TrendingDown, Eye, X, Check, Image as ImageIcon, Camera, FileSpreadsheet, Printer, CreditCard, Wallet, Banknote } from 'lucide-react';

const Suppliers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', phone: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const suppliers = db.getSuppliers().filter(s => s.name.includes(searchTerm));

  const handleShowLedger = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name) return;
    
    db.addSupplier(newSupplierForm.name, newSupplierForm.phone);
    setNewSupplierForm({ name: '', phone: '' });
    setIsAdding(false);
  };

  const exportLedgerToExcel = (supplier: Supplier) => {
    const ledger = db.getLedger(supplier.id);
    const dataToExport = ledger.map(entry => ({
      'التاريخ': new Date(entry.timestamp).toLocaleString('ar-EG'),
      'النوع': entry.type,
      'وسيلة الدفع': entry.paymentMethod,
      'وارد (+)': entry.amountIn || 0,
      'صادر (-)': entry.amountOut || 0,
      'الرصيد بعد الحركة': entry.balanceAfter,
      'سعر الوحدة': entry.unitPrice,
      'إجمالي القيمة (ج.م)': entry.totalValue,
      'المسؤول': entry.operator
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `كشف حساب ${supplier.name}`);
    XLSX.writeFile(workbook, `Ledger_${supplier.name}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK: return CreditCard;
      case PaymentMethod.E_WALLET: return Wallet;
      default: return Banknote;
    }
  };

  if (isAdding) {
    return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
            <h2 className="text-xl font-bold">إضافة مورد جديد</h2>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddSupplier} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">اسم المورد / الشركة</label>
              <input 
                type="text" 
                required
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all"
                placeholder="أدخل اسم المورد كاملاً"
                value={newSupplierForm.name}
                onChange={(e) => setNewSupplierForm({...newSupplierForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">رقم الهاتف / التواصل</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-mono"
                placeholder="05xxxxxxxx"
                value={newSupplierForm.phone}
                onChange={(e) => setNewSupplierForm({...newSupplierForm, phone: e.target.value})}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                <Check className="w-5 h-5" />
                حفظ بيانات المورد
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
               <h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-indigo-600" /> مستند العملية</h3>
               <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2 bg-slate-100 flex items-center justify-center min-h-[400px]">
              <img src={previewImage} className="max-w-full max-h-[80vh] object-contain shadow-lg rounded-md" alt="Preview" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="البحث عن مورد بالاسم..." 
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          إضافة مورد جديد
        </button>
      </div>

      {!selectedSupplier ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl font-bold">
                    {s.name[0]}
                  </div>
                  <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{s.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                  <Phone className="w-3 h-3" />
                  {s.phone}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">الرصيد الحالي</p>
                    <p className="text-lg font-bold text-indigo-600">{s.currentBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">إجمالي الداخل</p>
                    <p className="text-lg font-bold text-emerald-600">{s.totalIn.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">إجمالي الخارج</p>
                    <p className="text-lg font-bold text-orange-600">{s.totalOut.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">الحالة</p>
                    <div className="flex items-center gap-1">
                      {s.currentBalance > 0 ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> رصيد موجب
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">لا يوجد رصيد</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => handleShowLedger(s)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <History className="w-4 h-4" />
                  كشف الحساب
                </button>
                <button 
                  onClick={() => exportLedgerToExcel(s)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all"
                  title="تصدير Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between no-print">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedSupplier(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold">كشف حساب: {selectedSupplier.name}</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => exportLedgerToExcel(selectedSupplier)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                طباعة التقرير
              </button>
            </div>
          </div>

          <div className="hidden print:block text-center border-b pb-4 mb-4">
             <h2 className="text-2xl font-bold">كشف حساب مورد: {selectedSupplier.name}</h2>
             <p className="text-slate-500">التاريخ: {new Date().toLocaleString('ar-EG')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-slate-300">
             <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider print:bg-slate-200">
                <tr>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">الدفع</th>
                  <th className="px-6 py-4">داخل (+)</th>
                  <th className="px-6 py-4">خارج (-)</th>
                  <th className="px-6 py-4">الرصيد بعد</th>
                  <th className="px-6 py-4 text-center no-print">المرفق</th>
                  <th className="px-6 py-4">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {db.getLedger(selectedSupplier.id).map((entry) => {
                  const PayIcon = getPaymentIcon(entry.paymentMethod);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors print:break-inside-avoid">
                      <td className="px-6 py-4 text-xs">{new Date(entry.timestamp).toLocaleString('ar-EG')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          entry.type === TransactionType.PURCHASE ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <PayIcon className="w-3 h-3 text-indigo-500" />
                          {entry.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{entry.amountIn || '-'}</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">{entry.amountOut || '-'}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{entry.balanceAfter.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center no-print">
                        {entry.imageUrl ? (
                          <div 
                            onClick={() => setPreviewImage(entry.imageUrl!)}
                            className="w-10 h-10 mx-auto rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 ring-indigo-500 transition-all bg-slate-100 flex items-center justify-center"
                          >
                            <img src={entry.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{entry.operator}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/swap">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default Suppliers;
