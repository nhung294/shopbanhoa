import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';

const CartPanel = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, updateMessage, totalPrice, isCheckout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate(user ? '/checkout' : '/login');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-display text-2xl font-light">Giỏ hoa của bạn</SheetTitle>
          <SheetDescription className="text-xs tracking-widest uppercase text-muted-foreground">
            {items.length} sản phẩm
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground italic">Giỏ hoa đang trống</p>
            <p className="text-sm text-muted-foreground mt-2">Hãy chọn một đóa hoa để bắt đầu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map(item => (
              <div key={item.product._id} className="flex gap-4 pb-6 border-b border-border">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display text-lg leading-tight">{item.product.name}</h4>
                      <p className="font-mono text-xs text-primary mt-1">{formatPrice(item.product.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.product._id)}
                      disabled={isCheckout}
                      className="text-muted-foreground hover:text-foreground p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)} 
                      disabled={isCheckout}
                      className="w-7 h-7 border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)} 
                      disabled={isCheckout || (item.product.stock !== undefined && item.quantity >= item.product.stock)}
                      className="w-7 h-7 border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={item.product.stock !== undefined && item.quantity >= item.product.stock ? `Chỉ còn ${item.product.stock} cái` : ''}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <Textarea
                    placeholder="Lời nhắn trên thiệp..."
                    value={item.message || ''}
                    onChange={(e) => updateMessage(item.product._id, e.target.value)}
                    disabled={isCheckout}
                    className="mt-3 text-xs h-16 resize-none bg-secondary/50 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}

            <div className="mt-4">
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Ngày giao hàng</label>
              <Input type="date" className="mt-2 bg-secondary/50 border-0 font-mono text-sm" />
            </div>

            <div className="border-t border-border pt-6 mt-2">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-sm text-muted-foreground">Tổng cộng</span>
                <span className="font-mono text-lg text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Button className="w-full rounded-full h-12 font-body tracking-widest uppercase text-sm" onClick={handleCheckout}>
                Đặt hoa ngay
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;
