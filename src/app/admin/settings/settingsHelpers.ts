'use client';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type User = Database['public']['Tables']['user']['Row'];

export interface BusinessSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  businessHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  serviceCategories: string[];
  defaultRates: {
    serviceType: string;
    rate: number;
    unit: string;
  }[];
}

export interface SystemSettings {
  emailNotifications: {
    newBooking: boolean;
    bookingUpdates: boolean;
    lowInventory: boolean;
    dailyReports: boolean;
  };
  defaultPreferences: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
}

export async function fetchUsers() {
  const { data: users, error } = await supabase
    .from('user')
    .select('*')
    .order('firstName');

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  return users;
}

export async function updateUserRole(userId: string, role: string) {
  const { error } = await supabase
    .from('user')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function fetchServiceCategories() {
  const { data, error } = await supabase
    .rpc('get_service_categories');

  if (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories');
  }

  return data;
}

export async function addServiceCategory(category: string) {
  const { data, error } = await supabase
    .rpc('add_service_category', { new_cat: category });

  if (error) {
    console.error('Error adding service category:', error);
    throw new Error('Failed to add service category');
  }

  return data;
}

// Note: These would typically be stored in a settings table
// For now, we'll use mock data
export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  return {
    companyName: 'Rockhouse ATL',
    email: 'contact@rockhouseatl.com',
    phone: '(404) 555-0123',
    address: 'Atlanta, GA',
    businessHours: [
      { day: 'Monday', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Tuesday', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Wednesday', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Thursday', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Friday', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
      { day: 'Sunday', open: '00:00', close: '00:00', isOpen: false },
    ],
    serviceCategories: ['Landscaping', 'Hardscaping', 'Maintenance', 'Design'],
    defaultRates: [
      { serviceType: 'Landscaping', rate: 75, unit: 'hour' },
      { serviceType: 'Hardscaping', rate: 85, unit: 'hour' },
      { serviceType: 'Maintenance', rate: 65, unit: 'hour' },
      { serviceType: 'Design', rate: 95, unit: 'hour' },
    ],
  };
}

export async function fetchSystemSettings(): Promise<SystemSettings> {
  return {
    emailNotifications: {
      newBooking: true,
      bookingUpdates: true,
      lowInventory: true,
      dailyReports: true,
    },
    defaultPreferences: {
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      language: 'en-US',
    },
  };
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>) {
  // Implement settings storage
  console.log('Updating business settings:', settings);
}

export async function updateSystemSettings(settings: Partial<SystemSettings>) {
  // Implement settings storage
  console.log('Updating system settings:', settings);
}
