import React from 'react';
import { useStore } from '../context/StoreContext';
import { Send, Sparkles, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCustomBot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCustomBot }) => {
  const { settings } = useStore();
  const telegramUrl = `https://t.me/${settings.telegramUsername.replace('@', '')}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080d16]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 lg:px-8">
        {/* Brand Lockup */}
        <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0088cc] to-[#00a8ff] text-white shadow-md shadow-[#0088cc]/30 group-hover:scale-105 transition-transform">
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-[#29b6f6] transition-colors">
              {settings.brandName}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-cyan-400">
              [Telegram Bot Systems]
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#bots" className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Bot Catalog
          </a>
          <button
            onClick={onOpenCustomBot}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap flex items-center gap-1.5 text-cyan-400 font-semibold cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Custom Bot Request
          </button>
          <a href="#features" className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Quality Architecture
          </a>
          <a href="#payment-info" className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Payment Methods
          </a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            Support Channels
          </a>
        </nav>

        {/* Right Action Cluster: Pure Customer Telegram CTA (Zero Public Admin Link) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] rounded-xl shadow-md shadow-[#0088cc]/25 transition-all whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Chat on Telegram</span>
            <span className="sm:hidden">Telegram</span>
          </a>
        </div>
      </div>
    </header>
  );
};
