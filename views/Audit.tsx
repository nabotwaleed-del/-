
import React from 'react';
import { db } from '../services/mockDb';
import { ShieldAlert, User, Clock, CheckCircle, Database } from 'lucide-react';

const Audit: React.FC = () => {
  const logs = db.getAuditLogs();
  
  // Dummy logs if empty for demo
  const displayLogs = logs.length > 0 ? logs : [
    { id: '1', action: 'CREATE', table: 'sales_transactions', recordId: 's1', operator: 'مدير النظام', timestamp: new Date().toISOString(), newData: { qty: 50000, price: 3.8 } },
    { id: '2', action: 'UPDATE', table: 'suppliers', recordId: '1', operator: 'محاسب أ', timestamp: new Date(Date.now() - 3600000).toISOString(), oldData: { bal: 0 }, newData: { bal: 100000 } },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">سجل المراجعة والتدقيق</h2>
          <p className="text-slate-400 max-w-xl">
            يتم تسجيل كافة العمليات الإدارية والمالية والحساسة هنا لضمان الشفافية وإمكانية العودة للتاريخ في حال وجود أي فروقات مالية.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <ShieldAlert className="absolute bottom-4 left-4 w-24 h-24 text-white/5" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold">الحركات الأخيرة المسجلة</h3>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            النظام مشفر ومؤمن بالكامل
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {displayLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">
                      {log.action === 'CREATE' ? 'إضافة سجل جديد' : 'تعديل بيانات'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-mono">
                      {log.table}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.operator}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  {log.newData && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-500 border border-slate-100 overflow-x-auto max-w-md">
                      {JSON.stringify(log.newData)}
                    </div>
                  )}
                </div>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:underline">
                تفاصيل المرجع
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Audit;
