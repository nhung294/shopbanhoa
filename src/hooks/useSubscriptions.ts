import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface ProductSnapshot {
  name: string;
  nameEn?: string;
  price: number;
  image?: string;
}

export interface Subscription {
  _id: string;
  user: string;
  product: any; // Product reference
  productSnapshot: ProductSnapshot;
  quantity: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  deliveryAddress: string;
  phone: string;
  message?: string;
  price: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  nextDeliveryDate: string;
  lastDeliveryDate?: string;
  totalOrdersCreated: number;
  paymentMethod: 'credit-card' | 'bank-transfer' | 'cash-on-delivery';
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách subscription của người dùng
  const fetchSubscriptions = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = status 
        ? `/api/subscriptions?status=${status}`
        : '/api/subscriptions';
      const data = await api.get(url);
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo subscription mới
  const createSubscription = useCallback(async (subscriptionData: {
    productId: string;
    quantity: number;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
    deliveryAddress: string;
    phone: string;
    message?: string;
    paymentMethod?: string;
    endDate?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.post('/api/subscriptions', subscriptionData);
      setSubscriptions(prev => [data.subscription, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật subscription
  const updateSubscription = useCallback(async (
    id: string,
    updates: Partial<Subscription>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/subscriptions/${id}`, updates);
      setSubscriptions(prev => prev.map(sub => sub._id === id ? data.subscription : sub));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạm dừng subscription
  const pauseSubscription = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/subscriptions/${id}/pause`, {});
      setSubscriptions(prev => prev.map(sub => sub._id === id ? data.subscription : sub));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tiếp tục subscription
  const resumeSubscription = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/subscriptions/${id}/resume`, {});
      setSubscriptions(prev => prev.map(sub => sub._id === id ? data.subscription : sub));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy subscription
  const cancelSubscription = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.patch(`/api/subscriptions/${id}/cancel`, { reason });
      setSubscriptions(prev => prev.map(sub => sub._id === id ? data.subscription : sub));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa subscription
  const deleteSubscription = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/api/subscriptions/${id}`);
      setSubscriptions(prev => prev.filter(sub => sub._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    deleteSubscription,
  };
};
