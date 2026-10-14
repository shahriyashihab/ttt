export interface BotCommand {
  command: string;
  description: string;
  role: 'user' | 'admin';
}

export type BotCategory =
  | 'E-Commerce & Shop'
  | 'File & Media Store'
  | 'Channel & Group'
  | 'Payment & Crypto'
  | 'Utility & AI';

export interface BotItem {
  id: string;
  title: string;
  version: string;
  slug: string;
  category: BotCategory;
  shortDescription: string;
  fullDescription: string;
  priceBDT: number;
  priceUSD: number;
  isFeatured: boolean;
  isPublished?: boolean;
  salesCount: number;
  rating: number;
  deliveryTime: string;
  demoBotUsername?: string;
  demoVideoOrDocUrl?: string;
  image: string;
  features: string[];
  commands: BotCommand[];
  adminFeatures: string[];
  techStack: string[];
  includes: string[];
  seoTitle?: string;
  seoDescription?: string;
  viewsCount?: number;
  createdAt: string;
  lastUpdated?: string;
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  botId?: string;
  botTitle: string;
  botVersion?: string;
  orderType: 'ready_bot' | 'custom_bot';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  telegramUsername: string;
  instagramUsername?: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Binance/USDT' | 'Bank Transfer' | 'Telegram Discussion';
  transactionId?: string;
  amountBDT: number;
  status: OrderStatus;
  customSpecs?: {
    category: string;
    featuresNeeded: string;
    budget: string;
    deadline: string;
  };
  customerNotes?: string;
  createdAt: string;
  telegramMessageUrl: string;
}

export interface ContactSettings {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  telegramUsername: string;
  telegramChannelUrl: string;
  whatsappNumber: string;
  facebookUrl: string;
  messengerUrl: string;
  instagramUrl: string;
  email: string;
  phone: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  binancePayId: string;
  adminPin: string;
  currency: 'BDT' | 'USD';
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL: string;
  connected: boolean;
  syncOrders: boolean;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'bot_detail_view'
  | 'order_started'
  | 'order_created'
  | 'order_completed';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string; // ISO
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  pagePath: string;
  referrer: string;
  trafficSource: 'Direct' | 'Telegram' | 'Google Search' | 'Social Media' | 'Referral';
  deviceCategory: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  botId?: string;
  botTitle?: string;
  orderId?: string;
  amountBDT?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegramUsername: string;
  instagramUsername?: string;
  totalOrders: number;
  completedOrders: number;
  totalSpentBDT: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: OrderItem[];
}

export interface AdminActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminUser?: string;
  category: 'bot' | 'order' | 'settings' | 'security' | 'cloud' | 'system';
}

export type AdminProcessTab =
  | 'overview'
  | 'analytics'
  | 'bots'
  | 'orders'
  | 'customers'
  | 'custom_leads'
  | 'payments'
  | 'branding'
  | 'socials'
  | 'security'
  | 'backup';
