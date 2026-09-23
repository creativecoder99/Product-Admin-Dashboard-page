import { UI } from './ui.js';

export class ProductManager {
  constructor(store) {
    this.store = store;
    this.editingProductId = null;
    this.init();
  }

  init() {
    this.tableBody = document.getElementById('productsTableBody');
    this.productGrid = document.getElementById('productsGrid');
    this.paginationContainer = document.getElementById('paginationControls');
    this.paginationInfo = document.getElementById('paginationInfo');
    this.selectAllCheckbox = document.getElementById('selectAllProducts');
    this.bulkActionsBar = document.getElementById('bulkActionsBar');
    this.bulkCountBadge = document.getElementById('bulkSelectedCount');

    // Subscribe to changes
    this.store.subscribe('products:changed', () => this.render());
    this.store.subscribe('currency:changed', () => this.render());

    // Listen to custom drawer trigger
    window.addEventListener('edit-product-triggered', (e) => {
      this.openEditModal(e.detail);
    });

    this.bindFormEvents();
    this.bindFilterEvents();
    this.render();
  }

  bindFilterEvents() {
    const searchInput = document.getElementById('productSearchInput');
    const categoryFilter = document.getElementById('productCategoryFilter');
    const statusFilter = document.getElementById('productStatusFilter');
    const stockFilter = document.getElementById('productStockFilter');
    const sortSelect = document.getElementById('productSortSelect');
    const viewTableBtn = document.getElementById('viewTableBtn');
    const viewGridBtn = document.getElementById('viewGridBtn');

    if (searchInput) {
      searchInput.oninput = (e) => {
        this.store.productFilter.search = e.target.value;
        this.store.productFilter.page = 1;
        this.render();
      };
    }

    if (categoryFilter) {
      categoryFilter.onchange = (e) => {
        this.store.productFilter.category = e.target.value;
        this.store.productFilter.page = 1;
        this.render();
      };
    }

    if (statusFilter) {
      statusFilter.onchange = (e) => {
        this.store.productFilter.status = e.target.value;
        this.store.productFilter.page = 1;
        this.render();
      };
    }

    if (stockFilter) {
      stockFilter.onchange = (e) => {
        this.store.productFilter.stockStatus = e.target.value;
        this.store.productFilter.page = 1;
        this.render();
      };
    }

    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.store.productFilter.sortBy = e.target.value;
        this.render();
      };
    }

    if (viewTableBtn && viewGridBtn) {
      viewTableBtn.onclick = () => {
        this.store.productFilter.viewMode = 'table';
        localStorage.setItem('nxg_view_mode', 'table');
        viewTableBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        this.render();
      };

      viewGridBtn.onclick = () => {
        this.store.productFilter.viewMode = 'grid';
        localStorage.setItem('nxg_view_mode', 'grid');
        viewGridBtn.classList.add('active');
        viewTableBtn.classList.remove('active');
        this.render();
      };
    }

    // Select All
    if (this.selectAllCheckbox) {
      this.selectAllCheckbox.onchange = (e) => {
        const checked = e.target.checked;
        const currentProducts = this.getCurrentPageProducts();
        if (checked) {
          currentProducts.forEach(p => this.store.selectedProductIds.add(p.id));
        } else {
          currentProducts.forEach(p => this.store.selectedProductIds.delete(p.id));
        }
        this.updateBulkBar();
        this.render();
      };
    }

    // Bulk buttons
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const bulkPublishBtn = document.getElementById('bulkPublishBtn');
    const bulkDraftBtn = document.getElementById('bulkDraftBtn');

    if (bulkDeleteBtn) {
      bulkDeleteBtn.onclick = () => {
        const ids = Array.from(this.store.selectedProductIds);
        if (ids.length === 0) return;
        UI.showConfirm(
          'Delete Selected Products',
          `Are you sure you want to permanently delete ${ids.length} selected products? This action cannot be undone.`,
          () => {
            this.store.batchDeleteProducts(ids);
            UI.showToast(`Deleted ${ids.length} products`, 'success');
          }
        );
      };
    }

    if (bulkPublishBtn) {
      bulkPublishBtn.onclick = () => {
        const ids = Array.from(this.store.selectedProductIds);
        this.store.batchUpdateStatus(ids, 'published');
        UI.showToast(`Published ${ids.length} products`, 'success');
      };
    }

    if (bulkDraftBtn) {
      bulkDraftBtn.onclick = () => {
        const ids = Array.from(this.store.selectedProductIds);
        this.store.batchUpdateStatus(ids, 'draft');
        UI.showToast(`Moved ${ids.length} products to draft`, 'info');
      };
    }
  }

  getCurrentPageProducts() {
    const filtered = this.store.getFilteredProducts();
    const { page, pageSize } = this.store.productFilter;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  updateBulkBar() {
    const count = this.store.selectedProductIds.size;
    if (this.bulkActionsBar) {
      if (count > 0) {
        this.bulkActionsBar.style.display = 'flex';
        if (this.bulkCountBadge) this.bulkCountBadge.textContent = count;
      } else {
        this.bulkActionsBar.style.display = 'none';
      }
    }
  }

  render() {
    const filtered = this.store.getFilteredProducts();
    const { page, pageSize, viewMode } = this.store.productFilter;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    // Adjust page if out of bounds
    if (page > totalPages) {
      this.store.productFilter.page = totalPages;
    }

    const start = (this.store.productFilter.page - 1) * pageSize;
    const currentProducts = filtered.slice(start, start + pageSize);

    // Update pagination info
    if (this.paginationInfo) {
      const from = totalItems === 0 ? 0 : start + 1;
      const to = Math.min(start + pageSize, totalItems);
      this.paginationInfo.textContent = `Showing ${from} - ${to} of ${totalItems} products`;
    }

    this.renderPaginationControls(totalPages);

    const tableWrapper = document.getElementById('productsTableWrapper');
    const gridWrapper = document.getElementById('productsGridWrapper');

    if (viewMode === 'table') {
      if (tableWrapper) tableWrapper.style.display = 'block';
      if (gridWrapper) gridWrapper.style.display = 'none';
      this.renderTable(currentProducts);
    } else {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (gridWrapper) gridWrapper.style.display = 'block';
      this.renderGrid(currentProducts);
    }

    this.updateBulkBar();
  }

  renderTable(products) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    if (products.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 48px 16px; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">No products match your search</div>
            <p style="font-size: 0.85rem; margin-top: 4px;">Try adjusting filters or clear your search query.</p>
          </td>
        </tr>
      `;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      const isSelected = this.store.selectedProductIds.has(p.id);
      if (isSelected) tr.classList.add('selected');

      const categoryObj = this.store.categories.find(c => c.id === p.category) || { name: p.category, color: '#6366f1' };

      // Stock status
      let stockBadgeClass = 'badge-in-stock';
      let stockLabel = `${p.stock} units`;
      if (p.stock === 0) {
        stockBadgeClass = 'badge-out-of-stock';
        stockLabel = 'Out of Stock';
      } else if (p.stock <= (p.lowStockThreshold || 15)) {
        stockBadgeClass = 'badge-low-stock';
        stockLabel = `${p.stock} Low Stock`;
      }

      // Stock health percent
      const stockMax = Math.max(100, p.stock * 1.5);
      const stockPct = Math.min(100, (p.stock / stockMax) * 100);

      tr.innerHTML = `
        <td>
          <input type="checkbox" class="product-select-cb" data-id="${p.id}" ${isSelected ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
        </td>
        <td>
          <div class="product-cell">
            <img class="product-thumb" src="${p.image}" alt="${p.name}">
            <div class="product-meta">
              <span class="product-name-link" data-id="${p.id}">${p.name}</span>
              <span class="product-sku">${p.sku}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:${categoryObj.color}1c; color:${categoryObj.color}; border: 1px solid ${categoryObj.color}33;">
            ${categoryObj.name}
          </span>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px; min-width: 110px;">
            <span class="badge ${stockBadgeClass}" style="width:fit-content;">
              <span class="badge-dot-indicator"></span>${stockLabel}
            </span>
            <div class="progress-bar-container" style="height:4px;">
              <div class="progress-bar-fill ${p.stock === 0 ? 'progress-rose' : (p.stock <= 15 ? 'progress-amber' : 'progress-emerald')}" style="width:${stockPct}%"></div>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex; flex-direction:column;">
            <span style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${this.store.formatPrice(p.price)}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${p.margin}% margin</span>
          </div>
        </td>
        <td>
          <span class="badge badge-${p.status}">
            <span class="badge-dot-indicator"></span>${p.status}
          </span>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; align-items:center; gap:6px;">
            <button class="btn btn-secondary btn-sm quick-view-btn" data-id="${p.id}" title="Quick View">
              <span>👁️</span>
            </button>
            <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${p.id}" title="Edit Product">
              <span>✏️</span>
            </button>
            <button class="btn btn-secondary btn-sm delete-product-btn" data-id="${p.id}" title="Delete" style="color:var(--color-rose);">
              <span>🗑️</span>
            </button>
          </div>
        </td>
      `;

      // Checkbox event
      const cb = tr.querySelector('.product-select-cb');
      cb.onchange = (e) => {
        if (e.target.checked) {
          this.store.selectedProductIds.add(p.id);
          tr.classList.add('selected');
        } else {
          this.store.selectedProductIds.delete(p.id);
          tr.classList.remove('selected');
        }
        this.updateBulkBar();
      };

      // Open drawer on name or quick view
      tr.querySelector('.product-name-link').onclick = () => UI.openDrawer(p, this.store);
      tr.querySelector('.quick-view-btn').onclick = () => UI.openDrawer(p, this.store);

      // Edit
      tr.querySelector('.edit-product-btn').onclick = () => this.openEditModal(p);

      // Delete
      tr.querySelector('.delete-product-btn').onclick = () => {
        UI.showConfirm(
          'Delete Product',
          `Are you sure you want to delete "${p.name}"? This action cannot be reversed.`,
          () => {
            this.store.deleteProduct(p.id);
            UI.showToast(`Deleted "${p.name}"`, 'success');
          }
        );
      };

      this.tableBody.appendChild(tr);
    });
  }

  renderGrid(products) {
    if (!this.productGrid) return;
    this.productGrid.innerHTML = '';

    if (products.length === 0) {
      this.productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 48px 16px; color: var(--text-muted); background:var(--bg-card); border-radius:var(--radius-xl); border:1px solid var(--border-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">No products found</div>
          <p style="font-size: 0.85rem; margin-top: 4px;">Adjust your filters to see results.</p>
        </div>
      `;
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const categoryObj = this.store.categories.find(c => c.id === p.category) || { name: p.category, color: '#6366f1' };

      card.innerHTML = `
        <div class="product-card-media">
          <img class="product-card-img" src="${p.image}" alt="${p.name}">
          <div class="product-card-badge-top">
            <span class="badge badge-${p.status}">
              <span class="badge-dot-indicator"></span>${p.status}
            </span>
          </div>
          <div class="product-card-actions-top">
            <button class="btn btn-secondary btn-sm grid-quick-view-btn" data-id="${p.id}" title="Quick View" style="padding:4px 8px; font-size:0.75rem;">
              👁️ View
            </button>
            <button class="btn btn-secondary btn-sm grid-edit-btn" data-id="${p.id}" title="Edit" style="padding:4px 8px; font-size:0.75rem;">
              ✏️
            </button>
          </div>
        </div>
        <div class="product-card-content">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="product-card-category" style="color:${categoryObj.color}">${categoryObj.name}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${p.sku}</span>
          </div>
          <h4 class="product-card-title">${p.name}</h4>
          <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${p.subtitle || p.description}
          </p>
          <div class="product-card-footer">
            <div style="display:flex; flex-direction:column;">
              <span class="product-card-price">${this.store.formatPrice(p.price)}</span>
              <span class="product-card-cost">${p.stock} in stock (${p.margin}% margin)</span>
            </div>
            <div style="display:flex; align-items:center; gap:4px; font-size:0.8rem; font-weight:700; color:var(--color-amber);">
              <span>★</span>
              <span>${p.rating || '5.0'}</span>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.grid-quick-view-btn').onclick = (e) => {
        e.stopPropagation();
        UI.openDrawer(p, this.store);
      };

      card.querySelector('.grid-edit-btn').onclick = (e) => {
        e.stopPropagation();
        this.openEditModal(p);
      };

      card.onclick = () => UI.openDrawer(p, this.store);

      this.productGrid.appendChild(card);
    });
  }

  renderPaginationControls(totalPages) {
    if (!this.paginationContainer) return;
    this.paginationContainer.innerHTML = '';

    const { page } = this.store.productFilter;

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '‹';
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => {
      if (page > 1) {
        this.store.productFilter.page--;
        this.render();
      }
    };
    this.paginationContainer.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === page ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        this.store.productFilter.page = i;
        this.render();
      };
      this.paginationContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '›';
    nextBtn.disabled = page >= totalPages;
    nextBtn.onclick = () => {
      if (page < totalPages) {
        this.store.productFilter.page++;
        this.render();
      }
    };
    this.paginationContainer.appendChild(nextBtn);
  }

  // Form & Modal Operations
  bindFormEvents() {
    const modal = document.getElementById('productFormModal');
    const form = document.getElementById('productForm');
    const priceInput = document.getElementById('formProductPrice');
    const costInput = document.getElementById('formProductCost');
    const marginDisplay = document.getElementById('formCalculatedMargin');
    const profitDisplay = document.getElementById('formCalculatedProfit');
    const seoTitleInput = document.getElementById('formProductTitle');
    const seoPreviewTitle = document.getElementById('seoPreviewTitle');
    const seoPreviewSnippet = document.getElementById('seoPreviewSnippet');
    const descInput = document.getElementById('formProductDesc');

    // Real-time margin calculation
    const calcMargin = () => {
      const price = parseFloat(priceInput.value) || 0;
      const cost = parseFloat(costInput.value) || 0;
      const profit = price - cost;
      const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

      if (marginDisplay) marginDisplay.textContent = `${margin}%`;
      if (profitDisplay) profitDisplay.textContent = this.store.formatPrice(profit);
    };

    if (priceInput) priceInput.oninput = calcMargin;
    if (costInput) costInput.oninput = calcMargin;

    // Real-time SEO preview
    if (seoTitleInput && seoPreviewTitle) {
      seoTitleInput.oninput = (e) => {
        seoPreviewTitle.textContent = e.target.value || 'Product Title | Nexgenesis';
      };
    }

    if (descInput && seoPreviewSnippet) {
      descInput.oninput = (e) => {
        seoPreviewSnippet.textContent = e.target.value.substring(0, 150) || 'Product meta description preview...';
      };
    }

    // New Product button in UI
    const newProductBtn = document.getElementById('newProductBtn');
    if (newProductBtn) {
      newProductBtn.onclick = () => this.openCreateModal();
    }

    // Close modal
    const closeBtn = document.getElementById('closeProductModalBtn');
    const cancelBtn = document.getElementById('cancelProductModalBtn');
    if (closeBtn) closeBtn.onclick = () => UI.closeModal('productFormModal');
    if (cancelBtn) cancelBtn.onclick = () => UI.closeModal('productFormModal');

    // Form submit
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.saveProductForm();
      };
    }
  }

  openCreateModal() {
    this.editingProductId = null;
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('productModalTitle');
    if (modalTitle) modalTitle.textContent = 'Create New Product';
    if (form) form.reset();

    // Default image
    const imgSelect = document.getElementById('formProductImage');
    if (imgSelect) imgSelect.value = '/assets/products/quantum-hub.jpg';

    // Populate categories select
    this.populateCategorySelect();

    // Reset margin display
    document.getElementById('formCalculatedMargin').textContent = '0%';
    document.getElementById('formCalculatedProfit').textContent = '$0.00';

    UI.openModal('productFormModal');
  }

  openEditModal(product) {
    this.editingProductId = product.id;
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('productModalTitle');
    if (modalTitle) modalTitle.textContent = `Edit Product: ${product.name}`;
    if (form) form.reset();

    this.populateCategorySelect();

    // Fill fields
    document.getElementById('formProductTitle').value = product.name || '';
    document.getElementById('formProductSubtitle').value = product.subtitle || '';
    document.getElementById('formProductSku').value = product.sku || '';
    document.getElementById('formProductBarcode').value = product.barcode || '';
    document.getElementById('formProductCategory').value = product.category || 'smart-hub';
    document.getElementById('formProductStatus').value = product.status || 'published';
    document.getElementById('formProductPrice').value = product.price || 0;
    document.getElementById('formProductComparePrice').value = product.comparePrice || 0;
    document.getElementById('formProductCost').value = product.cost || 0;
    document.getElementById('formProductStock').value = product.stock || 0;
    document.getElementById('formProductThreshold').value = product.lowStockThreshold || 15;
    document.getElementById('formProductDesc').value = product.description || '';
    document.getElementById('formProductTags').value = (product.tags || []).join(', ');

    const imgSelect = document.getElementById('formProductImage');
    if (imgSelect) imgSelect.value = product.image || '/assets/products/quantum-hub.jpg';

    // Update margin & SEO snippet
    const price = product.price || 0;
    const cost = product.cost || 0;
    const profit = price - cost;
    const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

    document.getElementById('formCalculatedMargin').textContent = `${margin}%`;
    document.getElementById('formCalculatedProfit').textContent = this.store.formatPrice(profit);

    const seoTitle = document.getElementById('seoPreviewTitle');
    const seoSnippet = document.getElementById('seoPreviewSnippet');
    if (seoTitle) seoTitle.textContent = product.seo?.metaTitle || product.name;
    if (seoSnippet) seoSnippet.textContent = product.seo?.metaDescription || product.description;

    UI.openModal('productFormModal');
  }

  populateCategorySelect() {
    const sel = document.getElementById('formProductCategory');
    if (!sel) return;
    sel.innerHTML = '';
    this.store.categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon} ${c.name}`;
      sel.appendChild(opt);
    });
  }

  saveProductForm() {
    const name = document.getElementById('formProductTitle').value.trim();
    const subtitle = document.getElementById('formProductSubtitle').value.trim();
    const sku = document.getElementById('formProductSku').value.trim();
    const barcode = document.getElementById('formProductBarcode').value.trim();
    const category = document.getElementById('formProductCategory').value;
    const status = document.getElementById('formProductStatus').value;
    const price = parseFloat(document.getElementById('formProductPrice').value) || 0;
    const comparePrice = parseFloat(document.getElementById('formProductComparePrice').value) || 0;
    const cost = parseFloat(document.getElementById('formProductCost').value) || 0;
    const stock = parseInt(document.getElementById('formProductStock').value, 10) || 0;
    const lowStockThreshold = parseInt(document.getElementById('formProductThreshold').value, 10) || 15;
    const description = document.getElementById('formProductDesc').value.trim();
    const tagsRaw = document.getElementById('formProductTags').value;
    const image = document.getElementById('formProductImage').value;

    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    if (!name || !sku) {
      UI.showToast('Please provide both Product Title and SKU', 'error');
      return;
    }

    const payload = {
      name,
      subtitle,
      sku,
      barcode: barcode || '890' + Math.floor(100000000 + Math.random() * 900000000),
      category,
      status,
      price,
      comparePrice,
      cost,
      stock,
      lowStockThreshold,
      description,
      tags,
      image,
      seo: {
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        metaTitle: `${name} | Nexgenesis Official`,
        metaDescription: description.substring(0, 150)
      }
    };

    if (this.editingProductId) {
      this.store.updateProduct(this.editingProductId, payload);
      UI.showToast(`Updated "${name}" successfully`, 'success');
    } else {
      this.store.addProduct(payload);
      UI.showToast(`Created new product "${name}"`, 'success');
    }

    UI.closeModal('productFormModal');
  }
}
