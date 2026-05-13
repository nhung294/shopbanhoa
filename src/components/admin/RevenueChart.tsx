import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  data: Array<{ _id: string; revenue: number; count: number }>;
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading = false }) => {
  const chartData = data.map(item => ({
    month: item._id,
    revenue: Math.round(item.revenue / 1000), // Convert to thousands
    orders: item.count
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Doanh Số 6 Tháng Gần Đây</CardTitle>
        <CardDescription>Biểu đồ doanh số và số lượng đơn hàng</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Đang tải...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') return [`${value}K VNĐ`, 'Doanh Số'];
                  return [value, 'Đơn Hàng'];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                name="Doanh Số (K VNĐ)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                name="Số Đơn Hàng"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
