/**
 * Nexgenesis Landing Page Manager
 * Handles interactive technical specification inspector, live catalog sandbox preview,
 * and enterprise procurement volume inquiry modal.
 */

export class LandingManager {
  constructor(store) {
    this.store = store;
    this.activeSpecId = 'quantum-hub';
    this.sandboxViewMode = 'table';
    this.sandboxFilter = {
      search: '',
      category: 'all'
    };

    this.specsData = {
      'quantum-hub': {
        id: 'quantum-hub',
        name: 'Nexgenesis Quantum Hub',
        subtitle: 'Enterprise Neural Mesh Coordinator',
        sku: 'NXG-HUB-01',
        image: '/assets/products/quantum-hub.jpg',
        description: 'Central hardware coordinator orchestrating local low-latency Matter mesh clusters with on-device tensor inference and dual hardware security elements.',
        specs: [
          { label: 'Form Factor', value: 'Desktop / Rackmount (1U half-width)' },
          { label: 'Chassis Material', value: 'CNC Anodized 6061-T6 Aluminum' },
          { label: 'Dimensions', value: '180 × 180 × 32 mm' },
          { label: 'Unit Weight', value: '640 g (Net)' },
          { label: 'Ingress Protection', value: 'IP52 Industrial Sealed' },
          { label: 'Processor', value: 'Quad-core ARM Cortex-A76 @ 2.4GHz' },
          { label: 'Neural Processing', value: '6.0 TOPS Dedicated NPU' },
          { label: 'Mesh Protocols', value: 'Thread / Matter 2.0, Zigbee 3.0' },
          { label: 'Wireless Connectivity', value: 'Wi-Fi 6E (2.4/5/6 GHz), BLE 5.3' },
          { label: 'Power Supply', value: 'USB-C PD 45W / PoE+ (IEEE 802.3at)' },
          { label: 'Security Chipset', value: 'Dual Microchip ATECC608B HSM' },
          { label: 'Operating Range', value: '-20°C to +65°C' },
          { label: 'Firmware Engine', value: 'NexRTOS Hard Real-Time v3.2-LTS' },
          { label: 'MTBF Reliability', value: '120,000 Hours Continuous' }
        ]
      },
      'pulse-watch': {
        id: 'pulse-watch',
        name: 'Nexgenesis Pulse Ultra',
        subtitle: 'Aerospace Grade 5 Biometric Node',
        sku: 'NXG-WAT-01',
        image: '/assets/products/pulse-watch.jpg',
        description: 'Continuous biometric sensor terminal milled from solid Grade 5 titanium, featuring an optical ECG array and sapphire crystal micro-OLED panel.',
        specs: [
          { label: 'Form Factor', value: '44mm Monolithic Wrist Terminal' },
          { label: 'Chassis Material', value: 'Aerospace Grade 5 Titanium (Ti-6Al-4V)' },
          { label: 'Dimensions', value: '44.2 × 38.6 × 10.8 mm' },
          { label: 'Unit Weight', value: '48.5 g (Excluding strap)' },
          { label: 'Ingress Protection', value: 'IP68 / 10 ATM Submersion (100m)' },
          { label: 'Optical Cluster', value: '8-Channel Multi-Wavelength PPG' },
          { label: 'Biometric Metrics', value: 'ECG, HRV, SpO2, Skin Temp, VO2' },
          { label: 'Display Panel', value: '1.78" Micro-OLED (1,200 nits, Sapphire)' },
          { label: 'GNSS Subsystem', value: 'Dual-Band L1+L5 Multiconstellation' },
          { label: 'Battery Capacity', value: '480 mAh High-Density Li-Cobalt' },
          { label: 'Battery Endurance', value: 'Up to 72 Hours Continuous Sampling' },
          { label: 'Charging Method', value: 'Magnetic Inductive Quick-Charge' },
          { label: 'Operating Range', value: '-15°C to +55°C' },
          { label: 'MTBF Reliability', value: '85,000 Hours Continuous' }
        ]
      },
      'aura-headphones': {
        id: 'aura-headphones',
        name: 'Nexgenesis Aura Pro',
        subtitle: 'Spatial Acoustic Controller',
        sku: 'NXG-AUD-01',
        image: '/assets/products/aura-headphones.jpg',
        description: 'Circumaural studio acoustic monitor with 45mm pure beryllium transducers and hybrid 8-microphone active acoustic cancellation.',
        specs: [
          { label: 'Form Factor', value: 'Circumaural Acoustic Monitor' },
          { label: 'Chassis Material', value: 'Forged Aluminum & Memory Foam' },
          { label: 'Dimensions', value: '195 × 175 × 82 mm' },
          { label: 'Unit Weight', value: '285 g' },
          { label: 'Transducer Type', value: '45mm Pure Beryllium Dynamic' },
          { label: 'Frequency Response', value: '5 Hz – 42,000 Hz (Hi-Res Audio)' },
          { label: 'Acoustic Nullification', value: 'Hybrid 8-Mic Adaptive ANC (-38dB)' },
          { label: 'Wireless Audio', value: 'Bluetooth 5.4, aptX Lossless, LDAC' },
          { label: 'Wired Connectivity', value: '3.5mm Balanced / USB-C 24-bit/192kHz' },
          { label: 'Battery Capacity', value: '1,050 mAh Rechargeable Cell' },
          { label: 'Battery Endurance', value: '60h (ANC Active) / 80h (ANC Off)' },
          { label: 'Microphone Array', value: 'Dual Beamforming MEMS for Telemetry' },
          { label: 'Operating Range', value: '0°C to +45°C' },
          { label: 'MTBF Reliability', value: '90,000 Hours Continuous' }
        ]
      },
      'vision-glasses': {
        id: 'vision-glasses',
        name: 'Nexgenesis Vision AR',
        subtitle: 'Industrial Optical HUD',
        sku: 'NXG-VIS-01',
        image: '/assets/products/vision-glasses.jpg',
        description: 'Lightweight optical waveguide heads-up display engineered for warehouse inventory scanning and technician diagnostics.',
        specs: [
          { label: 'Form Factor', value: 'Industrial Ergonomic Eyewear' },
          { label: 'Chassis Material', value: 'High-Tensile Magnesium-Lithium Alloy' },
          { label: 'Dimensions', value: '162 × 154 × 48 mm' },
          { label: 'Unit Weight', value: '68 g (Balanced center of mass)' },
          { label: 'Ingress Protection', value: 'IP65 Dust & Water Jet Resistant' },
          { label: 'Optical Engine', value: 'Dual Micro-OLED Diffractive Waveguide' },
          { label: 'Display Resolution', value: '1920 × 1080 per eye (45° Diagonal FOV)' },
          { label: 'Machine Vision Sensor', value: '12MP Low-Latency Global Shutter' },
          { label: 'Wireless Protocols', value: 'Wi-Fi 6 (802.11ax), BLE 5.3, UWB' },
          { label: 'Power Architecture', value: 'Dual Hot-Swappable Temple Batteries' },
          { label: 'Run Time', value: '4 Hours Active Telemetry per cell' },
          { label: 'Spatial Tracking', value: '6-DoF Optical Inertial Odometry' },
          { label: 'Operating Range', value: '-10°C to +50°C' },
          { label: 'MTBF Reliability', value: '75,000 Hours Continuous' }
        ]
      }
    };

    this.init();
  }

