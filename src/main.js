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
    // Apply saved theme
    this.store.setTheme(this.store.theme);

    // Apply sidebar state
    this.applySidebarState(this.store.sidebarCollapsed);

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
    this.store.subscribe('view:changed', (view) => this.switchView(view));
    this.store.subscribe('timerange:changed', () => this.renderCharts());
    this.store.subscribe('logs:changed', () => this.renderAuditLogs());

    this.bindGlobalEvents();
    this.renderKPIs();
    this.renderCharts();
    this.renderTopSellers();
    this.renderAuditLogs();

    // Check low stock on load
    this.checkInitialStockAlerts();
  }

  applySidebarState(collapsed) {
    const sidebar = document.getElementById('appSidebar');
    if (!sidebar) return;
    if (collapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }

  bindGlobalEvents() {
    // Sidebar toggle button
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    if (toggleSidebarBtn) {
      toggleSidebarBtn.onclick = () => {
        this.store.toggleSidebar();
        this.applySidebarState(this.store.sidebarCollapsed);
        setTimeout(() => this.renderCharts(), 260);
      };
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('appSidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.onclick = () => {
        sidebar.classList.toggle('mobile-open');
      };
    }

    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        this.store.setActiveView(view);
        if (sidebar) sidebar.classList.remove('mobile-open');
      };
    });

    // Theme toggle buttons (Dark / Light / Midnight)
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const nextTheme = this.store.theme === 'dark' ? 'light' : (this.store.theme === 'light' ? 'midnight' : 'dark');
        this.store.setTheme(nextTheme);
        UI.showToast(`Switched to ${nextTheme.toUpperCase()} theme`, 'info', 2000);
      };
    }

    // Currency selector
    const currencySelect = document.getElementById('currencySelector');
    if (currencySelect) {
      currencySelect.value = this.store.currency;
      currencySelect.onchange = (e) => {
        this.store.setCurrency(e.target.value);
        UI.showToast(`Currency set to ${e.target.value}`, 'info', 2000);
      };
    }

    // Time Range buttons on Area Chart
    const timeRangeBtns = document.querySelectorAll('.chart-filter-btn[data-range]');
    timeRangeBtns.forEach(btn => {
      btn.onclick = () => {
        timeRangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.store.setTimeRange(btn.dataset.range);
      };
    });

    // Drawer close buttons
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');
    if (closeDrawerBtn) closeDrawerBtn.onclick = () => UI.closeDrawer();
    if (drawerOverlay) drawerOverlay.onclick = () => UI.closeDrawer();

    // Confirm modal close/cancel
    const cancelConfirmBtn = document.getElementById('confirmCancelBtn');
    const closeConfirmBtn = document.getElementById('closeConfirmModalBtn');
    if (cancelConfirmBtn) cancelConfirmBtn.onclick = () => UI.closeModal('confirmModal');
    if (closeConfirmBtn) closeConfirmBtn.onclick = () => UI.closeModal('confirmModal');

    // Global Search Bar Input & Keydown
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
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length > 0) {
          searchDropdown.innerHTML = matches.map(p => `
            <div class="search-result-item" data-id="${p.id}" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--border-subtle); cursor:pointer;">
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.image}" style="width:32px; height:32px; border-radius:var(--radius-sm); object-fit:cover;">
                <div>
                  <div style="font-weight:600; font-size:0.85rem; color:var(--text-primary);">${p.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
                </div>
              </div>
              <strong style="font-size:0.85rem; color:var(--color-primary);">${this.store.formatPrice(p.price)}</strong>
            </div>
          `).join('');

          searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.onclick = () => {
              const prod = this.store.products.find(p => p.id === item.dataset.id);
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
            <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
              No matching products found
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape closes modals and drawers
      if (e.key === 'Escape') {
        UI.closeModal();
        UI.closeDrawer();
        if (searchDropdown) searchDropdown.style.display = 'none';
      }

      // '/' or 'Cmd+K' focuses global search
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInput) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (searchInput) searchInput.focus();
        }
      }

      // 'n' key opens new product modal when not typing in an input
      if (e.key === 'n' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.productManager.openCreateModal();
      }
    });

    // Window resize debounced chart re-render
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.renderCharts(), 200);
    });
  }

  switchView(viewName) {
    // Update nav link active state
    document.querySelectorAll('.nav-link[data-view]').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle view section
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Re-render chart if switching to dashboard or analytics
    if (viewName === 'dashboard' || viewName === 'analytics') {
      setTimeout(() => this.renderCharts(), 50);
    }
  }

  renderKPIs() {
    const metrics = this.store.getMetrics();

    // 1. Total Revenue
    const revEl = document.getElementById('kpiTotalRevenue');
    if (revEl) revEl.textContent = this.store.formatPrice(metrics.totalRevenue);

    // 2. Inventory Valuation
    const valEl = document.getElementById('kpiInventoryValuation');
    if (valEl) valEl.textContent = this.store.formatPrice(metrics.inventoryValuation);

    // 3. Active Products
    const prodEl = document.getElementById('kpiActiveProducts');
    if (prodEl) prodEl.textContent = `${metrics.activeProducts} / ${metrics.totalProducts}`;

    // 4. Low & Out of Stock Alerts
    const alertEl = document.getElementById('kpiLowStockAlerts');
    if (alertEl) alertEl.textContent = metrics.lowStockCount + metrics.outOfStockCount;

    // 5. Avg Margin
    const marginEl = document.getElementById('kpiAvgMargin');
    if (marginEl) marginEl.textContent = `${metrics.avgMargin}%`;

    // 6. CSAT Score
    const csatEl = document.getElementById('kpiCsatScore');
    if (csatEl) csatEl.textContent = `${metrics.avgRating} / 5.0`;

    // Render KPI Sparklines
    const sparkRev = document.getElementById('sparklineRevenue');
    const sparkVal = document.getElementById('sparklineValuation');
    const sparkStock = document.getElementById('sparklineStock');

    if (sparkRev) ChartEngine.renderSparkline(sparkRev, [32, 45, 41, 58, 62, 75, 84], '#6366f1');
    if (sparkVal) ChartEngine.renderSparkline(sparkVal, [50, 48, 55, 60, 58, 67, 72], '#06b6d4');
    if (sparkStock) ChartEngine.renderSparkline(sparkStock, [18, 16, 14, 12, 11, 9, 8], '#f43f5e');

    // Update sidebar counters
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

    const sortedBySales = [...this.store.products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);

    sortedBySales.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        gap: 12px;
        transition: background 0.15s ease;
        cursor: pointer;
      `;

      row.onmouseenter = () => row.style.background = 'var(--bg-hover)';
      row.onmouseleave = () => row.style.background = 'var(--bg-card-subtle)';

      row.onclick = () => UI.openDrawer(p, this.store);

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap: 12px; min-width: 0;">
          <div style="font-size: 0.85rem; font-weight: 800; color: ${idx === 0 ? 'var(--color-amber)' : 'var(--text-muted)'}; width: 16px;">
            #${idx + 1}
          </div>
          <img src="${p.image}" alt="${p.name}" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;">
          <div style="display:flex; flex-direction:column; min-width:0;">
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${p.salesCount.toLocaleString()} units sold</span>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end;">
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--color-primary);">${this.store.formatPrice(p.revenue)}</span>
          <span style="font-size: 0.725rem; color: var(--color-emerald); font-weight: 600;">+${(18.5 - idx * 2.5).toFixed(1)}%</span>
        </div>
      `;

      container.appendChild(row);
    });
  }

  renderAuditLogs() {
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    container.innerHTML = '';

    const logs = this.store.logs.slice(0, 5);
    logs.forEach(log => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.825rem;
      `;

      item.innerHTML = `
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); margin-top: 5px; flex-shrink: 0;"></div>
        <div style="flex: 1; display:flex; flex-direction:column; gap: 2px;">
          <div style="display:flex; justify-content:space-between;">
            <strong style="color:var(--text-primary); font-size:0.8rem;">${log.action}</strong>
            <span style="color:var(--text-muted); font-size:0.7rem;">${log.time}</span>
          </div>
          <span style="color:var(--text-secondary); font-size:0.775rem;">${log.detail}</span>
          <span style="color:var(--text-muted); font-size:0.7rem;">by ${log.user}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  checkInitialStockAlerts() {
    const metrics = this.store.getMetrics();
    if (metrics.lowStockCount + metrics.outOfStockCount > 0) {
      setTimeout(() => {
        UI.showToast(`Inventory Alert: ${metrics.lowStockCount + metrics.outOfStockCount} items need attention!`, 'warning', 4500);
      }, 1000);
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
