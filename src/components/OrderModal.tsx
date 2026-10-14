import React, { useState } from 'react';
import { BotItem, OrderItem } from '../types';
import { useStore } from '../context/StoreContext';
import { X, Copy, Check, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';

interface OrderModalProps {
  bot: BotItem | null;
  onClose: () => void;
  onSuccess: (order: OrderItem) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ bot, onClose, onSuccess }) => {
  const { settings, createOrder } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Binance/USDT' | 'Bank Transfer' | 'Telegram Discussion'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!bot) return null;

  const currencySym = settings.currency === 'USD' ? '$' : 'BDT ';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Please enter your contact phone or WhatsApp number.');
      return;
    }
    if (!telegramUsername.trim()) {
      setErrorMsg('Please enter your Telegram handle (e.g. @your_username).');
      return;
    }

    const created = createOrder({
      botId: bot.id,
      botTitle: bot.title,
      botVersion: bot.version,
      orderType: 'ready_bot',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      telegramUsername: telegramUsername.trim().startsWith('@') ? telegramUsername.trim() : `@${telegramUsername.trim()}`,
      instagramUsername: instagramUsername.trim() || undefined,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      amountBDT: bot.priceBDT,
      customerNotes: customerNotes.trim() || undefined,
    });

    onSuccess(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0e1420] text-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-[#111724]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Order Bot & Manual Payment Confirmation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Summary Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20">
            <div>
              <div className="text-[11px] text-slate-400">Selected Bot:</div>
              <div className="text-sm font-bold text-white">{bot.title}</div>
              <div className="text-[10px] font-mono text-cyan-400">{bot.version || 'v1.0.0'}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Due:</div>
              <div className="text-base sm:text-lg font-extrabold text-cyan-400 font-mono tabular-nums">
                {currencySym}{bot.priceBDT.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Manual Payment Instructions */}
          <div className="space-y-2.5 rounded-xl border border-white/10 bg-[#121927] p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Manual Payment Accounts (Send Money):</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Personal / Instant</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Send the package price ({currencySym}{bot.priceBDT.toLocaleString()}) to any account below and enter your Transaction ID (TrxID) in the form:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div>
                  <span className="text-cyan-400 font-bold">bKash: </span>
                  <span className="text-slate-200">{settings.bkashNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.bkashNumber, 'bkash')}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                >
                  {copiedNumber === 'bkash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-950/20 border border-orange-500/20">
                <div>
                  <span className="text-orange-400 font-bold">Nagad: </span>
                  <span className="text-slate-200">{settings.nagadNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.nagadNumber, 'nagad')}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                >
                  {copiedNumber === 'nagad' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/20 border border-purple-500/20">
                <div>
                  <span className="text-purple-400 font-bold">Rocket: </span>
                  <span className="text-slate-200">{settings.rocketNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.rocketNumber, 'rocket')}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                >
                  {copiedNumber === 'rocket' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <div>
                  <span className="text-amber-400 font-bold">Binance Pay: </span>
                  <span className="text-slate-200">{settings.binancePayId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.binancePayId, 'binance')}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                >
                  {copiedNumber === 'binance' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Customer Form Inputs */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Customer Information:
            </h4>
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Phone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Telegram Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="@your_username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instagram Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="@your_instagram"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                >
                  <option value="bKash">bKash (Send Money)</option>
                  <option value="Nagad">Nagad (Send Money)</option>
                  <option value="Rocket">Rocket (Send Money)</option>
                  <option value="Binance/USDT">Binance Pay (USDT TRC20)</option>
                  <option value="Telegram Discussion">Discuss / Pay via Telegram</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction ID (TrxID) / Proof Reference
              </label>
              <input
                type="text"
                placeholder="e.g. BK9283741X or TxHash"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Any special modifications or hosting queries..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0088cc]/30 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Confirm Order & Open Telegram Dispatch</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Order registers immediately in the Admin CRM and generates a 1-click message link for Telegram.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
