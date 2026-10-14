import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Send, MessageSquare, Facebook, Instagram, Mail, Phone, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings } = useStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const telegramUserUrl = `https://t.me/${settings.telegramUsername.replace('@', '')}`;
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`;

  const copyNumber = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="contact" className="relative border-b border-white/10 bg-[#0d121c] py-8 sm:py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400">
            [Direct Communication Channels]
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white">
            Connect & Social Support
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300">
            Tap any messenger below for instant 1-on-1 developer consultation.
          </p>
        </div>

        {/* Compact Responsive Communication Grid (2x2 on Mobile, 4 on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5">
          {/* Telegram Tile */}
          <a
            href={telegramUserUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#0e1726] to-[#122038] border border-[#0088cc]/30 hover:border-[#0088cc] hover:shadow-lg hover:shadow-[#0088cc]/20 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#0088cc] text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-[#0088cc]/30">
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1">
                <span>Telegram</span>
                <ExternalLink className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan-300 font-mono truncate">
                {settings.telegramUsername.startsWith('@') ? settings.telegramUsername : `@${settings.telegramUsername}`}
              </div>
            </div>
          </a>

          {/* WhatsApp Tile */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#0e1726] to-[#0f2420] border border-emerald-500/25 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/15 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/30">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1">
                <span>WhatsApp</span>
                <ExternalLink className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-300 font-mono truncate">
                {settings.whatsappNumber}
              </div>
            </div>
          </a>

          {/* Messenger Tile */}
          <a
            href={settings.messengerUrl || settings.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#0e1726] to-[#121c35] border border-blue-500/25 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-600/30">
              <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1">
                <span>Messenger</span>
                <ExternalLink className="h-2.5 w-2.5 text-blue-400 shrink-0" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-blue-300 truncate">
                Direct Chat
              </div>
            </div>
          </a>

          {/* Instagram Tile */}
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#0e1726] to-[#241324] border border-purple-500/25 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/15 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-purple-600/30">
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1">
                <span>Instagram</span>
                <ExternalLink className="h-2.5 w-2.5 text-purple-400 shrink-0" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-purple-300 truncate">
                Reels & Stories
              </div>
            </div>
          </a>
        </div>

        {/* Manual Payment Section */}
        <div id="payment-info" className="rounded-xl border border-white/10 bg-[#111724] p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Manual Payment Accounts (Send Money)</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400">
              Instant Verification • Zero Fees
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {/* bKash */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-colors">
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-cyan-400 font-bold">bKash Personal</div>
                <div className="text-[11px] text-slate-200 truncate">{settings.bkashNumber}</div>
              </div>
              <button
                type="button"
                onClick={() => copyNumber(settings.bkashNumber, 'bkash')}
                className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                title="Copy Number"
              >
                {copiedKey === 'bkash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-950/20 border border-orange-500/20">
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-orange-400 font-bold">Nagad Personal</div>
                <div className="text-[11px] text-slate-200 truncate">{settings.nagadNumber}</div>
              </div>
              <button
                type="button"
                onClick={() => copyNumber(settings.nagadNumber, 'nagad')}
                className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                title="Copy Number"
              >
                {copiedKey === 'nagad' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Rocket */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/20 border border-purple-500/20">
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-purple-400 font-bold">Rocket Personal</div>
                <div className="text-[11px] text-slate-200 truncate">{settings.rocketNumber}</div>
              </div>
              <button
                type="button"
                onClick={() => copyNumber(settings.rocketNumber, 'rocket')}
                className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                title="Copy Number"
              >
                {copiedKey === 'rocket' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Binance Pay */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
              <div className="min-w-0 pr-1">
                <div className="text-[10px] text-amber-400 font-bold">Binance Pay (USDT)</div>
                <div className="text-[11px] text-slate-200 truncate">{settings.binancePayId}</div>
              </div>
              <button
                type="button"
                onClick={() => copyNumber(settings.binancePayId, 'binance')}
                className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                title="Copy Number"
              >
                {copiedKey === 'binance' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Compact Email & Hotline Row */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>Email: <span className="font-mono text-slate-200">{settings.email}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Hotline: <span className="font-mono text-slate-200">{settings.phone}</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
