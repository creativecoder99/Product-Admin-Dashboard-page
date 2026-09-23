export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    sku: 'NXG-HUB-01',
    barcode: '890124982101',
    name: 'Nexgenesis Quantum Hub',
    subtitle: 'Neural Mesh Smart Home Core Controller',
    category: 'smart-hub',
    status: 'published',
    price: 349.00,
    comparePrice: 399.00,
    cost: 165.00,
    margin: 52.7,
    stock: 84,
    lowStockThreshold: 20,
    allowBackorders: false,
    rating: 4.9,
    reviewsCount: 128,
    salesCount: 1420,
    revenue: 495580,
    image: '/assets/products/quantum-hub.jpg',
    warehouses: {
      na: 45,
      eu: 24,
      apac: 15
    },
    variants: [
      { id: 'v1', name: 'Obsidian Matte / 128GB Core', sku: 'NXG-HUB-01-OBS', price: 349.00, stock: 54 },
      { id: 'v2', name: 'Titanium Silver / 256GB Core', sku: 'NXG-HUB-01-SIL', price: 399.00, stock: 30 }
    ],
    tags: ['Best Seller', 'AI Powered', 'Matter Compatible', 'Smart Home'],
    description: 'The Nexgenesis Quantum Hub serves as the central neural core of next-generation ambient homes. Equipped with an on-device tensor processor, zero-latency local Matter routing, and an illuminated haptic status ring.',
    seo: {
      slug: 'nexgenesis-quantum-smart-hub',
      metaTitle: 'Nexgenesis Quantum Hub Neural Smart Home Controller',
      metaDescription: 'Shop the Nexgenesis Quantum Hub with edge AI inference and instant Matter 2.0 connectivity.'
    },
    createdAt: '2026-01-14T08:30:00Z',
    updatedAt: '2026-09-21T14:15:00Z'
  },
  {
    id: 'prod-002',
    sku: 'NXG-PUL-ULT',
    barcode: '890124982102',
    name: 'Nexgenesis Pulse Ultra',
    subtitle: 'Aerospace Titanium Biometric Smartwatch',
    category: 'wearables',
    status: 'published',
    price: 499.00,
    comparePrice: 549.00,
    cost: 210.00,
    margin: 57.9,
    stock: 142,
    lowStockThreshold: 30,
    allowBackorders: true,
    rating: 4.95,
    reviewsCount: 310,
    salesCount: 2840,
    revenue: 1417160,
    image: '/assets/products/pulse-watch.jpg',
    warehouses: {
      na: 80,
      eu: 42,
      apac: 20
    },
    variants: [
      { id: 'v1', name: 'Braided Obsidian / 46mm', sku: 'NXG-PUL-46-OBS', price: 499.00, stock: 82 },
      { id: 'v2', name: 'Braided Stellar / 46mm', sku: 'NXG-PUL-46-STE', price: 499.00, stock: 60 }
    ],
    tags: ['Flagship', 'Health Tech', 'Titanium', 'Waterproof 100m'],
    description: 'Precision forged from Grade 5 aerospace titanium with curved micro-OLED display. Continuous optical heart rate, ECG, VO2 max, sleep architecture, and satellite SOS beacon.',
    seo: {
      slug: 'nexgenesis-pulse-ultra-titanium-smartwatch',
      metaTitle: 'Nexgenesis Pulse Ultra Smartwatch | Aerospace Grade Titanium',
      metaDescription: 'Advanced biometric smartwatch with micro-OLED display and 7-day battery endurance.'
    },
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-09-22T09:40:00Z'
  },
  {
    id: 'prod-003',
    sku: 'NXG-AUR-PRO',
    barcode: '890124982103',
    name: 'Nexgenesis Aura Pro',
    subtitle: 'Spatial Acoustic Over-Ear Wireless Headphones',
    category: 'audio',
    status: 'published',
    price: 389.00,
    comparePrice: 429.00,
    cost: 155.00,
    margin: 60.1,
    stock: 67,
    lowStockThreshold: 25,
    allowBackorders: false,
    rating: 4.88,
    reviewsCount: 195,
    salesCount: 1890,
    revenue: 735210,
    image: '/assets/products/aura-headphones.jpg',
    warehouses: {
      na: 35,
      eu: 20,
      apac: 12
    },
    variants: [
      { id: 'v1', name: 'Graphite Black / Standard', sku: 'NXG-AUR-BLK', price: 389.00, stock: 45 },
      { id: 'v2', name: 'Lunar Slate / Studio Edition', sku: 'NXG-AUR-SLT', price: 429.00, stock: 22 }
    ],
    tags: ['Active Noise Canceling', 'Lossless Audio', 'Hi-Res Certified'],
    description: 'Custom 45mm beryllium drivers combined with 8 adaptive microphones for -48dB ambient noise cancellation. Dynamic head tracking spatial audio with 60-hour playback.',
    seo: {
      slug: 'nexgenesis-aura-pro-wireless-headphones',
      metaTitle: 'Nexgenesis Aura Pro Wireless Headphones | Spatial Audio ANC',
      metaDescription: 'Experience studio acoustics with hybrid active noise cancellation and beryllium acoustic chambers.'
    },
    createdAt: '2026-02-18T14:20:00Z',
    updatedAt: '2026-09-20T16:05:00Z'
  },
  {
    id: 'prod-004',
    sku: 'NXG-VIS-AR1',
    barcode: '890124982104',
    name: 'Nexgenesis Vision AR',
    subtitle: 'Lightweight Holographic Display Glasses',
    category: 'ar-vision',
    status: 'published',
    price: 749.00,
    comparePrice: 799.00,
    cost: 340.00,
    margin: 54.6,
    stock: 18,
    lowStockThreshold: 20,
    allowBackorders: true,
    rating: 4.82,
    reviewsCount: 84,
    salesCount: 620,
    revenue: 464380,
    image: '/assets/products/vision-glasses.jpg',
    warehouses: {
      na: 10,
      eu: 5,
      apac: 3
    },
    variants: [
      { id: 'v1', name: 'Obsidian Wireframe / Clear Tint', sku: 'NXG-VIS-CLR', price: 749.00, stock: 12 },
      { id: 'v2', name: 'Obsidian Wireframe / Polarized Transition', sku: 'NXG-VIS-POL', price: 799.00, stock: 6 }
    ],
    tags: ['Low Stock', 'Augmented Reality', 'Spatial Computing', 'Developer Edition'],
    description: 'Ultra-thin 42g titanium smart glasses featuring binocular Micro-LED waveguide optics. Delivers floating real-time turn-by-turn navigation, AI translations, and spatial heads-up notifications.',
    seo: {
      slug: 'nexgenesis-vision-ar-glasses',
      metaTitle: 'Nexgenesis Vision AR Glasses | Micro-LED Waveguide Heads-Up Display',
      metaDescription: 'Next-generation augmented reality glasses with seamless eye-tracking and real-time AI overlay.'
    },
    createdAt: '2026-03-05T11:15:00Z',
    updatedAt: '2026-09-23T07:10:00Z'
  },
  {
    id: 'prod-005',
    sku: 'NXG-MOD-DOK',
    barcode: '890124982105',
    name: 'Nexgenesis HyperDock GaN 200W',
    subtitle: 'Gallium Nitride Multi-Device Magnetic Fast Station',
    category: 'accessories',
    status: 'published',
    price: 129.00,
    comparePrice: 149.00,
    cost: 48.00,
    margin: 62.7,
    stock: 220,
    lowStockThreshold: 40,
    allowBackorders: false,
    rating: 4.92,
    reviewsCount: 165,
    salesCount: 3100,
    revenue: 399900,
    image: '/assets/products/quantum-hub.jpg',
    warehouses: {
      na: 120,
      eu: 65,
      apac: 35
    },
    variants: [
      { id: 'v1', name: 'Matte Onyx / 4-Port GaN', sku: 'NXG-DOK-ONX', price: 129.00, stock: 220 }
    ],
    tags: ['GaN Tech', 'Fast Charging', 'MagSafe Ready'],
    description: 'High-density GaN V power architecture delivering 200W simultaneous multi-device PD 3.1 charging. Temperature telemetry with real-time OLED power wattage monitor.',
    seo: {
      slug: 'nexgenesis-hyperdock-gan-200w-charging-station',
      metaTitle: 'Nexgenesis HyperDock GaN 200W Multi-Port Fast Charger',
      metaDescription: 'Ultra-compact GaN fast charging station with smart thermal regulation and live power readouts.'
    },
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-09-18T13:40:00Z'
  },
  {
    id: 'prod-006',
    sku: 'NXG-NEU-ACC',
    barcode: '890124982106',
    name: 'Nexgenesis Neural Synapse Coprocessor',
    subtitle: 'PCIe 5.0 Edge AI Inference Accelerator Card',
    category: 'ai-hardware',
    status: 'draft',
    price: 1299.00,
    comparePrice: 1499.00,
    cost: 580.00,
    margin: 55.3,
    stock: 0,
    lowStockThreshold: 10,
    allowBackorders: true,
    rating: 0,
    reviewsCount: 0,
    salesCount: 0,
    revenue: 0,
    image: '/assets/products/quantum-hub.jpg',
    warehouses: {
      na: 0,
      eu: 0,
      apac: 0
    },
    variants: [
      { id: 'v1', name: '128 TOPS / 32GB HBM3', sku: 'NXG-NEU-32', price: 1299.00, stock: 0 }
    ],
    tags: ['Upcoming Launch', 'Enterprise', 'AI Hardware', 'Draft'],
    description: 'Dedicated local LLM and vision model accelerator card with 128 TOPS INT8 performance at only 45W TDP. Passive liquid-metal vapor cooling architecture.',
    seo: {
      slug: 'nexgenesis-neural-synapse-coprocessor',
      metaTitle: 'Nexgenesis Neural Synapse Edge AI Accelerator Card',
      metaDescription: 'Ultra-low power edge AI hardware acceleration with high-bandwidth memory for local AI models.'
    },
    createdAt: '2026-04-10T16:00:00Z',
    updatedAt: '2026-09-22T18:00:00Z'
  },
  {
    id: 'prod-007',
    sku: 'NXG-AIR-POD',
    barcode: '890124982107',
    name: 'Nexgenesis Echo Buds Wireless',
    subtitle: 'True Wireless Earbuds with Bone Conduction Mic',
    category: 'audio',
    status: 'published',
    price: 199.00,
    comparePrice: 229.00,
    cost: 72.00,
    margin: 63.8,
    stock: 9,
    lowStockThreshold: 15,
    allowBackorders: false,
    rating: 4.76,
    reviewsCount: 140,
    salesCount: 2240,
    revenue: 445760,
    image: '/assets/products/aura-headphones.jpg',
    warehouses: {
      na: 5,
      eu: 3,
      apac: 1
    },
    variants: [
      { id: 'v1', name: 'Phantom Black', sku: 'NXG-ECH-BLK', price: 199.00, stock: 5 },
      { id: 'v2', name: 'Cyber White', sku: 'NXG-ECH-WHT', price: 199.00, stock: 4 }
    ],
    tags: ['Low Stock', 'Wireless Audio', 'IPX8 Waterproof'],
    description: 'Dual driver architecture with graphene dynamic woofer and balanced armature tweeter. Bone conduction voice microphone ensures crystal clear calls in windy conditions.',
    seo: {
      slug: 'nexgenesis-echo-buds-wireless',
      metaTitle: 'Nexgenesis Echo Buds | Spatial ANC Wireless Earbuds',
      metaDescription: 'Premium wireless earbuds with crystal acoustic resolution and IPX8 water resistance.'
    },
    createdAt: '2026-04-25T12:00:00Z',
    updatedAt: '2026-09-23T11:20:00Z'
  },
  {
    id: 'prod-008',
    sku: 'NXG-STR-TIT',
    barcode: '890124982108',
    name: 'Nexgenesis Titanium Link Band',
    subtitle: 'Quick-Release Diamond DLC Coated Watch Strap',
    category: 'accessories',
    status: 'published',
    price: 89.00,
    comparePrice: 110.00,
    cost: 28.00,
    margin: 68.5,
    stock: 180,
    lowStockThreshold: 30,
    allowBackorders: false,
    rating: 4.85,
    reviewsCount: 92,
    salesCount: 1450,
    revenue: 129050,
    image: '/assets/products/pulse-watch.jpg',
    warehouses: {
      na: 100,
      eu: 50,
      apac: 30
    },
    variants: [
      { id: 'v1', name: 'Diamond DLC Matte Black', sku: 'NXG-STR-BLK', price: 89.00, stock: 110 },
      { id: 'v2', name: 'Raw Aerospace Titanium', sku: 'NXG-STR-RAW', price: 89.00, stock: 70 }
    ],
    tags: ['Accessory', 'Titanium', 'Pulse Compatible'],
    description: 'Grade 5 aerospace titanium link bracelet with scratch-resistant diamond-like carbon (DLC) coating and butterfly deployment clasp.',
    seo: {
      slug: 'nexgenesis-titanium-link-watch-band',
      metaTitle: 'Nexgenesis Titanium Link Strap for Pulse Ultra Watch',
      metaDescription: 'Precision engineered DLC titanium link band with dual-trigger butterfly clasp.'
    },
    createdAt: '2026-05-12T09:30:00Z',
    updatedAt: '2026-09-19T10:15:00Z'
  }
];
