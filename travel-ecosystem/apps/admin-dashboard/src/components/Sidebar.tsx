import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  UserCog,
  Package,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Trips', href: '/admin/trips', icon: MapPin },
  { name: 'Hosts & Volunteers', href: '/admin/hosts', icon: UserCog },
  { name: 'Gear Rentals', href: '/admin/gear-rentals', icon: Package },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Blog Management', href: '/admin/blog', icon: FileText },
  { name: 'Finance', href: '/admin/finance', icon: DollarSign },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Content & Support', href: '/admin/content', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Travel Ecosystem</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
