import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/data/products';
import { api } from '@/lib/api';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryAddress: string;
  phone: string;
  items: Array<{
    productSnapshot: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  createdAt: string;
  payosTransaction?: {
    completedAt?: string;
  };
}

export const OrderDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/my');
      setOrders(response);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not_paid':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'not_paid':
        return 'Chưa thanh toán';
      default:
        return status;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
      approved: { color: 'bg-blue-100 text-blue-800', text: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Bị từ chối' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Đã giao' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return badge;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-light">Đơn hàng của tôi</h1>
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
            <Button
              onClick={() => navigate('/collection')}
              className="rounded-full"
            >
              Bắt đầu mua sắm
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order._id} className="overflow-hidden hover:shadow-lg transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Đơn hàng #{order._id.slice(-6).toUpperCase()}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusBadge(order.status).color}`}>
                        {getOrderStatusBadge(order.status).text}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Sản phẩm:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.productSnapshot.name} x{item.quantity}
                          </span>
                          <span className="font-mono">
                            {formatPrice(item.productSnapshot.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                      <strong>Địa chỉ:</strong> {order.deliveryAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>SĐT:</strong> {order.phone}
                    </p>
                  </div>

                  {/* Payment Status */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(order.paymentStatus)}
                        <div>
                          <p className="text-xs text-muted-foreground">Trạng thái thanh toán</p>
                          <p className="font-semibold text-sm">
                            {getPaymentStatusText(order.paymentStatus)}
                          </p>
                          {order.paymentMethod === 'payos' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Phương thức: PayOS (QR)
                            </p>
                          )}
                          {order.paymentMethod === 'cash' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Phương thức: Tiền mặt
                            </p>
                          )}
                          {order.payosTransaction?.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Thanh toán: {new Date(order.payosTransaction.completedAt).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total and Actions */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng cộng</p>
                      <p className="font-mono text-lg font-semibold text-primary">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                    {order.paymentStatus === 'failed' && order.paymentMethod === 'payos' && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/checkout?retry=${order._id}`)}
                      >
                        Thanh toán lại
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
