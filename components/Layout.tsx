import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  ShieldCheck, 
  Coins, 
  PlusCircle,
  Menu,
  X,
  Briefcase,
  LogOut
} from 'lucide-react';
import { authService } from '../services/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const user = authService.getUser();

  const navItems = [
    { name: 'لوحة التحكم', path: '/', icon: LayoutDashboard },
    { name: 'الموردون', path: '/suppliers', icon: Users },
    { name: 'العملاء', path: '/clients', icon: Briefcase },
    { name: 'العمليات', path: '/transactions', icon: ArrowLeftRight },
    { name: 'التقارير المالية', path: '/reports', icon: BarChart3 },
    { name: 'التدقيق والمراجعة', path: '/audit', icon: ShieldCheck },
  ];

  const activePath = location.pathname;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">الوليد التجاري</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activePath === item.path 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.username?.substring(0, 2) || 'AD'}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{user?.username || 'مدير النظام'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role || 'Admin'}</p>
            </div>
          </div>
          <button 
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex justify-between items-center shadow-sm no-print">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-indigo-600" />
          <span className="font-bold">الوليد التجاري</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 text-white z-40 p-6 pt-20 no-print">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 text-lg border-b border-slate-800 pb-3 ${
                  activePath === item.path ? 'text-indigo-400' : 'text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.name}
              </Link>
            ))}
            <button 
              onClick={() => authService.logout()}
              className="flex items-center gap-4 text-lg text-rose-400 pt-4"
            >
              <LogOut className="w-6 h-6" />
              تسجيل الخروج
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-8 sticky top-0 z-30 shadow-sm no-print">
          <h1 className="text-xl font-bold text-slate-800">
            {navItems.find(n => n.path === activePath)?.name || 'الرئيسية'}
          </h1>
          <div className="flex gap-4">
            <Link to="/transactions" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              <PlusCircle className="w-4 h-4" />
              عملية جديدة
            </Link>
          </div>
        </header>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;