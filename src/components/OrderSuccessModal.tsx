import React, { useState } from 'react';
import { OrderItem } from '../types';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Send, Copy, Check, X, MessageSquare } from 'lucide-react';

interface OrderSuccessModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const currencySym = settings.currency === 'USD' ? '$' : 'BDT ';

  const copyOrderSummary = () => {
    const text = `Order ID: ${order.id}\nBot: ${order.botTitle} (${order.botVersion || 'v1.0'})\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nTelegram: ${order.telegramUsername}\nPayment: ${order.paymentMethod} (TrxID: ${order.transactionId || 'None'})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#0e1420] text-slate-200 shadow-2xl p-5 sm:p-8 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-2xl font-extrabold text-white">
            Order Successfully Placed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Your order has been recorded in the database. Complete your order by sending your order details to the developer on Telegram below:
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-left text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Order Reference:</span>
            <span className="font-mono font-bold text-cyan-400">{order.id}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Bot Item:</span>
            <span className="font-semibold text-white truncate max-w-[220px]">
              {order.botTitle}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Customer:</span>
            <span className="text-slate-200">{order.customerName} ({order.customerPhone})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Price:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {currencySym}{order.amountBDT.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 1-Click Telegram Action */}
        <div className="space-y-2.5">
          <a
            href={order.telegramMessageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#0088cc]/40 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Open Telegram & Confirm Order (1-Click)</span>
          </a>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={copyOrderSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-xs text-emerald-300 border border-emerald-500/20 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Backup</span>
            </a>
          </div>
        </div>

        <div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
