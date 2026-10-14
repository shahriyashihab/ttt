import React, { useState } from 'react';
import { BotItem } from '../types';
import { useStore } from '../context/StoreContext';
import { X, Send, ShoppingCart, CheckCircle2, Shield, Cpu, PackageCheck, ExternalLink, Star, Tag } from 'lucide-react';
import { resolveBotImage, getCategoryFallback } from '../data/botImages';

interface BotDetailModalProps {
  bot: BotItem | null;
  onClose: () => void;
  onOrder: (bot: BotItem) => void;
}

export const BotDetailModal: React.FC<BotDetailModalProps> = ({ bot, onClose, onOrder }) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'admin' | 'tech'>('overview');

  if (!bot) return null;

  const currencySym = settings.currency === 'USD' ? '$' : 'BDT ';
  const displayImage = resolveBotImage(bot.image, bot.category);
  const telegramChatUrl = `https://t.me/${settings.telegramUsername.replace('@', '')}?text=${encodeURIComponent(
    `Hello! I am inquiring about "${bot.title}" (${bot.version || 'latest version'}).`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0e1420] text-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-[#111724]">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider">
              {bot.category}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{bot.version || 'v1.0.0'}</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-xs text-slate-400">{bot.deliveryTime}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Banner Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
            <div className="md:col-span-5 rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-slate-900">
              <img
                src={displayImage}
                alt={bot.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCategoryFallback(bot.category);
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-7 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Version: {bot.version || 'v1.0.0'}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {bot.id}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {bot.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {bot.fullDescription}
              </p>

              {/* Price & Rating */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-white/10">
                <div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Package Price</div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tabular-nums">
                    {currencySym}{bot.priceBDT.toLocaleString()}
                    <span className="text-xs text-slate-400 ml-1.5 font-normal">
                      (${bot.priceUSD} USD)
                    </span>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-4 sm:pl-6">
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Client Rating</div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{bot.rating} / 5.0</span>
                    <span className="text-xs text-slate-400">({bot.salesCount}+ Deployed)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOrder(bot);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] rounded-xl shadow-lg shadow-[#0088cc]/25 transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Order This Bot</span>
                </button>

                {bot.demoBotUsername && (
                  <a
                    href={`https://t.me/${bot.demoBotUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 text-xs font-semibold text-cyan-300 bg-slate-900 hover:bg-slate-800 rounded-xl border border-cyan-500/40 transition-colors"
                  >
                    <span>Test Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <a
                  href={telegramChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 sm:p-3 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-white/15 transition-colors"
                  title="Ask Developer on Telegram"
                >
                  <Send className="h-4 w-4 text-[#29b6f6]" />
                </a>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 pt-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Key Features ({bot.features.length})
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'commands'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Commands & Functions ({bot.commands.length})
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Admin Controls
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'tech'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Tech Stack & Inclusions
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
              {bot.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5"
                >
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Commands */}
          {activeTab === 'commands' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-xs text-slate-400">
                Granular command registry programmed into this bot instance:
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="px-3.5 py-2.5">Command</th>
                      <th className="px-3.5 py-2.5">Role</th>
                      <th className="px-3.5 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#111724]">
                    {bot.commands.map((cmd, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-cyan-300 whitespace-nowrap">
                          {cmd.command}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span className={`inline-block font-mono text-[11px] ${
                            cmd.role === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
                          }`}>
                            {cmd.role === 'admin' ? 'ADMIN ONLY' : 'USER'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-300">
                          {cmd.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Admin Features */}
          {activeTab === 'admin' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-xs text-slate-400">
                Admin management capabilities available directly inside Telegram:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bot.adminFeatures.map((admFeat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/10"
                  >
                    <Shield className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200">{admFeat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Tech Stack */}
          {activeTab === 'tech' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <span>Architecture & Frameworks:</span>
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {bot.techStack.map((tech, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-cyan-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-cyan-400" />
                  <span>Package Inclusions:</span>
                </h4>
                <div className="space-y-2">
                  {bot.includes.map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 px-4 sm:px-6 py-3.5 bg-[#111724] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Delivery: <span className="text-white font-medium">{bot.deliveryTime}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOrder(bot);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Proceed to Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
