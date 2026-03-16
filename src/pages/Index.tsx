import { motion } from 'framer-motion';
import { Camera, ChefHat, ShoppingCart, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

function getDaysUntilExpiry(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return name ? `Good ${time}, ${name.split(' ')[0]}` : `Good ${time}`;
}

function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

const CATEGORY_EMOJI: Record<string, string> = { fridge: '🧊', cupboard: '🗄️', freezer: '❄️' };

export default function Index() {
  const navigate = useNavigate();
  const pantryItems = useAppStore((s) => s.pantryItems);
  const shoppingItems = useAppStore((s) => s.shoppingItems);
  const user = useAppStore((s) => s.user);

  const expiringItems = pantryItems
    .filter((i) => i.expiryDate && getDaysUntilExpiry(i.expiryDate) <= 3)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  const fridgeCount = pantryItems.filter((i) => i.category === 'fridge').length;
  const cupboardCount = pantryItems.filter((i) => i.category === 'cupboard').length;
  const freezerCount = pantryItems.filter((i) => i.category === 'freezer').length;
  const activeShoppingCount = shoppingItems.filter((i) => !i.completed).length;

  const recentItems = [...pantryItems]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 3);

  const quickActions = [
    { icon: Camera, title: 'Scan Ingredients', desc: 'Take a photo', bg: 'bg-secondary/10', color: 'text-secondary', path: '/chat' },
    { icon: ChefHat, title: "What's for Dinner?", desc: 'Get recipes', bg: 'bg-primary/10', color: 'text-primary', path: '/chat' },
    { icon: ShoppingCart, title: 'Smart Shop', desc: 'Compare prices', bg: 'bg-warning/10', color: 'text-warning', path: '/shopping' },
    { icon: MapPin, title: 'Nearby Stores', desc: 'Find stores', bg: 'bg-destructive/10', color: 'text-destructive', path: '/chat' },
  ];

  const handleExpiryCTA = () => {
    const names = expiringItems.slice(0, 3).map((i) => i.name).join(', ');
    navigate('/chat', { state: { initialMessage: `What can I make with ${names} that are expiring soon?` } });
  };

  return (
    <div className="app-container pb-20">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary-foreground">
              {user ? getGreeting(user.name) : <span>Pantry<span className="opacity-80">.</span>Pal</span>}
            </h1>
            {user && (
              <p className="text-xs text-primary-foreground/50 font-medium mt-0.5">Pantry.Pal — AI Food Assistant</p>
            )}
          </div>
          <div className="flex gap-2">
            <span className="pill bg-primary-foreground/10 text-primary-foreground text-xs">
              🧊 {pantryItems.length} items
            </span>
            {activeShoppingCount > 0 && (
              <span className="pill bg-primary-foreground/10 text-primary-foreground text-xs">
                🛒 {activeShoppingCount}
              </span>
            )}
          </div>
        </div>
        {!user && <p className="text-sm text-primary-foreground/60 font-medium">AI Food Assistant</p>}
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Expiry Alert */}
        {expiringItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border border-warning/20"
            style={{ background: 'linear-gradient(135deg, hsl(38, 92%, 50%, 0.08), hsl(0, 84%, 60%, 0.06))' }}
          >
            <p className="text-sm font-bold text-warning mb-2">⚠️ Expiring soon</p>
            <div className="space-y-1">
              {expiringItems.slice(0, 3).map((item) => {
                const days = getDaysUntilExpiry(item.expiryDate!);
                return (
                  <p key={item.id} className="text-sm text-foreground">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted-foreground"> — {days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `${days} days`}</span>
                  </p>
                );
              })}
            </div>
            <button
              onClick={handleExpiryCTA}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Get recipes to use these up →
            </button>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(action.path)}
              className="card-elevated p-4 text-left hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <p className="text-sm font-bold text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Pantry Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Pantry Summary</h2>
            <button onClick={() => navigate('/pantry')} className="text-xs font-semibold text-primary">
              View all →
            </button>
          </div>
          {[
            { label: '🧊 Fridge', count: fridgeCount, max: 15, color: 'gradient-primary' },
            { label: '🗄️ Cupboard', count: cupboardCount, max: 15, color: 'bg-warning' },
            { label: '❄️ Freezer', count: freezerCount, max: 10, color: 'bg-secondary' },
          ].map((bar) => (
            <div key={bar.label} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{bar.label}</span>
                <span className="text-muted-foreground">{bar.count} items</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                  style={{ width: `${Math.min((bar.count / bar.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recently Added */}
        {recentItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">Recently Added</h2>
              <button onClick={() => navigate('/pantry')} className="text-xs font-semibold text-primary">
                View pantry →
              </button>
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="text-lg">{CATEGORY_EMOJI[item.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.name} <span className="text-muted-foreground font-normal">— {item.quantity}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{getRelativeTime(item.addedDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
