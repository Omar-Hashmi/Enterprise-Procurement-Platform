// Used only as an empty-state fallback so a new local installation feels alive.
// Real API results always take precedence over these records.
export const demoPurchaseRequests = [
  { _id: 'demo-pr-1', title: 'Developer workstations', category: 'IT Hardware', quantity: 12, estimatedCost: 384000, requiredDate: '2026-09-12', status: 'Pending', description: 'Laptop refresh for product engineering.', createdAt: '2026-08-17', requestedBy: { fullName: 'Ayesha Khan' } },
  { _id: 'demo-pr-2', title: 'Office collaboration licences', category: 'Software & SaaS', quantity: 45, estimatedCost: 162000, requiredDate: '2026-09-01', status: 'Finance Approved', description: 'Annual collaboration suite renewal.', createdAt: '2026-08-14', requestedBy: { fullName: 'Bilal Ahmed' } },
  { _id: 'demo-pr-3', title: 'Ergonomic chairs', category: 'Facilities', quantity: 20, estimatedCost: 640000, requiredDate: '2026-09-25', status: 'Approved', description: 'New floor seating.', createdAt: '2026-08-09', requestedBy: { fullName: 'Sara Malik' } },
];

export const demoPurchaseOrders = [
  { _id: 'demo-po-1', poNumber: 'PO-2026-1042', vendor: { companyName: 'Vertex Technologies' }, totalAmount: 384000, status: 'Issued', createdAt: '2026-08-16' },
  { _id: 'demo-po-2', poNumber: 'PO-2026-1041', vendor: { companyName: 'Northstar Office' }, totalAmount: 640000, status: 'Pending', createdAt: '2026-08-11' },
];

export const demoApprovals = [
  { _id: 'demo-approval-1', decision: 'Pending', currentStage: 'Finance', purchaseRequest: demoPurchaseRequests[0], createdAt: '2026-08-17' },
  { _id: 'demo-approval-2', decision: 'Approved', currentStage: 'Procurement', purchaseRequest: demoPurchaseRequests[1], createdAt: '2026-08-15' },
];

export const demoContracts = [
  { id: 'demo-contract-1', title: 'Managed IT Support 2026', vendor: { companyName: 'Vertex Technologies' }, startDate: '2026-01-01', endDate: '2026-10-01', status: 'active' },
  { id: 'demo-contract-2', title: 'Facilities Maintenance Agreement', vendor: { companyName: 'Prime Facilities' }, startDate: '2026-02-01', endDate: '2026-09-05', status: 'expiring_soon' },
  { id: 'demo-contract-3', title: 'Cloud Infrastructure Subscription', vendor: { companyName: 'Nimbus Systems' }, startDate: '2026-04-01', endDate: '2027-03-31', status: 'active' },
  { id: 'demo-contract-4', title: 'Corporate Travel Services', vendor: { companyName: 'Atlas Travel' }, startDate: '2025-01-01', endDate: '2026-07-31', status: 'expired' },
  { id: 'demo-contract-5', title: 'Office Supplies Framework', vendor: { companyName: 'Northstar Office' }, startDate: '2026-06-01', endDate: '2027-05-31', status: 'draft' },
];

export const demoBudgets = [
  { id: 'demo-budget-1', department: { name: 'Engineering' }, allocatedAmount: 2500000, spentAmount: 1420000, remainingAmount: 1080000, fiscalYear: 2026 },
  { id: 'demo-budget-2', department: { name: 'Operations' }, allocatedAmount: 1800000, spentAmount: 1260000, remainingAmount: 540000, fiscalYear: 2026 },
  { id: 'demo-budget-3', department: { name: 'People & Culture' }, allocatedAmount: 950000, spentAmount: 420000, remainingAmount: 530000, fiscalYear: 2026 },
  { id: 'demo-budget-4', department: { name: 'Facilities' }, allocatedAmount: 1200000, spentAmount: 1080000, remainingAmount: 120000, fiscalYear: 2026 },
];

