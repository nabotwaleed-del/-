import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Coins, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    // محاكاة تأخير بسيط لتجربة مستخدم أفضل
    setTimeout(() => {
      const success = authService.login(username, password);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-6">
            <Coins className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">الوليد التجاري</h2>
          <p className="mt-2 text-slate-500 font-medium">مرحباً بك، يرجى تسجيل الدخول للمتابعة</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold">اسم المستخدم أو كلمة المرور غير صحيحة</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Al-Waleed Engine v2.5 • Secured Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;