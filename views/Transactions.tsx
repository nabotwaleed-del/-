
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/mockDb';
import { PaymentMethod } from '../types';
import { Plus, Minus, Camera, FileText, CheckCircle2, AlertTriangle, XCircle, UserPlus, X, Check, Image as ImageIcon, CreditCard, Wallet, Banknote } from 'lucide-react';

const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sale'>('purchase');
  const [formData, setFormData] = useState({
    supplierId: '',
    clientId: '',
    quantity: 0,
    unitPrice: 0,
    paymentMethod: PaymentMethod.CASH,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    imageUrl: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');

  const suppliers = db.getSuppliers();
  const clients = db.getClients();

  useEffect(() => {
    setErrorMessage(null);
  }, [activeTab, formData.supplierId, formData.quantity]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      if (activeTab === 'purchase') {
        db.addPurchase({
          supplierId: formData.supplierId,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice,
          totalPrice: formData.quantity * formData.unitPrice,
          paymentMethod: formData.paymentMethod,
          date: new Date(formData.date).toISOString(),
          imageUrl: formData.imageUrl
        });
      } else {
        db.addSale({
          supplierId: formData.supplierId,
          clientId: formData.clientId,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice,
          totalPrice: formData.quantity * formData.unitPrice,
          paymentMethod: formData.paymentMethod,
          date: new Date(formData.date).toISOString(),
          imageUrl: formData.imageUrl
        });
      }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setFormData({ 
        supplierId: '', clientId: '', quantity: 0, unitPrice: 0, 
        paymentMethod: PaymentMethod.CASH,
        date: new Date().toISOString().split('T')[0], notes: '', imageUrl: '' 
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء تنفيذ العملية');
    }
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName) return;
    const newClient = db.addClient(quickClientName, quickClientPhone);
    setFormData({ ...formData, clientId: newClient.id });
    setShowQuickAddClient(false);
    setQuickClientName('');
    setQuickClientPhone('');
  };

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
  const isOverBalance = activeTab === 'sale' && selectedSupplier && formData.quantity > selectedSupplier.currentBalance;

  const paymentMethods = [
    { id: PaymentMethod.CASH, name: 'نقدي', icon: Banknote },
    { id: PaymentMethod.BANK, name: 'تحويل بنكي', icon: CreditCard },
    { id: PaymentMethod.E_WALLET, name: 'كاش (محفظة)', icon: Wallet },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <button 
          onClick={() => setActiveTab('purchase')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'purchase' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-5 h-5" />
          عملية إدخال (شراء)
        </button>
        <button 
          onClick={() => setActiveTab('sale')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'sale' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Minus className="w-5 h-5" />
          عملية توزيع (بيع)
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <div className="p-2 bg-red-500 rounded-lg text-white">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-red-800 text-sm">خطأ في العملية</h4>
            <p className="text-red-600 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {showQuickAddClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">تسجيل عميل سريع</h3>
              <button onClick={() => setShowQuickAddClient(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleQuickAddClient} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم العميل</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">رقم الهاتف</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                حفظ واختيار العميل
              </button>
            </form>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        {isSuccess && (
          <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-in fade-in rounded-3xl">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
            <p className="text-2xl font-bold text-slate-800">تم تسجيل العملية بنجاح!</p>
            <p className="text-slate-500">تم تحديث الأرصدة والسجلات تلقائياً</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supplier & Client Selects */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">المورد</label>
            <select 
              required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all"
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
            >
              <option value="">اختر المورد...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} (رصيد: {s.currentBalance.toLocaleString()})</option>)}
            </select>
          </div>

          {activeTab === 'sale' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-700">العميل المستلم</label>
                <button 
                  type="button"
                  onClick={() => setShowQuickAddClient(true)}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="w-3 h-3" />
                  تسجيل عميل جديد
                </button>
              </div>
              <select 
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-orange-600 rounded-2xl outline-none transition-all"
                value={formData.clientId}
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">اختر العميل...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Payment Method - New Feature */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700 block">طريقة الدفع / التحصيل</label>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                    formData.paymentMethod === method.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md'
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit Price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">الكمية (العدد)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="1"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-mono ${
                  isOverBalance ? 'border-red-300 focus:border-red-500 text-red-600' : 'border-transparent focus:border-indigo-600'
                }`}
                placeholder="0.00"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              />
              {isOverBalance && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  رصيد غير كافٍ
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">سعر الوحدة</label>
            <input 
              type="number" 
              step="0.0001"
              required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-mono"
              placeholder="0.0000"
              value={formData.unitPrice || ''}
              onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})}
            />
          </div>

          <div className={`md:col-span-2 p-6 rounded-2xl text-white flex justify-between items-center transition-colors duration-300 ${
            isOverBalance ? 'bg-red-600' : 'bg-slate-900'
          }`}>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">إجمالي القيمة التقديرية</p>
              <p className="text-3xl font-bold">{(formData.quantity * formData.unitPrice).toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">حالة العملية</p>
              <p className={`text-sm font-bold mt-1 ${
                isOverBalance ? 'text-white' : (activeTab === 'purchase' ? 'text-emerald-400' : 'text-orange-400')
              }`}>
                {isOverBalance ? 'تجاوز للرصيد المتاح' : (activeTab === 'purchase' ? 'جاري إضافة رصيد' : 'جاري سحب رصيد')}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="md:col-span-2 space-y-4">
            <label className="text-sm font-bold text-slate-700 block">المرفقات والصور</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  formData.imageUrl ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.imageUrl ? (
                  <div className="relative w-full h-32">
                    <img src={formData.imageUrl} className="w-full h-full object-contain rounded-lg shadow-sm" alt="Preview" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ''})}}
                      className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="font-bold">إرفاق صورة العملية</span>
                    <span className="text-[10px]">JPG, PNG supported</span>
                  </>
                )}
              </div>
              <button type="button" className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all">
                <Camera className="w-8 h-8" />
                <span className="font-bold">فتح الكاميرا المباشرة</span>
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isOverBalance}
          className={`w-full mt-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'purchase' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-orange-600 text-white shadow-orange-200'
          }`}
        >
          {activeTab === 'purchase' ? 'تأكيد عملية الشراء والإدخال' : 'تأكيد عملية التوزيع والبيع'}
        </button>
      </form>
    </div>
  );
};

export default Transactions;
