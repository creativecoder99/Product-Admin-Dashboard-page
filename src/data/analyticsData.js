export const TIMELINE_DATA = {
  '7D': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [38200, 42100, 48900, 45200, 56800, 64200, 58400],
    orders: [142, 168, 195, 178, 224, 256, 230]
  },
  '30D': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    revenue: [248000, 289500, 312400, 342850],
    orders: [980, 1140, 1260, 1380]
  },
  '90D': {
    labels: ['Jul', 'Aug', 'Sep'],
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
    title: 'The most refined titanium smartwatch on the market',
    content: 'The micro-OLED panel in direct sunlight is remarkable, and the heart rate variability telemetry matches my clinical ECG gear with 99.4% precision. Grade 5 titanium is light and completely scratch proof.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: 'Thank you Dr. Vance! We spent 18 months tuning our optical sensor cluster.'
  },
  {
    id: 'rev-02',
    productId: 'prod-001',
    productName: 'Nexgenesis Quantum Hub',
    author: 'Elena Rostova',
    avatar: 'ER',
    rating: 5,
    date: '2026-09-20',
    title: 'Zero latency Matter control - sheer brilliance',
    content: 'All our home automations now run locally without pinging third-party cloud servers. The cyan breathing LED ring looks gorgeous on our walnut console.',
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
    title: 'Studio level audio resolution, slight clamp force',
    content: 'Acoustic separation of instruments is mind-bending. Spatial audio tracking feels natural. The headband was slightly tight for the first few days, but broke in nicely after 15 hours.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: 'Thanks Julian! The memory foam cushion conforms to individual contour over the first week.'
  },
  {
    id: 'rev-04',
    productId: 'prod-004',
    productName: 'Nexgenesis Vision AR',
    author: 'Devon Reed',
    avatar: 'DR',
    rating: 5,
    date: '2026-09-17',
    title: 'Science fiction made reality',
    content: 'We are developing our spatial logistics overlay on the developer SDK. 42g weight means you can wear it all afternoon without fatigue. The Micro-LED waveguides are crystal clear.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: null
  },
  {
    id: 'rev-05',
    productId: 'prod-007',
    productName: 'Nexgenesis Echo Buds Wireless',
    author: 'Sarah Jenkins',
    avatar: 'SJ',
    rating: 4,
    date: '2026-09-15',
    title: 'Bone conduction microphone works wonders in windy city',
    content: 'Walking through downtown Chicago in 25mph winds, the person on the other end heard me like I was in a quiet studio. Battery life is easily 8 hours per charge.',
    verified: true,
    sentiment: 'positive',
    status: 'published',
    reply: null
  }
];

export const AUDIT_LOGS = [
  { id: 'log-1', action: 'Price Updated', detail: 'Updated Nexgenesis Pulse Ultra price to $499.00', user: 'Admin', time: '12 mins ago' },
  { id: 'log-2', action: 'Restock Order', detail: 'Created PO #PO-8821 for 500 units of HyperDock GaN', user: 'Inventory Mgr', time: '1 hour ago' },
  { id: 'log-3', action: 'Product Added', detail: 'Draft created for Nexgenesis Neural Synapse Coprocessor', user: 'Product Lead', time: '4 hours ago' },
  { id: 'log-4', action: 'Review Replied', detail: 'Replied to Dr. Marcus Vance on Pulse Ultra review', user: 'Support Lead', time: '1 day ago' },
  { id: 'log-5', action: 'Stock Alert', detail: 'Nexgenesis Echo Buds stock dipped below reorder threshold (9 units remaining)', user: 'System Telemetry', time: '1 day ago' }
];
