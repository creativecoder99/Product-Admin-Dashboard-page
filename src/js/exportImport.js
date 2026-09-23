import { UI } from './ui.js';

export class ExportImportManager {
  constructor(store) {
    this.store = store;
    this.init();
  }

  init() {
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importFileInput = document.getElementById('importFileInput');
    const resetFactoryBtn = document.getElementById('resetFactoryBtn');

    if (exportCsvBtn) exportCsvBtn.onclick = () => this.exportCSV();
    if (exportJsonBtn) exportJsonBtn.onclick = () => this.exportJSON();

    if (importFileInput) {
      importFileInput.onchange = (e) => this.handleFileImport(e);
    }

    if (resetFactoryBtn) {
      resetFactoryBtn.onclick = () => {
        UI.showConfirm(
          'Reset to Demo Data',
          'Are you sure you want to reset all products, inventory, and reviews to the factory demo state? Any custom items will be overwritten.',
          () => {
            this.store.resetToDefault();
            UI.showToast('Reset to factory demo data successfully', 'success');
          }
        );
      };
    }
  }

  exportCSV() {
    const products = this.store.products;
    if (products.length === 0) {
      UI.showToast('No products available to export', 'warning');
      return;
    }

    const headers = ['ID', 'SKU', 'Name', 'Category', 'Status', 'Price', 'Cost', 'Margin %', 'Stock', 'Revenue', 'Sales Count', 'Barcode'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.sku}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.status}"`,
      p.price,
      p.cost,
      p.margin,
      p.stock,
      p.revenue,
      p.salesCount,
      `"${p.barcode}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexgenesis_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.store.addLog('Export Data', 'Exported products catalog to CSV');
    UI.showToast('Products catalog exported to CSV', 'success');
  }

  exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      store: 'Nexgenesis Global Enterprise',
      version: '2.4.0',
      products: this.store.products,
      categories: this.store.categories,
      reviews: this.store.reviews
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexgenesis_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.store.addLog('Export Backup', 'Generated full JSON system backup');
    UI.showToast('Catalog exported to JSON backup', 'success');
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const importedProducts = Array.isArray(parsed) ? parsed : (parsed.products || []);

        if (importedProducts.length === 0) {
          throw new Error('No valid products array found in JSON file.');
        }

        this.store.products = importedProducts;
        this.store.saveProducts();
        this.store.addLog('Data Imported', `Imported ${importedProducts.length} products from backup`);
        UI.showToast(`Imported ${importedProducts.length} products successfully!`, 'success');
      } catch (err) {
        UI.showToast(`Import Failed: ${err.message}`, 'error');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }
}
