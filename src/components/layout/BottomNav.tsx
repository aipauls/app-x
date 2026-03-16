import { Home, Package, MessageCircle, ShoppingCart, UserCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/pantry', icon: Package, label: 'Pantry' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/shopping', icon: ShoppingCart, label: 'Shop' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const shoppingItems = useAppStore((s) => s.shoppingItems);
  const activeCount = shoppingItems.filter((i) => !i.completed).length;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
                {label === 'Shop' && activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full gradient-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{label}</span>
              {active && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gradient-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
