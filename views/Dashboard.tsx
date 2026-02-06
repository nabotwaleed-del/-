
import React from 'react';
import { db } from '../services/mockDb';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, Package, Wallet } from 'lucide-react';

const StatCard: React.FC<{ title: string, value: string, sub: string, icon: any, color: string }> = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</div>
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{sub}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const suppliers = db.getSuppliers();
  const sales = db.getSales();
  const totalBalance = suppliers.reduce((acc, curr) => acc + curr.currentBalance, 0);
  const totalProfit = sales.reduce((acc, curr) => acc + curr.profit, 0);
  const dailyVolume = sales.reduce((acc, curr) => acc + curr.quantity, 0);

  const chartData = [
    { name: 'السبت', value: 4000 },
    { name: 'الأحد', value: 3000 },
    { name: 'الاثنين', value: 5000 },
    { name: 'الثلاثاء', value: 2780 },
    { name: 'الأربعاء', value: 1890 },
    { name: 'الخميس', value: 2390 },
    { name: 'الجمعة', value: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي الأرصدة" 
          value={`${totalBalance.toLocaleString()} وحدة`} 
          sub="رصيد متاح حالياً لدى كافة الموردين"
          icon={Wallet} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="إجمالي الأرباح" 
          value={`${totalProfit.toLocaleString()} ج.م`} 
          sub="صافي الأرباح المحققة (بالجنية المصري)"
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="حجم التداول" 
          value={`${dailyVolume.toLocaleString()} وحدة`} 
          sub="إجمالي الكميات الموزعة اليوم"
          icon={Package} 
          color="bg-orange-50 text-orange-600"
        />
        <StatCard 
          title="عدد الموردين" 
          value={suppliers.length.toString()} 
          sub="الموردين النشطين في النظام"
          icon={Users} 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">تطور العمليات الأسبوعي</h3>
            <select className="bg-slate-50 border-none text-sm font-semibold rounded-lg p-2 outline-none cursor-pointer">
              <option>آخر 7 أيام</option>
              <option>آخر 30 يوم</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Suppliers Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6">حالة الموردين</h3>
          <div className="space-y-4">
            {suppliers.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.phone}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-indigo-600">{s.currentBalance.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">رصيد متاح</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-slate-400 border-2 border-dashed border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all">
            عرض كافة الموردين
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold">آخر الحركات المالية</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">تصدير CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">المورد</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">الكمية</th>
                <th className="px-6 py-4">سعر الوحدة</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {db.getLedger().slice(0, 5).map((l, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold">{suppliers.find(s => s.id === l.supplierId)?.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      l.type === 'إدخال' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{l.amountIn > 0 ? `+${l.amountIn}` : `-${l.amountOut}`}</td>
                  <td className="px-6 py-4 font-mono">{l.unitPrice.toFixed(4)}</td>
                  <td className="px-6 py-4 font-bold">{l.totalValue.toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
