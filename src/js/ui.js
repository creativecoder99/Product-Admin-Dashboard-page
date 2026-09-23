// UI Interaction, Toasts, Modals, Drawer, and Shortcut Handlers

export class UI {
  static showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-weight:700;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.add('active');
      const input = overlay.querySelector('input, select, textarea');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  static closeModal(modalId = null) {
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    } else {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  }

  static showConfirm(title, message, onConfirm) {
    const confirmModal = document.getElementById('confirmModal');
    if (!confirmModal) return;

    const titleEl = confirmModal.querySelector('#confirmTitle');
    const msgEl = confirmModal.querySelector('#confirmMessage');
    const okBtn = confirmModal.querySelector('#confirmOkBtn');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    // Clone button to remove previous listeners
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);

    newOkBtn.onclick = () => {
      this.closeModal('confirmModal');
      onConfirm();
    };

    this.openModal('confirmModal');
  }

  static openDrawer(product, store) {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('productDrawer');
    if (!overlay || !panel) return;

    const titleEl = panel.querySelector('#drawerProductTitle');
    const bodyEl = panel.querySelector('#drawerBody');

    if (titleEl) titleEl.textContent = product.name;

    const categoryObj = store.categories.find(c => c.id === product.category) || { name: product.category, color: '#6366f1' };

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap: var(--space-md);">
        <div style="display:flex; gap: var(--space-md); align-items: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; border-radius: var(--radius-lg); object-fit: cover; border: 1px solid var(--border-default);">
          <div style="display:flex; flex-direction:column; gap: 4px;">
            <div style="display:flex; align-items:center; gap: 8px;">
              <span class="badge" style="background:${categoryObj.color}22; color:${categoryObj.color};">${categoryObj.name}</span>
              <span class="badge ${product.stock > 0 ? (product.stock <= product.lowStockThreshold ? 'badge-low-stock' : 'badge-in-stock') : 'badge-out-of-stock'}">
                <span class="badge-dot-indicator"></span>${product.stock > 0 ? (product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
              </span>
            </div>
            <span style="font-family:var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${product.sku}</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">${store.formatPrice(product.price)}</span>
          </div>
        </div>

        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">${product.description}</p>

        <!-- KPI Mini Grid -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); background: var(--bg-card-subtle); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Units Sold</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${product.salesCount.toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Revenue</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--color-primary);">${store.formatPrice(product.revenue)}</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Profit Margin</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--color-emerald);">${product.margin}%</div>
          </div>
        </div>

        <!-- Inventory by Warehouse -->
        <div style="display:flex; flex-direction:column; gap: var(--space-xs);">
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-primary);">Warehouse Distribution</div>
          <div style="display:flex; flex-direction:column; gap: 8px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
              <span>North America Hub (NA-East)</span>
              <strong style="color:var(--text-primary);">${product.warehouses?.na || 0} units</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill progress-primary" style="width: ${Math.min(100, ((product.warehouses?.na || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
              <span>European Hub (EU-Central)</span>
              <strong style="color:var(--text-primary);">${product.warehouses?.eu || 0} units</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill progress-emerald" style="width: ${Math.min(100, ((product.warehouses?.eu || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
              <span>Asia-Pacific Hub (APAC-Tokyo)</span>
              <strong style="color:var(--text-primary);">${product.warehouses?.apac || 0} units</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill progress-amber" style="width: ${Math.min(100, ((product.warehouses?.apac || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>
          </div>
        </div>

        <!-- Variants list -->
        ${product.variants && product.variants.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap: var(--space-xs); margin-top: var(--space-sm);">
            <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-primary);">Active Variants (${product.variants.length})</div>
            <div style="display:flex; flex-direction:column; gap: 6px;">
              ${product.variants.map(v => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding: 8px 12px; background:var(--bg-input); border-radius:var(--radius-sm); font-size:0.825rem;">
                  <span>${v.name}</span>
                  <div style="display:flex; gap:12px; font-weight:600;">
                    <span style="color:var(--text-muted);">${v.stock} in stock</span>
                    <span style="color:var(--text-primary);">${store.formatPrice(v.price)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Quick actions -->
        <div style="display:flex; gap: var(--space-sm); margin-top: var(--space-md);">
          <button class="btn btn-primary" id="drawerEditBtn" style="flex:1;">
            <span>✏️</span> Edit Product
          </button>
          <button class="btn btn-secondary" id="drawerRestockBtn" style="flex:1;">
            <span>📦</span> Quick Restock
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    panel.classList.add('open');

    // Drawer edit button
    const editBtn = bodyEl.querySelector('#drawerEditBtn');
    if (editBtn) {
      editBtn.onclick = () => {
        this.closeDrawer();
        window.dispatchEvent(new CustomEvent('edit-product-triggered', { detail: product }));
      };
    }

    // Drawer restock button
    const restockBtn = bodyEl.querySelector('#drawerRestockBtn');
    if (restockBtn) {
      restockBtn.onclick = () => {
        store.restockProduct(product.id, 25, 'na');
        this.showToast(`Restocked +25 units to ${product.name}`, 'success');
        this.openDrawer(store.products.find(p => p.id === product.id), store);
      };
    }
  }

  static closeDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('productDrawer');
    if (overlay) overlay.classList.remove('active');
    if (panel) panel.classList.remove('open');
  }
}