  init() {
    this.bindSpecInspector();
    this.bindSandbox();
    this.bindProcurementModal();
    this.renderSandbox();
  }

  /* -------------------------------------------------------------------------
   * 1. Technical Specification Inspector
   * ------------------------------------------------------------------------- */
  bindSpecInspector() {
    const buttons = document.querySelectorAll('.spec-selector-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.specId;
        if (id && this.specsData[id]) {
          this.switchSpec(id);
        }
      });
    });

    const downloadCsvBtn = document.getElementById('downloadSpecCsvBtn');
    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', () => {
        this.downloadActiveSpecCsv();
      });
    }
  }

  switchSpec(id) {
    this.activeSpecId = id;
    const data = this.specsData[id];
    if (!data) return;

    // Update button states
    document.querySelectorAll('.spec-selector-btn').forEach(btn => {
      if (btn.dataset.specId === id) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update Visual Preview
    const imgEl = document.getElementById('specPreviewImg');
    const skuEl = document.getElementById('specPreviewSku');
    const titleEl = document.getElementById('specDetailTitle');
    const subtitleEl = document.getElementById('specDetailSubtitle');
    const descEl = document.getElementById('specDetailDesc');
    const tableBody = document.getElementById('specTableBody');

    if (imgEl) {
      imgEl.src = data.image;
      imgEl.alt = data.name;
    }
    if (skuEl) skuEl.textContent = `SKU: ${data.sku}`;
    if (titleEl) titleEl.textContent = data.name;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;
    if (descEl) descEl.textContent = data.description;

    // Render Specs Table
    if (tableBody) {
      tableBody.innerHTML = data.specs.map(item => `
        <tr>
          <td>${item.label}</td>
          <td>${item.value}</td>
        </tr>
      `).join('');
    }
  }

  downloadActiveSpecCsv() {
    const data = this.specsData[this.activeSpecId];
    if (!data) return;

    const rows = [
      ['Specification Property', 'Engineering Parameter'],
      ['Product Model', data.name],
      ['Product Classification', data.subtitle],
      ['SKU Code', data.sku],
      ...data.specs.map(s => [s.label, s.value])
    ];

    const csvContent = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgenesis-${data.id}-engineering-datasheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /* -------------------------------------------------------------------------
   * 2. Live Operations Sandbox Preview
   * ------------------------------------------------------------------------- */
  bindSandbox() {
    const searchInput = document.getElementById('sandboxSearchInput');
    const categorySelect = document.getElementById('sandboxCategorySelect');
    const viewTableBtn = document.getElementById('sandboxViewTableBtn');
    const viewGridBtn = document.getElementById('sandboxViewGridBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.sandboxFilter.search = e.target.value.toLowerCase().trim();
        this.renderSandbox();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.sandboxFilter.category = e.target.value;
        this.renderSandbox();
      });
    }

    if (viewTableBtn) {
      viewTableBtn.addEventListener('click', () => {
        this.sandboxViewMode = 'table';
        viewTableBtn.classList.add('active');
        if (viewGridBtn) viewGridBtn.classList.remove('active');
        this.renderSandbox();
      });
    }

    if (viewGridBtn) {
      viewGridBtn.addEventListener('click', () => {
        this.sandboxViewMode = 'grid';
        viewGridBtn.classList.add('active');
        if (viewTableBtn) viewTableBtn.classList.remove('active');
        this.renderSandbox();
      });
    }
  }

  getFilteredSandboxProducts() {
    const products = this.store.products || [];
    return products.filter(p => {
      const matchSearch = !this.sandboxFilter.search ||
        p.name.toLowerCase().includes(this.sandboxFilter.search) ||
        p.sku.toLowerCase().includes(this.sandboxFilter.search);

      const matchCategory = this.sandboxFilter.category === 'all' ||
        p.category === this.sandboxFilter.category;

      return matchSearch && matchCategory;
    });
  }

  renderSandbox() {
    const container = document.getElementById('sandboxContent');
    const countEl = document.getElementById('sandboxResultCount');
    if (!container) return;

    const items = this.getFilteredSandboxProducts();
    if (countEl) {
      countEl.textContent = `${items.length} ${items.length === 1 ? 'Product' : 'Products'} Verified in Catalog`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding:var(--space-xl); text-align:center; color:var(--text-muted); font-size:0.875rem;">
          No hardware records match your query. Try clearing search filters or changing categories.
        </div>
      `;
      return;
    }

    if (this.sandboxViewMode === 'table') {
      container.innerHTML = `
        <div class="metrics-table-wrapper" style="border:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">Unit</th>
                <th>Hardware Item & SKU</th>
                <th>Category</th>
                <th>Inventory Status</th>
                <th style="text-align:right;">Standard Price</th>
                <th style="text-align:right;">Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(p => {
                const margin = p.cost ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : '50.0';
                const statusBadge = p.stock > 20
                  ? '<span class="badge badge-in-stock">In Stock (' + p.stock + ')</span>'
                  : p.stock > 0
                    ? '<span class="badge badge-low-stock">Low Stock (' + p.stock + ')</span>'
                    : '<span class="badge badge-out-of-stock">Depleted</span>';

                return `
                  <tr>
                    <td>
                      <img src="${p.thumbnail || p.image || '/assets/products/quantum-hub.jpg'}" alt="${p.name}" style="width:36px; height:36px; object-fit:cover; border-radius:var(--radius-xs); border:1px solid var(--border-subtle);">
                    </td>
                    <td>
                      <strong style="color:var(--text-primary); font-size:0.875rem;">${p.name}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${p.sku}</div>
                    </td>
                    <td>
                      <span style="font-size:0.8125rem; color:var(--text-secondary); text-transform:capitalize;">${p.category}</span>
                    </td>
                    <td>${statusBadge}</td>
                    <td style="text-align:right; font-weight:600; color:var(--text-primary); font-size:0.875rem;">$${p.price.toFixed(2)}</td>
                    <td style="text-align:right; color:var(--text-secondary); font-size:0.8125rem;">${margin}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // Grid view
      container.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:var(--space-md); padding:var(--space-xs);">
          ${items.map(p => {
            const statusBadge = p.stock > 20
              ? '<span class="badge badge-in-stock">In Stock</span>'
              : p.stock > 0
                ? '<span class="badge badge-low-stock">Low Stock</span>'
                : '<span class="badge badge-out-of-stock">Depleted</span>';

            return `
              <div style="background-color:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-xs); overflow:hidden; display:flex; flex-direction:column;">
                <div style="height:140px; background-color:var(--bg-subtle); overflow:hidden; border-bottom:1px solid var(--border-subtle);">
                  <img src="${p.thumbnail || p.image || '/assets/products/quantum-hub.jpg'}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="padding:var(--space-sm); display:flex; flex-direction:column; gap:4px; flex:1;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${p.sku}</span>
                    ${statusBadge}
                  </div>
                  <strong style="font-size:0.875rem; color:var(--text-primary); line-height:1.2;">${p.name}</strong>
                  <div style="margin-top:auto; padding-top:6px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle);">
                    <span style="font-size:0.75rem; color:var(--text-muted); text-transform:capitalize;">${p.category}</span>
                    <strong style="color:var(--text-primary); font-size:0.875rem;">$${p.price.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  /* -------------------------------------------------------------------------
   * 3. Enterprise Volume Procurement Modal
   * ------------------------------------------------------------------------- */
  bindProcurementModal() {
    const modal = document.getElementById('procurementModal');
    const openBtns = document.querySelectorAll('[data-action="open-procurement-modal"]');
    const closeBtns = modal ? modal.querySelectorAll('[data-action="close-procurement-modal"]') : [];
    const form = document.getElementById('procurementInquiryForm');

    const openModal = (e) => {
      if (e) e.preventDefault();
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    };

    const closeModal = () => {
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProcurementSubmit(form);
      });
    }
  }

  handleProcurementSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Submit';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Transmitting Inquiry...';
    }

    setTimeout(() => {
      const refCode = `NXG-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      const resultBox = document.getElementById('procurementResultNotice');

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background-color:var(--color-accent-subtle); border:1px solid var(--color-accent-border); border-radius:var(--radius-xs); padding:var(--space-md); margin-bottom:var(--space-md);">
            <div style="font-weight:650; color:var(--color-accent); font-size:0.95rem; margin-bottom:4px;">
              Procurement Request Acknowledged
            </div>
            <p style="font-size:0.8125rem; color:var(--text-secondary); line-height:1.45; margin-bottom:6px;">
              Reference identifier: <strong style="color:var(--text-primary); font-family:monospace;">${refCode}</strong>.
              A Nexgenesis distribution engineer has been assigned to your operational parameters. An official quotation and EDI configuration sheet will be delivered to your registered corporate address within 2 business hours.
            </p>
            <div style="font-size:0.75rem; color:var(--text-muted);">
              SLA Standard: Guaranteed 48-Hour Regional Dispatch Availability.
            </div>
          </div>
        `;
      }

      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Another Inquiry';
      }
    }, 600);
  }
}
