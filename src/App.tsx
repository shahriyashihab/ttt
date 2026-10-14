import React, { useState, useMemo, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { BotItem, OrderItem } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BotCard } from './components/BotCard';
import { BotDetailModal } from './components/BotDetailModal';
import { OrderModal } from './components/OrderModal';
import { CustomBotModal } from './components/CustomBotModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import {
  Search,
  Sparkles,
  Code2,
  Headphones,
  Rocket,
  X,
  Layers,
  ArrowRight,
  Shield
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { bots } = useStore();

  // Category & Search filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedBotForDetails, setSelectedBotForDetails] = useState<BotItem | null>(null);
  const [selectedBotForOrder, setSelectedBotForOrder] = useState<BotItem | null>(null);
  const [isCustomBotOpen, setIsCustomBotOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<OrderItem | null>(null);

  // SECRET URL-BASED ADMIN ROUTING (#admin or /admin) & Owner Hotkey (Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#!/admin' ||
        path.endsWith('/admin') ||
        path === '/admin' ||
        search.includes('admin')
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Secret Owner Shortcut: Press Ctrl+Shift+A (or Cmd+Shift+A) to toggle admin console
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    try {
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else if (window.location.pathname.toLowerCase().endsWith('/admin')) {
        window.history.replaceState(null, '', '/' + window.location.search);
      } else if (window.location.search.toLowerCase().includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      window.location.hash = '';
    }
  };

  const categories = [
    'All',
    'E-Commerce & Shop',
    'File & Media Store',
    'Channel & Group',
    'Payment & Crypto',
    'Utility & AI',
  ];

  const filteredBots = useMemo(() => {
    if (!Array.isArray(bots)) return [];
    const query = searchQuery.trim().toLowerCase();
    return bots.filter((bot) => {
      if (!bot) return false;
      const matchCat = selectedCategory === 'All' || bot.category === selectedCategory;
      if (!query) return matchCat;
      const matchSearch =
        (bot.title && bot.title.toLowerCase().includes(query)) ||
        (bot.shortDescription && bot.shortDescription.toLowerCase().includes(query)) ||
        (Array.isArray(bot.features) && bot.features.some((f) => f && f.toLowerCase().includes(query))) ||
        (Array.isArray(bot.techStack) && bot.techStack.some((t) => t && t.toLowerCase().includes(query)));
      return matchCat && matchSearch;
    });
  }, [bots, selectedCategory, searchQuery]);

  const handleOrderSuccess = (order: OrderItem) => {
    setSelectedBotForOrder(null);
    setIsCustomBotOpen(false);
    setRecentOrderSuccess(order);
  };

  const handleScrollToBots = () => {
    const el = document.getElementById('bots');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 w-full overflow-x-hidden">
      {/* 100% Clean Customer-Facing Top Bar (Zero Admin Buttons) */}
      <Navbar
        onOpenCustomBot={() => setIsCustomBotOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onOpenCustomBot={() => setIsCustomBotOpen(true)}
          onExploreBots={handleScrollToBots}
        />

        {/* Bot Showcase & Catalog Section */}
        <section id="bots" className="py-4 sm:py-12 md:py-14 border-b border-white/10 bg-[#0c111c] relative w-full overflow-hidden">
          <div className="mx-auto max-w-7xl px-1 sm:px-6 lg:px-8 w-full box-border">
            {/* Header Strip & Search */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3 sm:mb-5">
              <div>
                <div className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Layers className="h-3 w-3" />
                  <span>Verified Telegram Bot Collection</span>
                </div>
                <h2 className="text-base sm:text-2xl md:text-3xl font-extrabold text-white">
                  Telegram Bot Storefront
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bots or commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 sm:mb-5 scrollbar-none w-full max-w-full">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0088cc] text-white shadow-md shadow-[#0088cc]/30'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                    }`}
                  >
                    {cat === 'All' ? 'All Bots' : cat}
                  </button>
                );
              })}
            </div>

            {/* 3 BOTS PER ROW GRID (MANDATORY 3 COLUMNS ON ALL SCREENS) */}
            {filteredBots.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-white/10 bg-slate-900/50 space-y-2 max-w-sm mx-auto">
                <div className="text-cyan-400 text-2xl font-mono">🔍</div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  No bots found in this category
                </h3>
                <p className="text-[11px] text-slate-400">
                  Custom bots can be engineered according to your exact requirements.
                </p>
                <button
                  onClick={() => setIsCustomBotOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088cc] text-white text-xs font-bold hover:bg-[#0077b5] transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Request Custom Bot</span>
                </button>
              </div>
            ) : (
              <div
                className="bot-grid-3cols grid grid-cols-3 gap-1 sm:gap-4 lg:gap-5 w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {filteredBots.map((bot) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onViewDetails={(b) => setSelectedBotForDetails(b)}
                    onOrder={(b) => setSelectedBotForOrder(b)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quality Architecture Section */}
        <section id="features" className="py-6 sm:py-12 md:py-14 border-b border-white/10 bg-[#0b0f17]">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <div className="text-[9px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                [Standards & Quality]
              </div>
              <h2 className="text-base sm:text-2xl font-extrabold text-white">
                Why Choose BotCraft Studio?
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Production-grade Telegram bots designed for durability and full ownership.
              </p>
            </div>

            {/* Compact 3-Column Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl bg-[#111724] border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">100% Clean Source Code</h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-tight pt-0.5">
                    Unobfuscated Python & Node.js code with zero backdoors or hidden fees.
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl bg-[#111724] border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Free Hosting Guide</h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-tight pt-0.5">
                    Setup guides for free 24/7 cloud runtime without recurring costs.
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl bg-[#111724] border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30 shrink-0">
                  <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">24/7 Telegram Support</h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-tight pt-0.5">
                    Direct voice, text, or screen-share onboarding support on Telegram.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Bot Banner */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#0e192a] via-[#10233b] to-[#0e192a] p-3 sm:p-5 flex items-center justify-between gap-3 shadow-md">
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-bold text-white truncate">
                  Need a Custom Telegram Bot?
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                  Tell us your specific requirements, workflow, and budget.
                </p>
              </div>
              <button
                onClick={() => setIsCustomBotOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] text-white font-bold text-[11px] sm:text-xs shadow transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Request Bot</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>

        {/* Contact & Social Section */}
        <ContactSection />
      </main>

      {/* 100% Customer-Facing Clean Footer */}
      <Footer onOpenCustomBot={() => setIsCustomBotOpen(true)} />

      {/* MODALS */}
      {selectedBotForDetails && (
        <BotDetailModal
          bot={selectedBotForDetails}
          onClose={() => setSelectedBotForDetails(null)}
          onOrder={(b) => {
            setSelectedBotForDetails(null);
            setSelectedBotForOrder(b);
          }}
        />
      )}

      {selectedBotForOrder && (
        <OrderModal
          bot={selectedBotForOrder}
          onClose={() => setSelectedBotForOrder(null)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {isCustomBotOpen && (
        <CustomBotModal
          isOpen={isCustomBotOpen}
          onClose={() => setIsCustomBotOpen(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {recentOrderSuccess && (
        <OrderSuccessModal
          order={recentOrderSuccess}
          onClose={() => setRecentOrderSuccess(null)}
        />
      )}

      {/* ADMIN CONSOLE (ONLY ACCESSIBLE VIA #admin IN URL OR CTRL+SHIFT+A) */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={handleCloseAdmin}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
