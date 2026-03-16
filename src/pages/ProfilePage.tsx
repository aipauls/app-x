import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { MapPin, Bell, Info, LogOut, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const DIETS = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb'];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function AccountSection() {
  const { user, signIn, signOut, updateUser } = useAppStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Please enter a valid email'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (tab === 'signup' && !name.trim()) { toast.error('Please enter your name'); return; }
    const displayName = tab === 'signup' ? name.trim() : email.split('@')[0];
    signIn(displayName, email);
    toast.success(tab === 'signup' ? `Welcome, ${displayName}!` : 'Signed in!');
  };

  const handleSaveName = () => {
    if (!newName.trim()) return;
    updateUser({ name: newName.trim() });
    setEditingName(false);
    toast.success('Name updated');
  };

  if (user) {
    return (
      <div className="card-elevated p-5">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => toast.info('Photo upload coming soon')}
            className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <span className="text-xl font-black text-primary-foreground">{getInitials(user.name)}</span>
          </button>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="text-base font-bold bg-transparent border-b border-primary outline-none w-full"
                />
                <button onClick={handleSaveName} className="text-primary"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingName(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-foreground truncate">{user.name}</p>
                <button onClick={() => { setNewName(user.name); setEditingName(true); }} className="text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4 space-y-1">
          <button
            onClick={() => { signOut(); toast.success('Signed out'); }}
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-5">
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
        {(['signin', 'signup'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            {t === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleAuth} className="space-y-3">
        {tab === 'signup' && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold mt-1 active:scale-[0.98] transition-transform"
        >
          {tab === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { dietaryPreferences, setDietaryPreferences, notificationsEnabled, setNotificationsEnabled, user } = useAppStore();

  const toggleDiet = (diet: string) => {
    if (diet === 'None') { setDietaryPreferences([]); return; }
    setDietaryPreferences(
      dietaryPreferences.includes(diet)
        ? dietaryPreferences.filter((d) => d !== diet)
        : [...dietaryPreferences.filter((d) => d !== 'None'), diet]
    );
  };

  return (
    <div className="app-container pb-24">
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-black text-primary-foreground">Profile</h1>
        <p className="text-sm text-primary-foreground/60">{user ? `Signed in as ${user.name}` : 'Account & preferences'}</p>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {/* Account */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Account</p>
          <AccountSection />
        </div>

        {/* App Settings */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">App Settings</p>

          <div className="space-y-3">
            {/* Dietary */}
            <div className="card-elevated p-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Dietary Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((diet) => {
                  const isActive = diet === 'None' ? dietaryPreferences.length === 0 : dietaryPreferences.includes(diet);
                  return (
                    <button
                      key={diet}
                      onClick={() => toggleDiet(diet)}
                      className={`pill transition-all cursor-pointer ${isActive ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div className="card-elevated p-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Location</h2>
              <button className="flex items-center gap-3 w-full py-2 text-sm text-primary font-medium">
                <MapPin className="w-4 h-4" />
                <span>Detect my location</span>
              </button>
            </div>

            {/* Notifications */}
            <div className="card-elevated p-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Notifications</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Expiry alerts</span>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'gradient-primary' : 'bg-muted'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-all ${notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* About */}
            <div className="card-elevated p-4">
              <div className="flex items-center gap-3 mb-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">About</h2>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Pantry<span className="text-primary font-bold">.</span>Pal — AI Food Assistant</p>
                <p className="text-xs">Cook smarter. Waste less. Save more.</p>
                <p className="text-xs">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
