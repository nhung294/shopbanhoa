import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { payosApi } from '@/lib/api';
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface PaymentStatusProps {
  orderId: string;
  paymentMethod?: 'cash' | 'payos';
  onStatusChange?: (status: string) => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  orderId,
  paymentMethod = 'cash',
  onStatusChange,
}) => {
  const [status, setStatus] = useState<'not_paid' | 'pending' | 'completed' | 'failed' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(paymentMethod === 'payos');

  useEffect(() => {
    checkPaymentStatus();

    // Auto-refresh status every 5 seconds if PayOS and not completed/failed
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, autoRefresh]);

  const checkPaymentStatus = async () => {
    try {
      setError('');
      let response;

      if (paymentMethod === 'payos') {
        // Pull status từ PayOS
        response = await payosApi.checkPaymentStatus(orderId);
      } else {
        // Lấy status từ DB
        response = await payosApi.getPaymentStatus(orderId);
      }

      setStatus(response.paymentStatus);

      if (onStatusChange) {
        onStatusChange(response.paymentStatus);
      }

      // Stop auto-refresh nếu đã completed hoặc failed
      if (response.paymentStatus === 'completed' || response.paymentStatus === 'failed') {
        setAutoRefresh(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          title: '✅ Thanh toán thành công',
          description: 'Đơn hàng của bạn đã được thanh toán. Cảm ơn bạn!',
          color: 'bg-green-50 border-green-200 text-green-800',
          badge: 'Đã thanh toán',
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          title: '⏳ Đang chờ thanh toán',
          description: 'Vui lòng hoàn tất thanh toán trong vòng 24 giờ.',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          badge: 'Chờ thanh toán',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-5 h-5" />,
          title: '❌ Thanh toán thất bại',
          description: 'Thanh toán đã bị hủy hoặc hết hạn. Vui lòng thử lại.',
          color: 'bg-red-50 border-red-200 text-red-800',
          badge: 'Thất bại',
        };
      case 'not_paid':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          title: '💳 Chưa thanh toán',
          description: 'Vui lòng tiến hành thanh toán để hoàn tất đơn hàng.',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          badge: 'Chưa thanh toán',
        };
      default:
        return null;
    }
  };

  const display = getStatusDisplay();

  if (loading && status === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin">
          <RefreshCw className="w-5 h-5" />
        </div>
        <span className="ml-2">Kiểm tra trạng thái...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {display && (
        <div className={`rounded-lg border-2 p-4 ${display.color}`}>
          <div className="flex items-start gap-3">
            {display.icon}
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{display.title}</h3>
              <p className="text-sm opacity-90">{display.description}</p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-black bg-opacity-10 rounded-full text-xs font-medium">
                  {display.badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkPaymentStatus}
          disabled={loading}
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? 'Kiểm tra...' : 'Kiểm tra lại'}
        </Button>

        {status === 'failed' && (
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              // Redirect to checkout with retry
              window.location.href = `/checkout?retry=${orderId}`;
            }}
          >
            Thử lại thanh toán
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
