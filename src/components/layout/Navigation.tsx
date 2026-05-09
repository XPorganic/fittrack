import { clsx } from 'clsx';
import { Home, Target, UtensilsCrossed, Lightbulb, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/goals', icon: Target, label: '目标' },
  { path: '/meals', icon: UtensilsCrossed, label: '饮食' },
  { path: '/advice', icon: Lightbulb, label: '建议' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-turquoise-500 bg-turquoise-50' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
              <span className={clsx('text-xs mt-1 font-medium', isActive && 'font-semibold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-turquoise-400 to-turquoise-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">FitTrack</h1>
            <p className="text-xs text-gray-400">健康每一天</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-gradient-to-r from-turquoise-400 to-turquoise-500 text-white shadow-lg shadow-turquoise-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-turquoise-50 to-teal-50">
          <p className="text-xs text-gray-500 mb-1">今日步数</p>
          <p className="text-lg font-bold text-turquoise-600">8,432 步</p>
        </div>
      </div>
    </aside>
  );
}
