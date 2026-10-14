import React from 'react';
import { useStore } from '../context/StoreContext';
import { Send } from 'lucide-react';

interface FooterProps {
  onOpenCustomBot: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCustomBot }) => {
  const { settings } = useStore();

  return (
    <footer className="border-t border-white/10 bg-[#080c14] py-10 sm:py-12 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0088cc] text-white">
                <Send className="h-4 w-4" />
              </div>
              <span>{settings.brandName}</span>
            </div>
            <p className="text-slate-300 max-w-sm leading-relaxed text-xs">
              Premier destination for Telegram bots, automated digital shops, community management, and bespoke bot engineering.
            </p>
            <div className="text-[11px] text-cyan-400 font-mono">
              24/7 direct Telegram developer consultation & instant setup.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider">
              Navigation
            </div>
            <ul className="space-y-1.5">
              <li>
                <a href="#bots" className="hover:text-cyan-400 transition-colors">
                  Bot Catalog
                </a>
              </li>
              <li>
                <button onClick={onOpenCustomBot} className="hover:text-cyan-400 transition-colors text-left cursor-pointer">
                  Request Custom Bot
                </button>
              </li>
              <li>
                <a href="#payment-info" className="hover:text-cyan-400 transition-colors">
                  Payment Accounts
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-400 transition-colors">
                  Support Channels
                </a>
              </li>
            </ul>
          </div>

          {/* Official Community */}
          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider">
              Official Hub
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Join Official Telegram Channel
                </a>
              </li>
              <li>
                <span className="text-slate-400">
                  Global 24/7 Availability
                </span>
              </li>
              <li>
                <span className="text-cyan-400 font-mono text-[11px]">
                  Real-Time Verified Infrastructure
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            <a href="#admin" className="hover:text-slate-300 transition-colors" title="Owner Admin Shortcut: #admin or Ctrl+Shift+A">
              © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
            </a>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by</span>
            <span className="text-cyan-400 font-semibold">{settings.brandName}</span>
            <span>• Telegram Automation Systems</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
