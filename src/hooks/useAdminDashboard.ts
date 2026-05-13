import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface QuickStats {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface DashboardStats {
  revenue: { totalRevenue: number; totalOrders: number };
  monthlyRevenue: Array<{ _id: string; revenue: number; count: number }>;
  totalUsers: number;
  totalProducts: number;
  activeSubscriptions: number;
  ordersByStatus: Array<{ _id: string; count: number }>;
  subscriptionsByStatus: Array<{ _id: string; count: number }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalQty: number;
    totalRevenue: number;
  }>;
  inventoryStatus: {
    totalItems: number;
    lowStockCount: number;
    averageStock: number;
  };
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: Array<{
    product: string;
    productSnapshot: { name: string; price: number; image: string };
    quantity: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  deliveryAddress: string;
  phone: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  user: { _id: string; name: string; email: string };
  product: { _id: string; name: string; price: number; image: string };
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  price: number;
  nextDeliveryDate: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  stock: number;
  minimumStock: number;
  image: string;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy thống kê dashboard
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/api/admin/stats');
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy thống kê nhanh
  const fetchQuickStats = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/quick-stats');
      setQuickStats(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Lấy danh sách đơn hàng
  const fetchOrders = useCallback(async (status?: string, page = 1, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/orders?page=${page}&limit=20`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;
      const data = await api.get(url);
      // Backend trả về orders array trực tiếp
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders(data.orders || []);
      }
      return data.pagination;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách subscription
  const fetchSubscriptions = useCallback(async (status?: string, page = 1, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/subscriptions?page=${page}&limit=20`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;
      const data = await api.get(url);
      if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions(data.subscriptions || []);
      }
      return data.pagination;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách tồn kho
  const fetchInventory = useCallback(async (sortBy = 'stock', search?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/inventory?sortBy=${sortBy}&order=desc`;
      if (search) url += `&search=${search}`;
      const data = await api.get(url);
      setInventory(data.products);
      setInventoryStats(data.stats);
      return data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/orders/${orderId}/status`, { status });
      setOrders(prev =>
        prev.map(order => order._id === orderId ? data : order)
      );
      // Tự động refetch inventory khi status được cập nhật (đặc biệt khi đổi sang "delivered")
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchInventory();
      await fetchStats();
      await fetchQuickStats();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInventory, fetchStats, fetchQuickStats]);

  // Cập nhật tồn kho
  const updateInventory = useCallback(async (productId: string, stock: number, minimumStock?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/admin/inventory/${productId}`, {
        stock,
        ...(minimumStock !== undefined && { minimumStock })
      });
      setInventory(prev =>
        prev.map(product => product._id === productId ? data.product : product)
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    quickStats,
    orders,
    subscriptions,
    inventory,
    inventoryStats,
    loading,
    error,
    fetchStats,
    fetchQuickStats,
    fetchOrders,
    updateOrderStatus,
    fetchSubscriptions,
    fetchInventory,
    updateInventory,
  };
};
