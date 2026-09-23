import { DEFAULT_PRODUCTS } from '../data/defaultProducts.js';
import { CATEGORIES } from '../data/categories.js';
import { REVIEWS_DATA, AUDIT_LOGS, TIMELINE_DATA } from '../data/analyticsData.js';

class Store {
  constructor() {
    this.subscribers = new Map();
    this.init();
  }

  init() {
    // Load products
    const savedProducts = localStorage.getItem('nxg_products');
    this.products = savedProducts ? JSON.parse(savedProducts) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

    // Load reviews
    const savedReviews = localStorage.getItem('nxg_reviews');
    this.reviews = savedReviews ? JSON.parse(savedReviews) : JSON.parse(JSON.stringify(REVIEWS_DATA));

    // Load logs
    const savedLogs = localStorage.getItem('nxg_logs');
    this.logs = savedLogs ? JSON.parse(savedLogs) : JSON.parse(JSON.stringify(AUDIT_LOGS));

    // Currencies
    this.currency = localStorage.getItem('nxg_currency') || 'USD';
    this.currencyRates = {
      USD: { symbol: '$', rate: 1.0, decimals: 2 },
      EUR: { symbol: '€', rate: 0.92, decimals: 2 },
      GBP: { symbol: '£', rate: 0.79, decimals: 2 },
      JPY: { symbol: '¥', rate: 152.4, decimals: 0 }
    };

    // User authentication
    const savedUser = localStorage.getItem('nxg_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;

    // Routing
    this.currentRoute = this.getRouteFromHash() || (this.currentUser ? 'app' : 'landing');
    this.activeDashboardView = this.getSubViewFromHash();

    // UI state
    this.sidebarCollapsed = localStorage.getItem('nxg_sidebar_collapsed') === 'true';
    this.timeRange = '30D';
    this.selectedProductIds = new Set();

    // Filters for product list
    this.productFilter = {
      search: '',
      category: 'all',
      status: 'all',
      stockStatus: 'all',
      sortBy: 'date-desc',
      viewMode: localStorage.getItem('nxg_view_mode') || 'table',
      page: 1,
      pageSize: 10
    };

    this.categories = CATEGORIES;
    this.timelineData = TIMELINE_DATA;
  }

  getRouteFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    const hash = raw.split('?')[0];
    if (!hash) return 'landing';
    if (hash === 'login' || hash === 'terms' || hash === 'privacy' || hash === 'landing') {
      return hash;
    }
    if (hash.startsWith('app') || hash === 'dashboard' || hash === 'products' || hash === 'inventory' || hash === 'analytics' || hash === 'reviews' || hash === 'settings') {
      return 'app';
    }
    return 'landing';
  }

  getSubViewFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    const hash = raw.split('?')[0];
    if (['dashboard', 'products', 'inventory', 'analytics', 'reviews', 'settings'].includes(hash)) {
      return hash;
    }
    if (hash.startsWith('app/')) {
      return hash.split('/')[1] || 'dashboard';
    }
    return 'dashboard';
  }

  // Pub/Sub
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const subs = this.subscribers.get(event);
      if (subs) {
        this.subscribers.set(event, subs.filter(cb => cb !== callback));
      }
    };
  }

  dispatch(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in subscriber for event ${event}:`, err);
        }
      });
    }
  }

  // Authentication - POST /auth/login
  async login(username, password) {
    const trimmedUsername = (username || '').trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedUsername) {
      return { success: false, message: 'Please enter your username.' };
    }
    if (!trimmedPassword) {
      return { success: false, message: 'Please enter your password.' };
    }

    try {
      // 1. Attempt POST to /auth/login (proxied to dummyjson by Vite) or direct endpoint
      let response;
      try {
        response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: trimmedUsername,
            password: trimmedPassword,
            expiresInMins: 60
          })
        });
        if (response && response.status === 404) {
          throw new Error('Local proxy not present');
        }
      } catch (err) {
        // Fallback to direct URL if /auth proxy is not available (e.g. static hosting)
        response = await fetch('https://dummyjson.com/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: trimmedUsername,
            password: trimmedPassword,
            expiresInMins: 60
          })
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        const user = {
          id: data.id,
          username: data.username,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          image: data.image,
          token: data.accessToken,
          role: 'Director of Product Operations'
        };

        this.currentUser = user;
        localStorage.setItem('nxg_user', JSON.stringify(user));
        this.dispatch('auth:changed', user);
        this.addLog('Operator Sign In', `Signed in as ${user.name} (${user.username})`, user.name);
        this.setRoute('app');
        return { success: true, user };
      } else {
        const errData = await response.json().catch(() => ({}));
        if (trimmedUsername === 'emilys' && trimmedPassword === 'emilyspass') {
          return this.applyLocalEmilyUser();
        }
        return { success: false, message: errData.message || 'Invalid credentials. Expected username: emilys, password: emilyspass' };
      }
    } catch (networkErr) {
      if (trimmedUsername === 'emilys' && trimmedPassword === 'emilyspass') {
        return this.applyLocalEmilyUser();
      }
      return { success: false, message: 'Authentication network error. Please use username: emilys, password: emilyspass' };
    }
  }

  applyLocalEmilyUser() {
    const user = {
      id: 1,
      username: 'emilys',
      name: 'Emily Johnson',
      email: 'emily.johnson@x.dummyjson.com',
      image: 'https://dummyjson.com/icon/emilys/128',
      token: 'simulated-token-emilys',
      role: 'Director of Product Operations'
    };
    this.currentUser = user;
    localStorage.setItem('nxg_user', JSON.stringify(user));
    this.dispatch('auth:changed', user);
    this.addLog('Operator Sign In', 'Signed in as Emily Johnson (emilys)', 'Emily Johnson');
    this.setRoute('app');
    return { success: true, user };
  }

  async loginDemo() {
    return this.login('emilys', 'emilyspass');
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('nxg_user');
    this.dispatch('auth:changed', null);
    this.setRoute('landing');
  }

  // Route & Navigation
  setRoute(route, subView = null) {
    this.currentRoute = route;
    if (subView) {
      this.activeDashboardView = subView;
    }
    window.location.hash = route === 'app' ? `app/${this.activeDashboardView}` : route;
    this.dispatch('route:changed', { route, subView: this.activeDashboardView });
  }

  setDashboardView(view) {
    this.activeDashboardView = view;
    window.location.hash = `app/${view}`;
    this.dispatch('view:changed', view);
  }

  toggleSidebar(collapsed = null) {
    this.sidebarCollapsed = collapsed !== null ? collapsed : !this.sidebarCollapsed;
    localStorage.setItem('nxg_sidebar_collapsed', String(this.sidebarCollapsed));
    this.dispatch('sidebar:toggled', this.sidebarCollapsed);
  }

  // Data persistence
  saveProducts() {
    localStorage.setItem('nxg_products', JSON.stringify(this.products));
    this.dispatch('products:changed', this.products);
    this.dispatch('metrics:changed', this.getMetrics());
  }

  saveReviews() {
    localStorage.setItem('nxg_reviews', JSON.stringify(this.reviews));
    this.dispatch('reviews:changed', this.reviews);
  }

  saveLogs() {
    localStorage.setItem('nxg_logs', JSON.stringify(this.logs));
    this.dispatch('logs:changed', this.logs);
  }

  addLog(action, detail, user = null) {
    const activeUser = user || (this.currentUser ? this.currentUser.name : 'System');
    const newLog = {
      id: 'log-' + Date.now(),
      action,
      detail,
      user: activeUser,
      time: 'Just now'
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 20) this.logs.pop();
    this.saveLogs();
  }

  // Currency
  setCurrency(curr) {
    if (this.currencyRates[curr]) {
      this.currency = curr;
      localStorage.setItem('nxg_currency', curr);
      this.dispatch('currency:changed', curr);
      this.dispatch('products:changed', this.products);
      this.dispatch('metrics:changed', this.getMetrics());
    }
  }

  formatPrice(amountInUSD) {
    const curr = this.currencyRates[this.currency] || this.currencyRates.USD;
    const converted = amountInUSD * curr.rate;
    return `${curr.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals
    })}`;
  }

  // Time Range
  setTimeRange(range) {
    if (this.timelineData[range]) {
      this.timeRange = range;
      this.dispatch('timerange:changed', range);
    }
  }

  // Product CRUD
  addProduct(productData) {
    const id = 'prod-' + Date.now();
    const newProduct = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salesCount: productData.salesCount || 0,
      revenue: productData.revenue || 0,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 0
    };

    if (!newProduct.margin && newProduct.price && newProduct.cost) {
      newProduct.margin = Number((((newProduct.price - newProduct.cost) / newProduct.price) * 100).toFixed(1));
    }

    this.products.unshift(newProduct);
    this.saveProducts();
    this.addLog('Product Created', `Added ${newProduct.name} (${newProduct.sku})`);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const oldProduct = this.products[idx];
    const updated = {
      ...oldProduct,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updated.price && updated.cost) {
      updated.margin = Number((((updated.price - updated.cost) / updated.price) * 100).toFixed(1));
    }

    this.products[idx] = updated;
    this.saveProducts();
    this.addLog('Product Updated', `Modified ${updated.name} (${updated.sku})`);
    return updated;
  }

  deleteProduct(id) {
    const prod = this.products.find(p => p.id === id);
    if (!prod) return false;

    this.products = this.products.filter(p => p.id !== id);
    this.selectedProductIds.delete(id);
    this.saveProducts();
    this.addLog('Product Deleted', `Removed ${prod.name} (${prod.sku})`);
    return true;
  }

  batchDeleteProducts(ids) {
    const count = ids.length;
    this.products = this.products.filter(p => !ids.includes(p.id));
    ids.forEach(id => this.selectedProductIds.delete(id));
    this.saveProducts();
    this.addLog('Bulk Delete', `Deleted ${count} products`);
  }

  batchUpdateStatus(ids, newStatus) {
    this.products.forEach(p => {
      if (ids.includes(p.id)) {
        p.status = newStatus;
        p.updatedAt = new Date().toISOString();
      }
    });
    this.saveProducts();
    this.addLog('Bulk Status', `Updated status for ${ids.length} products`);
  }

  restockProduct(id, quantity, warehouse = 'na') {
    const prod = this.products.find(p => p.id === id);
    if (!prod) return;

    prod.stock += quantity;
    if (!prod.warehouses) prod.warehouses = { na: 0, eu: 0, apac: 0 };
    prod.warehouses[warehouse] = (prod.warehouses[warehouse] || 0) + quantity;
    prod.updatedAt = new Date().toISOString();

    this.saveProducts();
    this.addLog('Inventory Restocked', `Allocated ${quantity} units to ${prod.name}`);
  }

  addReviewReply(reviewId, replyText) {
    const rev = this.reviews.find(r => r.id === reviewId);
    if (rev) {
      rev.reply = replyText;
      this.saveReviews();
      this.addLog('Response Published', `Published operational reply to ${rev.author}`);
    }
  }

  resetToDefault() {
    this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    this.reviews = JSON.parse(JSON.stringify(REVIEWS_DATA));
    this.logs = JSON.parse(JSON.stringify(AUDIT_LOGS));
    this.selectedProductIds.clear();

    localStorage.removeItem('nxg_products');
    localStorage.removeItem('nxg_reviews');
    localStorage.removeItem('nxg_logs');

    this.saveProducts();
    this.saveReviews();
    this.saveLogs();
    this.addLog('System Reset', 'Reset product database to factory demonstration state');
  }

  // Metrics
  getMetrics() {
    const totalProducts = this.products.length;
    const activeProducts = this.products.filter(p => p.status === 'published').length;
    const draftProducts = this.products.filter(p => p.status === 'draft').length;
    const archivedProducts = this.products.filter(p => p.status === 'archived').length;

    let totalStock = 0;
    let inventoryValuation = 0;
    let totalRevenue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalMarginSum = 0;
    let marginCount = 0;

    this.products.forEach(p => {
      totalStock += p.stock || 0;
      inventoryValuation += (p.stock || 0) * (p.cost || p.price * 0.5);
      totalRevenue += p.revenue || 0;

      if ((p.stock || 0) === 0) {
        outOfStockCount++;
      } else if (p.stock <= (p.lowStockThreshold || 15)) {
        lowStockCount++;
      }

      if (p.margin) {
        totalMarginSum += p.margin;
        marginCount++;
      }
    });

    const avgMargin = marginCount > 0 ? (totalMarginSum / marginCount).toFixed(1) : '56.4';
    const totalReviews = this.reviews.length;
    const avgRating = totalReviews > 0
      ? (this.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2)
      : '4.88';

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      archivedProducts,
      totalStock,
      inventoryValuation,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
      avgMargin,
      avgRating,
      totalReviews
    };
  }

  getFilteredProducts() {
    let list = [...this.products];
    const { search, category, status, stockStatus, sortBy } = this.productFilter;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (status !== 'all') {
      list = list.filter(p => p.status === status);
    }

    if (stockStatus !== 'all') {
      if (stockStatus === 'in-stock') {
        list = list.filter(p => p.stock > (p.lowStockThreshold || 15));
      } else if (stockStatus === 'low-stock') {
        list = list.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 15));
      } else if (stockStatus === 'out-of-stock') {
        list = list.filter(p => p.stock === 0);
      }
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'sales-desc':
          return (b.salesCount || 0) - (a.salesCount || 0);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'date-asc':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'date-desc':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return list;
  }
}

export const store = new Store();
