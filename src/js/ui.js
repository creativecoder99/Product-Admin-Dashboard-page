// UI Interaction, Toasts, Modals, Drawer, and Shortcut Handlers

export class UI {
  static showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let label = 'Notice';
    if (type === 'success') label = 'Success';
    if (type === 'error') label = 'Error';
    if (type === 'warning') label = 'Alert';

    toast.innerHTML = `
      <strong style="margin-right:6px;">[${label}]</strong>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  static openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.add('active');
      const input = overlay.querySelector('input:not([type="hidden"]), select, textarea');
      if (input) setTimeout(() => input.focus(), 80);
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

    const categoryObj = store.categories.find(c => c.id === product.category) || { name: product.category, color: '#1e3a5f' };

    let stockBadgeClass = 'badge-in-stock';
    let stockStatusText = 'In Stock';
    if (product.stock === 0) {
      stockBadgeClass = 'badge-out-of-stock';
      stockStatusText = 'Out of Stock';
    } else if (product.stock <= (product.lowStockThreshold || 15)) {
      stockBadgeClass = 'badge-low-stock';
      stockStatusText = 'Low Stock';
    }

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap: var(--space-md);">
        <div style="display:flex; gap: var(--space-md); align-items: flex-start;">
          <img src="${product.image}" alt="${product.name}" style="width: 88px; height: 88px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-default); flex-shrink:0;">
          <div style="display:flex; flex-direction:column; gap: 4px;">
            <div style="display:flex; align-items:center; gap: 6px; flex-wrap:wrap;">
              <span class="badge">${categoryObj.name}</span>
              <span class="badge ${stockBadgeClass}">${stockStatusText}</span>
            </div>
            <span style="font-family:var(--font-mono); font-size: 0.775rem; color: var(--text-muted);">${product.sku}</span>
            <span style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${store.formatPrice(product.price)}</span>
          </div>
        </div>

        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55;">${product.description}</p>

        <!-- Product Specs Panel -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xs); background: var(--bg-subtle); padding: var(--space-sm); border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Units Sold</div>
            <div style="font-size:1rem; font-weight:700; color:var(--text-primary);">${(product.salesCount || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Gross Revenue</div>
            <div style="font-size:1rem; font-weight:700; color:var(--color-accent);">${store.formatPrice(product.revenue || 0)}</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Gross Margin</div>
            <div style="font-size:1rem; font-weight:700; color:var(--color-success);">${product.margin}%</div>
          </div>
        </div>

        <!-- Inventory Allocation by Regional Hub -->
        <div style="display:flex; flex-direction:column; gap: var(--space-xs);">
          <div style="font-size: 0.8125rem; font-weight: 650; color: var(--text-primary);">Regional Warehouse Distribution</div>
          <div style="display:flex; flex-direction:column; gap: 6px; font-size: 0.8125rem;">
            <div style="display:flex; justify-content:space-between;">
              <span>North America Hub (NA-East)</span>
              <strong>${product.warehouses?.na || 0} units</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${Math.min(100, ((product.warehouses?.na || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:2px;">
              <span>European Hub (EU-Central)</span>
              <strong>${product.warehouses?.eu || 0} units</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${Math.min(100, ((product.warehouses?.eu || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:2px;">
              <span>Asia-Pacific Hub (APAC-Tokyo)</span>
              <strong>${product.warehouses?.apac || 0} units</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${Math.min(100, ((product.warehouses?.apac || 0) / (product.stock || 1)) * 100)}%;"></div>
            </div>
          </div>
        </div>

        <!-- Variants list -->
        ${product.variants && product.variants.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap: var(--space-2xs); margin-top: var(--space-xs);">
            <div style="font-size: 0.8125rem; font-weight: 650; color: var(--text-primary);">Catalog Variants (${product.variants.length})</div>
            <div style="display:flex; flex-direction:column; gap: 4px;">
              ${product.variants.map(v => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 10px; background:var(--bg-subtle); border-radius:var(--radius-xs); font-size:0.8125rem; border:1px solid var(--border-subtle);">
                  <span>${v.name}</span>
                  <div style="display:flex; gap:10px; font-weight:550;">
                    <span style="color:var(--text-muted);">${v.stock} in stock</span>
                    <span style="color:var(--text-primary);">${store.formatPrice(v.price)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex; gap: var(--space-sm); margin-top: var(--space-sm);">
          <button class="btn btn-primary" id="drawerEditBtn" style="flex:1;">
            Edit Details
          </button>
          <button class="btn btn-secondary" id="drawerRestockBtn" style="flex:1;">
            Restock Inventory
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    panel.classList.add('open');

    const editBtn = bodyEl.querySelector('#drawerEditBtn');
    if (editBtn) {
      editBtn.onclick = () => {
        this.closeDrawer();
        window.dispatchEvent(new CustomEvent('edit-product-triggered', { detail: product }));
      };
    }

    const restockBtn = bodyEl.querySelector('#drawerRestockBtn');
    if (restockBtn) {
      restockBtn.onclick = () => {
        store.restockProduct(product.id, 25, 'na');
        this.showToast(`Restocked 25 units for ${product.name}`, 'success');
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
