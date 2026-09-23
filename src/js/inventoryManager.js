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
          UI.showToast(`Allocated +${qty} units to warehouse hub`, 'success');
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

    if (this.criticalAlertsContainer) {
      this.criticalAlertsContainer.innerHTML = '';
      const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 15));

      if (lowStockProducts.length === 0) {
        this.criticalAlertsContainer.innerHTML = `
          <div style="padding: 12px 14px; background: var(--color-success-bg); border: 1px solid #cde7dc; border-radius: var(--radius-xs); color: var(--color-success); font-size: 0.8125rem;">
            Inventory levels across all regional hubs currently satisfy threshold targets.
          </div>
        `;
      } else {
        lowStockProducts.forEach(p => {
          const item = document.createElement('div');
          item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-left: 3px solid ${p.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)'};
            border-radius: var(--radius-xs);
            gap: 12px;
          `;

          item.innerHTML = `
            <div style="display:flex; align-items:center; gap: 10px;">
              <img src="${p.image}" alt="${p.name}" style="width:34px; height:34px; border-radius:var(--radius-xs); object-fit:cover; border:1px solid var(--border-subtle);">
              <div>
                <strong style="color:var(--text-primary); font-size:0.875rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap: 10px;">
              <span class="badge ${p.stock === 0 ? 'badge-out-of-stock' : 'badge-low-stock'}">
                ${p.stock === 0 ? 'Depleted' : `${p.stock} units remaining`}
              </span>
              <button class="btn btn-secondary btn-sm restock-inline-btn" data-id="${p.id}">
                Replenish
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

    products.forEach(p => {
      const tr = document.createElement('tr');
      const na = p.warehouses?.na || 0;
      const eu = p.warehouses?.eu || 0;
      const apac = p.warehouses?.apac || 0;
      const total = p.stock || 0;
      const valuation = total * (p.cost || p.price * 0.5);

      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap: 8px;">
            <img src="${p.image}" alt="${p.name}" style="width:32px; height:32px; border-radius:var(--radius-xs); object-fit:cover; border:1px solid var(--border-subtle);">
            <div>
              <strong style="color:var(--text-primary); font-size:0.85rem;">${p.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</div>
            </div>
          </div>
        </td>
        <td><strong>${total}</strong></td>
        <td>${na}</td>
        <td>${eu}</td>
        <td>${apac}</td>
        <td><strong>${this.store.formatPrice(valuation)}</strong></td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm restock-item-btn" data-id="${p.id}">Restock</button>
        </td>
      `;

      tr.querySelector('.restock-item-btn').onclick = () => {
        this.openRestockModal(p.id);
      };

      this.inventoryTable.appendChild(tr);
    });
  }
}
