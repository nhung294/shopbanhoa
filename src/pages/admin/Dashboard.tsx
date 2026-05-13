import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { StatCard } from '@/components/admin/StatCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { SubscriptionsTable } from '@/components/admin/SubscriptionsTable';
import { InventoryTable } from '@/components/admin/InventoryTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavLink } from '@/components/NavLink';
import { ShoppingCart, Users, Package, TrendingUp, LogOut, LayoutGrid, ListOrdered, Repeat, Boxes, ShoppingBag } from 'lucide-react';
import ProductManagement from './ProductManagement';

const dashboardBasePath = '/admin/dashboard';
const dashboardSections = ['overview', 'products', 'orders', 'subscriptions', 'inventory'] as const;
type DashboardSection = (typeof dashboardSections)[number];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stats,
    quickStats,
    orders,
    subscriptions,
    inventory,
    inventoryStats,
    loading,
    error,
    fetchStats,
    fetchQuickStats,
    fetchOrders,
    updateOrderStatus,
    fetchSubscriptions,
    fetchInventory,
    updateInventory,
  } = useAdminDashboard();

  const [searchOrders, setSearchOrders] = useState('');

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      // Success - data will auto-update via updateOrderStatus callback
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleInventoryChange = async (productId: string, stock: number, minimumStock?: number) => {
    try {
      await updateInventory(productId, stock, minimumStock);
      // Success - data will auto-update
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  const activeSection = useMemo<DashboardSection>(() => {
    const currentPath = location.pathname.replace(/\/+$/, '');
    return dashboardSections.find((section) => currentPath === `${dashboardBasePath}/${section}`) ?? 'overview';
  }, [location.pathname]);

  const navItems = [
    {
      to: dashboardBasePath,
      label: 'Tổng Quan',
      icon: LayoutGrid,
      end: true,
    },
    {
      to: `${dashboardBasePath}/products`,
      label: 'Sản Phẩm',
      icon: ShoppingBag,
      end: false,
    },
    {
      to: `${dashboardBasePath}/orders`,
      label: 'Đơn Hàng',
      icon: ListOrdered,
      end: false,
    },
    {
      to: `${dashboardBasePath}/subscriptions`,
      label: 'Hoa định kỳ',
      icon: Repeat,
      end: false,
    },
    {
      to: `${dashboardBasePath}/inventory`,
      label: 'Tồn Kho',
      icon: Boxes,
      end: false,
    },
  ] as const;

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Load data on mount
    fetchStats();
    fetchQuickStats();
    fetchOrders();
    fetchSubscriptions();
    fetchInventory();
  }, [user, navigate, fetchStats, fetchQuickStats, fetchOrders, fetchSubscriptions, fetchInventory]);

  if (user?.role !== 'admin') {
    return null;
  }

  const renderOverview = () => (
    <div className="space-y-6 mt-6">
      {/* Quick Stats */}
      {quickStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Đơn Hàng Hôm Nay"
            value={quickStats.ordersToday}
            icon={<ShoppingCart className="w-4 h-4" />}
            loading={loading}
          />
          <StatCard
            title="Doanh Số Hôm Nay"
            value={quickStats.revenueToday.toLocaleString('vi-VN') + ' VNĐ'}
            icon={<TrendingUp className="w-4 h-4 text-green-600" />}
            loading={loading}
          />
          <StatCard
            title="Đơn Hàng Chờ Xử Lý"
            value={quickStats.pendingOrders}
            icon={<ShoppingCart className="w-4 h-4 text-yellow-600" />}
            loading={loading}
            description="Cần xác nhận"
          />
          <StatCard
            title="Hoa Tồn Kho Thấp"
            value={quickStats.lowStockProducts}
            icon={<Package className="w-4 h-4 text-red-600" />}
            loading={loading}
            description="Cần nhập thêm"
          />
        </div>
      )}

      {/* Revenue and Core Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Tổng Doanh Số"
            value={stats.revenue.totalRevenue.toLocaleString('vi-VN') + ' VNĐ'}
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loading}
          />
          <StatCard
            title="Tổng Khách Hàng"
            value={stats.totalUsers}
            icon={<Users className="w-4 h-4" />}
            loading={loading}
          />
          <StatCard
            title="Subscription Đang Hoạt Động"
            value={stats.activeSubscriptions}
            icon={<ShoppingCart className="w-4 h-4" />}
            loading={loading}
          />
        </div>
      )}

      {/* Revenue Chart */}
      {stats && <RevenueChart data={stats.monthlyRevenue} loading={loading} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats && (
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Sản Phẩm Bán Chạy Top 5</h3>
            <div className="space-y-3">
              {stats.topProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
              ) : (
                stats.topProducts.map((product, idx) => (
                  <div key={product._id} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.totalQty} bó · {product.totalRevenue.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {inventoryStats && (
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Trạng Thái Tồn Kho</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng Hoa Có Hàng</span>
                <span className="font-semibold text-lg text-green-600">{inventoryStats.totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tồn Kho Thấp</span>
                <span className="font-semibold text-lg text-yellow-600">{inventoryStats.lowStockCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trung Bình Mỗi Loài</span>
                <span className="font-semibold text-lg">{Math.round(inventoryStats.averageStock)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Phân Loại Đơn Hàng</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'pending', label: 'Chờ Xử Lý', color: 'text-yellow-600' },
              { status: 'approved', label: 'Đã Duyệt', color: 'text-blue-600' },
              { status: 'rejected', label: 'Đã Từ Chối', color: 'text-red-600' },
              { status: 'delivered', label: 'Đã Giao', color: 'text-green-600' },
            ].map(({ status, label, color }) => {
              const count = stats.ordersByStatus.find((s) => s._id === status)?.count || 0;
              return (
                <div key={status} className="text-center">
                  <div className={`text-3xl font-bold ${color}`}>{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Phân Loại Subscription</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'active', label: 'Đang Hoạt Động', color: 'text-green-600' },
              { status: 'paused', label: 'Tạm Dừng', color: 'text-yellow-600' },
              { status: 'cancelled', label: 'Đã Hủy', color: 'text-red-600' },
              { status: 'expired', label: 'Hết Hạn', color: 'text-gray-600' },
            ].map(({ status, label, color }) => {
              const count = stats.subscriptionsByStatus.find((s) => s._id === status)?.count || 0;
              return (
                <div key={status} className="text-center">
                  <div className={`text-3xl font-bold ${color}`}>{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return (
          <div className="mt-6">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm email, tên khách hàng hoặc SĐT..."
                value={searchOrders}
                onChange={(e) => setSearchOrders(e.target.value)}
              />
            </div>
            <OrdersTable orders={orders} loading={loading} onStatusChange={handleStatusChange} />
          </div>
        );
      case 'subscriptions':
        return (
          <div className="mt-6">
            <SubscriptionsTable subscriptions={subscriptions} loading={loading} />
          </div>
        );
      case 'inventory':
        return (
          <div className="mt-6">
            <InventoryTable products={inventory} loading={loading} onUpdateInventory={handleInventoryChange} />
          </div>
        );
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Quản lý doanh số, đơn hàng, subscription và kho hàng</p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Đăng Xuất
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="lg:w-72 lg:shrink-0">
            <nav className="sticky top-28 rounded-2xl border bg-white/80 p-2 shadow-sm backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground lg:justify-start"
                    activeClassName="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </div>
  );
}
