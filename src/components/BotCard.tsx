import React from 'react';
import { BotItem } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Tag, ChevronRight } from 'lucide-react';
import { resolveBotImage, getCategoryFallback } from '../data/botImages';

interface BotCardProps {
  bot: BotItem;
  onViewDetails: (bot: BotItem) => void;
  onOrder: (bot: BotItem) => void;
}

export const BotCard: React.FC<BotCardProps> = ({ bot, onViewDetails }) => {
  const { settings } = useStore();
  const currencySym = settings.currency === 'USD' ? '$' : 'BDT ';
  const displayImage = resolveBotImage(bot.image, bot.category);

  return (
    <div
      onClick={() => onViewDetails(bot)}
      className="bot-card-item flex flex-col rounded-lg sm:rounded-xl border border-white/10 bg-[#101624] overflow-hidden hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-950/40 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
      style={{
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Compact Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={displayImage}
          alt={bot.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getCategoryFallback(bot.category);
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-60" />

        {/* Bot Version Pill */}
        <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md text-[7px] sm:text-[9.5px] font-mono font-bold text-cyan-300 flex items-center gap-0.5 max-w-[45px] sm:max-w-none shrink-0 truncate">
          <Tag className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 text-cyan-400 shrink-0" />
          <span className="truncate">{bot.version || 'v1.0'}</span>
        </div>

        {/* Rating Star Badge */}
        <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-slate-950/90 border border-white/10 backdrop-blur-md text-[7px] sm:text-[9.5px] font-mono text-amber-400 flex items-center gap-0.5 shrink-0">
          <Star className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 fill-amber-400 shrink-0" />
          <span>{bot.rating}</span>
        </div>
      </div>

      {/* Compact Content Container */}
      <div className="flex flex-1 flex-col p-1 sm:p-2.5 justify-between space-y-1 sm:space-y-1.5 min-w-0">
        <div className="min-w-0">
          {/* Category Tag */}
          <div className="text-[7.5px] sm:text-[10px] font-mono text-cyan-400 uppercase tracking-tight truncate block">
            {bot.category}
          </div>
          {/* Title (2 lines clamp) */}
          <h3 className="text-[9px] sm:text-xs md:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-[1.2] pt-0.5 break-words">
            {bot.title}
          </h3>
        </div>

        {/* Price & Tap Indicator */}
        <div className="pt-1 border-t border-white/5 flex items-center justify-between gap-0.5 min-w-0">
          <div className="min-w-0 flex-1 truncate">
            <span className="text-[8.5px] sm:text-xs md:text-sm font-extrabold text-white font-mono tabular-nums leading-none truncate block">
              {currencySym}{bot.priceBDT.toLocaleString()}
            </span>
            <span className="hidden sm:inline text-[9px] text-slate-400 font-mono ml-0.5">
              (${bot.priceUSD})
            </span>
          </div>
          <div className="flex items-center text-[8.5px] sm:text-[10px] font-semibold text-cyan-400 shrink-0">
            <span className="hidden md:inline text-[9px] mr-0.5">Details</span>
            <ChevronRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
