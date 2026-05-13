import { useState } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Flower2, MapPin, Phone, Clock, Trash2, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string, reason?: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onPause,
  onResume,
  onCancel,
  onDelete,
  loading = false,
}) => {
  const frequencyLabels = {
    weekly: 'Hàng tuần',
    'bi-weekly': 'Lẻ tuần',
    monthly: 'Hàng tháng',
  };

  const statusBadgeVariant = {
    active: 'default',
    paused: 'secondary',
    cancelled: 'destructive',
    expired: 'outline',
  } as const;

  const statusLabels = {
    active: 'Đang hoạt động',
    paused: 'Tạm dừng',
    cancelled: 'Đã hủy',
    expired: 'Đã hết hạn',
  };

  const [cancelReason, setCancelReason] = useState('');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <Flower2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-pink-500" />
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate text-lg">
                  {subscription.productSnapshot.name}
                </CardTitle>
                <CardDescription>
                  {subscription.quantity}x {frequencyLabels[subscription.frequency]}
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge variant={statusBadgeVariant[subscription.status]}>
            {statusLabels[subscription.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Giá tiền */}
        <div className="flex items-center justify-between py-2 border-t border-b">
          <span className="text-sm text-muted-foreground">Giá / lần</span>
          <span className="font-bold text-lg text-primary">
            {subscription.price.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>

        {/* Ngày giao tiếp theo */}
        {subscription.status === 'active' && (
          <div className="flex items-center gap-3 text-sm bg-blue-50 p-3 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Giao hàng tiếp theo</p>
              <p className="font-semibold text-blue-700">
                {format(new Date(subscription.nextDeliveryDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
          </div>
        )}

        {/* Thông tin giao hàng */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Địa chỉ giao hàng</p>
              <p className="text-foreground">{subscription.deliveryAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Số điện thoại</p>
              <p className="text-foreground">{subscription.phone}</p>
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        {subscription.message && (
          <div className="bg-secondary/50 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground text-xs mb-1">Lời nhắn</p>
            <p className="italic">{subscription.message}</p>
          </div>
        )}

        {/* Thống kê */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              Bắt đầu: {format(new Date(subscription.startDate), 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          <span>Tổng {subscription.totalOrdersCreated} đơn</span>
        </div>

        {/* Các nút hành động */}
        <div className="flex gap-2 pt-4 border-t">
          {subscription.status === 'active' && onPause && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onPause(subscription._id)}
              disabled={loading}
            >
              <Pause className="w-4 h-4 mr-2" />
              Tạm dừng
            </Button>
          )}

          {subscription.status === 'paused' && onResume && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onResume(subscription._id)}
              disabled={loading}
            >
              <Play className="w-4 h-4 mr-2" />
              Tiếp tục
            </Button>
          )}

          {(subscription.status === 'active' || subscription.status === 'paused') && onCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1">
                  Hủy
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hủy đơn đặt hoa định kỳ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Bạn chắc chắn muốn hủy đơn hàng định kỳ này không?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Lý do hủy (tùy chọn)</label>
                  <textarea
                    className="w-full mt-2 p-2 border rounded text-sm"
                    placeholder="Cho chúng tôi biết tại sao bạn hủy..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <AlertDialogCancel>Không</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onCancel(subscription._id, cancelReason);
                      setCancelReason('');
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Hủy đơn
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subscription._id)}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
