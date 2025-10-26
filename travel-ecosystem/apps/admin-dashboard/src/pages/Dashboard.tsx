import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/store';
import { fetchAnalytics } from '@/store/slices/analyticsSlice';
import { Users, MapPin, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const metrics = [
  {
    title: 'Total Users',
    value: '12,543',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Active Trips',
    value: '342',
    change: '+8.2%',
    trend: 'up',
    icon: MapPin,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Revenue',
    value: '$48,392',
    change: '+23.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Bookings',
    value: '1,284',
    change: '-3.2%',
    trend: 'down',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export function Dashboard() {
  const dispatch = useDispatch();
  const { metrics: analyticsMetrics, loading } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                <metric.icon className={cn('h-4 w-4', metric.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                  <div className="text-xs text-gray-500">User #{1234 + i}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 mb-2 text-blue-600" />
                <p className="font-medium text-sm">Add User</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <MapPin className="h-6 w-6 mb-2 text-green-600" />
                <p className="font-medium text-sm">Create Trip</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <Calendar className="h-6 w-6 mb-2 text-purple-600" />
                <p className="font-medium text-sm">View Bookings</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <DollarSign className="h-6 w-6 mb-2 text-emerald-600" />
                <p className="font-medium text-sm">Finance Report</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
