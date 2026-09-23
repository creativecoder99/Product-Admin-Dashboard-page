import { UI } from './ui.js';

export class InventoryManager {
  constructor(store) {
    this.store = store;
    this.init();
  }

  init() {
    this.inventoryTable = document.getElementById('inventoryTableBody');
    this.criticalAlertsContainer = document.getElementById('criticalAlertsList');

    this.store.subscribe('products:changed', () => this.render());
    this.store.subscribe('currency:changed', () => this.render());

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const quickRestockModal = document.getElementById('restockModal');
    const restockForm = document.getElementById('restockForm');
    const closeRestockBtn = document.getElementById('closeRestockModalBtn');
    const cancelRestockBtn = document.getElementById('cancelRestockModalBtn');

    if (closeRestockBtn) closeRestockBtn.onclick = () => UI.closeModal('restockModal');
    if (cancelRestockBtn) cancelRestockBtn.onclick = () => UI.closeModal('restockModal');

    if (restockForm) {
      restockForm.onsubmit = (e) => {
        e.preventDefault();
        const prodId = document.getElementById('restockProductSelect').value;
        const qty = parseInt(document.getElementById('restockQtyInput').value, 10) || 0;
        const warehouse = document.getElementById('restockWarehouseSelect').value;

        if (prodId && qty > 0) {
          this.store.restockProduct(prodId, qty, warehouse);
          UI.showToast(`Restocked +${qty} units successfully`, 'success');
          UI.closeModal('restockModal');
        }
      };
    }

    const openRestockBtn = document.getElementById('triggerRestockModalBtn');
    if (openRestockBtn) {
      openRestockBtn.onclick = () => this.openRestockModal();
    }
  }

  openRestockModal(preselectedProductId = null) {
    const select = document.getElementById('restockProductSelect');
    if (select) {
      select.innerHTML = '';
      this.store.products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (Current: ${p.stock} units)`;
        if (preselectedProductId && p.id === preselectedProductId) opt.selected = true;
        select.appendChild(opt);
      });
    }

    document.getElementById('restockQtyInput').value = '50';
    UI.openModal('restockModal');
  }

  render() {
    if (!this.inventoryTable) return;
    this.inventoryTable.innerHTML = '';

    const products = this.store.products;

    // Critical low stock list
    if (this.criticalAlertsContainer) {
      this.criticalAlertsContainer.innerHTML = '';
      const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 15));

      if (lowStockProducts.length === 0) {
        this.criticalAlertsContainer.innerHTML = `
          <div style="padding: 16px; background: var(--color-emerald-bg); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-lg); color: var(--color-emerald); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
            <span>✓</span> All product inventory levels are healthy across global distribution hubs.
          </div>
        `;
      } else {
        lowStockProducts.forEach(p => {
          const item = document.createElement('div');
          item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-left: 4px solid ${p.stock === 0 ? 'var(--color-rose)' : 'var(--color-amber)'};
            border-radius: var(--radius-md);
            gap: 12px;
          `;

          item.innerHTML = `
            <div style="display:flex; align-items:center; gap: 12px;">
              <img src="${p.image}" alt="${p.name}" style="width:36px; height:36px; border-radius:var(--radius-sm); object-fit:cover;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.875rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap: 12px;">
              <span class="badge ${p.stock === 0 ? 'badge-out-of-stock' : 'badge-low-stock'}">
                ${p.stock === 0 ? 'Depleted' : `${p.stock} units remaining`}
              </span>
              <button class="btn btn-secondary btn-sm restock-inline-btn" data-id="${p.id}">
                Replenish PO
              </button>
            </div>
          `;

          item.querySelector('.restock-inline-btn').onclick = () => {
            this.openRestockModal(p.id);
          };

          this.criticalAlertsContainer.appendChild(item);
        });
      }
    }

    // Full inventory table
    products.forEach(p => {
      const tr = document.createElement('tr');
      const na = p.warehouses?.na || 0;
      const eu = p.warehouses?.eu || 0;
      const apac = p.warehouses?.apac || 0;
      const total = p.stock || 0;
      const valuation = total * (p.cost || p.price * 0.5);

      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap: 10px;">
            <img src="${p.image}" style="width:36px; height:36px; border-radius:var(--radius-sm); object-fit:cover;">
            <div>
              <strong style="color:var(--text-primary);">${p.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight:700; color:var(--text-primary); font-size:1rem;">${total}</span>
        </td>
        <td><span style="color:var(--text-secondary);">${na} units</span></td>
        <td><span style="color:var(--text-secondary);">${eu} units</span></td>
        <td><span style="color:var(--text-secondary);">${apac} units</span></td>
        <td><strong style="color:var(--color-primary);">${this.store.formatPrice(valuation)}</strong></td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm restock-item-btn" data-id="${p.id}">
            + Restock
          </button>
        </td>
      `;

      tr.querySelector('.restock-item-btn').onclick = () => {
        this.openRestockModal(p.id);
      };

      this.inventoryTable.appendChild(tr);
    });
  }
}
