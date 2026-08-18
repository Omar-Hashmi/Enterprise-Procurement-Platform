import { useState, useMemo } from 'react';

const INITIAL_ITEMS = [
  {
    id: 'INV-1001',
    sku: 'LOG-HD-1080P',
    name: 'Logitech HD Webcam C920',
    category: 'Electronics',
    quantity: 45,
    minStockThreshold: 10,
    unitPrice: 12500,
    location: 'Warehouse A - Shelf 3B',
    status: 'IN_STOCK',
    lastUpdated: '2026-08-15',
  },
  {
    id: 'INV-1002',
    sku: 'DELL-27-4K',
    name: 'Dell UltraSharp 27" 4K Monitor',
    category: 'Monitors',
    quantity: 4,
    minStockThreshold: 8,
    unitPrice: 85000,
    location: 'Warehouse A - Shelf 1A',
    status: 'LOW_STOCK',
    lastUpdated: '2026-08-17',
  },
  {
    id: 'INV-1003',
    sku: 'MX-KEYS-ADV',
    name: 'Logitech MX Keys Wireless Keyboard',
    category: 'Peripherals',
    quantity: 0,
    minStockThreshold: 15,
    unitPrice: 28000,
    location: 'Warehouse B - Shelf 5C',
    status: 'OUT_OF_STOCK',
    lastUpdated: '2026-08-10',
  },
  {
    id: 'INV-1004',
    sku: 'ERG-CHAIR-BLK',
    name: 'Ergonomic Mesh Office Chair',
    category: 'Furniture',
    quantity: 18,
    minStockThreshold: 5,
    unitPrice: 42000,
    location: 'Warehouse B - Floor 2',
    status: 'IN_STOCK',
    lastUpdated: '2026-08-12',
  },
];

export const useInventory = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Compute summary stats
  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalItems += 1;
        acc.totalQuantity += item.quantity;
        acc.totalValuation += item.quantity * item.unitPrice;
        if (item.status === 'LOW_STOCK') acc.lowStockCount += 1;
        if (item.status === 'OUT_OF_STOCK') acc.outOfStockCount += 1;
        return acc;
      },
      { totalItems: 0, totalQuantity: 0, totalValuation: 0, lowStockCount: 0, outOfStockCount: 0 }
    );
  }, [items]);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category)));
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Handlers
  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (newItem) => {
    const createdItem = {
      ...newItem,
      id: `INV-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      status:
        newItem.quantity === 0
          ? 'OUT_OF_STOCK'
          : newItem.quantity <= newItem.minStockThreshold
          ? 'LOW_STOCK'
          : 'IN_STOCK',
    };
    setItems((prev) => [createdItem, ...prev]);
  };

  return {
    items: filteredItems,
    summary,
    categories,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    handleDeleteItem,
    handleAddItem,
  };
};