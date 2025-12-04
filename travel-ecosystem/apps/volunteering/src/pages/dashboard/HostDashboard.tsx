import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/MainLayout';
import { Button, Badge, Avatar, Card, Tabs, TabPanel, cn } from '../../design-system';

/* ========================================
   HOST DASHBOARD
   Host's management dashboard
   ======================================== */

const HostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Host Dashboard"
      sidebar={<HostSidebar activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      <TabPanel tabId="overview" activeTab={activeTab}>
        <HostOverviewTab />
      </TabPanel>

      <TabPanel tabId="opportunities" activeTab={activeTab}>
        <OpportunitiesTab />
      </TabPanel>

      <TabPanel tabId="applications" activeTab={activeTab}>
        <ApplicationsManagementTab />
      </TabPanel>

      <TabPanel tabId="calendar" activeTab={activeTab}>
        <CalendarTab />
      </TabPanel>

      <TabPanel tabId="messages" activeTab={activeTab}>
        <HostMessagesTab />
      </TabPanel>

      <TabPanel tabId="analytics" activeTab={activeTab}>
        <AnalyticsTab />
      </TabPanel>
    </DashboardLayout>
  );
};

/* Host Sidebar */
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HostSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'opportunities', label: 'My Opportunities', icon: '🏠', badge: 3 },
    { id: 'applications', label: 'Applications', icon: '📝', badge: 8 },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: 5 },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Host Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar
            name="Eco Farm Portugal"
            src="/images/host-logo.jpg"
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Eco Farm Portugal</h3>
            <Badge variant="primary" size="sm">⭐ Superhost</Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">127</p>
          <p className="text-xs text-gray-500">Reviews</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">4.9</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
              activeTab === item.id
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="primary" size="sm">{item.badge}</Badge>
            )}
          </button>
        ))}
      </nav>

      {/* Create New */}
      <div className="p-4">
        <Button fullWidth leftIcon={<PlusIcon className="w-5 h-5" />}>
          Create Opportunity
        </Button>
      </div>
    </div>
  );
};

/* Host Overview Tab */
const HostOverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back! 🌱</h2>
            <p className="text-emerald-100">
              You have 8 new applications waiting for your review
            </p>
          </div>
          <Button className="bg-white text-emerald-600 hover:bg-emerald-50 shrink-0">
            Review Applications
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="👁️"
          label="Profile Views"
          value="1,234"
          trend="+12% vs last month"
          trendUp
        />
        <StatCard
          icon="📝"
          label="Applications"
          value="48"
          trend="+8 this week"
          trendUp
        />
        <StatCard
          icon="✅"
          label="Confirmed"
          value="12"
          trend="Next 3 months"
        />
        <StatCard
          icon="⭐"
          label="Rating"
          value="4.9"
          trend="Based on 127 reviews"
        />
      </div>

      {/* Upcoming Volunteers */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Volunteers</h3>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
            View calendar
          </a>
        </div>
        <div className="space-y-4">
          <UpcomingVolunteer
            name="Sarah Johnson"
            avatar="/images/volunteers/sarah.jpg"
            dates="Dec 15 - Jan 5"
            status="confirmed"
          />
          <UpcomingVolunteer
            name="Thomas Brown"
            avatar="/images/volunteers/thomas.jpg"
            dates="Dec 20 - Dec 30"
            status="confirmed"
          />
          <UpcomingVolunteer
            name="Emma Wilson"
            avatar="/images/volunteers/emma.jpg"
            dates="Jan 10 - Feb 15"
            status="pending"
          />
        </div>
      </Card>

      {/* Recent Applications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">New Applications</h3>
          <Badge variant="primary">8 pending</Badge>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ApplicationPreview key={i} />
          ))}
        </div>
        <Button variant="outline" fullWidth className="mt-4">
          View All Applications
        </Button>
      </Card>
    </div>
  );
};

/* Opportunities Tab */
const OpportunitiesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Opportunities</h2>
        <Button leftIcon={<PlusIcon className="w-5 h-5" />}>
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        <OpportunityManageCard
          title="Organic Farm Experience"
          status="active"
          views={456}
          applications={12}
        />
        <OpportunityManageCard
          title="Summer Garden Helper"
          status="active"
          views={234}
          applications={8}
        />
        <OpportunityManageCard
          title="Winter Harvest Support"
          status="draft"
          views={0}
          applications={0}
        />
      </div>
    </div>
  );
};

