
import React, { useState, useMemo } from 'react';
import { db } from '../services/mockDb';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  Filter, 
  Printer, 
  AlertCircle,
  X,
  Users,
  Image as ImageIcon,
  FileSpreadsheet,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  BarChart3,
  ShoppingBag,
  Coins,
  Settings2,
  Check
} from 'lucide-react';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('pnl'); 
  const [showFilters, setShowFilters] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState<string | null>(null);
  
  // Filter States
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterClient, setFilterClient] = useState('');

  // Column Visibility States
  const [clientColumns, setClientColumns] = useState({
    name: { label: 'اسم العميل', visible: true },
    txCount: { label: 'عدد العمليات', visible: true },
    volume: { label: 'الكمية المسحوبة', visible: true },
    revenue: { label: 'إجمالي الإيرادات', visible: true },
    profit: { label: 'صافي الربح', visible: true },
  });

  const [supplierColumns, setSupplierColumns] = useState({
    name: { label: 'اسم المورد', visible: true },
    txCount: { label: 'إجمالي العمليات', visible: true },
    totalVolume: { label: 'إجمالي الوحدات', visible: true },
    totalProfit: { label: 'إجمالي الأرباح', visible: true },
    avgProfit: { label: 'متوسط ربح الوحدة', visible: true },
  });

  const sales = db.getSales();
  const suppliers = db.getSuppliers();
  const clients = db.getClients();

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchSupplier = filterSupplier ? sale.supplierId === filterSupplier : true;
      const matchClient = filterClient ? sale.clientId === filterClient : true;
      const saleDate = new Date(sale.date).getTime();
      const matchStart = filterStartDate ? saleDate >= new Date(filterStartDate).getTime() : true;
      const matchEnd = filterEndDate ? saleDate <= new Date(filterEndDate).getTime() + 86400000 : true;
      return matchSupplier && matchClient && matchStart && matchEnd;
    });
  }, [sales, filterSupplier, filterClient, filterStartDate, filterEndDate]);

  const financialSummary = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalCost = filteredSales.reduce((acc, curr) => acc + (curr.purchasePriceAtTime * curr.quantity), 0);
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalCost, totalProfit, margin };
  }, [filteredSales]);

  const clientAnalysis = useMemo(() => {
    const map: Record<string, { volume: number; profit: number; revenue: number; txCount: number }> = {};
    filteredSales.forEach(s => {
      if (!map[s.clientId]) {
        map[s.clientId] = { volume: 0, profit: 0, revenue: 0, txCount: 0 };
      }
      map[s.clientId].volume += s.quantity;
      map[s.clientId].profit += s.profit;
      map[s.clientId].revenue += s.totalPrice;
      map[s.clientId].txCount += 1;
    });
    return Object.entries(map).map(([id, data]) => ({
      name: clients.find(c => c.id === id)?.name || 'غير معروف',
      ...data
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredSales, clients]);

  const supplierPerformance = useMemo(() => {
    const map: Record<string, { txCount: number; totalVolume: number; totalProfit: number }> = {};
    filteredSales.forEach(s => {
      if (!map[s.supplierId]) {
        map[s.supplierId] = { txCount: 0, totalVolume: 0, totalProfit: 0 };
      }
      map[s.supplierId].txCount += 1;
      map[s.supplierId].totalVolume += s.quantity;
      map[s.supplierId].totalProfit += s.profit;
    });
    return Object.entries(map).map(([id, data]) => ({
      name: suppliers.find(sup => sup.id === id)?.name || 'غير معروف',
      ...data,
      avgProfit: data.totalVolume > 0 ? data.totalProfit / data.totalVolume : 0
    }));
  }, [filteredSales, suppliers]);

  const profitBySupplierChart = useMemo(() => {
    return supplierPerformance.map(s => ({ name: s.name, profit: s.totalProfit }));
  }, [supplierPerformance]);

  const pnlBarData = [
    { name: 'الإيرادات', value: financialSummary.totalRevenue, color: '#4f46e5' },
    { name: 'التكاليف', value: financialSummary.totalCost, color: '#f43f5e' },
    { name: 'صافي الربح', value: financialSummary.totalProfit, color: '#10b981' }
  ];

  const reportTypes = [
    { id: 'pnl', name: 'الأرباح والخسائر', icon: BarChart3 },
    { id: 'client_report', name: 'تقارير العملاء الموحدة', icon: Users },
    { id: 'profitability', name: 'تحليل الموردين', icon: TrendingUp },
    { id: 'account_statement', name: 'سجل العمليات', icon: FileText },
  ];

  const exportToExcel = () => {
    let dataToExport = [];
    if (activeReport === 'pnl') {
      dataToExport = [
        { 'البيان': 'إجمالي الإيرادات', 'القيمة': financialSummary.totalRevenue },
        { 'البيان': 'إجمالي التكاليف', 'القيمة': financialSummary.totalCost },
        { 'البيان': 'صافي الربح', 'القيمة': financialSummary.totalProfit }
      ];
    } else if (activeReport === 'client_report') {
      dataToExport = clientAnalysis.map(c => {
        const row: any = {};
        if (clientColumns.name.visible) row['اسم العميل'] = c.name;
        if (clientColumns.txCount.visible) row['عدد العمليات'] = c.txCount;
        if (clientColumns.volume.visible) row['الكمية المسحوبة'] = c.volume;
        if (clientColumns.revenue.visible) row['إجمالي الإيرادات'] = c.revenue;
        if (clientColumns.profit.visible) row['صافي الربح'] = c.profit;
        return row;
      });
    } else if (activeReport === 'profitability') {
      dataToExport = supplierPerformance.map(s => {
        const row: any = {};
        if (supplierColumns.name.visible) row['اسم المورد'] = s.name;
        if (supplierColumns.txCount.visible) row['إجمالي العمليات'] = s.txCount;
        if (supplierColumns.totalVolume.visible) row['إجمالي الوحدات'] = s.totalVolume;
        if (supplierColumns.totalProfit.visible) row['إجمالي الأرباح'] = s.totalProfit;
        if (supplierColumns.avgProfit.visible) row['متوسط ربح الوحدة'] = s.avgProfit;
        return row;
      });
    } else {
      dataToExport = filteredSales.map(s => ({
        'المورد': suppliers.find(sup => sup.id === s.supplierId)?.name,
        'العميل': clients.find(c => c.id === s.clientId)?.name,
        'التاريخ': new Date(s.date).toLocaleDateString('ar-EG'),
        'القيمة': s.totalPrice,
        'الربح': s.profit
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FinancialReport");
    XLSX.writeFile(workbook, `ArzFlow_Report_${activeReport}.xlsx`);
  };

  const ColumnSettingsMenu = ({ type, columns, setColumns }: { type: string, columns: any, setColumns: any }) => (
    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 no-print">
      <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500">تخصيص الأعمدة</span>
        <button onClick={() => setShowColumnSettings(null)}><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      <div className="p-2 space-y-1">
        {Object.entries(columns).map(([key, config]: [string, any]) => (
          <button
            key={key}
            onClick={() => setColumns({ ...columns, [key]: { ...config, visible: !config.visible } })}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
          >
            <span className={`text-sm font-medium ${config.visible ? 'text-indigo-600' : 'text-slate-400'}`}>
              {config.label}
            </span>
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${config.visible ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
              {config.visible && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 print-container">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border">
          {reportTypes.map(r => (
            <button 
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all text-sm ${
                activeReport === r.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <r.icon className="w-4 h-4" />
              {r.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-all text-sm">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border text-slate-700 rounded-xl font-bold hover:bg-slate-50 shadow-sm text-sm">
            <Printer className="w-4 h-4" /> طباعة
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm ${showFilters ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'}`}>
            <Filter className="w-4 h-4" /> تصفية
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl no-print animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block px-1">المورد</label>
              <select className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
                <option value="">كافة الموردين</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block px-1">العميل</label>
              <select className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                <option value="">كافة العملاء</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block px-1">من تاريخ</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block px-1">إلى تاريخ</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* --- Section 1: Profit & Loss --- */}
      {activeReport === 'pnl' && (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm group hover:border-indigo-500 transition-all">
               <div className="flex justify-between items-center mb-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowUpCircle className="w-6 h-6" /></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">الإيرادات</span>
               </div>
               <p className="text-2xl font-bold">{financialSummary.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm group hover:border-rose-500 transition-all">
               <div className="flex justify-between items-center mb-4">
                 <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all"><ArrowDownCircle className="w-6 h-6" /></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">التكاليف</span>
               </div>
               <p className="text-2xl font-bold">{financialSummary.totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm group hover:border-emerald-500 transition-all">
               <div className="flex justify-between items-center mb-4">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><TrendingUp className="w-6 h-6" /></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">صافي الربح</span>
               </div>
               <p className="text-2xl font-bold">{financialSummary.totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm group hover:border-amber-500 transition-all">
               <div className="flex justify-between items-center mb-4">
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all"><Percent className="w-6 h-6" /></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">هامش الربح</span>
               </div>
               <p className="text-2xl font-bold">{financialSummary.margin.toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm p-8 space-y-6">
              <h3 className="font-bold text-lg mb-4 border-b pb-4">بيان قائمة الدخل</h3>
              <div className="flex justify-between items-center py-4 border-b">
                 <span className="text-slate-600">إجمالي المبيعات</span>
                 <span className="font-bold text-indigo-600">{financialSummary.totalRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b">
                 <span className="text-slate-600">تكلفة البضاعة المباعة (COGS)</span>
                 <span className="font-bold text-rose-600">({financialSummary.totalCost.toLocaleString()}) ج.م</span>
              </div>
              <div className="flex justify-between items-center py-6 bg-slate-50 px-6 rounded-2xl text-xl font-bold">
                 <span className="text-slate-900">إجمالي الربح</span>
                 <span className="text-emerald-600">{financialSummary.totalProfit.toLocaleString()} ج.م</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl border shadow-sm p-8">
               <h3 className="font-bold mb-6 text-center text-slate-700">التمثيل البياني</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnlBarData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {pnlBarData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Section 2: Unified Client Reports --- */}
      {activeReport === 'client_report' && (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">إجمالي مبيعات العملاء</p>
                <p className="text-2xl font-bold">{financialSummary.totalRevenue.toLocaleString()} ج.م</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Coins className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">صافي أرباح العملاء</p>
                <p className="text-2xl font-bold">{financialSummary.totalProfit.toLocaleString()} ج.م</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
              <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">العملاء النشطون</p>
                <p className="text-2xl font-bold">{clientAnalysis.length} عميل</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold">تحليل أداء العملاء</h3>
              <div className="relative">
                <button 
                  onClick={() => setShowColumnSettings(showColumnSettings === 'clients' ? null : 'clients')}
                  className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm no-print"
                >
                  <Settings2 className="w-5 h-5 text-slate-500" />
                </button>
                {showColumnSettings === 'clients' && (
                  <ColumnSettingsMenu type="clients" columns={clientColumns} setColumns={setClientColumns} />
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    {clientColumns.name.visible && <th className="px-6 py-4">اسم العميل</th>}
                    {clientColumns.txCount.visible && <th className="px-6 py-4">عدد العمليات</th>}
                    {clientColumns.volume.visible && <th className="px-6 py-4">الكمية المسحوبة</th>}
                    {clientColumns.revenue.visible && <th className="px-6 py-4">إجمالي الإيرادات</th>}
                    {clientColumns.profit.visible && <th className="px-6 py-4 text-emerald-600">صافي الربح</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clientAnalysis.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {clientColumns.name.visible && <td className="px-6 py-4 font-bold text-slate-700">{c.name}</td>}
                      {clientColumns.txCount.visible && <td className="px-6 py-4 font-mono">{c.txCount}</td>}
                      {clientColumns.volume.visible && <td className="px-6 py-4 font-mono">{c.volume.toLocaleString()}</td>}
                      {clientColumns.revenue.visible && <td className="px-6 py-4 font-bold">{c.revenue.toLocaleString()} ج.م</td>}
                      {clientColumns.profit.visible && <td className="px-6 py-4 font-bold text-emerald-600">+{c.profit.toLocaleString()} ج.م</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Section 3: Supplier Analysis --- */}
      {activeReport === 'profitability' && (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <h3 className="text-xl font-bold mb-8">الأرباح حسب المورد</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitBySupplierChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis hide />
                    <Tooltip formatter={(value: any) => `${value.toLocaleString()} ج.م`} />
                    <Bar dataKey="profit" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <h3 className="text-xl font-bold mb-6">إحصائيات الموردين العامة</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl">
                  <span className="font-bold text-emerald-800 text-sm">إجمالي ربح الفترة</span>
                  <span className="text-lg font-bold text-emerald-600">{financialSummary.totalProfit.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-800 text-sm">عدد الحركات الموزعة</span>
                  <span className="text-lg font-bold text-slate-600">{filteredSales.length} حركة</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl">
                  <span className="font-bold text-indigo-800 text-sm">إجمالي حجم التداول</span>
                  <span className="text-lg font-bold text-indigo-600">{filteredSales.reduce((a, b) => a + b.quantity, 0).toLocaleString()} وحدة</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold">سجل أداء الموردين التفصيلي</h3>
              <div className="relative">
                <button 
                  onClick={() => setShowColumnSettings(showColumnSettings === 'suppliers' ? null : 'suppliers')}
                  className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm no-print"
                >
                  <Settings2 className="w-5 h-5 text-slate-500" />
                </button>
                {showColumnSettings === 'suppliers' && (
                  <ColumnSettingsMenu type="suppliers" columns={supplierColumns} setColumns={setSupplierColumns} />
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    {supplierColumns.name.visible && <th className="px-6 py-4">اسم المورد</th>}
                    {supplierColumns.txCount.visible && <th className="px-6 py-4">إجمالي العمليات</th>}
                    {supplierColumns.totalVolume.visible && <th className="px-6 py-4">إجمالي الوحدات</th>}
                    {supplierColumns.totalProfit.visible && <th className="px-6 py-4 text-emerald-600">إجمالي الأرباح</th>}
                    {supplierColumns.avgProfit.visible && <th className="px-6 py-4">متوسط ربح الوحدة</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {supplierPerformance.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {supplierColumns.name.visible && <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>}
                      {supplierColumns.txCount.visible && <td className="px-6 py-4 font-mono">{s.txCount}</td>}
                      {supplierColumns.totalVolume.visible && <td className="px-6 py-4 font-mono">{s.totalVolume.toLocaleString()}</td>}
                      {supplierColumns.totalProfit.visible && <td className="px-6 py-4 font-bold text-emerald-600">+{s.totalProfit.toLocaleString()} ج.م</td>}
                      {supplierColumns.avgProfit.visible && <td className="px-6 py-4 font-bold text-indigo-600">{s.avgProfit.toFixed(4)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Section 4: Transaction Log --- */}
      {activeReport === 'account_statement' && (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
             <h3 className="text-xl font-bold">سجل العمليات المجمع</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5">المورد</th>
                  <th className="px-6 py-5">العميل</th>
                  <th className="px-6 py-5">التاريخ</th>
                  <th className="px-6 py-5">الكمية</th>
                  <th className="px-6 py-5 text-left text-emerald-600">صافي الربح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-bold">{suppliers.find(sup => sup.id === s.supplierId)?.name}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{clients.find(c => c.id === s.clientId)?.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(s.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4 font-mono">{s.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-left">+{s.profit.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
               <h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-indigo-600" /> مستند العملية</h3>
               <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2 bg-slate-100 flex items-center justify-center min-h-[400px]">
              <img src={previewImage} className="max-w-full max-h-[80vh] object-contain" alt="Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
