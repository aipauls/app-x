import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, Clock, Users, Flame } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore, type ChatMessage, type Recipe } from '@/stores/appStore';

const AGENTS = [
  { name: 'Orchestrator', emoji: '⚡' },
  { name: 'Vision', emoji: '📷' },
  { name: 'Chef', emoji: '👨‍🍳' },
  { name: 'Shopping', emoji: '🛒' },
  { name: 'Location', emoji: '📍' },
];

const QUICK_CHIPS = [
  "What can I cook tonight?",
  "Use up expiring food",
  "Find cheap meals",
  "Stores nearby",
];

const MOCK_RECIPES: Recipe[] = [
  {
    id: '1', name: 'Chicken & Spinach Stir-Fry', description: 'Quick and healthy stir-fry using ingredients about to expire',
    matchPercent: 85, time: '20 min', difficulty: 'Easy', servings: 2, tags: ['Quick', 'Healthy'],
    haveIngredients: ['Chicken Breast', 'Spinach', 'Eggs', 'Olive Oil'],
    needIngredients: ['Soy Sauce', 'Ginger'],
    steps: ['Slice chicken into strips and season with salt and pepper.', 'Heat olive oil in a wok over high heat.', 'Cook chicken for 5 minutes until golden.', 'Add spinach and stir until wilted.', 'Beat eggs, push chicken aside, scramble eggs in the wok.', 'Mix everything together and serve.'],
    chefTip: 'Add a splash of soy sauce at the end for extra umami flavour.',
  },
  {
    id: '2', name: 'Cheesy Pasta Bake', description: 'Comfort food using your pantry staples',
    matchPercent: 72, time: '35 min', difficulty: 'Easy', servings: 4, tags: ['Comfort', 'Family'],
    haveIngredients: ['Pasta', 'Cheddar Cheese', 'Tinned Tomatoes', 'Olive Oil'],
    needIngredients: ['Mozzarella'],
    steps: ['Cook pasta according to packet instructions.', 'Make a tomato sauce with tinned tomatoes and olive oil.', 'Mix pasta with sauce in an oven-safe dish.', 'Top with grated cheddar and bake at 200°C for 15 minutes.'],
    chefTip: 'Add frozen peas from your freezer for extra veg and colour.',
  },
  {
    id: '3', name: 'Egg Fried Rice', description: 'Classic quick meal with pantry ingredients',
    matchPercent: 90, time: '15 min', difficulty: 'Easy', servings: 2, tags: ['Quick', 'Budget'],
    haveIngredients: ['Rice', 'Eggs', 'Frozen Peas', 'Olive Oil'],
    needIngredients: ['Soy Sauce'],
    steps: ['Cook rice and let it cool slightly.', 'Scramble eggs in a hot wok with olive oil.', 'Add rice and frozen peas, stir-fry on high heat.', 'Season to taste and serve.'],
    chefTip: 'Day-old rice works best for fried rice — it has less moisture.',
  },
];

function RecipeCard({ recipe, onExpand }: { recipe: Recipe; onExpand: () => void }) {
  return (
    <button onClick={onExpand} className="w-full text-left card-elevated p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-foreground flex-1">{recipe.name}</h4>
        <span className="pill-success ml-2">{recipe.matchPercent}% match</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{recipe.description}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.time}</span>
        <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{recipe.difficulty}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings} servings</span>
      </div>
    </button>
  );
}

