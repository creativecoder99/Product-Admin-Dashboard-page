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

    this.store.subscribe('products:changed', () => this.render());
    this.store.subscribe('currency:changed', () => this.render());

    window.addEventListener('edit-product-triggered', (e) => {
      this.openEditModal(e.detail);
    });

    this.bindFilterEvents();
    this.bindFormEvents();
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

    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const bulkPublishBtn = document.getElementById('bulkPublishBtn');
    const bulkDraftBtn = document.getElementById('bulkDraftBtn');

    if (bulkDeleteBtn) {
      bulkDeleteBtn.onclick = () => {
        const ids = Array.from(this.store.selectedProductIds);
        if (ids.length === 0) return;
        UI.showConfirm(
          'Delete Selected Products',
          `Are you sure you want to permanently delete ${ids.length} selected products? This action cannot be reversed.`,
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
        UI.showToast(`Set ${ids.length} products to draft`, 'info');
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

    if (page > totalPages) {
      this.store.productFilter.page = totalPages;
    }

    const start = (this.store.productFilter.page - 1) * pageSize;
    const currentProducts = filtered.slice(start, start + pageSize);

    if (this.paginationInfo) {
      const from = totalItems === 0 ? 0 : start + 1;
      const to = Math.min(start + pageSize, totalItems);
      this.paginationInfo.textContent = `Displaying ${from} to ${to} of ${totalItems} products`;
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
          <td colspan="7" style="text-align:center; padding: 36px 16px; color: var(--text-muted);">
            <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">No products match the selected criteria</div>
            <p style="font-size: 0.8125rem; margin-top: 4px;">Adjust filters or clear search query to inspect other records.</p>
          </td>
        </tr>
      `;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      const isSelected = this.store.selectedProductIds.has(p.id);
      if (isSelected) tr.classList.add('selected');

      const categoryObj = this.store.categories.find(c => c.id === p.category) || { name: p.category, color: '#1e3a5f' };

      let stockBadgeClass = 'badge-in-stock';
      let stockLabel = `${p.stock} units`;
      if (p.stock === 0) {
        stockBadgeClass = 'badge-out-of-stock';
        stockLabel = 'Depleted';
      } else if (p.stock <= (p.lowStockThreshold || 15)) {
        stockBadgeClass = 'badge-low-stock';
        stockLabel = `${p.stock} (Low)`;
      }

      tr.innerHTML = `
        <td style="width:36px;">
          <input type="checkbox" class="product-select-cb" data-id="${p.id}" ${isSelected ? 'checked' : ''} aria-label="Select ${p.name}">
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${p.image}" alt="${p.name}" style="width:40px; height:40px; border-radius:var(--radius-xs); object-fit:cover; border:1px solid var(--border-default); flex-shrink:0;">
            <div style="display:flex; flex-direction:column;">
              <span class="product-name-link" data-id="${p.id}" style="font-weight:600; color:var(--text-primary); cursor:pointer;">${p.name}</span>
              <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${p.sku}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge">${categoryObj.name}</span>
        </td>
        <td>
          <span class="badge ${stockBadgeClass}">${stockLabel}</span>
        </td>
        <td>
          <div style="display:flex; flex-direction:column;">
            <strong style="color:var(--text-primary); font-size:0.9rem;">${this.store.formatPrice(p.price)}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${p.margin}% margin</span>
          </div>
        </td>
        <td>
          <span class="badge ${p.status === 'published' ? 'badge-published' : ''}">${p.status}</span>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; align-items:center; gap:4px;">
            <button class="btn btn-secondary btn-sm quick-view-btn" data-id="${p.id}">View</button>
            <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${p.id}">Edit</button>
            <button class="btn btn-secondary btn-sm delete-product-btn" data-id="${p.id}" style="color:var(--color-danger);">Delete</button>
          </div>
        </td>
      `;

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

      tr.querySelector('.product-name-link').onclick = () => UI.openDrawer(p, this.store);
      tr.querySelector('.quick-view-btn').onclick = () => UI.openDrawer(p, this.store);
      tr.querySelector('.edit-product-btn').onclick = () => this.openEditModal(p);

      tr.querySelector('.delete-product-btn').onclick = () => {
        UI.showConfirm(
          'Delete Product',
          `Are you sure you want to delete ${p.name}? This removes the record from local inventory catalog.`,
          () => {
            this.store.deleteProduct(p.id);
            UI.showToast(`Deleted ${p.name}`, 'success');
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
        <div style="grid-column: 1 / -1; text-align:center; padding: 36px 16px; color: var(--text-muted); background:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-sm);">
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">No products found</div>
          <p style="font-size: 0.8125rem; margin-top: 4px;">Adjust search terms or reset filters.</p>
        </div>
      `;
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.padding = '0';
      card.style.overflow = 'hidden';

      const categoryObj = this.store.categories.find(c => c.id === p.category) || { name: p.category, color: '#1e3a5f' };

      card.innerHTML = `
        <div style="width:100%; height:180px; background:var(--bg-subtle); border-bottom:1px solid var(--border-default); position:relative; overflow:hidden;">
          <img src="${p.image}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; top:8px; left:8px;">
            <span class="badge ${p.status === 'published' ? 'badge-published' : ''}">${p.status}</span>
          </div>
        </div>
        <div style="padding:var(--space-md); display:flex; flex-direction:column; gap:6px; flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; color:var(--text-muted);">${categoryObj.name}</span>
            <span style="font-family:var(--font-mono); font-size:0.725rem; color:var(--text-muted);">${p.sku}</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:650; color:var(--text-primary);">${p.name}</h4>
          <p style="font-size:0.8125rem; color:var(--text-secondary); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${p.description}
          </p>
          <div style="margin-top:auto; padding-top:var(--space-sm); border-top:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:1.05rem; font-weight:700; color:var(--text-primary);">${this.store.formatPrice(p.price)}</div>
              <div style="font-size:0.725rem; color:var(--text-muted);">${p.stock} in stock</div>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-secondary btn-sm grid-view-btn">View</button>
              <button class="btn btn-secondary btn-sm grid-edit-btn">Edit</button>
              <button class="btn btn-secondary btn-sm grid-delete-btn" style="color:var(--color-danger);" title="Delete Product">Delete</button>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.grid-view-btn').onclick = () => UI.openDrawer(p, this.store);
      card.querySelector('.grid-edit-btn').onclick = () => this.openEditModal(p);
      card.querySelector('.grid-delete-btn').onclick = () => {
        UI.showConfirm(
          'Delete Product Record',
          `Are you sure you want to delete ${p.name}? This action removes the record from the catalog and recalculates inventory valuations.`,
          () => {
            this.store.deleteProduct(p.id);
            UI.showToast(`Deleted ${p.name}`, 'success');
          }
        );
      };

      this.productGrid.appendChild(card);
    });
  }

  renderPaginationControls(totalPages) {
    if (!this.paginationContainer) return;
    this.paginationContainer.innerHTML = '';

    const { page } = this.store.productFilter;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary btn-sm';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => {
      if (page > 1) {
        this.store.productFilter.page--;
        this.render();
      }
    };
    this.paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        this.store.productFilter.page = i;
        this.render();
      };
      this.paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-sm';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = page >= totalPages;
    nextBtn.onclick = () => {
      if (page < totalPages) {
        this.store.productFilter.page++;
        this.render();
      }
    };
    this.paginationContainer.appendChild(nextBtn);
  }

  setImageValue(url, isUploaded = false, filename = '') {
    const preview = document.getElementById('formProductImagePreview');
    const finalVal = document.getElementById('formProductImageFinalValue');
    const resetBtn = document.getElementById('resetImageFileBtn');

    if (preview) preview.src = url;
    if (finalVal) finalVal.value = url;

    if (resetBtn) {
      resetBtn.style.display = isUploaded ? 'inline-flex' : 'none';
    }
  }

  handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      UI.showToast('Please select a valid image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      UI.showToast('Image file size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.setImageValue(dataUrl, true, file.name);
      const presetSel = document.getElementById('formProductImagePreset');
      if (presetSel) presetSel.value = 'custom';
      const customUrl = document.getElementById('formProductCustomUrl');
      if (customUrl) {
        customUrl.style.display = 'none';
        customUrl.value = '';
      }
      UI.showToast(`Uploaded image: ${file.name}`, 'success');
    };
    reader.onerror = () => {
      UI.showToast('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  }

  bindFormEvents() {
    const form = document.getElementById('productForm');
    const priceInput = document.getElementById('formProductPrice');
    const costInput = document.getElementById('formProductCost');
    const marginDisplay = document.getElementById('formCalculatedMargin');
    const profitDisplay = document.getElementById('formCalculatedProfit');

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

    const closeBtn = document.getElementById('closeProductModalBtn');
    const cancelBtn = document.getElementById('cancelProductModalBtn');
    if (closeBtn) closeBtn.onclick = () => UI.closeModal('productFormModal');
    if (cancelBtn) cancelBtn.onclick = () => UI.closeModal('productFormModal');

    // Image Upload Controls
    const fileInput = document.getElementById('formProductImageFile');
    const browseBtn = document.getElementById('browseImageFileBtn');
    const resetBtn = document.getElementById('resetImageFileBtn');
    const dropzone = document.getElementById('imageUploadDropzone');
    const presetSelect = document.getElementById('formProductImagePreset');
    const customUrlInput = document.getElementById('formProductCustomUrl');

    if (browseBtn && fileInput) {
      browseBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
    }

    if (fileInput) {
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      };
    }

    if (dropzone) {
      dropzone.onclick = () => {
        if (fileInput) fileInput.click();
      };
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      };
      dropzone.ondragleave = () => {
        dropzone.classList.remove('dragover');
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      };
    }

    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        if (fileInput) fileInput.value = '';
        const defaultPreset = '/assets/products/quantum-hub.jpg';
        if (presetSelect) presetSelect.value = defaultPreset;
        if (customUrlInput) {
          customUrlInput.value = '';
          customUrlInput.style.display = 'none';
        }
        this.setImageValue(defaultPreset, false);
      };
    }

    if (presetSelect) {
      presetSelect.onchange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
          if (customUrlInput) customUrlInput.style.display = 'block';
        } else {
          if (customUrlInput) customUrlInput.style.display = 'none';
          this.setImageValue(val, false);
        }
      };
    }

    if (customUrlInput) {
      customUrlInput.oninput = (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.setImageValue(val, false);
        }
      };
    }

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
    if (modalTitle) modalTitle.textContent = 'Add Product Record';
    if (form) form.reset();

    const deleteBtn = document.getElementById('deleteProductFromModalBtn');
    if (deleteBtn) deleteBtn.style.display = 'none';

    const defaultImg = '/assets/products/quantum-hub.jpg';
    this.setImageValue(defaultImg, false);

    const presetSelect = document.getElementById('formProductImagePreset');
    if (presetSelect) presetSelect.value = defaultImg;

    const customUrlInput = document.getElementById('formProductCustomUrl');
    if (customUrlInput) {
      customUrlInput.value = '';
      customUrlInput.style.display = 'none';
    }

    const fileInput = document.getElementById('formProductImageFile');
    if (fileInput) fileInput.value = '';

    this.populateCategorySelect();
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

    const deleteBtn = document.getElementById('deleteProductFromModalBtn');
    if (deleteBtn) {
      deleteBtn.style.display = 'inline-flex';
      deleteBtn.onclick = () => {
        UI.showConfirm(
          'Delete Product Record',
          `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
          () => {
            UI.closeModal('productFormModal');
            this.store.deleteProduct(product.id);
            UI.showToast(`Permanently deleted ${product.name}`, 'success');
          }
        );
      };
    }

    const img = product.image || '/assets/products/quantum-hub.jpg';
    const isPreset = [
      '/assets/products/quantum-hub.jpg',
      '/assets/products/pulse-watch.jpg',
      '/assets/products/aura-headphones.jpg',
      '/assets/products/vision-glasses.jpg'
    ].includes(img);

    this.setImageValue(img, !isPreset);

    const presetSelect = document.getElementById('formProductImagePreset');
    const customUrlInput = document.getElementById('formProductCustomUrl');
    if (presetSelect) {
      if (isPreset) {
        presetSelect.value = img;
        if (customUrlInput) customUrlInput.style.display = 'none';
      } else {
        presetSelect.value = 'custom';
        if (customUrlInput) {
          customUrlInput.style.display = img.startsWith('data:') ? 'none' : 'block';
          customUrlInput.value = img.startsWith('data:') ? '' : img;
        }
      }
    }

    const fileInput = document.getElementById('formProductImageFile');
    if (fileInput) fileInput.value = '';

    this.populateCategorySelect();

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

    const price = product.price || 0;
    const cost = product.cost || 0;
    const profit = price - cost;
    const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

    document.getElementById('formCalculatedMargin').textContent = `${margin}%`;
    document.getElementById('formCalculatedProfit').textContent = this.store.formatPrice(profit);

    UI.openModal('productFormModal');
  }

  populateCategorySelect() {
    const sel = document.getElementById('formProductCategory');
    if (!sel) return;
    sel.innerHTML = '';
    this.store.categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.code})`;
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
    const image = document.getElementById('formProductImageFinalValue')?.value || '/assets/products/quantum-hub.jpg';

    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    if (!name || !sku) {
      UI.showToast('Product Title and SKU are required', 'error');
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
      image
    };

    if (this.editingProductId) {
      this.store.updateProduct(this.editingProductId, payload);
      UI.showToast(`Updated ${name}`, 'success');
    } else {
      this.store.addProduct(payload);
      UI.showToast(`Created ${name}`, 'success');
    }

    UI.closeModal('productFormModal');
  }
}
