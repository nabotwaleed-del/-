
import React, { useState } from 'react';
import { db } from '../services/mockDb';
import * as XLSX from 'xlsx';
import { Client, SalesTransaction, PaymentMethod } from '../types';
import { 
  UserPlus, 
  Search, 
  Phone, 
  MoreHorizontal, 
  History, 
  Briefcase, 
  X, 
  Check, 
  TrendingUp, 
  Wallet,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  Image as ImageIcon,
  CreditCard,
  Banknote
} from 'lucide-react';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const clients = db.getClients().filter(c => c.name.includes(searchTerm));
  const suppliers = db.getSuppliers();
  const allSales = db.getSales();

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name) return;
    
    db.addClient(newClientForm.name, newClientForm.phone);
    setNewClientForm({ name: '', phone: '' });
    setIsAdding(false);
  };

  const exportClientLedgerToExcel = (client: Client) => {
    const clientSales = allSales.filter(s => s.clientId === client.id);
    const dataToExport = clientSales.map(s => ({
      'التاريخ': new Date(s.date).toLocaleString('ar-EG'),
      'المورد الأصلي': suppliers.find(sup => sup.id === s.supplierId)?.name || 'غير معروف',
      'وسيلة الدفع': s.paymentMethod,
      'الكمية المستلمة': s.quantity,
      'سعر البيع': s.unitPrice,
      'إجمالي القيمة (ج.م)': s.totalPrice,
      'الربح الناتج (ج.م)': s.profit
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `حساب ${client.name}`);
    XLSX.writeFile(workbook, `Client_${client.name}_${new Date().toISOString().slice(0,10)}.xlsx`);
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
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-900 text-white">
            <h2 className="text-xl font-bold">تسجيل عميل جديد</h2>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddClient} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">اسم العميل</label>
              <input 
                type="text" 
                required
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all"
                placeholder="أدخل اسم العميل كاملاً"
                value={newClientForm.name}
                onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">رقم الهاتف</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-mono"
                placeholder="01xxxxxxxxx"
                value={newClientForm.phone}
                onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                <Check className="w-5 h-5" />
                حفظ بيانات العميل
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
    <div className="space-y-6 pb-20">
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

      {!selectedClient ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="البحث عن عميل بالاسم..." 
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
              إضافة عميل جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(c => {
              const clientSales = allSales.filter(s => s.clientId === c.id);
              const totalVolume = clientSales.reduce((acc, curr) => acc + curr.quantity, 0);
              const totalProfit = clientSales.reduce((acc, curr) => acc + curr.profit, 0);

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 text-xl font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => exportClientLedgerToExcel(c)}
                           className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                           title="تصدير Excel"
                         >
                           <FileSpreadsheet className="w-4 h-4" />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                           <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{c.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                      <Phone className="w-3 h-3" />
                      {c.phone || 'بدون رقم هاتف'}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">حجم السحوبات</p>
                        <p className="text-lg font-bold text-indigo-600">{totalVolume.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-[10px] text-emerald-600/70 font-bold uppercase mb-1">الربح المحقق</p>
                        <p className="text-lg font-bold text-emerald-600">{totalProfit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => setSelectedClient(c)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                    >
                      <History className="w-4 h-4" />
                      كشف الحساب التفصيلي
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between no-print">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white border shadow-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">كشف حساب العميل: {selectedClient.name}</h2>
                <p className="text-sm text-slate-400 font-medium">عرض كافة عمليات التوزيع والربحية</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => exportClientLedgerToExcel(selectedClient)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                طباعة التقرير
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
             <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Wallet className="w-6 h-6" /></div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">إجمالي المسحوبات</p>
                 <p className="text-2xl font-bold">{allSales.filter(s => s.clientId === selectedClient.id).reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()} <span className="text-sm">وحدة</span></p>
               </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">صافي الربح المحقق</p>
                 <p className="text-2xl font-bold">{allSales.filter(s => s.clientId === selectedClient.id).reduce((acc, curr) => acc + curr.profit, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><History className="w-6 h-6" /></div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase">عدد العمليات</p>
                 <p className="text-2xl font-bold">{allSales.filter(s => s.clientId === selectedClient.id).length} <span className="text-sm">عملية</span></p>
               </div>
             </div>
          </div>

          <div className="hidden print:block text-center border-b pb-6 mb-6">
             <h2 className="text-3xl font-bold mb-2">كشف حساب عميل: {selectedClient.name}</h2>
             <p className="text-slate-500 font-bold">رقم الهاتف: {selectedClient.phone || 'غير مسجل'}</p>
             <p className="text-slate-400 mt-2">تاريخ التقرير: {new Date().toLocaleString('ar-EG')}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-slate-300">
             <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider print:bg-slate-200">
                <tr>
                  <th className="px-6 py-5">التاريخ والوقت</th>
                  <th className="px-6 py-5">المورد</th>
                  <th className="px-6 py-5">الدفع</th>
                  <th className="px-6 py-5">الكمية</th>
                  <th className="px-6 py-5">الإجمالي</th>
                  <th className="px-6 py-5 text-center no-print">المستند</th>
                  <th className="px-6 py-5 text-left text-emerald-600">الربح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allSales.filter(s => s.clientId === selectedClient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => {
                  const PayIcon = getPaymentIcon(sale.paymentMethod);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors print:break-inside-avoid">
                      <td className="px-6 py-4 text-xs font-medium">{new Date(sale.date).toLocaleString('ar-EG')}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {suppliers.find(sup => sup.id === sale.supplierId)?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <PayIcon className="w-3 h-3 text-indigo-500" />
                          {sale.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{sale.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold">{sale.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center no-print">
                        {sale.imageUrl ? (
                          <div 
                            onClick={() => setPreviewImage(sale.imageUrl!)}
                            className="w-10 h-10 mx-auto rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 ring-indigo-500 transition-all bg-slate-100 flex items-center justify-center"
                          >
                            <img src={sale.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-left font-bold text-emerald-600">
                        +{sale.profit.toLocaleString()}
                      </td>
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

export default Clients;
