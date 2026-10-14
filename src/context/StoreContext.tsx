import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  BotItem,
  OrderItem,
  ContactSettings,
  OrderStatus,
  FirebaseConfigState,
  AdminActivityLog,
  CustomerProfile,
  AnalyticsEventType
} from '../types';
import { INITIAL_BOTS, INITIAL_ORDERS, INITIAL_CONTACT_SETTINGS } from '../data/defaultBots';
import { trackEvent, loadAnalyticsEvents } from '../services/analytics';

interface StoreContextType {
  bots: BotItem[];
  orders: OrderItem[];
  settings: ContactSettings;
  firebaseConfig: FirebaseConfigState;
  activityLogs: AdminActivityLog[];
  customers: CustomerProfile[];
  addBot: (bot: Omit<BotItem, 'id' | 'createdAt'>) => void;
  duplicateBot: (id: string) => void;
  updateBot: (id: string, bot: Partial<BotItem>) => void;
  deleteBot: (id: string) => void;
  toggleBotPublish: (id: string) => void;
  createOrder: (orderData: Omit<OrderItem, 'id' | 'createdAt' | 'status' | 'telegramMessageUrl'>) => OrderItem;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  updateSettings: (newSettings: Partial<ContactSettings>) => void;
  updateFirebaseConfig: (config: Partial<FirebaseConfigState>) => void;
  testFirebaseConnection: () => Promise<{ success: boolean; message: string }>;
  syncWithFirebase: () => Promise<{ success: boolean; message: string }>;
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
  resetToDefaults: () => void;
  generateTelegramOrderUrl: (order: OrderItem) => string;
  logAdminAction: (action: string, details: string, category: AdminActivityLog['category']) => void;
  trackAnalytics: (type: AnalyticsEventType, meta?: { botId?: string; botTitle?: string; orderId?: string; amountBDT?: number; path?: string }) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const BOTS_STORAGE_KEY = 'botcraft_bots_v3';
const ORDERS_STORAGE_KEY = 'botcraft_orders_v3';
const SETTINGS_STORAGE_KEY = 'botcraft_settings_v3';
const FIREBASE_STORAGE_KEY = 'botcraft_firebase_v3';
const LOGS_STORAGE_KEY = 'botcraft_activity_logs_v1';
const DEFAULT_FIREBASE_URL = 'https://shahriya-tg-web-default-rtdb.firebaseio.com';

function sanitizeBot(b: any): BotItem {
  return {
    id: b?.id || `bot-${Date.now()}`,
    title: b?.title || 'Untitled Bot',
    version: b?.version || 'v1.0.0',
    slug: b?.slug || (b?.title ? b.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'bot'),
    category: b?.category || 'E-Commerce & Shop',
    shortDescription: b?.shortDescription || '',
    fullDescription: b?.fullDescription || '',
    priceBDT: typeof b?.priceBDT === 'number' ? b.priceBDT : Number(b?.priceBDT) || 2000,
    priceUSD: typeof b?.priceUSD === 'number' ? b.priceUSD : Number(b?.priceUSD) || 20,
    isFeatured: Boolean(b?.isFeatured),
    isPublished: b?.isPublished !== undefined ? Boolean(b.isPublished) : true,
    salesCount: Number(b?.salesCount) || 0,
    rating: Number(b?.rating) || 5.0,
    deliveryTime: b?.deliveryTime || 'Instant Setup (10 Mins)',
    demoBotUsername: b?.demoBotUsername || '',
    demoVideoOrDocUrl: b?.demoVideoOrDocUrl || '',
    image: b?.image || '',
    features: Array.isArray(b?.features) ? b.features : [],
    commands: Array.isArray(b?.commands) ? b.commands : [],
    adminFeatures: Array.isArray(b?.adminFeatures) ? b.adminFeatures : [],
    techStack: Array.isArray(b?.techStack) ? b.techStack : [],
    includes: Array.isArray(b?.includes) ? b.includes : ['Full Source Code', 'Updates'],
    seoTitle: b?.seoTitle || b?.title,
    seoDescription: b?.seoDescription || b?.shortDescription,
    viewsCount: Number(b?.viewsCount) || (Math.floor(Math.random() * 80) + 20),
    createdAt: b?.createdAt || new Date().toISOString(),
    lastUpdated: b?.lastUpdated || new Date().toISOString(),
  };
}

function sanitizeOrder(o: any): OrderItem {
  return {
    id: o?.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    botId: o?.botId,
    botTitle: o?.botTitle || 'Bot Order',
    botVersion: o?.botVersion || 'v1.0',
    orderType: o?.orderType === 'custom_bot' ? 'custom_bot' : 'ready_bot',
    customerName: o?.customerName || 'Anonymous',
    customerPhone: o?.customerPhone || '',
    customerEmail: o?.customerEmail,
    telegramUsername: o?.telegramUsername || '',
    instagramUsername: o?.instagramUsername,
    paymentMethod: o?.paymentMethod || 'bKash',
    transactionId: o?.transactionId || '',
    amountBDT: Number(o?.amountBDT) || 0,
    status: o?.status || 'pending',
    customSpecs: o?.customSpecs,
    customerNotes: o?.customerNotes,
    createdAt: o?.createdAt || new Date().toISOString(),
    telegramMessageUrl: o?.telegramMessageUrl || '',
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bots, setBots] = useState<BotItem[]>(() => {
    try {
      const saved = localStorage.getItem(BOTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeBot);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_BOTS.map(sanitizeBot);
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeOrder);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDERS.map(sanitizeOrder);
  });

  const [settings, setSettings] = useState<ContactSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) {
          return { ...INITIAL_CONTACT_SETTINGS, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CONTACT_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'log-init-1',
        action: 'System Initialized',
        details: 'Storefront and administrative console running in production mode',
        timestamp: new Date().toISOString(),
        category: 'system',
      },
      {
        id: 'log-init-2',
        action: 'Catalog Loaded',
        details: 'Verified Telegram Bot collection synchronized with database',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        category: 'bot',
      },
    ];
  });

  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigState>(() => {
    try {
      const saved = localStorage.getItem(FIREBASE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.databaseURL) return parsed;
      }
    } catch {
      // fallback
    }
    return {
      apiKey: '',
      authDomain: '',
      projectId: 'shahriya-tg-web',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      databaseURL: DEFAULT_FIREBASE_URL,
      connected: true,
      syncOrders: true,
    };
  });

  const isInitialSyncDone = useRef(false);

  // LocalStorage synchronizations
  useEffect(() => {
    try {
      localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(bots));
    } catch (e) {
      console.warn('Failed to persist bots:', e);
    }
  }, [bots]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(FIREBASE_STORAGE_KEY, JSON.stringify(firebaseConfig));
    } catch (e) {
      console.warn('Failed to persist firebase config:', e);
    }
  }, [firebaseConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(activityLogs));
    } catch (e) {
      console.warn('Failed to persist activity logs:', e);
    }
  }, [activityLogs]);

  const logAdminAction = useCallback((action: string, details: string, category: AdminActivityLog['category']) => {
    const newLog: AdminActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      timestamp: new Date().toISOString(),
      category,
    };
    setActivityLogs((prev) => [newLog, ...prev].slice(0, 500));
  }, []);

  const trackAnalytics = useCallback((
    type: AnalyticsEventType,
    meta?: { botId?: string; botTitle?: string; orderId?: string; amountBDT?: number; path?: string }
  ) => {
    trackEvent(type, meta);
  }, []);

  // Customer Management Aggregation derived directly from genuine orders
  const customers = useMemo<CustomerProfile[]>(() => {
    const map = new Map<string, CustomerProfile>();

    orders.forEach((ord) => {
      // Key by clean phone or clean telegram handle or name
      const key = (ord.customerPhone.trim() || ord.telegramUsername.toLowerCase().trim() || ord.customerName.toLowerCase().trim());
      if (!key) return;

      const existing = map.get(key);
      const isCompleted = ord.status === 'completed';
      const orderAmount = ord.amountBDT || 0;

      if (!existing) {
        map.set(key, {
          id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: ord.customerName,
          phone: ord.customerPhone,
          email: ord.customerEmail,
          telegramUsername: ord.telegramUsername,
          instagramUsername: ord.instagramUsername,
          totalOrders: 1,
          completedOrders: isCompleted ? 1 : 0,
          totalSpentBDT: isCompleted ? orderAmount : 0,
          firstOrderDate: ord.createdAt,
          lastOrderDate: ord.createdAt,
          orders: [ord],
        });
      } else {
        existing.totalOrders += 1;
        if (isCompleted) {
          existing.completedOrders += 1;
          existing.totalSpentBDT += orderAmount;
        }
        if (new Date(ord.createdAt) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = ord.createdAt;
        }
        if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = ord.createdAt;
        }
        if (!existing.email && ord.customerEmail) {
          existing.email = ord.customerEmail;
        }
        existing.orders.push(ord);
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
    return list;
  }, [orders]);

  // LIVE CLOUD SYNCHRONIZATION (Optional graceful polling)
  useEffect(() => {
    if (!firebaseConfig.connected || !firebaseConfig.databaseURL) {
      return;
    }
    const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');

    const fetchCloudData = async () => {
      try {
        const ordersRes = await fetch(`${dbUrl}/orders.json`);
        if (ordersRes.ok) {
          const cloudOrdersData = await ordersRes.json();
          if (cloudOrdersData && typeof cloudOrdersData === 'object') {
            const parsedOrders: OrderItem[] = Object.values(cloudOrdersData).map(sanitizeOrder);
            parsedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(parsedOrders);
          }
        }

        const botsRes = await fetch(`${dbUrl}/bots.json`);
        if (botsRes.ok) {
          const cloudBotsData = await botsRes.json();
          if (cloudBotsData && typeof cloudBotsData === 'object') {
            const parsedBots: BotItem[] = Object.values(cloudBotsData).map(sanitizeBot);
            if (parsedBots.length > 0) {
              setBots(parsedBots);
            }
          }
        }

        if (!isInitialSyncDone.current) {
          const settingsRes = await fetch(`${dbUrl}/settings.json`);
          if (settingsRes.ok) {
            const cloudSettingsData = await settingsRes.json();
            if (cloudSettingsData && typeof cloudSettingsData === 'object') {
              setSettings((prev) => ({ ...prev, ...cloudSettingsData }));
            }
          }
          isInitialSyncDone.current = true;
        }
      } catch (err) {
        console.warn('Background cloud poll skipped gracefully:', err);
      }
    };

    fetchCloudData();
    const interval = setInterval(fetchCloudData, 45000); // Check every 45s
    return () => clearInterval(interval);
  }, [firebaseConfig.databaseURL, firebaseConfig.connected]);

  const generateTelegramOrderUrl = useCallback((order: OrderItem): string => {
    const cleanUsername = settings.telegramUsername.replace('@', '').trim();
    const currencySym = settings.currency === 'USD' ? '$' : 'BDT ';

    const messageLines = [
      `👋 Hello ${settings.brandName}!`,
      `I have placed an order on your website:`,
      `---------------------------------`,
      `📦 Order ID: ${order.id}`,
      `🤖 Item: ${order.botTitle} ${order.botVersion ? `(${order.botVersion})` : ''}`,
      `🏷️ Type: ${order.orderType === 'custom_bot' ? 'Custom Bot Request' : 'Ready-made Bot'}`,
      `💰 Amount: ${currencySym}${order.amountBDT.toLocaleString()}`,
      `💳 Payment Method: ${order.paymentMethod}`,
      order.transactionId ? `📝 Transaction ID / Reference: ${order.transactionId}` : 'Payment: Pending Discussion',
      `---------------------------------`,
      `👤 Customer Name: ${order.customerName}`,
      `📱 Contact Phone: ${order.customerPhone}`,
      `✈️ Telegram: ${order.telegramUsername}`,
      order.instagramUsername ? `📸 Instagram: ${order.instagramUsername}` : '',
      order.customSpecs ? `\n⚙️ Custom Specifications:\n${order.customSpecs.featuresNeeded}\n⏱️ Target Deadline: ${order.customSpecs.deadline}` : '',
      order.customerNotes ? `\n💬 Customer Note: ${order.customerNotes}` : '',
      `---------------------------------`,
      `Please check and verify my order. Thank you!`,
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    return `https://t.me/${cleanUsername}?text=${encodeURIComponent(fullMessage)}`;
  }, [settings]);

  const addBot = (newBotData: Omit<BotItem, 'id' | 'createdAt'>) => {
    const newBot: BotItem = {
      ...newBotData,
      id: `bot-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      isPublished: newBotData.isPublished !== undefined ? newBotData.isPublished : true,
      viewsCount: 0,
    };
    setBots((prev) => [newBot, ...prev]);
    logAdminAction('Bot Published', `Added new bot "${newBot.title}" in category "${newBot.category}"`, 'bot');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/bots/${newBot.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBot),
      }).catch(() => {});
    }
  };

  const duplicateBot = (id: string) => {
    const target = bots.find((b) => b.id === id);
    if (!target) return;
    const duplicated: BotItem = {
      ...target,
      id: `bot-${Date.now()}`,
      title: `${target.title} (Clone)`,
      slug: `${target.slug}-clone-${Date.now().toString(36).substring(2, 6)}`,
      salesCount: 0,
      viewsCount: 0,
      isPublished: false, // Save as Draft so admin can customize before publishing
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };
    setBots((prev) => [duplicated, ...prev]);
    logAdminAction('Bot Cloned', `Created draft clone of "${target.title}"`, 'bot');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/bots/${duplicated.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      }).catch(() => {});
    }
  };

  const updateBot = (id: string, updatedFields: Partial<BotItem>) => {
    const fieldsWithTimestamp = {
      ...updatedFields,
      lastUpdated: new Date().toISOString(),
    };
    setBots((prev) =>
      prev.map((bot) => (bot.id === id ? { ...bot, ...fieldsWithTimestamp } : bot))
    );
    const existing = bots.find((b) => b.id === id);
    logAdminAction('Bot Updated', `Modified specifications for "${existing?.title || id}"`, 'bot');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/bots/${id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsWithTimestamp),
      }).catch(() => {});
    }
  };

  const toggleBotPublish = (id: string) => {
    const bot = bots.find((b) => b.id === id);
    if (!bot) return;
    const nextStatus = bot.isPublished === false;
    updateBot(id, { isPublished: nextStatus });
    logAdminAction(
      nextStatus ? 'Bot Published' : 'Bot Unpublished',
      `Changed catalog visibility of "${bot.title}" to ${nextStatus ? 'Live' : 'Draft / Hidden'}`,
      'bot'
    );
  };

  const deleteBot = (id: string) => {
    const target = bots.find((b) => b.id === id);
    setBots((prev) => prev.filter((bot) => bot.id !== id));
    logAdminAction('Bot Deleted', `Removed bot "${target?.title || id}" from catalog`, 'bot');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/bots/${id}.json`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  const createOrder = (
    orderData: Omit<OrderItem, 'id' | 'createdAt' | 'status' | 'telegramMessageUrl'>
  ): OrderItem => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempOrder: OrderItem = {
      ...orderData,
      id: orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      telegramMessageUrl: '',
    };
    const telegramUrl = generateTelegramOrderUrl(tempOrder);
    const finalOrder = { ...tempOrder, telegramMessageUrl: telegramUrl };
    setOrders((prev) => [finalOrder, ...prev]);

    // Track analytics event
    trackEvent('order_created', {
      orderId: finalOrder.id,
      botTitle: finalOrder.botTitle,
      amountBDT: finalOrder.amountBDT,
    });

    logAdminAction('New Order Received', `Order #${finalOrder.id} placed by ${finalOrder.customerName} for ${finalOrder.botTitle}`, 'order');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/orders/${finalOrder.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrder),
      }).catch(() => {});
    }

    return finalOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    const targetOrder = orders.find((o) => o.id === orderId);

    if (status === 'completed' && targetOrder) {
      trackEvent('order_completed', {
        orderId: targetOrder.id,
        botTitle: targetOrder.botTitle,
        amountBDT: targetOrder.amountBDT,
      });
    }

    logAdminAction(
      'Order Status Changed',
      `Order #${orderId} marked as ${status.toUpperCase()} (Previous: ${targetOrder?.status?.toUpperCase() || 'UNKNOWN'})`,
      'order'
    );

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/orders/${orderId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    logAdminAction('Order Deleted', `Purged order #${orderId} from pipeline`, 'order');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/orders/${orderId}.json`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  const updateSettings = (newSettings: Partial<ContactSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAdminAction('Settings Updated', 'Administrative preferences and storefront configurations saved', 'settings');

    if (firebaseConfig.connected) {
      const dbUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      fetch(`${dbUrl}/settings.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch(() => {});
    }
  };

  const updateFirebaseConfig = (config: Partial<FirebaseConfigState>) => {
    setFirebaseConfig((prev) => ({ ...prev, ...config }));
    logAdminAction('Cloud Config Updated', 'Firebase Realtime Database parameters refreshed', 'cloud');
  };

  const testFirebaseConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const targetUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      const res = await fetch(`${targetUrl}/.json?shallow=true`);
      if (res.ok) {
        logAdminAction('Cloud Ping Success', `Connected to Firebase endpoint (${targetUrl})`, 'cloud');
        return { success: true, message: 'Cloud database endpoint is reachable and responsive.' };
      }
      return { success: false, message: `Cloud returned HTTP status ${res.status}. Check rules or credentials.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network request failed.' };
    }
  };

  const syncWithFirebase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const targetUrl = (firebaseConfig.databaseURL || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');

      // Push bots
      const botsPayload: Record<string, BotItem> = {};
      bots.forEach((b) => {
        botsPayload[b.id] = b;
      });
      await fetch(`${targetUrl}/bots.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botsPayload),
      });

      // Push orders
      const ordersPayload: Record<string, OrderItem> = {};
      orders.forEach((o) => {
        ordersPayload[o.id] = o;
      });
      await fetch(`${targetUrl}/orders.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordersPayload),
      });

      // Push settings
      await fetch(`${targetUrl}/settings.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      logAdminAction('Cloud Sync Complete', `Synchronized ${bots.length} bots and ${orders.length} orders with Firebase`, 'cloud');
      return { success: true, message: `Successfully synced ${bots.length} bots and ${orders.length} orders!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync operation failed.' };
    }
  };

  const exportBackupJson = () => {
    const backupData = {
      version: '3.0',
      timestamp: new Date().toISOString(),
      brand: settings.brandName,
      bots,
      orders,
      settings,
      activityLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BotCraft_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAdminAction('Backup Exported', 'Downloaded complete system snapshot as JSON archive', 'system');
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.bots)) {
        setBots(parsed.bots.map(sanitizeBot));
      }
      if (Array.isArray(parsed.orders)) {
        setOrders(parsed.orders.map(sanitizeOrder));
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...parsed.settings }));
      }
      if (Array.isArray(parsed.activityLogs)) {
        setActivityLogs(parsed.activityLogs);
      }
      logAdminAction('Backup Restored', 'Imported JSON data archive and restored state', 'system');
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    setBots(INITIAL_BOTS.map(sanitizeBot));
    setOrders(INITIAL_ORDERS.map(sanitizeOrder));
    setSettings(INITIAL_CONTACT_SETTINGS);
    setActivityLogs([
      {
        id: 'log-reset',
        action: 'Factory Reset',
        details: 'Restored default bot catalog and configuration presets',
        timestamp: new Date().toISOString(),
        category: 'system',
      },
    ]);
  };

  return (
    <StoreContext.Provider
      value={{
        bots,
        orders,
        settings,
        firebaseConfig,
        activityLogs,
        customers,
        addBot,
        duplicateBot,
        updateBot,
        deleteBot,
        toggleBotPublish,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        updateSettings,
        updateFirebaseConfig,
        testFirebaseConnection,
        syncWithFirebase,
        exportBackupJson,
        importBackupJson,
        resetToDefaults,
        generateTelegramOrderUrl,
        logAdminAction,
        trackAnalytics,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
