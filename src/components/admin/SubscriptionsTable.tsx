import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/hooks/useAdminDashboard';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  loading?: boolean;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  subscriptions,
  loading = false,
}) => {
  const statusConfig = {
    active: { label: 'Đang hoạt động', variant: 'default' as const },
    paused: { label: 'Tạm dừng', variant: 'secondary' as const },
    cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
    expired: { label: 'Hết hạn', variant: 'outline' as const },
  };

  const frequencyLabels = {
    weekly: 'Hàng tuần',
    'bi-weekly': 'Lẻ tuần',
    monthly: 'Hàng tháng',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh Sách Đặt Hoa Định Kỳ</CardTitle>
        <CardDescription>Quản lý các đơn đặt hoa định kỳ của khách hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Sản Phẩm</TableHead>
                <TableHead>Tần Suất</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Giao Tiếp Theo</TableHead>
                <TableHead>Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không có đơn đặt hoa định kỳ nào
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map(sub => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{sub.user.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {sub.product.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {frequencyLabels[sub.frequency as keyof typeof frequencyLabels]}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {sub.price.toLocaleString('vi-VN')} VNĐ
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(sub.nextDeliveryDate), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[sub.status as keyof typeof statusConfig]?.variant}>
                        {statusConfig[sub.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
