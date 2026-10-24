'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, X, Trash2, Search, User } from 'lucide-react';
import { generateReferenceNumber } from '../quoteHelpers';
import { supabase } from '@/lib/supabase/client';

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: string;
  unit: string;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function NewQuotePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Customer search state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total whenever items change
  React.useEffect(() => {
    const total = quoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setTotalAmount(total);
  }, [quoteItems]);

  // Search customers when search term changes
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearch.length < 2) {
        setCustomers([]);
        return;
      }

      try {
        const response = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(customerSearch)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search customers');
        }

        const { customers, error } = await response.json();

        if (error) {
          console.error('Error searching customers:', error);
          return;
        }

        setCustomers(customers || []);
      } catch (err) {
        console.error('Customer search error:', err);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [customerSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone || '');
    setCustomerAddress(customer.address || '');
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
    setShowCustomerDropdown(false);
  };

  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerSearch('');
  };

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      item_type: 'service',
      unit: 'each'
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...quoteItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
    }
    
    setQuoteItems(updated);
  };

  const removeQuoteItem = (index: number) => {
    const updated = quoteItems.filter((_, i) => i !== index);
    setQuoteItems(updated);
  };

  const createQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!customerName || !customerEmail || !serviceType) {
        throw new Error('Please fill in customer name, email, and service type');
      }

      // Create quote via API
      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          service_type: serviceType,
          service_description: serviceDescription,
          notes,
          total_amount: totalAmount,
          reference_number: generateReferenceNumber(),
          status: 'draft',
          quote_items: quoteItems.filter(item => item.description.trim())
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quote');
      }

      const newQuote = await response.json();
      
      // Redirect to the new quote
      router.push(`/admin/quotes/${newQuote.id}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create quote: ${errorMessage}`);
      console.error('Create quote error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create New Quote</h1>
        <Button onClick={() => router.back()} variant="outline">
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        {/* Customer Information */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Customer Information</h3>
            {selectedCustomer && (
              <Button 
                onClick={clearCustomerSelection}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            )}
          </div>

          {/* Customer Search */}
          <div className="mb-4 relative customer-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Existing Customer (optional)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full border rounded-md pl-10 pr-4 py-2"
                placeholder="Search by name or email..."
              />
              {selectedCustomer && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            
            {/* Customer Dropdown */}
            {showCustomerDropdown && customers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="John Doe"
                required
                disabled={!!selectedCustomer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="john@example.com"
                required
                disabled={!!selectedCustomer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="(555) 123-4567"
                disabled={!!selectedCustomer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="123 Main St, City, State"
                disabled={!!selectedCustomer}
              />
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Select service type</option>
                <option value="landscaping">Landscaping</option>
                <option value="construction">Construction</option>
                <option value="maintenance">Maintenance</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Description
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                placeholder="Describe the work to be performed..."
              />
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Quote Items</h3>
            <Button onClick={addQuoteItem} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            {quoteItems.length > 0 ? (
              quoteItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-t">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuoteItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateQuoteItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">${item.total_price?.toFixed(2)}</span>
                  </div>
                  <div className="col-span-1">
                    <Button
                      onClick={() => removeQuoteItem(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 border-t text-center text-gray-500">
                No items added yet
              </div>
            )}
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end">
                <div className="text-lg font-bold">
                  Total: ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
            placeholder="Add internal notes about this quote..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            onClick={createQuote}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}