function RecipeDetail({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const addShoppingItem = useAppStore((s) => s.addShoppingItem);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[480px] max-h-[85vh] bg-card rounded-t-3xl overflow-y-auto z-10 pb-8"
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border/30">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-3" />
          <h2 className="text-lg font-black text-foreground">{recipe.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.time}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{recipe.difficulty}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings}</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {recipe.tags.map((tag) => (
              <span key={tag} className="pill-primary">{tag}</span>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">✅ Ingredients you have</h3>
            <div className="flex flex-wrap gap-1.5">
              {recipe.haveIngredients.map((ing) => (
                <span key={ing} className="pill-success">✓ {ing}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">🛒 You'll need</h3>
            <div className="flex flex-wrap gap-1.5">
              {recipe.needIngredients.map((ing) => (
                <button
                  key={ing}
                  onClick={() => addShoppingItem(ing)}
                  className="pill-warning cursor-pointer hover:bg-warning/20 transition-colors"
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Steps</h3>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4 border border-warning/20" style={{ background: 'hsl(38, 92%, 50%, 0.06)' }}>
            <p className="text-sm font-semibold text-warning mb-1">👨‍🍳 Chef's Tip</p>
            <p className="text-sm text-foreground">{recipe.chefTip}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Chat() {
  const { chatMessages, addChatMessage } = useAppStore();
  const [input, setInput] = useState('');
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<Recipe | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialSentRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      addChatMessage({ role: 'user', content: state.initialMessage });
      simulateResponse(state.initialMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const simulateResponse = (userMsg: string) => {
    setActiveAgents(['Orchestrator']);
    addChatMessage({ role: 'status', content: '⚡ Orchestrator analysing your request...' });

    setTimeout(() => {
      setActiveAgents(['Orchestrator', 'Chef']);
      addChatMessage({ role: 'status', content: '👨‍🍳 Chef Agent finding recipes from your pantry...' });
    }, 800);

    setTimeout(() => {
      setActiveAgents(['Chef']);
      addChatMessage({
        role: 'assistant',
        content: `Great question! I've looked through your pantry and found **3 recipes** you can make. I've prioritised items that are expiring soon — your chicken breast and spinach need using up!\n\nHere are your top matches:`,
        agents: ['Orchestrator', 'Chef'],
        richContent: { type: 'recipes', data: MOCK_RECIPES },
      });
      setActiveAgents([]);
    }, 2000);
  };

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    addChatMessage({ role: 'user', content: msg });
    setInput('');
    simulateResponse(msg);
  };

  const anyActive = activeAgents.length > 0;

  return (
    <div className="app-container flex flex-col h-screen">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-4 rounded-b-2xl shrink-0">
        <h1 className="text-xl font-black text-primary-foreground">AI Assistant</h1>
        {/* Agent status bar */}
        <div className="mt-3">
          <p className="text-[10px] text-primary-foreground/40 uppercase tracking-widest font-semibold mb-1.5">
            {anyActive ? 'Working…' : 'Powered by 5 AI agents'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {AGENTS.map((agent) => {
              const isActive = activeAgents.includes(agent.name);
              return (
                <div
                  key={agent.name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive ? 'bg-primary/20 text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/50'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />}
                  <span>{agent.emoji} {agent.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">👨‍🍳</span>
            <h2 className="text-lg font-bold text-foreground mb-2">What can I help with?</h2>
            <p className="text-sm text-muted-foreground">Ask me about recipes, ingredients, prices, or nearby stores</p>
          </div>
        )}

        <AnimatePresence>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'status' ? (
                <div className="w-full text-center">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-secondary/10 text-xs font-medium text-muted-foreground">
                    {msg.content}
                  </span>
                </div>
              ) : msg.role === 'user' ? (
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md gradient-primary text-primary-foreground text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[90%] space-y-2">
                  {msg.agents && (
                    <div className="flex gap-1">
                      {msg.agents.map((a) => {
                        const agent = AGENTS.find((ag) => ag.name === a);
                        return (
                          <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {agent?.emoji} {a}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="card-elevated px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                  {msg.richContent?.type === 'recipes' && (
                    <div className="space-y-2">
                      {(msg.richContent.data as Recipe[]).map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onExpand={() => setExpandedRecipe(recipe)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick chips */}
      {chatMessages.length === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="pill bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-20 pt-2 shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl gradient-camera flex items-center justify-center shrink-0 text-primary-foreground active:scale-95 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-xl bg-card border border-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expandedRecipe && <RecipeDetail recipe={expandedRecipe} onClose={() => setExpandedRecipe(null)} />}
      </AnimatePresence>
    </div>
  );
}
