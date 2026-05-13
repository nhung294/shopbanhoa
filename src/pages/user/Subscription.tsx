import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Flower2, Plus, Loader2 } from 'lucide-react';

export const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [activeTab, setActiveTab] = useState('active');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate, fetchSubscriptions]);

  if (!user) {
    return null;
  }

  const handlePause = async (id: string) => {
    try {
      setActionLoading(true);
      await pauseSubscription(id);
      toast({
        title: 'Thành công',
        description: 'Đơn đặt hoa định kỳ đã được tạm dừng',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (id: string) => {
    try {
      setActionLoading(true);
      await resumeSubscription(id);
      toast({
        title: 'Thành công',
        description: 'Đơn đặt hoa định kỳ đã được tiếp tục',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: string, reason?: string) => {
    try {
      setActionLoading(true);
      await cancelSubscription(id, reason);
      toast({
        title: 'Thành công',
        description: 'Đơn đặt hoa định kỳ đã được hủy',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      await deleteSubscription(id);
      toast({
        title: 'Thành công',
        description: 'Đơn đặt hoa định kỳ đã được xóa',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused');
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <Flower2 className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-foreground">Đơn đặt hoa định kỳ của tôi</h1>
          </div>
          <p className="text-muted-foreground">
            Quản lý các đơn đặt hoa định kỳ và nhận hoa tươi ngon mỗi {' '}
            <span className="font-semibold">tuần, lẻ tuần hoặc hàng tháng</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Create new subscription button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => navigate('/subscription')}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo đơn đặt hoa định kỳ mới
          </Button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : subscriptions.length === 0 ? (
          // Empty state
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Flower2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                Bạn chưa có đơn đặt hoa định kỳ
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Hãy tạo một đơn đặt hoa định kỳ để nhận hoa tươi ngon mỗi tuần
              </p>
              <Button onClick={() => navigate('/subscription')}>
                Khám phá gói hoa định kỳ
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="relative">
                Đang hoạt động
                {activeSubscriptions.length > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {activeSubscriptions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paused" className="relative">
                Tạm dừng
                {pausedSubscriptions.length > 0 && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    {pausedSubscriptions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="relative">
                Đã hủy
                {cancelledSubscriptions.length > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {cancelledSubscriptions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeSubscriptions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Không có đơn đặt hoa nào đang hoạt động</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activeSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription._id}
                      subscription={subscription}
                      onPause={handlePause}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paused" className="space-y-4">
              {pausedSubscriptions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Không có đơn đặt hoa nào bị tạm dừng</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pausedSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription._id}
                      subscription={subscription}
                      onResume={handleResume}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledSubscriptions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Không có đơn đặt hoa nào đã hủy</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cancelledSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription._id}
                      subscription={subscription}
                      onDelete={handleDelete}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Info card */}
        {subscriptions.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Mẹo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                • Bạn có thể <strong>tạm dừng</strong> đơn hàng bất kỳ lúc nào và tiếp tục sau đó
              </p>
              <p>
                • <strong>Hủy</strong> đơn hàng sẽ dừng tất cả các lần giao hàng trong tương lai
              </p>
              <p>
                • Bạn có thể <strong>chỉnh sửa</strong> địa chỉ, số điện thoại hoặc lời nhắn bất kỳ lúc nào
              </p>
              <p>
                • Mỗi lần giao hàng, bạn sẽ nhận được thông báo trước 1 ngày
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscription;
