import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronDown, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type PantryItem } from '@/stores/appStore';

function getDaysUntilExpiry(date?: string) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="pill bg-muted text-muted-foreground">No expiry</span>;
  if (days <= 2) return <span className="pill-destructive">{days <= 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d`}</span>;
  if (days <= 5) return <span className="pill-warning">{days}d left</span>;
  return <span className="pill-success">{days}d left</span>;
}

const QUICK_ADD = ['Eggs', 'Milk', 'Bread', 'Rice', 'Butter', 'Chicken', 'Onions', 'Garlic'];
const CATEGORIES = [
  { key: 'fridge' as const, label: '🧊 Fridge', emptyMsg: 'Nothing in the fridge yet. Tap + to add items.' },
  { key: 'cupboard' as const, label: '🗄️ Cupboard', emptyMsg: 'Your cupboard is empty. Add dry goods and tins.' },
  { key: 'freezer' as const, label: '❄️ Freezer', emptyMsg: 'Nothing frozen yet. Add your freezer items.' },
];

export default function Pantry() {
  const { pantryItems, addPantryItem, removePantryItem } = useAppStore();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'fridge' as const, expiryDate: '' });

  const filtered = pantryItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const handleAdd = () => {
    if (!newItem.name) return;
    addPantryItem({
      name: newItem.name,
      quantity: newItem.quantity || '1',
      category: newItem.category,
      expiryDate: newItem.expiryDate ? new Date(newItem.expiryDate).toISOString() : undefined,
    });
    setNewItem({ name: '', quantity: '', category: 'fridge', expiryDate: '' });
    setShowAdd(false);
  };

  return (
    <div className="app-container pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-black text-primary-foreground">My Pantry</h1>
        <p className="text-sm text-primary-foreground/60">{pantryItems.length} items tracked</p>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {/* Search */}
        <div className="card-elevated flex items-center gap-2 px-4 h-11">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pantry..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sections */}
        {CATEGORIES.map(({ key, label, emptyMsg }) => {
          const items = filtered.filter((i) => i.category === key);
          const isCollapsed = collapsed[key];
          const isSearching = search.length > 0;
          return (
            <div key={key} className="card-elevated overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-bold text-foreground">{label} ({items.length})</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
              </button>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {items.length === 0 ? (
                      <div className="px-4 pb-4 flex items-center gap-3">
                        <p className="text-sm text-muted-foreground flex-1">
                          {isSearching ? `No results for "${search}"` : emptyMsg}
                        </p>
                        {!isSearching && (
                          <button
                            onClick={() => { setNewItem((p) => ({ ...p, category: key })); setShowAdd(true); }}
                            className="text-xs font-semibold text-primary shrink-0"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 pb-3 space-y-2">
                        {items.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            className="flex items-center justify-between py-2 border-t border-border/30"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <ExpiryBadge days={getDaysUntilExpiry(item.expiryDate)} />
                              <button
                                onClick={() => removePantryItem(item.id)}
                                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {pantryItems.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">🧊</span>
            <p className="text-sm text-muted-foreground">Your pantry is empty. Tap + to add items or scan your fridge!</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 max-w-[480px] w-14 h-14 rounded-2xl gradient-primary shadow-xl flex items-center justify-center text-primary-foreground z-40 active:scale-95 transition-transform"
        style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card rounded-t-3xl z-50 p-6 pb-8"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Add Item</h3>
                <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Quick add chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_ADD.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      addPantryItem({ name: item, quantity: '1', category: newItem.category });
                      setShowAdd(false);
                    }}
                    className="pill bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom add */}
              <div className="space-y-3">
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Item name"
                  className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex gap-2">
                  <input
                    value={newItem.quantity}
                    onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                    placeholder="Qty"
                    className="flex-1 h-11 px-4 rounded-xl bg-muted text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value as any }))}
                    className="flex-1 h-11 px-3 rounded-xl bg-muted text-sm outline-none text-foreground"
                  >
                    <option value="fridge">Fridge</option>
                    <option value="cupboard">Cupboard</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none text-foreground"
                />
                <Button variant="gradient" size="lg" className="w-full" onClick={handleAdd}>
                  Add to Pantry
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
