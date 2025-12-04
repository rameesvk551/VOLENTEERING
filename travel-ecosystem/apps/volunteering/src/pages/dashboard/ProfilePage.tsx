import React, { useState } from 'react';
import { Button, Card, Input, TextArea, Avatar, Badge, cn } from '../../design-system';
import { DashboardLayout } from '../../layouts/MainLayout';

/* ========================================
   USER PROFILE PAGE
   Complete profile editing with sections
   ======================================== */

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'about', label: 'About Me', icon: '📝' },
    { id: 'skills', label: 'Skills & Experience', icon: '⭐' },
    { id: 'travel', label: 'Travel Preferences', icon: '🌍' },
    { id: 'verification', label: 'Verification', icon: '✅' },
  ];

  return (
    <DashboardLayout title="Edit Profile">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card padding="sm">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Avatar
                  name="John Doe"
                  src="/images/user-avatar.jpg"
                  size="2xl"
                />
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors">
                  <CameraIcon className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mt-4">John Doe</h3>
              <p className="text-sm text-gray-500">Member since 2023</p>
            </div>

            {/* Profile Completion */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Profile Completion</span>
                <span className="text-sm font-semibold text-primary-600">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <span>{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'personal' && <PersonalInfoSection />}
          {activeSection === 'about' && <AboutMeSection />}
          {activeSection === 'skills' && <SkillsSection />}
          {activeSection === 'travel' && <TravelPreferencesSection />}
          {activeSection === 'verification' && <VerificationSection />}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* Section Components */
const PersonalInfoSection: React.FC = () => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" defaultValue="John" />
          <Input label="Last Name" placeholder="Doe" defaultValue="Doe" />
        </div>

        <Input label="Email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Phone" placeholder="+1 234 567 890" />
          <Input label="Date of Birth" type="date" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Country" placeholder="United States" defaultValue="United States" />
          <Input label="City" placeholder="San Francisco" defaultValue="San Francisco" />
        </div>

        <div className="pt-4 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};

const AboutMeSection: React.FC = () => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-6">About Me</h2>

      <div className="space-y-6">
        <TextArea
          label="Bio"
          placeholder="Tell hosts about yourself, your interests, and why you love volunteering..."
          rows={6}
          hint="This will be visible to hosts when you apply"
        />

        <Input label="Occupation" placeholder="Software Developer" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Languages You Speak
          </label>
          <div className="flex flex-wrap gap-2">
            {['English', 'Spanish'].map((lang) => (
              <Badge key={lang} variant="secondary" removable onRemove={() => {}}>
                {lang}
              </Badge>
            ))}
            <button className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-full">
              + Add Language
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {['Farming', 'Photography', 'Hiking', 'Cooking'].map((interest) => (
              <Badge key={interest} variant="outline" removable onRemove={() => {}}>
                {interest}
              </Badge>
            ))}
            <button className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-full">
              + Add Interest
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};

const SkillsSection: React.FC = () => {
  const skillCategories = [
    {
      title: 'Farming & Gardening',
      skills: ['Organic Gardening', 'Permaculture', 'Animal Care', 'Composting'],
    },
    {
      title: 'Hospitality',
      skills: ['Cooking', 'Cleaning', 'Reception', 'Customer Service'],
    },
    {
      title: 'Teaching',
      skills: ['Language Teaching', 'Music', 'Art', 'Sports'],
    },
    {
      title: 'Technical',
      skills: ['Web Development', 'Photography', 'Video Editing', 'Social Media'],
    },
  ];

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Skills & Experience</h2>

      <div className="space-y-6">
        {skillCategories.map((category) => (
          <div key={category.title}>
            <h3 className="font-medium text-gray-900 mb-3">{category.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {category.skills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <TextArea
          label="Work Experience (Optional)"
          placeholder="Describe any relevant work or volunteering experience..."
          rows={4}
        />

        <div className="pt-4 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};

const TravelPreferencesSection: React.FC = () => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Travel Preferences</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Destinations
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              'Europe',
              'Asia',
              'South America',
              'Africa',
              'North America',
              'Oceania',
            ].map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">{region}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Opportunity Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Farming',
              'Hostels',
              'Eco Projects',
              'Teaching',
              'Animal Care',
              'Art & Culture',
            ].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Available From" type="date" />
          <Input label="Available Until" type="date" />
        </div>

        <div className="pt-4 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};

const VerificationSection: React.FC = () => {
  const verifications = [
    {
      id: 'email',
      title: 'Email Address',
      description: 'Verify your email address',
      status: 'verified',
    },
    {
      id: 'phone',
      title: 'Phone Number',
      description: 'Add and verify your phone number',
      status: 'pending',
    },
    {
      id: 'id',
      title: 'Government ID',
      description: 'Upload a photo of your ID for verification',
      status: 'not-started',
    },
    {
      id: 'social',
      title: 'Social Profiles',
      description: 'Link your LinkedIn or other profiles',
      status: 'not-started',
    },
  ];

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Verification</h2>
      <p className="text-gray-500 mb-6">
        Complete verifications to build trust with hosts and increase your acceptance rate
      </p>

      <div className="space-y-4">
        {verifications.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  item.status === 'verified'
                    ? 'bg-emerald-100'
                    : item.status === 'pending'
                    ? 'bg-amber-100'
                    : 'bg-gray-100'
                )}
              >
                {item.status === 'verified' ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                ) : item.status === 'pending' ? (
                  <ClockIcon className="w-6 h-6 text-amber-600" />
                ) : (
                  <ShieldIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>

            {item.status === 'verified' ? (
              <Badge variant="success">Verified</Badge>
            ) : item.status === 'pending' ? (
              <Badge variant="warning">Pending</Badge>
            ) : (
              <Button variant="outline" size="sm">
                Verify
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-50 rounded-xl">
        <h4 className="font-semibold text-primary-900 mb-2">
          🏆 Become a Verified Volunteer
        </h4>
        <p className="text-sm text-primary-700">
          Complete all verifications to earn a "Verified" badge on your profile.
          Verified volunteers are 4x more likely to get accepted by hosts.
        </p>
      </div>
    </Card>
  );
};

/* Icons */
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default ProfilePage;