export const demoVendors = [
  { id: 'demo-vendor-1', companyName: 'Vertex Technologies', name: 'Vertex Technologies', contactPerson: 'Omar Farooq', email: 'partners@vertex.example', categories: ['IT & Hardware'], category: 'IT & Hardware', averageRating: 4.7, rating: 4.7, status: 'ACTIVE' },
  { id: 'demo-vendor-2', companyName: 'Prime Facilities', name: 'Prime Facilities', contactPerson: 'Nadia Shah', email: 'hello@prime.example', categories: ['Facilities & Maintenance'], category: 'Facilities & Maintenance', averageRating: 4.4, rating: 4.4, status: 'PENDING' },
  { id: 'demo-vendor-3', companyName: 'Nimbus Systems', name: 'Nimbus Systems', contactPerson: 'Hassan Ali', email: 'sales@nimbus.example', categories: ['Software & SaaS'], category: 'Software & SaaS', averageRating: 4.8, rating: 4.8, status: 'ACTIVE' },
  { id: 'demo-vendor-4', companyName: 'Northstar Office', name: 'Northstar Office', contactPerson: 'Mariam Noor', email: 'accounts@northstar.example', categories: ['Office Supplies'], category: 'Office Supplies', averageRating: 4.2, rating: 4.2, status: 'ACTIVE' },
  { id: 'demo-vendor-5', companyName: 'Atlas Travel', name: 'Atlas Travel', contactPerson: 'Raza Khan', email: 'support@atlas.example', categories: ['Logistics & Freight'], category: 'Logistics & Freight', averageRating: 3.1, rating: 3.1, status: 'BLACKLISTED' },
  { id: 'demo-vendor-6', companyName: 'Legacy Industrial', name: 'Legacy Industrial', contactPerson: 'Amina Iqbal', email: 'review@legacy.example', categories: ['IT & Hardware'], category: 'IT & Hardware', averageRating: 2.6, rating: 2.6, status: 'BLACKLISTED' },
];

export const demoDeliveries = [
  { id: 'DEL-2026-104', deliveryStatus: 'Pending', expectedDeliveryDate: '2026-08-22' },
  { id: 'DEL-2026-105', deliveryStatus: 'In Transit', expectedDeliveryDate: '2026-08-26' },
  { id: 'DEL-2026-106', deliveryStatus: 'Scheduled', expectedDeliveryDate: '2026-08-27' },
  { id: 'DEL-2026-107', deliveryStatus: 'Delivered', expectedDeliveryDate: '2026-08-16' },
];
export const demoWarehouses = [
  { id: 'WH-001', name: 'Central Distribution Hub', location: 'Karachi — Korangi' },
  { id: 'WH-002', name: 'North Operations Store', location: 'Lahore — Sundar Estate' },
  { id: 'WH-003', name: 'IT Asset Room', location: 'Islamabad — Blue Area' },
];

export const demoAnalyticsOverview = {
  summary: { vendors: { active: 3 }, inventory: { pendingDeliveries: 2 }, contracts: { active: 2, compliancePercent: 94 }, rfqs: { open: 6 } },
  trend: [{ period: 'Jan', amount: 420000 }, { period: 'Feb', amount: 390000 }, { period: 'Mar', amount: 520000 }, { period: 'Apr', amount: 480000 }, { period: 'May', amount: 610000 }, { period: 'Jun', amount: 560000 }, { period: 'Jul', amount: 640000 }],
  departments: [{ department: 'Engineering', allocated: 620000, spent: 540000 }, { department: 'Operations', allocated: 470000, spent: 420000 }, { department: 'Administration', allocated: 240000, spent: 220000 }, { department: 'People', allocated: 180000, spent: 170000 }, { department: 'Facilities', allocated: 320000, spent: 290000 }],
};
