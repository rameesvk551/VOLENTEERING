import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/MainLayout';
import { Button, Badge, Avatar, Card, Tabs, TabPanel, cn } from '../../design-system';

/* ========================================
   USER DASHBOARD
   Volunteer's personal dashboard
   ======================================== */

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', badge: undefined },
    { id: 'applications', label: 'Applications', badge: 3 },
    { id: 'saved', label: 'Saved', badge: 12 },
    { id: 'messages', label: 'Messages', badge: 2 },
    { id: 'settings', label: 'Settings', badge: undefined },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      sidebar={<DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {/* Mobile Tabs */}
      <div className="lg:hidden mb-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />
      </div>

      <TabPanel tabId="overview" activeTab={activeTab}>
        <OverviewTab />
      </TabPanel>

      <TabPanel tabId="applications" activeTab={activeTab}>
        <ApplicationsTab />
      </TabPanel>

      <TabPanel tabId="saved" activeTab={activeTab}>
        <SavedTab />
      </TabPanel>

      <TabPanel tabId="messages" activeTab={activeTab}>
        <MessagesTab />
      </TabPanel>

      <TabPanel tabId="settings" activeTab={activeTab}>
        <SettingsTab />
      </TabPanel>
    </DashboardLayout>
  );
};

/* Dashboard Sidebar */
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'applications', label: 'My Applications', icon: ClipboardIcon, badge: 3 },
    { id: 'saved', label: 'Saved Opportunities', icon: HeartIcon, badge: 12 },
    { id: 'messages', label: 'Messages', icon: ChatIcon, badge: 2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* User Card */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar
            name="John Doe"
            src="/images/user-avatar.jpg"
            size="lg"
            status="online"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">John Doe</h3>
            <p className="text-sm text-gray-500">Volunteer</p>
          </div>
        </div>
        <Button variant="outline" size="sm" fullWidth className="mt-3">
          View Profile
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
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
              <Icon className="w-5 h-5" />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant="primary" size="sm">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Complete Profile CTA */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold text-primary-900">Complete your profile</span>
          </div>
          <p className="text-sm text-primary-700 mb-3">
            Hosts are 3x more likely to accept complete profiles
          </p>
          <div className="w-full bg-primary-200 rounded-full h-2 mb-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-primary-600">65% complete</p>
        </div>
      </div>
    </div>
  );
};

/* Overview Tab */
const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h2>
            <p className="text-primary-100">
              You have 3 new responses to your applications. Check them out!
            </p>
          </div>
          <Button className="bg-white text-primary-600 hover:bg-primary-50 shrink-0">
            View Applications
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Applications Sent" value="12" trend="+3 this week" />
        <StatCard label="Accepted" value="5" trend="42% rate" />
        <StatCard label="Saved Opportunities" value="24" />
        <StatCard label="Profile Views" value="89" trend="+15%" trendUp />
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </a>
        </div>
        <div className="space-y-4">
          <ActivityItem
            type="accepted"
            title="Application Accepted!"
            description="Eco Farm Portugal has accepted your application"
            time="2 hours ago"
          />
          <ActivityItem
            type="message"
            title="New Message"
            description="Maria from Beach Hostel Thailand sent you a message"
            time="5 hours ago"
          />
          <ActivityItem
            type="reminder"
            title="Complete Your Profile"
            description="Add your skills to get better matches"
            time="1 day ago"
          />
        </div>
      </Card>

      {/* Recommended Opportunities */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          <a href="/explore" className="text-sm text-primary-600 hover:text-primary-700">
            See more
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <MiniOpportunityCard key={i} />
          ))}
        </div>
      </Card>
    </div>
  );
};

