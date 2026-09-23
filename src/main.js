import './css/main.css';
import { store } from './js/store.js';
import { ChartEngine } from './js/charts.js';
import { UI } from './js/ui.js';
import { ProductManager } from './js/productManager.js';
import { InventoryManager } from './js/inventoryManager.js';
import { ReviewsManager } from './js/reviewsManager.js';
import { ExportImportManager } from './js/exportImport.js';

class App {
  constructor() {
    this.store = store;
    this.init();
  }

  init() {
    // Instantiate managers
    this.productManager = new ProductManager(this.store);
    this.inventoryManager = new InventoryManager(this.store);
    this.reviewsManager = new ReviewsManager(this.store);
    this.exportImportManager = new ExportImportManager(this.store);

    // Subscribe to store updates
    this.store.subscribe('metrics:changed', () => this.renderKPIs());
    this.store.subscribe('products:changed', () => {
      this.renderCharts();
      this.renderTopSellers();
      this.renderKPIs();
    });
    this.store.subscribe('currency:changed', () => {
      this.renderKPIs();
      this.renderCharts();
      this.renderTopSellers();
    });
    this.store.subscribe('view:changed', (view) => this.switchDashboardView(view));
    this.store.subscribe('route:changed', ({ route, subView }) => this.handleRoute(route, subView));
    this.store.subscribe('auth:changed', (user) => this.updateAuthUI(user));
    this.store.subscribe('timerange:changed', () => this.renderCharts());
    this.store.subscribe('logs:changed', () => this.renderAuditLogs());

    this.bindRouting();
    this.bindAuthEvents();
    this.bindGlobalEvents();

    // Initial render
    this.updateAuthUI(this.store.currentUser);
    this.renderKPIs();
    this.renderCharts();
    this.renderTopSellers();
    this.renderAuditLogs();

    // Handle initial hash
    const initialRoute = this.store.getRouteFromHash();
    this.handleRoute(initialRoute);
  }

  bindRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash || hash === 'landing') {
        this.store.setRoute('landing');
      } else if (hash === 'login' || hash === 'terms' || hash === 'privacy') {
        this.store.setRoute(hash);
      } else if (hash.startsWith('app') || hash === 'dashboard' || hash === 'products' || hash === 'inventory' || hash === 'analytics' || hash === 'reviews' || hash === 'settings') {
        let sub = 'dashboard';
        if (hash.includes('/')) {
          sub = hash.split('/')[1] || 'dashboard';
        } else if (hash !== 'app') {
          sub = hash;
        }
        this.store.setRoute('app', sub);
      }
    });

    // Sub-view nav links
    document.querySelectorAll('.nav-link[data-dash-view]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const view = link.dataset.dashView;
        this.store.setDashboardView(view);
      };
    });
  }

  handleRoute(route, subView = null) {
    const views = {
      landing: document.getElementById('landingView'),
      login: document.getElementById('loginView'),
      terms: document.getElementById('legalTermsView'),
      privacy: document.getElementById('legalPrivacyView'),
      app: document.getElementById('appView')
    };

    Object.entries(views).forEach(([name, el]) => {
      if (el) {
        if (name === route) {
          el.classList.add('active');
          if (name === 'app') {
            el.style.display = 'flex';
          } else {
            el.style.display = name === 'login' ? 'flex' : 'block';
          }
        } else {
          el.classList.remove('active');
          el.style.display = 'none';
        }
      }
    });

    if (route === 'app') {
      const targetView = subView || this.store.activeDashboardView || 'dashboard';
      this.switchDashboardView(targetView);
    }

    window.scrollTo(0, 0);
  }

  switchDashboardView(viewName) {
    document.querySelectorAll('.nav-link[data-dash-view]').forEach(link => {
      if (link.dataset.dashView === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    document.querySelectorAll('.dash-view-section').forEach(sec => {
      if (sec.id === `dash-${viewName}`) {
        sec.classList.add('active');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    if (viewName === 'dashboard' || viewName === 'analytics') {
      setTimeout(() => this.renderCharts(), 40);
    }
  }

  bindAuthEvents() {
    const loginForm = document.getElementById('loginForm');
    const loginDemoBtn = document.getElementById('loginDemoBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    const loginErrorMsg = document.getElementById('loginErrorMsg');
    const loginBox = document.querySelector('.login-box');
    const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    if (loginForm && submitBtn) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value.trim();

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Authenticating...';
        submitBtn.disabled = true;

        const result = await this.store.login(username, pass);

        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        if (result.success) {
          if (loginErrorMsg) loginErrorMsg.classList.remove('visible');
          UI.showToast(`Signed in as ${result.user.name}`, 'success');
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.textContent = result.message;
            loginErrorMsg.classList.add('visible');
          }
          if (loginBox) {
            loginBox.classList.remove('animate-shake');
            void loginBox.offsetWidth; // trigger reflow
            loginBox.classList.add('animate-shake');
          }
        }
      };
    }

    if (loginDemoBtn) {
      loginDemoBtn.onclick = async () => {
        document.getElementById('loginEmail').value = 'emilys';
        document.getElementById('loginPassword').value = 'emilyspass';
        if (loginForm) loginForm.requestSubmit();
      };
    }

    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.onclick = () => {
        this.store.logout();
        UI.showToast('Signed out of console', 'info');
      };
    }
  }

  updateAuthUI(user) {
    const nameEl = document.getElementById('appSidebarUserName');
    const roleEl = document.getElementById('appSidebarUserRole');
    const avatarEl = document.getElementById('appSidebarAvatar');

    if (nameEl) nameEl.textContent = user ? user.name : 'Guest Operator';
    if (roleEl) roleEl.textContent = user ? user.role : 'Signed Out';

    if (avatarEl && user && user.image) {
      avatarEl.innerHTML = `<img src="${user.image}" alt="${user.name}" style="width:28px; height:28px; border-radius:var(--radius-xs); object-fit:cover;">`;
    }
  }

  bindGlobalEvents() {
    // Currency
    const currencySelect = document.getElementById('currencySelector');
    if (currencySelect) {
      currencySelect.value = this.store.currency;
      currencySelect.onchange = (e) => {
        this.store.setCurrency(e.target.value);
        UI.showToast(`Display currency: ${e.target.value}`, 'info');
      };
    }

    // Time ranges
    const timeRangeBtns = document.querySelectorAll('.chart-filter-btn[data-range]');
    timeRangeBtns.forEach(btn => {
      btn.onclick = () => {
        timeRangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.store.setTimeRange(btn.dataset.range);
      };
    });

    // Close drawers and modals
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');
    if (closeDrawerBtn) closeDrawerBtn.onclick = () => UI.closeDrawer();
    if (drawerOverlay) drawerOverlay.onclick = () => UI.closeDrawer();

    const cancelConfirmBtn = document.getElementById('confirmCancelBtn');
    const closeConfirmBtn = document.getElementById('closeConfirmModalBtn');
    if (cancelConfirmBtn) cancelConfirmBtn.onclick = () => UI.closeModal('confirmModal');
    if (closeConfirmBtn) closeConfirmBtn.onclick = () => UI.closeModal('confirmModal');

    // Quick export CSV from dashboard header
    const dashExportCsvBtn = document.getElementById('dashExportCsvBtn');
    if (dashExportCsvBtn) {
      dashExportCsvBtn.onclick = () => {
        const mainExportBtn = document.getElementById('exportCsvBtn');
        if (mainExportBtn) mainExportBtn.click();
      };
    }

    // Global Search
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('globalSearchDropdown');

    if (searchInput && searchDropdown) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          searchDropdown.style.display = 'none';
          return;
        }

        const matches = this.store.products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length > 0) {
          searchDropdown.innerHTML = matches.map(p => `
            <div class="search-result-row" data-id="${p.id}" style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-bottom:1px solid var(--border-subtle); cursor:pointer;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.85rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
              </div>
              <span style="font-weight:600; font-size:0.85rem; color:var(--color-accent);">${this.store.formatPrice(p.price)}</span>
            </div>
          `).join('');

          searchDropdown.querySelectorAll('.search-result-row').forEach(row => {
            row.onclick = () => {
              const prod = this.store.products.find(p => p.id === row.dataset.id);
              if (prod) {
                UI.openDrawer(prod, this.store);
                searchDropdown.style.display = 'none';
                searchInput.value = '';
              }
            };
          });

          searchDropdown.style.display = 'block';
        } else {
          searchDropdown.innerHTML = `
            <div style="padding:12px; text-align:center; font-size:0.8125rem; color:var(--text-muted);">
              No products found matching "${query}"
            </div>
          `;
          searchDropdown.style.display = 'block';
        }
      };

      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
          searchDropdown.style.display = 'none';
        }
      });
    }

    // Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        UI.closeModal();
        UI.closeDrawer();
        if (searchDropdown) searchDropdown.style.display = 'none';
      }

      if (e.key === '/' && document.activeElement !== searchInput) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (searchInput) searchInput.focus();
        }
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.renderCharts(), 150);
    });
  }

  renderKPIs() {
    const metrics = this.store.getMetrics();

    const revEl = document.getElementById('kpiTotalRevenue');
    if (revEl) revEl.textContent = this.store.formatPrice(metrics.totalRevenue);

    const valEl = document.getElementById('kpiInventoryValuation');
    if (valEl) valEl.textContent = this.store.formatPrice(metrics.inventoryValuation);

    const prodEl = document.getElementById('kpiActiveProducts');
    if (prodEl) prodEl.textContent = `${metrics.activeProducts} / ${metrics.totalProducts}`;

    const alertEl = document.getElementById('kpiLowStockAlerts');
    if (alertEl) alertEl.textContent = metrics.lowStockCount + metrics.outOfStockCount;

    const marginEl = document.getElementById('kpiAvgMargin');
    if (marginEl) marginEl.textContent = `${metrics.avgMargin}%`;

    const csatEl = document.getElementById('kpiCsatScore');
    if (csatEl) csatEl.textContent = `${metrics.avgRating} / 5.0`;

    const sparkRev = document.getElementById('sparklineRevenue');
    const sparkVal = document.getElementById('sparklineValuation');
    const sparkStock = document.getElementById('sparklineStock');

    if (sparkRev) ChartEngine.renderSparkline(sparkRev, [32, 45, 41, 58, 62, 75, 84], '#1e3a5f');
    if (sparkVal) ChartEngine.renderSparkline(sparkVal, [50, 48, 55, 60, 58, 67, 72], '#335c67');
    if (sparkStock) ChartEngine.renderSparkline(sparkStock, [18, 16, 14, 12, 11, 9, 8], '#925400');

    const navProductsCounter = document.getElementById('sidebarProductsCount');
    const navLowStockCounter = document.getElementById('sidebarStockAlertsCount');

    if (navProductsCounter) navProductsCounter.textContent = metrics.totalProducts;
    if (navLowStockCounter) {
      const alertTotal = metrics.lowStockCount + metrics.outOfStockCount;
      navLowStockCounter.textContent = alertTotal;
      navLowStockCounter.style.display = alertTotal > 0 ? 'inline-block' : 'none';
    }
  }

  renderCharts() {
    const areaContainer = document.getElementById('revenueAreaChartContainer');
    const donutContainer = document.getElementById('categoryDonutChartContainer');

    const currentRangeData = this.store.timelineData[this.store.timeRange] || this.store.timelineData['30D'];

    if (areaContainer) {
      ChartEngine.renderAreaChart(areaContainer, currentRangeData, (val) => this.store.formatPrice(val));
    }

    if (donutContainer) {
      ChartEngine.renderDonutChart(donutContainer, this.store.categories, this.store.products, (val) => this.store.formatPrice(val));
    }
  }

  renderTopSellers() {
    const container = document.getElementById('topSellersList');
    if (!container) return;
    container.innerHTML = '';

    const sorted = [...this.store.products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 4);

    sorted.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--bg-subtle);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xs);
        cursor: pointer;
      `;

      row.onclick = () => UI.openDrawer(p, this.store);

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap: 10px;">
          <span style="font-weight:700; font-size:0.8rem; color:var(--text-muted); width:14px;">${idx + 1}</span>
          <img src="${p.image}" alt="${p.name}" style="width:32px; height:32px; border-radius:var(--radius-xs); object-fit:cover; border:1px solid var(--border-subtle);">
          <div>
            <strong style="font-size:0.85rem; color:var(--text-primary);">${p.name}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${(p.salesCount || 0).toLocaleString()} units delivered</div>
          </div>
        </div>
        <strong style="font-size:0.85rem; color:var(--color-accent);">${this.store.formatPrice(p.revenue || 0)}</strong>
      `;

      container.appendChild(row);
    });
  }

  renderAuditLogs() {
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    container.innerHTML = '';

    const logs = this.store.logs.slice(0, 4);
    logs.forEach(log => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.8125rem;
      `;

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <strong style="color:var(--text-primary); font-size:0.8rem;">${log.action}</strong>
          <span style="color:var(--text-muted); font-size:0.7rem;">${log.time}</span>
        </div>
        <span style="color:var(--text-secondary); font-size:0.775rem;">${log.detail}</span>
        <span style="color:var(--text-muted); font-size:0.7rem;">Operator: ${log.user}</span>
      `;
      container.appendChild(item);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
