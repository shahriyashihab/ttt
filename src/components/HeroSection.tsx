import React from 'react';
import { useStore } from '../context/StoreContext';
import { BOT_IMAGES } from '../data/botImages';
import { Send, Sparkles, ArrowDown, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onOpenCustomBot: () => void;
  onExploreBots: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenCustomBot, onExploreBots }) => {
  const { settings } = useStore();

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#080d16] pt-5 pb-5 sm:pt-12 sm:pb-14">
      {/* High-Tech Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-70 pointer-events-none" />

      {/* Ambient Radial Cyber Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[180px] sm:h-[300px] bg-[#0088cc]/20 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
            {/* High-Tech Live Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/50 backdrop-blur-md shadow-sm shadow-cyan-500/20">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                Telegram Bot Automation Hub
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]" style={{ textWrap: 'balance' }}>
              <span className="bg-gradient-to-r from-[#00a8ff] via-[#29b6f6] to-[#00ffcc] bg-clip-text text-transparent animate-gradient-text drop-shadow-[0_0_25px_rgba(0,168,255,0.3)]">
                High-Performance
              </span>{' '}
              Telegram Bots Built for{' '}
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Serious Businesses
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              {settings.heroSubheadline || 'Explore production-ready Telegram bots with clean source code, instant deployment guides, or order a custom-tailored bot with direct seller support.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={onExploreBots}
                className="group relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#0088cc] via-[#00a8ff] to-[#00d2ff] hover:from-[#0077b5] hover:to-[#00a8ff] rounded-xl shadow-lg shadow-[#0088cc]/35 hover:shadow-[#0088cc]/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Browse Bots</span>
                <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenCustomBot}
                className="group relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-cyan-300 bg-slate-900/90 hover:bg-slate-800/90 rounded-xl border border-cyan-400/40 hover:border-cyan-400 shadow-md shadow-cyan-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>Custom Bot</span>
              </button>
            </div>

            {/* Clean Micro Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[10px] sm:text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/5 text-cyan-300">
                <Zap className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>100% Unobfuscated Code</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/5 text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>Instant Deployment</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/5 text-purple-300">
                <ShieldCheck className="h-3 w-3 text-purple-400 shrink-0" />
                <span>Manual Verification</span>
              </span>
            </div>
          </div>

          {/* Desktop Visual Preview */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-900/80 shadow-2xl shadow-cyan-950/50 group animate-float">
              <img
                src={BOT_IMAGES.hero}
                alt="Telegram Bot Assistant Preview"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-cyan-400 font-mono font-medium">LIVE TELEGRAM HUB</div>
                  <div className="text-xs font-bold text-white">24/7 Automated Operations</div>
                </div>
                <a
                  href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Chat Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