/* Applications Tab */
const ApplicationsTab: React.FC = () => {
  const applications = [
    { id: '1', host: 'Eco Farm Portugal', status: 'accepted', date: '2 days ago' },
    { id: '2', host: 'Beach Hostel Thailand', status: 'pending', date: '5 days ago' },
    { id: '3', host: 'Mountain Lodge Nepal', status: 'pending', date: '1 week ago' },
    { id: '4', host: 'Wildlife Sanctuary', status: 'declined', date: '2 weeks ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">All</Button>
          <Button variant="ghost" size="sm">Pending</Button>
          <Button variant="ghost" size="sm">Accepted</Button>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <ApplicationCard key={app.id} {...app} />
        ))}
      </div>
    </div>
  );
};

/* Saved Tab */
const SavedTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Saved Opportunities</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <MiniOpportunityCard key={i} showRemove />
        ))}
      </div>
    </div>
  );
};

/* Messages Tab */
const MessagesTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <ConversationItem key={i} active={i === 1} />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Avatar name="Maria Santos" size="sm" />
            <div>
              <h4 className="font-medium text-gray-900">Maria Santos</h4>
              <p className="text-xs text-gray-500">Eco Farm Portugal</p>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <p className="text-center text-gray-500 text-sm">Chat messages here</p>
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Settings Tab */
const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <SettingRow label="Email" value="john@example.com" />
          <SettingRow label="Phone" value="+1 234 567 890" />
          <SettingRow label="Location" value="San Francisco, USA" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          <SettingToggle label="Email notifications" enabled />
          <SettingToggle label="Push notifications" enabled />
          <SettingToggle label="Marketing emails" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-4">
          <SettingToggle label="Show profile publicly" enabled />
          <SettingToggle label="Allow messages from hosts" enabled />
        </div>
      </Card>
    </div>
  );
};

/* Helper Components */
const StatCard: React.FC<{
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ label, value, trend, trendUp }) => (
  <Card variant="outlined" padding="sm">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {trend && (
      <p className={cn('text-xs mt-1', trendUp ? 'text-emerald-600' : 'text-gray-500')}>
        {trend}
      </p>
    )}
  </Card>
);

const ActivityItem: React.FC<{
  type: 'accepted' | 'message' | 'reminder';
  title: string;
  description: string;
  time: string;
}> = ({ type, title, description, time }) => {
  const icons = {
    accepted: '✅',
    message: '💬',
    reminder: '🔔',
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
        {icons[type]}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

const MiniOpportunityCard: React.FC<{ showRemove?: boolean }> = ({ showRemove }) => (
  <div className="bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors">
    <div className="aspect-video bg-gray-200" />
    <div className="p-3">
      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">Eco Farm Portugal</h4>
      <p className="text-xs text-gray-500">Sintra, Portugal</p>
      {showRemove && (
        <button className="text-xs text-red-500 mt-2">Remove</button>
      )}
    </div>
  </div>
);

const ApplicationCard: React.FC<{
  host: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}> = ({ host, status, date }) => {
  const statusColors = {
    pending: 'warning',
    accepted: 'success',
    declined: 'error',
  } as const;

  return (
    <Card variant="outlined" className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900">{host}</h4>
        <p className="text-sm text-gray-500">Applied {date}</p>
      </div>
      <Badge variant={statusColors[status]}>{status}</Badge>
    </Card>
  );
};

const ConversationItem: React.FC<{ active?: boolean }> = ({ active }) => (
  <div className={cn('p-4 cursor-pointer hover:bg-gray-50', active && 'bg-primary-50')}>
    <div className="flex items-center gap-3">
      <Avatar name="Maria Santos" size="sm" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm">Maria Santos</h4>
        <p className="text-xs text-gray-500 truncate">Looking forward to hosting you!</p>
      </div>
      <span className="text-xs text-gray-400">2h</span>
    </div>
  </div>
);

const SettingRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const SettingToggle: React.FC<{ label: string; enabled?: boolean }> = ({ label, enabled }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-600">{label}</span>
    <button className={cn(
      'w-11 h-6 rounded-full transition-colors',
      enabled ? 'bg-primary-500' : 'bg-gray-200'
    )}>
      <span className={cn(
        'block w-5 h-5 bg-white rounded-full shadow transition-transform',
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  </div>
);

/* Icons */
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default UserDashboard;