/* Applications Management Tab */
const ApplicationsManagementTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Applications</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">All (48)</Button>
          <Button variant="secondary" size="sm">Pending (8)</Button>
          <Button variant="ghost" size="sm">Accepted (32)</Button>
          <Button variant="ghost" size="sm">Declined (8)</Button>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <ApplicationDetailCard key={i} />
        ))}
      </div>
    </div>
  );
};

/* Calendar Tab */
const CalendarTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Availability Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="ghost" size="sm">◀</Button>
          <span className="px-3 py-1 font-medium">December 2024</span>
          <Button variant="ghost" size="sm">▶</Button>
        </div>
      </div>

      <Card>
        <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Calendar Component - Integrate with react-big-calendar or similar</p>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded" />
          <span className="text-sm text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded" />
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded" />
          <span className="text-sm text-gray-600">Blocked</span>
        </div>
      </div>
    </div>
  );
};

/* Host Messages Tab */
const HostMessagesTab: React.FC = () => {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversation List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <HostConversationItem key={i} active={i === 1} unread={i <= 2} />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name="Sarah Johnson" size="sm" status="online" />
              <div>
                <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                <p className="text-xs text-emerald-600">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">View Profile</Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Chat messages would go here */}
            <div className="text-center text-gray-500 text-sm">
              Start of conversation
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button>
                <SendIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

/* Analytics Tab */
const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Analytics & Insights</h2>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm">Last 7 days</Button>
        <Button variant="ghost" size="sm">Last 30 days</Button>
        <Button variant="ghost" size="sm">Last 3 months</Button>
        <Button variant="ghost" size="sm">Last year</Button>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Profile Views</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Applications Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Volunteer Demographics</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Response Rate</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* Helper Components */
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ icon, label, value, trend, trendUp }) => (
  <Card variant="outlined" padding="sm">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {trend && (
      <p className={cn('text-xs mt-1', trendUp ? 'text-emerald-600' : 'text-gray-500')}>
        {trend}
      </p>
    )}
  </Card>
);

const UpcomingVolunteer: React.FC<{
  name: string;
  avatar: string;
  dates: string;
  status: 'confirmed' | 'pending';
}> = ({ name, avatar, dates, status }) => (
  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
    <Avatar src={avatar} name={name} />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900">{name}</h4>
      <p className="text-sm text-gray-500">{dates}</p>
    </div>
    <Badge variant={status === 'confirmed' ? 'success' : 'warning'}>
      {status}
    </Badge>
  </div>
);

const ApplicationPreview: React.FC = () => (
  <div className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
    <Avatar name="John Doe" size="md" />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900">John Doe</h4>
      <p className="text-sm text-gray-500 truncate">
        Hi! I'm interested in your farm experience...
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs text-gray-400">2h ago</p>
      <Badge variant="warning" size="sm">New</Badge>
    </div>
  </div>
);

const OpportunityManageCard: React.FC<{
  title: string;
  status: 'active' | 'draft' | 'paused';
  views: number;
  applications: number;
}> = ({ title, status, views, applications }) => (
  <Card variant="outlined" className="flex items-center gap-4">
    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0" />
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
        <span>{views} views</span>
        <span>{applications} applications</span>
      </div>
    </div>
    <Badge
      variant={status === 'active' ? 'success' : status === 'draft' ? 'default' : 'warning'}
    >
      {status}
    </Badge>
    <Button variant="ghost" size="sm">Edit</Button>
  </Card>
);

const ApplicationDetailCard: React.FC = () => (
  <Card variant="outlined">
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <Avatar name="Sarah Johnson" size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
          <Badge variant="primary" size="sm">Digital Nomad</Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Dec 15, 2024 - Jan 5, 2025 • From United States
        </p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          Hi! I'm excited about your farm experience. I have some gardening experience
          and I'm eager to learn more about permaculture...
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="outline" size="sm">Decline</Button>
        <Button size="sm">Accept</Button>
      </div>
    </div>
  </Card>
);

const HostConversationItem: React.FC<{ active?: boolean; unread?: boolean }> = ({
  active,
  unread,
}) => (
  <div className={cn(
    'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
    active && 'bg-primary-50'
  )}>
    <div className="flex items-center gap-3">
      <Avatar name="Sarah Johnson" size="sm" status="online" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={cn('text-sm', unread ? 'font-semibold text-gray-900' : 'text-gray-700')}>
            Sarah Johnson
          </h4>
          <span className="text-xs text-gray-400">2h</span>
        </div>
        <p className={cn('text-xs truncate', unread ? 'text-gray-900' : 'text-gray-500')}>
          Thank you for accepting my application!
        </p>
      </div>
      {unread && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
    </div>
  </div>
);

/* Icons */
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export default HostDashboard;
