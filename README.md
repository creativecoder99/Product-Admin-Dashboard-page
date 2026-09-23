# Nexgenesis — Enterprise Product Admin Dashboard

An ultra-modern, enterprise-grade Product Management & Telemetry Admin Dashboard crafted for **Nexgenesis**. Built with pure vanilla CSS, modern ES modules, zero-overhead SVG vector visualizations, and responsive multi-hub inventory allocation.

![Nexgenesis Dashboard Preview](/assets/products/pulse-watch.jpg)

---

## Key Features

- **Futuristic Design System & Multi-Theme Architecture**:
  - **Dark Mode (Default)**: Deep midnight obsidian tones with glowing indigo and cyan accents.
  - **Light Mode**: Crisp executive slate surfaces and high-contrast typography.
  - **Midnight OLED Mode**: True pitch black `#020408` with electric neon cyan highlights.
  - Custom fluid glassmorphism, micro-animations, and responsive layouts.

- **Real-Time Key Performance Indicators (KPIs)**:
  - Catalog Gross Sales Revenue with 30-day velocity sparkline.
  - Multi-Hub Global Inventory Valuation ($) with live asset calculation.
  - Active vs Draft Catalog ratio indicator.
  - Critical Out-of-Stock and Low-Stock automated alert badges.
  - Profit Margin & Gross Profit telemetry.
  - Verified Buyer Product CSAT (Customer Satisfaction) rating gauge.

- **Zero-Dependency Vector Charting Engine**:
  - Interactive Cubic-Bezier Area Chart with dynamic crosshairs, date ranges (`7D`, `30D`, `90D`, `1Y`), and order tooltips.
  - Donut Category Breakdown chart with hover highlights and interactive legends.
  - Mini SVG Sparkline trend lines embedded inside KPI cards.

- **Full-Lifecycle Product Management (CRUD)**:
  - Dual View Modes: High-density Data Table view & Visual Product Card Grid view.
  - Instant multi-criteria search (Product Name, SKU code, tags) with global shortcut `⌘K` or `/`.
  - Multi-facet filters (Category, Publication Status, Stock Thresholds).
  - Multi-column sorting (Date Created, Price, Stock Units, Sales Volume, Rating).
  - Bulk Operations: Bulk Delete, Bulk Mark as Published, Bulk Mark as Draft.
  - Comprehensive Add / Edit Product modal:
    - Real-time Gross Profit & Margin % auto-calculator.
    - Multi-variant attribute tracking (colors, editions, storage).
    - Live Google Search SEO preview snippet.
    - Media selector featuring generated 8K product studio photography.

- **Global Warehouse & Inventory Matrix**:
  - Stock allocation across North America, European, and Asia-Pacific fulfillment hubs.
  - Automated low-stock trigger threshold warnings.
  - Interactive Restock Purchase Order workflow modal.

- **Customer Reviews & Sentiment Moderation**:
  - Verified customer reviews with sentiment tags (Positive / Critical).
  - Star ratings filter (5★ down to 1★).
  - Official brand response publishing system.

- **Data Portability & State Management**:
  - Download full catalog to CSV (Excel compatible with UTF-8 BOM).
  - Export structured JSON system backup.
  - Import catalog backups from JSON with error validation.
  - Factory Reset to restore original demonstration catalog.
  - Real-time currency switcher (USD `$`, EUR `€`, GBP `£`, JPY `¥`).

---

## Tech Stack

- **Core**: Semantic HTML5, Vanilla JavaScript (ES6+ Modules)
- **Styling**: Vanilla CSS3 (Custom Properties, Flexbox, Grid, Glassmorphism, Keyframes)
- **Dev & Build Tool**: Vite 6
- **Persistence**: LocalStorage with dynamic reactive event bus

---

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/creativecoder99/Product-Admin-Dashboard-page.git
cd Product-Admin-Dashboard-page

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `/` or `⌘K` | Focus Global Search Bar |
| `n` | Open Create Product Modal |
| `Escape` | Close active modals, drawers, or search popover |

---

## License

MIT License © 2026 Nexgenesis Technologies.
