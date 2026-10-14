import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { BotItem, OrderStatus, BotCommand, OrderItem, AdminProcessTab, CustomerProfile } from '../types';
import { BOT_IMAGES, getCategoryFallback } from '../data/botImages';
import { ImageUploadField } from './ImageUploadField';
import { loadAnalyticsEvents, filterEventsByDate, AnalyticsDateFilter, AnalyticsEvent } from '../services/analytics';
import {
  Shield,
  X,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Check,
  Send,
  Database,
  ShoppingBag,
  AlertTriangle,
  Search,
  DollarSign,
  Copy,
  Phone,
  BarChart3,
  Clock,
  Sparkles,
  ChevronRight,
  LogOut,
  Globe,
  KeyRound,
  Wallet,
  Share2,
  TrendingUp,
  PackageCheck,
  Eye,
  Zap,
  Users,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  MessageCircle,
  ExternalLink,
  Tag,
  Radio,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
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
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    updateFirebaseConfig,
    testFirebaseConnection,
    syncWithFirebase,
    exportBackupJson,
    importBackupJson,
    resetToDefaults,
    logAdminAction
  } = useStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Process & Navigation
  const [activeTab, setActiveTab] = useState<AdminProcessTab>('overview');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3800);
  };

  // In-app confirmation modal state (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Filters & Searches
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'ready_bot' | 'custom_bot'>('all');
  const [botCategoryFilter, setBotCategoryFilter] = useState<string>('All');
  const [botStatusFilter, setBotStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [botSearchQuery, setBotSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState<AnalyticsDateFilter>('30days');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selected customer for detailed history drawer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Bot Editing / Creating Modal state
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);

  // Form states for bot
  const [botFormTitle, setBotFormTitle] = useState('');
  const [botFormVersion, setBotFormVersion] = useState('v1.0.0');
  const [botFormCategory, setBotFormCategory] = useState<'E-Commerce & Shop' | 'File & Media Store' | 'Channel & Group' | 'Payment & Crypto' | 'Utility & AI'>('E-Commerce & Shop');
  const [botFormShortDesc, setBotFormShortDesc] = useState('');
  const [botFormFullDesc, setBotFormFullDesc] = useState('');
  const [botFormPriceBDT, setBotFormPriceBDT] = useState('2500');
  const [botFormPriceUSD, setBotFormPriceUSD] = useState('25');
  const [botFormDelivery, setBotFormDelivery] = useState('Instant Setup (10 Mins)');
  const [botFormDemoUsername, setBotFormDemoUsername] = useState('@DemoBot');
  const [botFormImage, setBotFormImage] = useState(BOT_IMAGES.ecommerce);
  const [botFormIsPublished, setBotFormIsPublished] = useState(true);
  const [botFormSeoTitle, setBotFormSeoTitle] = useState('');
  const [botFormSeoDesc, setBotFormSeoDesc] = useState('');
  const [botFormFeatures, setBotFormFeatures] = useState('Full Catalog Navigation\nInteractive Shopping Cart\nAutomated Invoice Generation\nBroadcast Marketing Messages');
  const [botFormCommands, setBotFormCommands] = useState('/start : Launches store menu (user)\n/catalog : Browse items (user)\n/admin : Administrator console (admin)\n/broadcast : Dispatch announcement (admin)');
  const [botFormAdminFeatures, setBotFormAdminFeatures] = useState('1-Click Item Upload\nOrder Status Approvals\nCustomer CSV Export');
  const [botFormTech, setBotFormTech] = useState('Python 3.11, Aiogram 3, SQLite');

  // Settings local state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newPin, setNewPin] = useState(settings.adminPin);

  // Cloud / Firebase state
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  const [fbDatabaseUrl, setFbDatabaseUrl] = useState(firebaseConfig.databaseURL);
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig.projectId);
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig.apiKey);
  const [fbTesting, setFbTesting] = useState(false);
  const [fbTestResult, setFbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [fbSyncing, setFbSyncing] = useState(false);

  // Raw analytics events loaded from storage
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAnalyticsEvents(loadAnalyticsEvents());
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === settings.adminPin.trim()) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
      logAdminAction('Admin Session Opened', 'Successful PIN verification', 'security');
    } else {
      setPinError(true);
      logAdminAction('Authentication Failed', 'Invalid PIN attempt submitted', 'security');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminMenuOpen(false);
    setPinInput('');
    logAdminAction('Admin Logged Out', 'Console locked securely', 'security');
  };

  // Bot creation modal triggers
  const openAddBot = (templateCategory?: 'E-Commerce & Shop' | 'File & Media Store' | 'Channel & Group' | 'Payment & Crypto' | 'Utility & AI') => {
    setEditingBotId(null);
    const cat = templateCategory || 'E-Commerce & Shop';
    setBotFormCategory(cat);
    setBotFormTitle(cat === 'File & Media Store' ? 'CloudVault Pro — Auto File Forwarder' : cat === 'Channel & Group' ? 'CommunityShield — Group Gatekeeper' : 'TeleStore Pro — E-Commerce Shop Bot');
    setBotFormVersion('v2.0.0');
    setBotFormShortDesc('High performance automated bot designed for Telegram enterprise operations.');
    setBotFormFullDesc('Complete source code package with 24/7 runtime deployment and administrative controls.');
    setBotFormPriceBDT('2500');
    setBotFormPriceUSD('25');
    setBotFormDelivery('Instant Setup (10 Mins)');
    setBotFormDemoUsername('@DemoBot');
    setBotFormImage(getCategoryFallback(cat));
    setBotFormIsPublished(true);
    setBotFormSeoTitle('');
    setBotFormSeoDesc('');
    setBotFormFeatures('Instant Telegram alerts\nMulti-layer admin management\nAutomated backup routines');
    setBotFormCommands('/start : Interactive menu (user)\n/help : Assistance guide (user)\n/admin : Owner console (admin)');
    setBotFormAdminFeatures('Instant live controls\nReal-time user analytics\nAutomated database backup');
    setBotFormTech('Python 3.11, Aiogram 3.x, SQLite / PostgreSQL');
    setIsBotModalOpen(true);
  };

  const openEditBot = (bot: BotItem) => {
    setEditingBotId(bot.id);
    setBotFormTitle(bot.title);
    setBotFormVersion(bot.version || 'v1.0.0');
    setBotFormCategory(bot.category);
    setBotFormShortDesc(bot.shortDescription);
    setBotFormFullDesc(bot.fullDescription);
    setBotFormPriceBDT(bot.priceBDT.toString());
    setBotFormPriceUSD(bot.priceUSD.toString());
    setBotFormDelivery(bot.deliveryTime);
    setBotFormDemoUsername(bot.demoBotUsername || '');
    setBotFormImage(bot.image);
    setBotFormIsPublished(bot.isPublished !== false);
    setBotFormSeoTitle(bot.seoTitle || bot.title);
    setBotFormSeoDesc(bot.seoDescription || bot.shortDescription);
    setBotFormFeatures(bot.features.join('\n'));
    setBotFormCommands(
      bot.commands
        .map((c) => `${c.command} : ${c.description} (${c.role})`)
        .join('\n')
    );
    setBotFormAdminFeatures(bot.adminFeatures.join('\n'));
    setBotFormTech(bot.techStack.join(', '));
    setIsBotModalOpen(true);
  };

  const handleSaveBot = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFeatures = botFormFeatures.split('\n').map((f) => f.trim()).filter(Boolean);
    const parsedAdminFeatures = botFormAdminFeatures.split('\n').map((f) => f.trim()).filter(Boolean);
    const parsedTech = botFormTech.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedCommands: BotCommand[] = botFormCommands
      .split('\n')
      .map((line) => {
        const parts = line.split(':');
        const cmd = parts[0]?.trim() || '/cmd';
        const rest = parts[1]?.trim() || '';
        const isAdm = rest.toLowerCase().includes('(admin)');
        const desc = rest.replace(/\((admin|user)\)/gi, '').trim() || 'Command Functionality';
        return {
          command: cmd,
          description: desc,
          role: (isAdm ? 'admin' : 'user') as 'admin' | 'user',
        };
      })
      .filter((c) => c.command);

    if (editingBotId) {
      updateBot(editingBotId, {
        title: botFormTitle,
        version: botFormVersion,
        category: botFormCategory,
        shortDescription: botFormShortDesc,
        fullDescription: botFormFullDesc,
        priceBDT: Number(botFormPriceBDT) || 2000,
        priceUSD: Number(botFormPriceUSD) || 20,
        deliveryTime: botFormDelivery,
        demoBotUsername: botFormDemoUsername,
        image: botFormImage || getCategoryFallback(botFormCategory),
        isPublished: botFormIsPublished,
        seoTitle: botFormSeoTitle || botFormTitle,
        seoDescription: botFormSeoDesc || botFormShortDesc,
        features: parsedFeatures,
        commands: parsedCommands,
        adminFeatures: parsedAdminFeatures,
        techStack: parsedTech,
      });
    } else {
      addBot({
        title: botFormTitle,
        version: botFormVersion,
        slug: botFormTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        category: botFormCategory,
        shortDescription: botFormShortDesc,
        fullDescription: botFormFullDesc,
        priceBDT: Number(botFormPriceBDT) || 2000,
        priceUSD: Number(botFormPriceUSD) || 20,
        deliveryTime: botFormDelivery,
        demoBotUsername: botFormDemoUsername,
        image: botFormImage || getCategoryFallback(botFormCategory),
        isPublished: botFormIsPublished,
        seoTitle: botFormSeoTitle || botFormTitle,
        seoDescription: botFormSeoDesc || botFormShortDesc,
        features: parsedFeatures,
        commands: parsedCommands,
        adminFeatures: parsedAdminFeatures,
        techStack: parsedTech,
        isFeatured: true,
        salesCount: 0,
        rating: 5.0,
        includes: [
          'Full Clean Source Code',
          'Free 24/7 Hosting Setup Guide',
          '30 Days Free Technical Support',
          'Lifetime Code Updates',
        ],
      });
    }
    setIsBotModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ ...settingsForm, adminPin: newPin });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirebaseConfig({
      databaseURL: fbDatabaseUrl,
      projectId: fbProjectId,
      apiKey: fbApiKey,
      connected: true,
    });
    showToast('Firebase Cloud configurations updated successfully.', 'success');
  };

  const handleTestCloudConnection = async () => {
    setFbTesting(true);
    setFbTestResult(null);
    const res = await testFirebaseConnection();
    setFbTesting(false);
    setFbTestResult(res);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleManualCloudSync = async () => {
    setFbSyncing(true);
    const res = await syncWithFirebase();
    setFbSyncing(false);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleBackupFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ok = importBackupJson(text);
          if (ok) {
            showToast('Backup JSON restored successfully!', 'success');
          } else {
            showToast('Failed to parse backup JSON. Invalid structure.', 'error');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('No orders available to export.', 'info');
      return;
    }
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Telegram',
      'Email',
      'Bot Title',
      'Version',
      'Order Type',
      'Amount BDT',
      'Payment Method',
      'Transaction ID',
      'Status'
    ];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toISOString().split('T')[0],
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(o.telegramUsername || '').replace(/"/g, '""')}"`,
      `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(o.botTitle || '').replace(/"/g, '""')}"`,
      o.botVersion || 'v1.0',
      o.orderType,
      o.amountBDT,
      `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(o.transactionId || '').replace(/"/g, '""')}"`,
      o.status
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `botcraft_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${orders.length} orders to CSV successfully!`, 'success');
  };

  const exportCustomersCSV = () => {
    if (customers.length === 0) {
      showToast('No customer records available to export.', 'info');
      return;
    }
    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Telegram',
      'Email',
      'Total Orders',
      'Completed Orders',
      'Total Spent BDT',
      'First Order Date',
      'Last Order Date'
    ];
    const rows = customers.map((c) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.telegramUsername || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      c.totalOrders,
      c.completedOrders,
      c.totalSpentBDT,
      c.firstOrderDate.split('T')[0],
      c.lastOrderDate.split('T')[0]
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `botcraft_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${customers.length} customer profiles to CSV!`, 'success');
  };

  // REVENUE & FINANCIAL CALCULATIONS (Strict Business Rules: Only Completed Orders Count as Confirmed Revenue)
  const confirmedCompletedOrders = useMemo(() => orders.filter((o) => o.status === 'completed'), [orders]);
  const confirmedRevenueBDT = useMemo(
    () => confirmedCompletedOrders.reduce((acc, ord) => acc + (ord.amountBDT || 0), 0),
    [confirmedCompletedOrders]
  );
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const pendingOrdersCount = pendingOrders.length;
  const pendingVolumeBDT = useMemo(
    () => pendingOrders.reduce((acc, ord) => acc + (ord.amountBDT || 0), 0),
    [pendingOrders]
  );
  const inProgressCount = useMemo(() => orders.filter((o) => o.status === 'in_progress').length, [orders]);
  const completedCount = confirmedCompletedOrders.length;
  const cancelledOrdersCount = useMemo(() => orders.filter((o) => o.status === 'cancelled').length, [orders]);
  const customLeadsCount = useMemo(() => orders.filter((o) => o.orderType === 'custom_bot').length, [orders]);

  const avgOrderValueBDT = useMemo(() => {
    if (confirmedCompletedOrders.length === 0) return 0;
    return Math.round(confirmedRevenueBDT / confirmedCompletedOrders.length);
  }, [confirmedRevenueBDT, confirmedCompletedOrders]);

  // ANALYTICS CALCULATIONS & AGGREGATIONS
  const filteredAnalyticsEvents = useMemo(() => {
    return filterEventsByDate(analyticsEvents, analyticsDateFilter);
  }, [analyticsEvents, analyticsDateFilter]);

  const pageViewEvents = useMemo(
    () => filteredAnalyticsEvents.filter((e) => e.type === 'page_view'),
    [filteredAnalyticsEvents]
  );
  const totalPageViews = pageViewEvents.length;

  const uniqueVisitors = useMemo(() => {
    const set = new Set<string>();
    filteredAnalyticsEvents.forEach((e) => set.add(e.visitorId));
    return set.size;
  }, [filteredAnalyticsEvents]);

  const newVisitorsCount = useMemo(() => {
    const set = new Set<string>();
    filteredAnalyticsEvents.filter((e) => e.isNewVisitor).forEach((e) => set.add(e.visitorId));
    return set.size;
  }, [filteredAnalyticsEvents]);

  const returningVisitorsCount = Math.max(0, uniqueVisitors - newVisitorsCount);

  // Active visitors in the last 30 minutes
  const activeVisitors30m = useMemo(() => {
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const set = new Set<string>();
    analyticsEvents.forEach((e) => {
      if (new Date(e.timestamp).getTime() >= thirtyMinAgo) {
        set.add(e.visitorId);
      }
    });
    return Math.max(set.size, 1); // at least current admin
  }, [analyticsEvents]);

  const botDetailViewsCount = useMemo(
    () => filteredAnalyticsEvents.filter((e) => e.type === 'bot_detail_view').length,
    [filteredAnalyticsEvents]
  );

  const conversionRate = useMemo(() => {
    if (uniqueVisitors === 0) return '0%';
    const rate = (confirmedCompletedOrders.length / uniqueVisitors) * 100;
    return `${rate.toFixed(1)}%`;
  }, [uniqueVisitors, confirmedCompletedOrders]);

  // Traffic sources distribution
  const trafficSourcesDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Telegram: 0,
      Direct: 0,
      'Google Search': 0,
      'Social Media': 0,
      Referral: 0,
    };
    filteredAnalyticsEvents.forEach((e) => {
      if (counts[e.trafficSource] !== undefined) {
        counts[e.trafficSource]++;
      } else {
        counts.Direct++;
      }
    });
    const total = filteredAnalyticsEvents.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [filteredAnalyticsEvents]);

  // Devices distribution
  const deviceDistribution = useMemo(() => {
    const counts = { Mobile: 0, Desktop: 0, Tablet: 0 };
    filteredAnalyticsEvents.forEach((e) => {
      counts[e.deviceCategory] = (counts[e.deviceCategory] || 0) + 1;
    });
    const total = filteredAnalyticsEvents.length || 1;
    return {
      mobile: Math.round((counts.Mobile / total) * 100),
      desktop: Math.round((counts.Desktop / total) * 100),
      tablet: Math.round((counts.Tablet / total) * 100),
    };
  }, [filteredAnalyticsEvents]);

  // Daily views grouped for chart
  const dailyTrafficChartData = useMemo(() => {
    const dayMap = new Map<string, { date: string; views: number; visitors: Set<string> }>();
    // Sort chronologically
    const sorted = [...filteredAnalyticsEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sorted.forEach((e) => {
      const day = e.timestamp.split('T')[0] || 'Today';
      if (!dayMap.has(day)) {
        dayMap.set(day, { date: day.slice(5), views: 0, visitors: new Set() });
      }
      const entry = dayMap.get(day)!;
      entry.views++;
      entry.visitors.add(e.visitorId);
    });

    const entries = Array.from(dayMap.values()).slice(-14); // show last 14 active days
    const maxViews = Math.max(...entries.map((d) => d.views), 10);
    return { entries, maxViews };
  }, [filteredAnalyticsEvents]);

  // Filtered bot catalog
  const filteredBots = useMemo(() => {
    return bots.filter((b) => {
      const matchCat = botCategoryFilter === 'All' || b.category === botCategoryFilter;
      const matchStatus =
        botStatusFilter === 'all' ||
        (botStatusFilter === 'published' && b.isPublished !== false) ||
        (botStatusFilter === 'draft' && b.isPublished === false);
      const matchSearch =
        !botSearchQuery.trim() ||
        b.title.toLowerCase().includes(botSearchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(botSearchQuery.toLowerCase()) ||
        b.shortDescription.toLowerCase().includes(botSearchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [bots, botCategoryFilter, botStatusFilter, botSearchQuery]);

  // Filtered orders pipeline
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderFilter !== 'all' && ord.status !== orderFilter) return false;
      if (orderTypeFilter !== 'all') {
        if (orderTypeFilter === 'custom_bot' && ord.orderType !== 'custom_bot') return false;
        if (orderTypeFilter === 'ready_bot' && ord.orderType === 'custom_bot') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ord.id.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.customerPhone.toLowerCase().includes(q) ||
          ord.telegramUsername.toLowerCase().includes(q) ||
          ord.botTitle.toLowerCase().includes(q) ||
          (ord.transactionId && ord.transactionId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, orderFilter, orderTypeFilter, searchQuery]);

  // Filtered customers directory
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const q = customerSearchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.telegramUsername.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, customerSearchQuery]);

  const customOrders = useMemo(() => orders.filter((o) => o.orderType === 'custom_bot'), [orders]);

  const getTabLabel = (tab: AdminProcessTab) => {
    switch (tab) {
      case 'overview': return 'Executive Overview';
      case 'analytics': return 'Analytics & Traffic Monitoring';
      case 'bots': return 'Bot Inventory Management';
      case 'orders': return 'Orders CRM Pipeline';
      case 'customers': return 'Customer Directory & LTV';
      case 'custom_leads': return 'Custom Bot Requests';
      case 'payments': return 'Payment Accounts';
      case 'branding': return 'Storefront & Branding';
      case 'socials': return 'Contact Handles';
      case 'security': return 'Security & PIN';
      case 'backup': return 'Data Backup & Cloud';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Full Screen Viewport on Mobile, Crisp Shell on Desktop */}
      <div
        className="relative w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-2xl border-0 md:border md:border-cyan-500/30 bg-[#070b13] text-slate-100 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Navigation Strip */}
        <header className="flex items-center justify-between border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#0b101d] shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* 3-Line Menu Button INSIDE Admin Panel */}
            {isAuthenticated && (
              <button
                onClick={() => setIsAdminMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 group"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                {/* 3 Crisp Horizontal Lines */}
                <div className="flex flex-col justify-center items-center gap-[3.5px] w-4 h-4" aria-hidden="true">
                  <span className="w-3.5 h-[2px] bg-cyan-400 group-hover:bg-white rounded-full transition-colors"></span>
                  <span className="w-3.5 h-[2px] bg-cyan-400 group-hover:bg-white rounded-full transition-colors"></span>
                  <span className="w-3.5 h-[2px] bg-cyan-400 group-hover:bg-white rounded-full transition-colors"></span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
                {pendingOrdersCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold font-mono">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Brand Lockup & Current Active Process Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0088cc] to-[#00a8ff] text-white shadow-md shadow-cyan-500/20 shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">{settings.brandName}</span>
                  <span className="text-slate-500 hidden sm:inline">/</span>
                  <span className="text-cyan-400 text-[11px] sm:text-xs font-mono font-semibold hidden sm:inline">Production Admin</span>
                </div>
                {isAuthenticated && (
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span className="text-slate-500">Module:</span>
                    <span className="text-cyan-300 font-bold truncate">{getTabLabel(activeTab)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Cluster: Quick Close and View Website */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Close Admin and view public customer website"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">View Storefront</span>
              <span className="sm:hidden">Website</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Admin and return to storefront"
              aria-label="Close Admin Console"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-sm mx-auto my-auto">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 shadow-xl shadow-cyan-500/20">
                <Lock className="h-8 w-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Admin Authentication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your secure 4-digit PIN code to manage bot catalogs, real-time client CRM, and sensitive payment accounts.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  maxLength={8}
                  placeholder="Enter 4-Digit Security PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  className="w-full text-center text-xl tracking-[0.4em] py-3.5 px-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-mono pt-1">
                    Incorrect Admin PIN. Please verify your access code.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0088cc] via-[#00a8ff] to-[#00d2ff] hover:from-[#0077b5] text-white font-extrabold text-sm shadow-lg shadow-[#0088cc]/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
              >
                Unlock Administrator Console
              </button>
            </form>

            <div className="text-[11px] text-slate-500 font-mono">
              Default system PIN: <span className="text-cyan-400 font-bold">1234</span> (Changeable inside Settings)
            </div>
          </div>
        ) : (
          /* AUTHENTICATED WORKSPACE SHELL */
          <div className="flex-1 flex overflow-hidden relative">
            {/* SLIDE-OUT / DESKTOP RESPONSIVE NAVIGATION DRAWER */}
            {isAdminMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={() => setIsAdminMenuOpen(false)}
              >
                <div
                  className="w-72 sm:w-80 h-full bg-[#080d16] border-r border-white/10 shadow-2xl flex flex-col z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-white/10 bg-[#0d1424] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[#0088cc] flex items-center justify-center text-white">
                          <Shield className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Command Center</span>
                      </div>
                      <button
                        onClick={() => setIsAdminMenuOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quick Vital Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
                        <div className="text-[9px] text-slate-400 uppercase">Bots</div>
                        <div className="text-xs font-bold text-white">{bots.length}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
                        <div className="text-[9px] text-slate-400 uppercase">Orders</div>
                        <div className="text-xs font-bold text-amber-400">{orders.length}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5">
                        <div className="text-[9px] text-slate-400 uppercase">Revenue</div>
                        <div className="text-xs font-bold text-emerald-400">
                          {confirmedRevenueBDT > 9999 ? `${Math.round(confirmedRevenueBDT / 1000)}k` : confirmedRevenueBDT}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Scrollable Navigation Links */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                    {/* Category 1: Analytics & Catalog */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 pb-1 font-bold">
                        [Core Operations]
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('overview');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'overview'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BarChart3 className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Executive Overview</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('analytics');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'analytics'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs">Analytics & Traffic</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          Live
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('bots');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'bots'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Bot Products Catalog</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                          {bots.length}
                        </span>
                      </button>
                    </div>

                    {/* Category 2: Sales & CRM */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 pb-1 font-bold">
                        [Sales & Clients CRM]
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'orders'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs">Client Orders CRM</span>
                        </div>
                        {pendingOrdersCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                            {pendingOrdersCount} Pending
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {orders.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('customers');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'customers'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Customers Directory</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                          {customers.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('custom_leads');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'custom_leads'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="text-xs">Custom Bot Requests</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                          {customLeadsCount} Leads
                        </span>
                      </button>
                    </div>

                    {/* Category 3: Store Configuration */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 pb-1 font-bold">
                        [Store & Gateways]
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('payments');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'payments'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Payment Accounts</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('branding');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'branding'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Storefront & Branding</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('socials');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'socials'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Share2 className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs">Contact Handles</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('security');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'security'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="h-4 w-4 text-amber-400" />
                          <span className="text-xs">Security & PIN</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('backup');
                          setIsAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          activeTab === 'backup'
                            ? 'bg-cyan-950/90 border border-cyan-500/50 text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="h-4 w-4 text-purple-400" />
                          <span className="text-xs">Data Backup & Cloud</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Footer Logout */}
                  <div className="p-3 border-t border-white/10 bg-[#0d1424] space-y-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out & Lock Console</span>
                    </button>
                    <div className="text-center text-[10px] text-slate-500 font-mono">
                      Session Protected • BotCraft OS v4.2
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN CONTENT WORKSPACE */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#070b13] space-y-5">
              {/* MODULE 1: EXECUTIVE OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5 max-w-6xl">
                  {/* Top 4 KPI Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1424] border border-cyan-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-mono uppercase font-semibold">Confirmed Revenue</span>
                        <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-white font-mono">
                        BDT {confirmedRevenueBDT.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span>• From {completedCount} completed orders</span>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1424] border border-cyan-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-mono uppercase font-semibold">Orders Pipeline</span>
                        <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-white font-mono">
                        {orders.length} <span className="text-xs text-slate-400 font-normal">Orders</span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        {pendingOrdersCount} Pending (BDT {pendingVolumeBDT.toLocaleString()})
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1424] border border-cyan-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-mono uppercase font-semibold">Live Bot Catalog</span>
                        <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400">
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-white font-mono">
                        {bots.filter((b) => b.isPublished !== false).length}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ {bots.length} Total</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {bots.filter((b) => b.isPublished === false).length} in Draft Mode
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1424] border border-cyan-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-mono uppercase font-semibold">Active Visitors</span>
                        <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400">
                          <Activity className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-white font-mono">
                        {activeVisitors30m} <span className="text-xs text-slate-400 font-normal">Online (30m)</span>
                      </div>
                      <div className="text-[10px] text-purple-400 font-mono">
                        {uniqueVisitors} Unique Visitors (30d)
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Launchpad */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-[#0f172a]/70 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">Administrator Quick Actions:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openAddBot()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New Bot</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Review Orders ({pendingOrdersCount})</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>View Analytics</span>
                      </button>
                      <button
                        onClick={exportBackupJson}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Backup</span>
                      </button>
                    </div>
                  </div>

                  {/* Two Column Grid: Top Bots & Recent Admin Activities */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top Bots Performance */}
                    <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Top Bots Performance</span>
                        </h4>
                        <button
                          onClick={() => setActiveTab('bots')}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Manage All ({bots.length})
                        </button>
                      </div>
                      <div className="space-y-2">
                        {bots.slice(0, 4).map((bot) => (
                          <div
                            key={bot.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={bot.image || getCategoryFallback(bot.category)}
                                alt={bot.title}
                                className="h-8 w-8 rounded-lg object-cover bg-slate-950 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{bot.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{bot.category}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-mono font-bold text-emerald-400">
                                BDT {bot.priceBDT.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{bot.salesCount} sold</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Admin Activity Audit Trail */}
                    <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-purple-400" />
                          <span>Recent Activity Audit Trail</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">Live Log</span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {activityLogs.slice(0, 6).map((log) => (
                          <div
                            key={log.id}
                            className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    log.category === 'bot'
                                      ? 'bg-cyan-400'
                                      : log.category === 'order'
                                      ? 'bg-emerald-400'
                                      : log.category === 'security'
                                      ? 'bg-amber-400'
                                      : 'bg-purple-400'
                                  }`}
                                />
                                {log.action}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-tight">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: WEBSITE ANALYTICS AND TRAFFIC MONITORING */}
              {activeTab === 'analytics' && (
                <div className="space-y-5 max-w-6xl">
                  {/* Analytics Header & Date Range Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-sm">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-400" />
                        <span>Website Analytics & Traffic Intelligence</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Real-time visitor telemetry, traffic channels, and storefront conversion funnel.
                      </p>
                    </div>

                    {/* Date Filter Pills */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                      {(['today', 'yesterday', '7days', '30days', 'all'] as AnalyticsDateFilter[]).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setAnalyticsDateFilter(filterKey)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            analyticsDateFilter === filterKey
                              ? 'bg-[#0088cc] text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {filterKey === 'today'
                            ? 'Today'
                            : filterKey === 'yesterday'
                            ? 'Yesterday'
                            : filterKey === '7days'
                            ? '7 Days'
                            : filterKey === '30days'
                            ? '30 Days'
                            : 'All Time'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary 6 Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Page Views</div>
                      <div className="text-xl font-black text-white font-mono">{totalPageViews}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Total impressions</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Unique Visitors</div>
                      <div className="text-xl font-black text-white font-mono">{uniqueVisitors}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{newVisitorsCount} new clients</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Returning</div>
                      <div className="text-xl font-black text-white font-mono">{returningVisitorsCount}</div>
                      <div className="text-[10px] text-purple-400 font-mono">Repeat audience</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Active (30m)</div>
                      <div className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {activeVisitors30m}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Real-time presence</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Bot Detail Views</div>
                      <div className="text-xl font-black text-white font-mono">{botDetailViewsCount}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">High purchase intent</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Conversion Rate</div>
                      <div className="text-xl font-black text-emerald-400 font-mono">{conversionRate}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Visitor to order</div>
                    </div>
                  </div>

                  {/* Daily Traffic Visual Chart */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-cyan-400" />
                          <span>Traffic Trends & Page Views Frequency</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Daily volume of page impressions recorded across this period.
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-300">
                        Peak: {dailyTrafficChartData.maxViews} views/day
                      </span>
                    </div>

                    {/* SVG / Flex Bar Chart */}
                    <div className="h-44 w-full flex items-end gap-1.5 sm:gap-3 pt-6 border-b border-white/10 pb-2">
                      {dailyTrafficChartData.entries.map((day, idx) => {
                        const heightPct = Math.max(12, Math.round((day.views / dailyTrafficChartData.maxViews) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <div className="text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.views}
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#0088cc] to-[#00d2ff] group-hover:brightness-125 transition-all shadow-sm"
                            />
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-full">
                              {day.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channels & Devices Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Traffic Acquisition Channels */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3.5 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        <span>Traffic Acquisition Channels</span>
                      </h4>
                      <div className="space-y-2.5">
                        {trafficSourcesDistribution.map((src) => (
                          <div key={src.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">{src.name}</span>
                              <span className="font-mono font-bold text-white">{src.pct}% ({src.count})</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                              <div
                                style={{ width: `${src.pct}%` }}
                                className={`h-full rounded-full ${
                                  src.name === 'Telegram'
                                    ? 'bg-[#0088cc]'
                                    : src.name === 'Direct'
                                    ? 'bg-cyan-400'
                                    : src.name === 'Google Search'
                                    ? 'bg-emerald-400'
                                    : src.name === 'Social Media'
                                    ? 'bg-purple-400'
                                    : 'bg-amber-400'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Device & Platform Breakdown */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3.5 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-cyan-400" />
                        <span>Device Categories</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                          <Smartphone className="h-5 w-5 mx-auto text-cyan-400" />
                          <div className="text-xs font-bold text-white">Mobile Phones</div>
                          <div className="text-base font-mono font-extrabold text-cyan-300">{deviceDistribution.mobile}%</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                          <Monitor className="h-5 w-5 mx-auto text-emerald-400" />
                          <div className="text-xs font-bold text-white">Desktop PCs</div>
                          <div className="text-base font-mono font-extrabold text-emerald-300">{deviceDistribution.desktop}%</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                          <Tablet className="h-5 w-5 mx-auto text-purple-400" />
                          <div className="text-xs font-bold text-white">Tablets</div>
                          <div className="text-base font-mono font-extrabold text-purple-300">{deviceDistribution.tablet}%</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                        Mobile remains the primary customer conversion channel. All storefront cards, checkout modals, and payment forms are responsive and tested on Android.
                      </p>
                    </div>
                  </div>

                  {/* Conversion Funnel */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3.5 shadow-sm">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-emerald-400" />
                      <span>End-to-End Storefront Conversion Funnel</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                        <div className="text-[10px] text-slate-400 font-mono">1. Unique Visitors</div>
                        <div className="text-lg font-bold text-white font-mono pt-1">{uniqueVisitors}</div>
                        <div className="text-[10px] text-slate-500">100% baseline</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
                        <div className="text-[10px] text-cyan-300 font-mono">2. Bot Detail Views</div>
                        <div className="text-lg font-bold text-white font-mono pt-1">{botDetailViewsCount}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">
                          {uniqueVisitors > 0 ? Math.round((botDetailViewsCount / uniqueVisitors) * 100) : 0}% intent
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
                        <div className="text-[10px] text-amber-300 font-mono">3. Orders Placed</div>
                        <div className="text-lg font-bold text-white font-mono pt-1">{orders.length}</div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          {uniqueVisitors > 0 ? Math.round((orders.length / uniqueVisitors) * 100) : 0}% conversion
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                        <div className="text-[10px] text-emerald-300 font-mono">4. Paid & Delivered</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono pt-1">{completedCount}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          BDT {confirmedRevenueBDT.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 3: BOT INVENTORY & PRODUCTS */}
              {activeTab === 'bots' && (
                <div className="space-y-4 max-w-6xl">
                  {/* Top Bar for Bot Manager */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search bot catalog..."
                          value={botSearchQuery}
                          onChange={(e) => setBotSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
                        />
                      </div>
                      <select
                        value={botCategoryFilter}
                        onChange={(e) => setBotCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      >
                        <option value="All">All Categories ({bots.length})</option>
                        <option value="E-Commerce & Shop">E-Commerce & Shop</option>
                        <option value="File & Media Store">File & Media Store</option>
                        <option value="Channel & Group">Channel & Group</option>
                        <option value="Payment & Crypto">Payment & Crypto</option>
                        <option value="Utility & AI">Utility & AI</option>
                      </select>
                      <select
                        value={botStatusFilter}
                        onChange={(e) => setBotStatusFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      >
                        <option value="all">All Visibility</option>
                        <option value="published">Live Only</option>
                        <option value="draft">Drafts Only</option>
                      </select>
                    </div>

                    <button
                      onClick={() => openAddBot()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto hover:brightness-110 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Telegram Bot</span>
                    </button>
                  </div>

                  {/* Grid of Bot Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredBots.map((bot) => (
                      <div
                        key={bot.id}
                        className="rounded-2xl border border-white/10 bg-[#0d1424] p-4 flex flex-col justify-between space-y-3.5 hover:border-cyan-500/40 transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                            <img
                              src={bot.image || getCategoryFallback(bot.category)}
                              alt={bot.title}
                              className="h-full w-full object-cover"
                            />
                            {bot.isPublished === false && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[8px] font-mono text-amber-300 font-bold uppercase">
                                Draft
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono text-cyan-400">{bot.category}</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">{bot.version || 'v1.0'}</span>
                              <button
                                onClick={() => toggleBotPublish(bot.id)}
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold cursor-pointer ${
                                  bot.isPublished !== false
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                }`}
                                title="Click to toggle catalog visibility"
                              >
                                {bot.isPublished !== false ? 'Live' : 'Draft'}
                              </button>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate pt-0.5">{bot.title}</h4>
                            <div className="text-xs font-mono font-semibold text-emerald-400 pt-0.5">
                              BDT {bot.priceBDT.toLocaleString()} <span className="text-slate-400 font-normal">(${bot.priceUSD})</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {bot.shortDescription}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="text-[10px] text-slate-400 font-mono">
                            {bot.salesCount} sold • {bot.viewsCount || 42} views
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                duplicateBot(bot.id);
                                showToast(`Cloned "${bot.title}" as draft!`, 'success');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold cursor-pointer transition-colors"
                              title="Duplicate bot as draft"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Clone</span>
                            </button>
                            <button
                              onClick={() => openEditBot(bot)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Telegram Bot',
                                  message: `Are you sure you want to delete "${bot.title}" from the catalog? This will remove it permanently.`,
                                  confirmLabel: 'Delete Bot',
                                  onConfirm: () => {
                                    deleteBot(bot.id);
                                    showToast(`Bot "${bot.title}" deleted.`, 'info');
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer transition-colors"
                              title="Delete Bot"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 4: ORDERS CRM PIPELINE */}
              {activeTab === 'orders' && (
                <div className="space-y-4 max-w-6xl">
                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search Order ID, Client, Phone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 w-48 sm:w-64"
                        />
                      </div>
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      >
                        <option value="all">All Status ({orders.length})</option>
                        <option value="pending">Pending Verification ({pendingOrdersCount})</option>
                        <option value="in_progress">In Progress ({inProgressCount})</option>
                        <option value="completed">Completed / Delivered ({completedCount})</option>
                        <option value="cancelled">Cancelled ({cancelledOrdersCount})</option>
                      </select>
                      <select
                        value={orderTypeFilter}
                        onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      >
                        <option value="all">All Types</option>
                        <option value="ready_bot">Ready Bots</option>
                        <option value="custom_bot">Custom Requests</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xs font-mono text-slate-400">
                        Confirmed: <span className="font-bold text-emerald-400">BDT {confirmedRevenueBDT.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={exportOrdersCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-white/10 cursor-pointer transition-colors shadow-sm"
                        title="Download all orders as CSV spreadsheet"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#0d1424] space-y-2">
                      <div className="text-2xl">📦</div>
                      <h4 className="text-sm font-bold text-white">No Orders Found</h4>
                      <p className="text-xs text-slate-400">No orders match your current filter criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map((ord) => {
                        const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                        const waLink = `https://wa.me/${cleanPhone}`;
                        const tgLink = `https://t.me/${ord.telegramUsername.replace('@', '')}`;

                        return (
                          <div
                            key={ord.id}
                            className="rounded-2xl border border-white/10 bg-[#0d1424] p-4 space-y-3 shadow-sm hover:border-cyan-500/30 transition-all"
                          >
                            {/* Order Header Strip */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-cyan-400">{ord.id}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    ord.status === 'completed'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                      : ord.status === 'pending'
                                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                      : ord.status === 'in_progress'
                                      ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>

                              {/* Status Dropdown */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">Update Status:</span>
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                  className="px-2 py-1 text-xs rounded-lg bg-slate-900 border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            {/* Details 3-Col Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-mono">Ordered Product</div>
                                <div className="font-bold text-white">{ord.botTitle}</div>
                                <div className="text-emerald-400 font-mono font-semibold">
                                  Amount: BDT {ord.amountBDT.toLocaleString()}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-mono">Client Profile</div>
                                <div className="font-semibold text-white">{ord.customerName}</div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  {cleanPhone && (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono hover:bg-emerald-900 transition-colors"
                                    >
                                      <Phone className="h-3 w-3" />
                                      <span>{ord.customerPhone}</span>
                                    </a>
                                  )}
                                  {ord.telegramUsername && (
                                    <a
                                      href={tgLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0088cc]/20 text-cyan-300 border border-[#0088cc]/40 text-[11px] font-mono hover:bg-[#0088cc]/30 transition-colors"
                                    >
                                      <Send className="h-3 w-3" />
                                      <span>{ord.telegramUsername}</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-mono">Payment Verification</div>
                                <div className="text-white font-mono">{ord.paymentMethod}</div>
                                {ord.transactionId ? (
                                  <div className="text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                                    <span>TrxID: {ord.transactionId}</span>
                                    <button
                                      onClick={() => copyToClipboard(ord.transactionId!, ord.id)}
                                      className="text-slate-400 hover:text-white"
                                      title="Copy Transaction ID"
                                    >
                                      {copiedKey === ord.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-slate-400 text-[11px]">Direct Discussion</div>
                                )}
                              </div>
                            </div>

                            {/* Customer Notes / Custom Specs if any */}
                            {ord.customerNotes && (
                              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-slate-300">
                                <span className="font-semibold text-slate-400">Note: </span>
                                {ord.customerNotes}
                              </div>
                            )}

                            {/* Actions footer */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                {ord.telegramUsername && (
                                  <a
                                    href={`https://t.me/${ord.telegramUsername.replace('@', '')}?text=${encodeURIComponent(
                                      `Hello ${ord.customerName}! Regarding your order #${ord.id} for "${ord.botTitle}": Status is currently marked as ${ord.status.toUpperCase()}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-cyan-300 border border-[#0088cc]/40 text-xs font-mono transition-colors"
                                  >
                                    <Send className="h-3 w-3" />
                                    <span>Chat with Client</span>
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    title: 'Delete Order Record',
                                    message: `Delete order #${ord.id} for "${ord.customerName}" (${ord.botTitle})? This record will be permanently purged.`,
                                    confirmLabel: 'Delete Order',
                                    onConfirm: () => {
                                      deleteOrder(ord.id);
                                      showToast(`Order #${ord.id} deleted.`, 'info');
                                    }
                                  });
                                }}
                                className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900 text-rose-400 text-xs font-mono transition-colors cursor-pointer"
                              >
                                Delete Record
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 5: CUSTOMER DIRECTORY & LTV */}
              {activeTab === 'customers' && (
                <div className="space-y-4 max-w-6xl">
                  {/* Top Bar for Customer CRM */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-sm">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-400" />
                        <span>Customer Management & Lifetime Value</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Aggregate profiles of all customers who purchased or inquired about bots.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search name, phone, or Telegram..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 w-52 sm:w-64"
                        />
                      </div>
                      <button
                        onClick={exportCustomersCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-white/10 cursor-pointer transition-colors shadow-sm"
                        title="Download customer list as CSV"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Total Clients</div>
                      <div className="text-xl font-bold text-white font-mono">{customers.length}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Aggregated records</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Repeat Buyers</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">
                        {customers.filter((c) => c.totalOrders > 1).length}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">Multiple bot orders</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Average Order Value</div>
                      <div className="text-xl font-bold text-white font-mono">BDT {avgOrderValueBDT.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Per delivered order</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0d1424] border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Total Verified LTV</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">BDT {confirmedRevenueBDT.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Delivered revenue</div>
                    </div>
                  </div>

                  {/* Customer Table */}
                  <div className="rounded-2xl border border-white/10 bg-[#0d1424] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0b101d] text-slate-400 font-mono text-[11px] uppercase border-b border-white/10">
                          <tr>
                            <th className="py-3 px-4">Client Name</th>
                            <th className="py-3 px-4">Direct Contact</th>
                            <th className="py-3 px-4">Orders</th>
                            <th className="py-3 px-4">Total Spent</th>
                            <th className="py-3 px-4">Last Activity</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No customer profiles found.
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((cust) => {
                              const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
                              return (
                                <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-white">{cust.name}</div>
                                    {cust.email && <div className="text-[10px] text-slate-400 font-mono">{cust.email}</div>}
                                  </td>
                                  <td className="py-3 px-4 font-mono">
                                    <div className="text-cyan-300">{cust.telegramUsername || 'None'}</div>
                                    <div className="text-slate-400 text-[11px]">{cust.phone || 'No phone'}</div>
                                  </td>
                                  <td className="py-3 px-4 font-mono">
                                    <span className="font-bold text-white">{cust.totalOrders}</span>{' '}
                                    <span className="text-[10px] text-slate-400">({cust.completedOrders} completed)</span>
                                  </td>
                                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                    BDT {cust.totalSpentBDT.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                                    {new Date(cust.lastOrderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {cleanPhone && (
                                        <a
                                          href={`https://wa.me/${cleanPhone}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900"
                                          title="WhatsApp Chat"
                                        >
                                          <Phone className="h-3.5 w-3.5" />
                                        </a>
                                      )}
                                      {cust.telegramUsername && (
                                        <a
                                          href={`https://t.me/${cust.telegramUsername.replace('@', '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 rounded bg-[#0088cc]/20 text-cyan-300 border border-[#0088cc]/40 hover:bg-[#0088cc]/30"
                                          title="Telegram Chat"
                                        >
                                          <Send className="h-3.5 w-3.5" />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => setSelectedCustomer(cust)}
                                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
                                      >
                                        History
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 6: CUSTOM BOT REQUESTS & LEADS */}
              {activeTab === 'custom_leads' && (
                <div className="space-y-4 max-w-6xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Custom Telegram Bot Architecture Requests</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      Tailored bots submitted by clients through the storefront custom bot modal.
                    </p>
                  </div>

                  {customOrders.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#0d1424]">
                      <div className="text-2xl">✨</div>
                      <h4 className="text-sm font-bold text-white pt-1">No Custom Bot Leads</h4>
                      <p className="text-xs text-slate-400">Any custom requirements submitted by users appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customOrders.map((ord) => (
                        <div key={ord.id} className="p-4 rounded-2xl bg-[#0d1424] border border-purple-500/30 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div>
                              <span className="font-mono text-cyan-400 font-bold">{ord.id}</span>
                              <span className="text-white font-bold ml-2">{ord.customerName}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-mono text-[10px] uppercase">
                              {ord.status}
                            </span>
                          </div>

                          {ord.customSpecs && (
                            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-400">Target Category: </span>
                                <span className="text-white font-semibold">{ord.customSpecs.category}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Budget Range: </span>
                                <span className="text-emerald-400 font-mono font-semibold">{ord.customSpecs.budget}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Required Features: </span>
                                <p className="text-slate-200 pt-1 leading-relaxed">{ord.customSpecs.featuresNeeded}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1">
                            <div className="font-mono text-slate-400">
                              Contact: {ord.customerPhone} ({ord.telegramUsername})
                            </div>
                            <a
                              href={`https://t.me/${ord.telegramUsername.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs flex items-center gap-1.5"
                            >
                              <Send className="h-3 w-3" />
                              <span>Discuss on Telegram</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 7: PAYMENT ACCOUNTS */}
              {activeTab === 'payments' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-cyan-400" />
                      <span>Payment Receiving Accounts</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure the payment numbers and IDs displayed to customers during manual checkout.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">bKash Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.bkashNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Nagad Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.nagadNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Rocket Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.rocketNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Binance Pay ID / USDT TRC20</label>
                        <input
                          type="text"
                          value={settingsForm.binancePayId}
                          onChange={(e) => setSettingsForm({ ...settingsForm, binancePayId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {settingsSaved && (
                        <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                          <Check className="h-4 w-4" /> Changes saved to store settings!
                        </span>
                      )}
                      <button
                        type="submit"
                        className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white font-bold cursor-pointer hover:brightness-110"
                      >
                        Save Payment Accounts
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MODULE 8: STOREFRONT & BRANDING */}
              {activeTab === 'branding' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cyan-400" />
                      <span>Storefront Headlines & Brand Identity</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Customize store title, hero headlines, and customer currency preferences.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Store Brand Name</label>
                        <input
                          type="text"
                          value={settingsForm.brandName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Hero Headline</label>
                        <input
                          type="text"
                          value={settingsForm.heroHeadline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Hero Subheadline</label>
                        <textarea
                          rows={3}
                          value={settingsForm.heroSubheadline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Default Currency Preference</label>
                        <select
                          value={settingsForm.currency}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        >
                          <option value="BDT">BDT (Bangladeshi Taka / English formatted)</option>
                          <option value="USD">USD ($ United States Dollars)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {settingsSaved && (
                        <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                          <Check className="h-4 w-4" /> Branding settings saved!
                        </span>
                      )}
                      <button
                        type="submit"
                        className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white font-bold cursor-pointer hover:brightness-110"
                      >
                        Save Branding
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MODULE 9: CONTACT HANDLES */}
              {activeTab === 'socials' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-cyan-400" />
                      <span>Direct Developer Communication Handles</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure your Telegram, WhatsApp, and social media links.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Telegram Username</label>
                        <input
                          type="text"
                          value={settingsForm.telegramUsername}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Telegram Channel URL</label>
                        <input
                          type="url"
                          value={settingsForm.telegramChannelUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">WhatsApp Number</label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">Support Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white font-bold cursor-pointer hover:brightness-110"
                      >
                        Update Handles
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MODULE 10: SECURITY & PIN */}
              {activeTab === 'security' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-amber-400" />
                      <span>Security Controls & Admin PIN</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Manage administrator access passcodes and session security policies.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4 text-xs max-w-md">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Admin Access PIN (4 Digits)</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center tracking-widest text-base"
                      />
                      <p className="text-[10px] text-slate-400 pt-1">
                        This PIN is required every time the console is opened via #admin or Ctrl+Shift+A.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer transition-colors"
                    >
                      Update Admin PIN
                    </button>
                  </form>
                </div>
              )}

              {/* MODULE 11: DATA BACKUP & CLOUD */}
              {activeTab === 'backup' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10 shadow-sm space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-400" />
                      <span>Data Backup, Export & Cloud Synchronization</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Export complete snapshot of bots, orders, analytics, and settings as JSON archive.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Download className="h-4 w-4 text-cyan-400" />
                        <span>Export Complete JSON Backup</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Downloads an offline JSON file containing all bots, active customer orders, custom leads, and settings.
                      </p>
                      <button
                        onClick={exportBackupJson}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Backup JSON</span>
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Upload className="h-4 w-4 text-purple-400" />
                        <span>Restore from JSON Backup</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Restore your bot inventory and order logs from a previously exported backup file.
                      </p>
                      <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Select JSON File</span>
                        <input type="file" accept=".json" onChange={handleBackupFileInput} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Cloud Realtime Database Section */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-[#0d1424] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <Radio className="h-4 w-4 text-emerald-400" />
                          <span>Firebase Realtime Database Cloud Sync</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          Synchronize bots and orders to a free cloud endpoint for cross-device persistence.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTestCloudConnection}
                          disabled={fbTesting}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer border border-white/10"
                        >
                          {fbTesting ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                          type="button"
                          onClick={handleManualCloudSync}
                          disabled={fbSyncing}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                        >
                          {fbSyncing ? 'Syncing...' : 'Sync Cloud Now'}
                        </button>
                      </div>
                    </div>

                    {fbTestResult && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          fbTestResult.success
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {fbTestResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                        <span>{fbTestResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* CUSTOMER ORDER HISTORY MODAL */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0d1424] text-slate-200 p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm sm:text-base font-bold text-white">Client Order History</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">{selectedCustomer.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Total LTV: BDT {selectedCustomer.totalSpentBDT.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-300">
                  <span>Phone: {selectedCustomer.phone}</span>
                  <span>Telegram: {selectedCustomer.telegramUsername}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Orders Timeline ({selectedCustomer.orders.length})
                </h5>
                <div className="space-y-2">
                  {selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="font-mono text-cyan-400">{ord.id}</span>
                          <span>• {ord.botTitle}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethod} {ord.transactionId ? `(TrxID: ${ord.transactionId})` : ''}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-emerald-400">BDT {ord.amountBDT.toLocaleString()}</div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOT ADD / EDIT MODAL WITH MANDATORY WORKING IMAGE UPLOAD */}
        {isBotModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsBotModalOpen(false)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-[#0d1424] text-slate-200 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-cyan-400" />
                  <span>{editingBotId ? 'Edit Telegram Bot Specifications' : 'Publish New Telegram Bot'}</span>
                </h3>
                <button
                  onClick={() => setIsBotModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBot} className="space-y-4 text-xs">
                {/* MANDATORY FEATURE: WORKING BOT IMAGE UPLOAD FIELD */}
                <ImageUploadField
                  currentImage={botFormImage}
                  category={botFormCategory}
                  onImageChange={(newImg) => setBotFormImage(newImg)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1 font-semibold">Bot Title</label>
                    <input
                      type="text"
                      required
                      value={botFormTitle}
                      onChange={(e) => setBotFormTitle(e.target.value)}
                      placeholder="e.g. TeleStore Pro — E-Commerce Bot"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Version Tag</label>
                    <input
                      type="text"
                      required
                      value={botFormVersion}
                      onChange={(e) => setBotFormVersion(e.target.value)}
                      placeholder="e.g. v3.4.0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                    <select
                      value={botFormCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as any;
                        setBotFormCategory(newCat);
                        // If no custom image uploaded yet, update to new category fallback
                        if (!botFormImage || botFormImage.startsWith('http')) {
                          setBotFormImage(getCategoryFallback(newCat));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    >
                      <option value="E-Commerce & Shop">E-Commerce & Shop</option>
                      <option value="File & Media Store">File & Media Store</option>
                      <option value="Channel & Group">Channel & Group</option>
                      <option value="Payment & Crypto">Payment & Crypto</option>
                      <option value="Utility & AI">Utility & AI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Telegram Demo Username</label>
                    <input
                      type="text"
                      value={botFormDemoUsername}
                      onChange={(e) => setBotFormDemoUsername(e.target.value)}
                      placeholder="@DemoBot"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Price (BDT)</label>
                    <input
                      type="number"
                      required
                      value={botFormPriceBDT}
                      onChange={(e) => setBotFormPriceBDT(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Price (USD $)</label>
                    <input
                      type="number"
                      value={botFormPriceUSD}
                      onChange={(e) => setBotFormPriceUSD(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Publish / Draft Status Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10">
                  <div>
                    <span className="text-xs font-semibold text-white block">Publishing Status</span>
                    <span className="text-[10px] text-slate-400 block">
                      {botFormIsPublished ? 'Active and visible on public storefront' : 'Draft mode (hidden from public view)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBotFormIsPublished((prev) => !prev)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                      botFormIsPublished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {botFormIsPublished ? 'Published (Live)' : 'Draft (Hidden)'}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Short Summary</label>
                  <input
                    type="text"
                    required
                    value={botFormShortDesc}
                    onChange={(e) => setBotFormShortDesc(e.target.value)}
                    placeholder="Single-line punchy description"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Full Description</label>
                  <textarea
                    rows={2}
                    required
                    value={botFormFullDesc}
                    onChange={(e) => setBotFormFullDesc(e.target.value)}
                    placeholder="Detailed functional description..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Key Features (One feature per line)
                  </label>
                  <textarea
                    rows={3}
                    value={botFormFeatures}
                    onChange={(e) => setBotFormFeatures(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Commands Registry (Format: /cmd : description (user) OR (admin))
                  </label>
                  <textarea
                    rows={3}
                    value={botFormCommands}
                    onChange={(e) => setBotFormCommands(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-[11px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tech Stack (Comma-separated)</label>
                  <input
                    type="text"
                    value={botFormTech}
                    onChange={(e) => setBotFormTech(e.target.value)}
                    placeholder="Python 3.11, Aiogram, SQLite"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                  />
                </div>

                {/* SEO Optimization Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">SEO Title (Optional)</label>
                    <input
                      type="text"
                      value={botFormSeoTitle}
                      onChange={(e) => setBotFormSeoTitle(e.target.value)}
                      placeholder="Custom browser page title"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">SEO Meta Description (Optional)</label>
                    <input
                      type="text"
                      value={botFormSeoDesc}
                      onChange={(e) => setBotFormSeoDesc(e.target.value)}
                      placeholder="Search engine summary"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBotModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] text-white font-bold cursor-pointer hover:brightness-110 shadow-md"
                  >
                    {editingBotId ? 'Save Changes' : 'Publish Bot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* IN-APP CONFIRMATION MODAL */}
        {confirmModal && (
          <div
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setConfirmModal(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0d1424] text-slate-200 p-5 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/30 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{confirmModal.title}</h4>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = confirmModal.onConfirm;
                    setConfirmModal(null);
                    action();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md"
                >
                  {confirmModal.confirmLabel || 'Confirm Action'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-80 animate-slideUp">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-medium shadow-2xl backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                  : toast.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/40'
                  : 'bg-slate-900/95 border-cyan-500/50 text-cyan-300 shadow-cyan-950/40'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-slate-400 hover:text-white cursor-pointer"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
