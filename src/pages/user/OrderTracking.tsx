import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/data/products';

type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

interface OrderItem {
  productSnapshot: { name: string; nameEn: string; price: number; image: string };
  quantity: number;
  message: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  deliveryAddress: string;
  phone: string;
  createdAt: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
  delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
};

const OrderTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/api/orders/my')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Đang tải...</p></div>;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-light mb-2">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground text-sm mb-8">Xin chào, {user?.name}</p>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground">Chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/collection')} className="mt-4 text-primary hover:underline text-sm">Khám phá bộ sưu tập</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const sc = statusConfig[order.status];
              return (
                <div key={order._id} className="border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${sc.className}`}>{sc.label}</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <img src={item.productSnapshot.image} alt={item.productSnapshot.name} className="w-12 h-14 object-cover rounded-sm" />
                        <div>
                          <p className="text-sm font-medium">{item.productSnapshot.name}</p>
                          <p className="text-xs text-muted-foreground">× {item.quantity} — {formatPrice(item.productSnapshot.price)}</p>
                          {item.message && <p className="text-xs text-muted-foreground italic">"{item.message}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">{order.deliveryAddress}</span>
                    <span className="font-mono text-primary">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
