'use client';

import { useState, useEffect } from 'react';
import { 
  fetchUsers, 
  fetchBusinessSettings, 
  fetchSystemSettings,
  fetchServiceCategories,
  BusinessSettings,
  SystemSettings,
  User
} from './settingsHelpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Settings2,
  Clock,
  Tag,
  DollarSign,
  Bell,
  Globe,
  Mail
} from 'lucide-react';

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          usersData,
          businessData,
          systemData,
          categoriesData
        ] = await Promise.all([
          fetchUsers(),
          fetchBusinessSettings(),
          fetchSystemSettings(),
          fetchServiceCategories()
        ]);

        setUsers(usersData);
        setBusinessSettings(businessData);
        setSystemSettings(systemData);
        setServiceCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">
            <Building2 className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings2 className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          {/* Company Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={businessSettings?.companyName}
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={businessSettings?.email}
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={businessSettings?.phone}
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={businessSettings?.address}
                  onChange={() => {}}
                />
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Business Hours</h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {businessSettings?.businessHours.map(hours => (
                <div key={hours.day} className="flex items-center justify-between">
                  <span className="font-medium w-24">{hours.day}</span>
                  <div className="flex items-center gap-4">
                    <Switch checked={hours.isOpen} />
                    {hours.isOpen ? (
                      <span className="text-sm text-gray-600">
                        {hours.open} - {hours.close}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Service Categories */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Service Categories</h2>
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              {serviceCategories.map(category => (
                <div key={category} className="flex items-center justify-between">
                  <span>{category}</span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                Add Category
              </Button>
            </div>
          </Card>

          {/* Default Rates */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Default Rates</h2>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {businessSettings?.defaultRates.map(rate => (
                <div key={rate.serviceType} className="flex items-center justify-between">
                  <span>{rate.serviceType}</span>
                  <div className="flex items-center gap-2">
                    <span>${rate.rate}/{rate.unit}</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Team Members */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <Button>Add Member</Button>
            </div>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      className="border rounded-md px-3 py-1"
                      value={user.role || ''}
                      onChange={() => {}}
                    >
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                      <option value="customer">Customer</option>
                    </select>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Email Notifications</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {Object.entries(systemSettings?.emailNotifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <Switch checked={value} />
                </div>
              ))}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">System Preferences</h2>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(systemSettings?.defaultPreferences || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={value}
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Email Settings</h2>
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md p-2"
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md p-2"
                  placeholder="587"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email From</label>
                <input
                  type="email"
                  className="mt-1 block w-full border rounded-md p-2"
                  placeholder="noreply@example.com"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}