import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchAnalytics } from '@/store/slices/analyticsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsPage() {
  const dispatch = useDispatch();
  const { metrics, loading } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-1">View operational metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Page Views', value: '145,234', change: '+12.5%', icon: BarChart3 },
          { label: 'Conversions', value: '3,421', change: '+8.2%', icon: TrendingUp },
          { label: 'Avg. Session', value: '5m 32s', change: '+2.1%', icon: BarChart3 },
          { label: 'Bounce Rate', value: '42.3%', change: '-3.2%', icon: TrendingUp },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-600 mt-1">{metric.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'Organic Search', percentage: 45, value: '65,320' },
                { source: 'Direct', percentage: 30, value: '43,560' },
                { source: 'Social Media', percentage: 15, value: '21,780' },
                { source: 'Referral', percentage: 10, value: '14,520' },
              ].map((item) => (
                <div key={item.source}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.source}</span>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { page: '/trips', views: '12,543', bounce: '38%' },
                { page: '/blog', views: '8,234', bounce: '42%' },
                { page: '/gear-rentals', views: '5,621', bounce: '45%' },
                { page: '/hosts', views: '3,421', bounce: '51%' },
              ].map((item) => (
                <div key={item.page} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.page}</p>
                    <p className="text-xs text-gray-500">Bounce rate: {item.bounce}</p>
                  </div>
                  <span className="text-sm font-medium">{item.views} views</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
