import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order } from '@/hooks/useAdminDashboard';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onStatusChange?: (orderId: string, status: string) => Promise<void>;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading = false,
  onStatusChange,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusConfig = {
    pending: { label: 'Chờ xử lý', variant: 'secondary' as const },
    approved: { label: 'Đã duyệt', variant: 'default' as const },
    rejected: { label: 'Đã từ chối', variant: 'destructive' as const },
    delivered: { label: 'Đã giao', variant: 'default' as const },
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (onStatusChange) {
      try {
        setUpdatingId(orderId);
        await onStatusChange(orderId, newStatus);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh Sách Đơn Hàng</CardTitle>
        <CardDescription>Quản lý tất cả các đơn hàng trong hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Địa Chỉ Giao</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Tổng Cộng</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell className="text-sm">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.phone}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {order.deliveryAddress}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} mục
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.status === 'delivered' ? (
                        <div className="text-sm text-muted-foreground">Đã khóa</div>
                      ) : (
                        <Select
                          defaultValue={order.status}
                          onValueChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                          disabled={updatingId === order._id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="approved">Đã duyệt</SelectItem>
                            <SelectItem value="rejected">Đã từ chối</SelectItem>
                            <SelectItem value="delivered">Đã giao</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
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
