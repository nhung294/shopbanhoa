import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, payosApi } from '@/lib/api';
import { formatPrice } from '@/data/products';
import PaymentStatus from '@/components/PaymentStatus';

const Checkout = () => {
  const { items, totalPrice, setIsOpen, setIsCheckout, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'payos'>('cash');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [returnedOrderId, setReturnedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
    setIsCheckout(true);
    
    // Kiểm tra status từ PayOS callback
    const status = searchParams.get('status');
    const checkoutOrderId = searchParams.get('orderId');
    
    if (checkoutOrderId) {
      setReturnedOrderId(checkoutOrderId);
      
      if (status === 'success') {
        setError('');
        // Wait for webhook to update status, then redirect
        setTimeout(() => {
          navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }, 3000);
      } else if (status === 'cancel') {
        setError('Thanh toán đã bị hủy. Vui lòng thử lại.');
      }
    }

    return () => setIsCheckout(false);
  }, [user, navigate, setIsCheckout, searchParams]);

  if (!user) return null;

  // Nếu quay lại từ PayOS
  if (returnedOrderId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-light mb-8">Trạng thái thanh toán</h1>
          
          <PaymentStatus 
            orderId={returnedOrderId} 
            paymentMethod="payos"
            onStatusChange={(status) => {
              if (status === 'completed') {
                setTimeout(() => {
                  navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
                }, 2000);
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-xl text-muted-foreground">Giỏ hoa đang trống</p>
          <Button className="mt-4 rounded-full" onClick={() => navigate('/collection')}>Xem bộ sưu tập</Button>
        </div>
      </div>
    );
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const orderResponse = await api.post('/api/orders', {
        items: items.map(i => ({ 
          productId: i.product._id, 
          quantity: i.quantity, 
          message: i.message || '' 
        })),
        deliveryAddress: address,
        phone,
      });
      
      setOrderId(orderResponse._id);

      if (paymentMethod === 'cash') {
        // Thanh toán tiền mặt - xóa giỏ và redirect
        clearCart();
        setIsOpen(false);
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      } else if (paymentMethod === 'payos') {
        // Tạo payment link PayOS
        const paymentData = await payosApi.createPaymentLink(orderResponse._id);
        // Redirect to PayOS checkout
        if (paymentData.checkoutUrl) {
          window.location.href = paymentData.checkoutUrl;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-light mb-8">Xác nhận đặt hàng</h1>

        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.product._id} className="flex gap-4 p-4 border border-border rounded-lg">
              <img src={item.product.image} alt={item.product.name} className="w-16 h-20 object-cover rounded-sm" />
              <div className="flex-1">
                <h4 className="font-display text-lg">{item.product.name}</h4>
                <p className="font-mono text-sm text-primary">{formatPrice(item.product.price)}</p>
                <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                {item.message && <p className="text-xs text-muted-foreground italic mt-1">"{item.message}"</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 mb-8">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Tổng cộng</span>
            <span className="font-mono text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <form onSubmit={handleCreateOrder} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md py-2 px-3">{error}</div>
          )}
          
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Địa chỉ giao hàng</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 bg-secondary/50 border-0" placeholder="Số nhà, đường, quận, thành phố" required />
          </div>
          
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Số điện thoại</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 bg-secondary/50 border-0" placeholder="0901234567" required />
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">Phương thức thanh toán</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'payos')}
                  className="mr-3"
                />
                <span className="text-sm font-body">Thanh toán tiền mặt khi nhận hàng</span>
              </label>
              <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition">
                <input
                  type="radio"
                  name="payment"
                  value="payos"
                  checked={paymentMethod === 'payos'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'payos')}
                  className="mr-3"
                />
                <span className="text-sm font-body">PayOS (Chuyển khoản QR)</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full h-12 font-body tracking-widest uppercase text-sm" disabled={loading}>
            {loading ? 'Đang xử lý...' : paymentMethod === 'payos' ? 'Thanh toán qua PayOS' : 'Xác nhận đặt hàng'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
