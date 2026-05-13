import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  productId,
  productName,
  productPrice,
  onSubmit,
  loading = false,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    quantity: 1,
    frequency: 'monthly',
    deliveryAddress: '',
    phone: '',
    message: '',
    paymentMethod: 'credit-card',
    notes: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.deliveryAddress.trim() || !formData.phone.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ địa chỉ và số điện thoại',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit({
        productId,
        ...formData,
        quantity: parseInt(formData.quantity.toString()),
      });
      toast({
        title: 'Thành công',
        description: 'Đơn đặt hoa định kỳ đã được tạo',
      });
      setFormData({
        quantity: 1,
        frequency: 'monthly',
        deliveryAddress: '',
        phone: '',
        message: '',
        paymentMethod: 'credit-card',
        notes: '',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    }
  };

  const frequencyLabels = {
    weekly: 'Hàng tuần (7 ngày)',
    'bi-weekly': 'Lẻ tuần (14 ngày)',
    monthly: 'Hàng tháng (30 ngày)',
  };

  const paymentMethods = {
    'credit-card': 'Thẻ tín dụng',
    'bank-transfer': 'Chuyển khoản ngân hàng',
    'cash-on-delivery': 'Thanh toán khi nhận hàng',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Đặt hoa định kỳ</CardTitle>
        <CardDescription>
          Nhận {productName} mỗi {formData.frequency === 'weekly' ? 'tuần' : formData.frequency === 'bi-weekly' ? 'lẻ tuần' : 'tháng'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hiển thị thông tin sản phẩm */}
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="font-semibold">{productName}</p>
            <p className="text-lg font-bold text-primary">
              {productPrice.toLocaleString('vi-VN')} VNĐ / lần
            </p>
          </div>

          {/* Số lượng */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng mỗi lần giao</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tần suất giao hàng */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Tần suất giao hàng</Label>
            <Select value={formData.frequency} onValueChange={(val) => handleSelectChange('frequency', val)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(frequencyLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Tổng: {(productPrice * parseInt(formData.quantity.toString())).toLocaleString('vi-VN')} VNĐ / {formData.frequency === 'weekly' ? 'tuần' : formData.frequency === 'bi-weekly' ? 'lẻ tuần' : 'tháng'}
            </p>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Địa chỉ giao hàng</Label>
            <Textarea
              id="deliveryAddress"
              name="deliveryAddress"
              placeholder="VD: 123 Đường Nguyễn Huệ, Quận 1, TP. HCM"
              value={formData.deliveryAddress}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0123456789"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Lời nhắn */}
          <div className="space-y-2">
            <Label htmlFor="message">Lời nhắn (tùy chọn)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Lời nhắn sẽ đi kèm với mỗi lần giao hàng..."
              value={formData.message}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
            <Select value={formData.paymentMethod} onValueChange={(val) => handleSelectChange('paymentMethod', val)}>
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethods).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú thêm (tùy chọn)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Ghi chú thêm về đơn hàng của bạn..."
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Nút submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang xử lý...' : 'Tạo đơn đặt hoa định kỳ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
