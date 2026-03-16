import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus, Share2, MapPin, PoundSterling, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/appStore';

export default function Shopping() {
  const { shoppingItems, addShoppingItem, toggleShoppingItem, removeShoppingItem, clearCompletedItems } = useAppStore();
  const [newItem, setNewItem] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  const active = shoppingItems.filter((i) => !i.completed);
  const completed = shoppingItems.filter((i) => i.completed);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addShoppingItem(newItem.trim());
    setNewItem('');
  };

  const handleShare = () => {
    const text = active.map((i) => `☐ ${i.name}`).join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      toast.success('List copied to clipboard');
    });
  };

  const handlePriceCheck = () => {
    const names = active.map((i) => i.name).join(', ');
    navigate('/chat', { state: { initialMessage: `What's the cheapest price for these items near me: ${names}?` } });
  };

  const handleBestStore = () => {
    const names = active.map((i) => i.name).join(', ');
    navigate('/chat', { state: { initialMessage: `Which store near me has the best deal for: ${names}?` } });
  };

  return (
    <div className="app-container pb-20">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-black text-primary-foreground">Shopping List</h1>
        <p className="text-sm text-primary-foreground/60">{active.length} items to buy</p>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {/* Add input */}
        <div className="card-elevated flex items-center gap-2 px-3 h-12">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add item..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Empty state */}
        {active.length === 0 && completed.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🛒</span>
            <p className="text-sm text-muted-foreground">Your list is empty. Missing ingredients from recipes will appear here.</p>
          </div>
        )}

        {/* Active items */}
        <AnimatePresence>
          {active.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="card-elevated flex items-center gap-3 px-4 py-3 group"
            >
              <button
                onClick={() => toggleShoppingItem(item.id)}
                className="w-6 h-6 rounded-lg border-2 border-border flex items-center justify-center shrink-0 hover:border-primary transition-colors"
              />
              <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
              {item.price && (
                <span className="text-sm font-semibold text-primary">£{item.price.toFixed(2)}</span>
              )}
              <button
                onClick={() => removeShoppingItem(item.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
              Completed ({completed.length})
            </button>
            <AnimatePresence>
              {showCompleted && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden space-y-2">
                  {completed.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50">
                      <button
                        onClick={() => toggleShoppingItem(item.id)}
                        className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      <span className="flex-1 text-sm text-muted-foreground line-through">{item.name}</span>
                    </div>
                  ))}
                  <button onClick={clearCompletedItems} className="text-xs font-semibold text-destructive hover:underline px-4 py-1">
                    Clear all completed
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        {active.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handlePriceCheck}>
              <PoundSterling className="w-3.5 h-3.5 mr-1" />
              Price Check
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleBestStore}>
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Best Store
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5 mr-1" />
              Share
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
