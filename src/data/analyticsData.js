export const TIMELINE_DATA = {
  '7D': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [38200, 42100, 48900, 45200, 56800, 64200, 58400],
    orders: [142, 168, 195, 178, 224, 256, 230]
  },
  '30D': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    revenue: [248000, 289500, 312400, 342850],
    orders: [980, 1140, 1260, 1380]
  },
  '90D': {
    labels: ['July', 'August', 'September'],
    revenue: [812000, 940500, 1085000],
    orders: [3400, 3850, 4390]
  },
  '1Y': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    revenue: [2150000, 2680000, 3120000, 3850000],
    orders: [9200, 11400, 13100, 15800]
  }
};

export const REVIEWS_DATA = [
  {
    id: 'rev-01',
    productId: 'prod-002',
    productName: 'Nexgenesis Pulse Ultra',
    author: 'Dr. Marcus Vance',
    avatar: 'MV',
    rating: 5,
    date: '2026-09-21',
    title: 'Precision titanium smartwatch for clinical tracking',
    content: 'The display remains readable under bright sunlight. Optical heart rate variability telemetry aligns with clinical ECG monitoring standards. Grade 5 titanium frame resists abrasion during lab work.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: 'Our optical sensor array was calibrated for medical telemetry requirements.'
  },
  {
    id: 'rev-02',
    productId: 'prod-001',
    productName: 'Nexgenesis Quantum Hub',
    author: 'Elena Rostova',
    avatar: 'ER',
    rating: 5,
    date: '2026-09-20',
    title: 'Local Matter control runs with zero latency',
    content: 'Automations execute locally without transmitting telemetry to third party cloud servers. The brushed titanium chassis integrates quietly into standard workspace environments.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: null
  },
  {
    id: 'rev-03',
    productId: 'prod-003',
    productName: 'Nexgenesis Aura Pro',
    author: 'Julian Chen',
    avatar: 'JC',
    rating: 4,
    date: '2026-09-18',
    title: 'Acoustic resolution is transparent with neutral frequency response',
    content: 'Spatial separation is accurate without artificial bass amplification. Headband tension requires a few hours of break-in before conforming comfortably.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: 'Memory foam ear cushions adapt to individual head contours within several hours of use.'
  },
  {
    id: 'rev-04',
    productId: 'prod-004',
    productName: 'Nexgenesis Vision AR',
    author: 'Devon Reed',
    avatar: 'DR',
    rating: 5,
    date: '2026-09-17',
    title: 'Lightweight titanium frame supports full-day developer usage',
    content: 'Total weight of 42 grams prevents nose bridge fatigue during extended testing. The optical waveguide delivers readable text across variable ambient lighting.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: null
  }
];

export const AUDIT_LOGS = [
  { id: 'log-1', action: 'Price Updated', detail: 'Updated Nexgenesis Pulse Ultra price to $499.00', user: 'Operations', time: '12 min ago' },
  { id: 'log-2', action: 'Restock Order', detail: 'Generated purchase order for 500 units of HyperDock GaN', user: 'Logistics', time: '1 hour ago' },
  { id: 'log-3', action: 'Product Created', detail: 'Draft created for Nexgenesis Neural Synapse Coprocessor', user: 'Product Engineering', time: '4 hours ago' },
  { id: 'log-4', action: 'Review Replied', detail: 'Published operational response to customer review', user: 'Support', time: '1 day ago' },
  { id: 'log-5', action: 'Inventory Alert', detail: 'Echo Buds stock reached replenishment threshold (9 units)', user: 'Inventory Telemetry', time: '1 day ago' }
];
