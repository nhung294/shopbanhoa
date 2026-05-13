import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/hooks/useAdminDashboard';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InventoryTableProps {
  products: Product[];
  loading?: boolean;
  onUpdateInventory?: (productId: string, stock: number, minimumStock?: number) => Promise<void>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  loading = false,
  onUpdateInventory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editMinimum, setEditMinimum] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setEditStock(product.stock);
    setEditMinimum(product.minimumStock);
  };

  const handleSave = async () => {
    if (editingId && onUpdateInventory) {
      try {
        setUpdating(true);
        await onUpdateInventory(editingId, editStock, editMinimum);
        setEditingId(null);
      } finally {
        setUpdating(false);
      }
    }
  };

  const getStockStatus = (stock: number, minimum: number) => {
    if (stock === 0) return { label: 'Hết hàng', variant: 'destructive' as const };
    if (stock <= minimum) return { label: 'Tồn kho thấp', variant: 'secondary' as const };
    return { label: 'Có hàng', variant: 'default' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản Lý Tồn Kho Hoa</CardTitle>
        <CardDescription>Cập nhật số lượng hoa trong kho</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Hoa</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn Kho</TableHead>
                <TableHead>Tồn Kho Tối Thiểu</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => {
                  const status = getStockStatus(product.stock, product.minimumStock);
                  return (
                    <TableRow key={product._id} className={status.variant === 'destructive' ? 'bg-red-50' : status.variant === 'secondary' ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.nameEn}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {product.price.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium">{product.stock}</span>
                        {product.stock <= product.minimumStock && product.stock > 0 && (
                          <AlertCircle className="w-4 h-4 text-yellow-500 inline ml-2" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.minimumStock}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              Cập Nhật
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cập Nhật Tồn Kho</DialogTitle>
                              <DialogDescription>
                                {product.name} ({product.nameEn})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <label className="text-sm font-medium">Số Lượng Tồn Kho</label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editStock}
                                  onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Tồn Kho Tối Thiểu</label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editMinimum}
                                  onChange={(e) => setEditMinimum(parseInt(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                  disabled={updating}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={handleSave}
                                  disabled={updating}
                                >
                                  {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Lưu
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
