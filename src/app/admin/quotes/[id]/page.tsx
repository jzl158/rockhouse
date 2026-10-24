'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuoteById, updateQuoteStatus, QuoteStatus, updateQuote } from '../quoteHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Pencil, Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { WorkflowNavigator } from '@/app/components/workflow/WorkflowNavigator';

type QuoteItem = {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string;
  unit?: string;
};

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<QuoteItem[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptFormData, setAcceptFormData] = useState({
    preferred_date: '',
    assignment_date: '',
    assigned_employee_id: '',
    notes: ''
  });

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const response = await fetch(`/api/admin/quotes/${params.id}/details`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quote details');
        }
        
        const { quote, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }
        
        setQuote(quote);
        setEditedItems(quote.quote_items || []);
        setAdminNotes(quote.notes || '');
        setTotalAmount(quote.total_amount || 0);
      } catch (err) {
        setError('Failed to load quote details');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuote();
  }, [params.id]);

  // Calculate total when items change
  useEffect(() => {
    const total = editedItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setTotalAmount(total);
  }, [editedItems]);

  const handleStatusUpdate = async (newStatus: typeof QuoteStatus[keyof typeof QuoteStatus]) => {
    setIsUpdating(true);
    try {
      const updatedQuote = await updateQuoteStatus(params.id as string, newStatus);
      setQuote(updatedQuote);
    } catch (err) {
      setError('Failed to update quote status');
      console.error('Error:', err);
    } finally {
      setIsUpdating(false);
    }
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
    setEditedItems([...editedItems, newItem]);
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
    }
    
    setEditedItems(updated);
  };

  const removeQuoteItem = (index: number) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const saveQuoteChanges = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('Saving quote changes:', {
        quoteId: params.id,
        adminNotes,
        totalAmount,
        editedItems
      });

      // Use admin API endpoint to bypass RLS issues
      const response = await fetch(`/api/admin/quotes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: adminNotes,
          total_amount: totalAmount,
          quote_items: editedItems
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save quote changes');
      }

      // Reload the quote to get fresh data
      const refreshResponse = await fetch(`/api/admin/quotes/${params.id}/details`);
      if (refreshResponse.ok) {
        const { quote: refreshedQuote } = await refreshResponse.json();
        setQuote(refreshedQuote);
        setEditedItems(refreshedQuote.quote_items || []);
      }
      setIsEditing(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to save quote changes: ${errorMessage}`);
      console.error('Save quote error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const sendQuoteToCustomer = async () => {
    setIsUpdating(true);
    try {
      const updatedQuote = await updateQuoteStatus(params.id as string, QuoteStatus.SENT);
      setQuote(updatedQuote);
      // TODO: Send email to customer
    } catch (err) {
      setError('Failed to send quote');
      console.error('Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const acceptQuoteAndCreateBooking = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/quotes/${params.id}/convert-to-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceptFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert quote to booking');
      }

      const result = await response.json();
      
      // Show success message and redirect to booking
      alert(`Quote successfully converted to booking ${result.booking.reference_number}!`);
      
      // Redirect to the new booking page
      router.push(`/admin/bookings`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept quote');
      console.error('Error accepting quote:', err);
    } finally {
      setIsUpdating(false);
      setShowAcceptModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Quote not found'}</p>
        <Button
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Quote Details</h1>
        <div className="flex gap-2">
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Quote
            </Button>
          )}
          <Button onClick={() => router.back()}>Back to Quotes</Button>
        </div>
      </div>

      <WorkflowNavigator 
        currentType="quote" 
        currentId={params.id as string}
        quoteId={params.id as string}
        bookingId={quote?.booking_id}
      />

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-medium">{quote.customer_name}</h2>
            <p className="text-gray-600">{quote.reference_number}</p>
          </div>
          <Badge className="text-lg">{quote.status}</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <p>Email: {quote.customer_email}</p>
            {quote.customer_phone && <p>Phone: {quote.customer_phone}</p>}
            {quote.customer_address && <p>Address: {quote.customer_address}</p>}
          </div>

          <div>
            <h3 className="font-medium mb-2">Service Details</h3>
            <p>Type: {quote.service_type}</p>
            {quote.service_description && (
              <p className="mt-2">Description: {quote.service_description}</p>
            )}
          </div>
        </div>

        {/* Quote Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Quote Items</h3>
            {isEditing && (
              <Button onClick={addQuoteItem} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
          
          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              {isEditing && <div className="col-span-1">Actions</div>}
            </div>
            
            {editedItems.length > 0 ? (
              editedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-t">
                  <div className="col-span-5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Item description"
                      />
                    ) : (
                      <span>{item.description}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    ) : (
                      <span>{item.quantity}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateQuoteItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span>${item.unit_price?.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">${item.total_price?.toFixed(2)}</span>
                  </div>
                  {isEditing && (
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
                  )}
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

        {/* Admin Notes */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Admin Notes</h3>
          {isEditing ? (
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Add internal notes about this quote..."
            />
          ) : (
            <p className="text-gray-600">{adminNotes || 'No notes added'}</p>
          )}
        </div>

        {/* Images Section */}
        {quote.project_documents && quote.project_documents.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-4">Attached Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {quote.project_documents.map((doc: any) => (
                <div key={doc.id} className="relative group">
                  <img
                    src={doc.file_path}
                    alt={doc.title || 'Quote image'}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          {isEditing ? (
            <>
              <Button
                onClick={saveQuoteChanges}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedItems(quote.quote_items || []);
                  setAdminNotes(quote.notes || '');
                }}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {/* Show Convert to Booking button during editing if quote hasn't been converted yet */}
              {!quote.booking_id && (quote.status === 'draft' || quote.status === 'pending' || quote.status === 'sent') && (
                <Button
                  onClick={() => setShowAcceptModal(true)}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Convert to Booking
                </Button>
              )}
            </>
          ) : (
            <>
              {quote.status === 'draft' && (
                <>
                  <Button
                    onClick={sendQuoteToCustomer}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send to Customer
                  </Button>
                  {!quote.booking_id && (
                    <Button
                      onClick={() => setShowAcceptModal(true)}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Convert to Booking
                    </Button>
                  )}
                </>
              )}
              {(quote.status === 'pending' || quote.status === 'sent') && (
                <>
                  <Button
                    onClick={() => setShowAcceptModal(true)}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Convert to Booking
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(QuoteStatus.REJECTED)}
                    disabled={isUpdating}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Reject Quote
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Created: {format(new Date(quote.created_at), 'PPP')}</p>
          {quote.valid_until && (
            <p>Valid until: {format(new Date(quote.valid_until), 'PPP')}</p>
          )}
        </div>
      </Card>

      {/* Convert to Booking Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Convert Quote to Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will accept the quote and create a new booking with the quote details.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={acceptFormData.preferred_date}
                  onChange={(e) => setAcceptFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assignment Date</label>
                <input
                  type="date"
                  value={acceptFormData.assignment_date}
                  onChange={(e) => setAcceptFormData(prev => ({ ...prev, assignment_date: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  value={acceptFormData.notes}
                  onChange={(e) => setAcceptFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Any additional notes for the booking..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={acceptQuoteAndCreateBooking}
                disabled={isUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? 'Converting...' : 'Create Booking'}
              </Button>
              <Button
                onClick={() => setShowAcceptModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
