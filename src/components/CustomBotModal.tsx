import React, { useState } from 'react';
import { OrderItem } from '../types';
import { useStore } from '../context/StoreContext';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CustomBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: OrderItem) => void;
}

export const CustomBotModal: React.FC<CustomBotModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createOrder } = useStore();
  const [category, setCategory] = useState('E-Commerce & Shop');
  const [featuresNeeded, setFeaturesNeeded] = useState('');
  const [budget, setBudget] = useState('$30 - $60 (BDT 3,500 - 6,000)');
  const [deadline, setDeadline] = useState('2-3 Days');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!featuresNeeded.trim()) {
      setErrorMsg('Please specify the features or logic your custom bot requires.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please provide your name.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Please provide your phone or WhatsApp number.');
      return;
    }
    if (!telegramUsername.trim()) {
      setErrorMsg('Please provide your Telegram username.');
      return;
    }

    const numMatch = budget.match(/\d+/);
    const amountEstimate = numMatch ? parseInt(numMatch[0], 10) * 100 || 3500 : 3500;

    const created = createOrder({
      botTitle: `Custom Bot Request (${category})`,
      botVersion: 'Custom v1.0',
      orderType: 'custom_bot',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      telegramUsername: telegramUsername.trim().startsWith('@') ? telegramUsername.trim() : `@${telegramUsername.trim()}`,
      instagramUsername: instagramUsername.trim() || undefined,
      paymentMethod: 'Telegram Discussion',
      amountBDT: amountEstimate,
      customSpecs: {
        category,
        featuresNeeded: featuresNeeded.trim(),
        budget,
        deadline,
      },
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
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Order a Custom Telegram Bot
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Need a unique bot with proprietary workflows, payment bridges, or AI integration? Fill in your specifications below to receive a direct quote and start development.
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bot Category / Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="E-Commerce & Shop">E-Commerce & Digital Store</option>
                <option value="File & Media Store">File Vault & Auto-Forwarder</option>
                <option value="Channel & Group">Community Protector & Moderator</option>
                <option value="Payment & Crypto">Payment Gateway & Subscriptions</option>
                <option value="Education & Quiz">Quiz, Exams & Scoring</option>
                <option value="Utility & AI">AI Assistant / Trading Signal</option>
                <option value="Other Custom">Other Custom Architecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estimated Budget Range
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $40 - $80 or BDT 4,000 - 7,000"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Required Features & Workflow Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={featuresNeeded}
              onChange={(e) => setFeaturesNeeded(e.target.value)}
              placeholder="What commands should the bot have? What should users see? What admin controls do you require? Describe every detail..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Delivery Timeline
              </label>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="Urgent (24 Hours)">Urgent (Within 24 Hours)</option>
                <option value="2-3 Days">2 to 3 Days</option>
                <option value="1 Week">1 Week</option>
                <option value="Flexible / Discuss">Flexible / To Discuss</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone / WhatsApp <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+880 1XXXXXXXXX"
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
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder="@your_username"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="@your_instagram"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Additional Notes
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special integrations..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] hover:from-[#0077b5] hover:to-[#0095e0] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0088cc]/30 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Submit Custom Request & Open Telegram Chat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
