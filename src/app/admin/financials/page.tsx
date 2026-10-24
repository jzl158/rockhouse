'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  FileText,
  AlertCircle,
  Calendar,
  Users,
  PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { WorkflowNavigator } from '@/app/components/workflow/WorkflowNavigator';

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  cashFlow: number;
}

interface RecentTransaction {
  id: string;
  type: 'payment' | 'expense' | 'invoice';
  amount: number;
  description: string;
  date: string;
  status: string;
  customer?: string;
}

interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: string;
  daysOverdue?: number;
}

export default function AdminFinancials() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState<OutstandingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'payments'>('overview');

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch financial metrics
      const [metricsResponse, transactionsResponse, outstandingResponse] = await Promise.all([
        fetch('/api/admin/financials?action=metrics'),
        fetch('/api/admin/financials?action=transactions'),
        fetch('/api/admin/financials?action=outstanding')
      ]);

      if (!metricsResponse.ok || !transactionsResponse.ok || !outstandingResponse.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const { metrics } = await metricsResponse.json();
      const { transactions } = await transactionsResponse.json();
      const { outstandingInvoices } = await outstandingResponse.json();

      setMetrics(metrics);
      setRecentTransactions(transactions);
      setOutstandingInvoices(outstandingInvoices);
      setError(null);
    } catch (err) {
      setError('Failed to load financial data');
      console.error('Financial data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'invoice') {
      switch (status) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    if (type === 'payment') {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-blue-100 text-blue-800';
  };

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
          onClick={loadFinancialData}
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
        <h1 className="text-2xl font-semibold">Financial Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: DollarSign },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'payments', label: 'Payments', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <h3 className="text-2xl font-semibold">${metrics?.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-green-600">↑ ${metrics?.monthlyRevenue.toFixed(2)}</span> this month
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <h3 className="text-2xl font-semibold">${metrics?.totalExpenses.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-red-600">↑ ${metrics?.monthlyExpenses.toFixed(2)}</span> this month
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <h3 className="text-2xl font-semibold">${metrics?.netProfit.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-blue-600">↑ ${metrics?.cashFlow.toFixed(2)}</span> cash flow
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <h3 className="text-2xl font-semibold">${metrics?.outstandingInvoices.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                From invoices
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'payment' ? 'bg-green-100' :
                        transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'payment' ? <DollarSign className="h-4 w-4 text-green-600" /> :
                         transaction.type === 'expense' ? <Receipt className="h-4 w-4 text-red-600" /> :
                         <FileText className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(transaction.status, transaction.type)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Outstanding Invoices */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Outstanding Invoices</h2>
              <div className="space-y-4">
                {outstandingInvoices.map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.customerName}</p>
                      <p className="text-xs text-gray-500">
                        Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                        {invoice.daysOverdue && (
                          <span className="text-red-500 ml-2">
                            ({invoice.daysOverdue} days overdue)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                      <Badge className={getStatusColor(invoice.status, 'invoice')}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'invoices' && (
        <InvoiceManagement />
      )}

      {activeTab === 'expenses' && (
        <ExpenseTracking />
      )}

      {activeTab === 'payments' && (
        <PaymentTracking />
      )}
    </div>
  );
}

// Invoice Management Component
function InvoiceManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      
      const { invoices } = await response.json();
      setInvoices(invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status: 'paid' })
      });

      if (!response.ok) throw new Error('Failed to mark invoice as paid');
      
      // Refresh the invoices list
      loadInvoices();
      alert('Invoice marked as paid successfully!');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid');
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_email' })
      });

      if (!response.ok) throw new Error('Failed to send invoice');
      
      const result = await response.json();
      // Refresh the invoices list
      loadInvoices();
      alert(`Invoice sent successfully to ${result.recipient}!`);
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Invoice Management</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full pl-4 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Invoice #</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Due Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Workflow</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{invoice.invoice_number}</td>
                    <td className="p-4">{invoice.customerName || 'Unknown'}</td>
                    <td className="p-4">${invoice.total_amount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(invoice.status || 'draft', 'invoice')}>
                        {invoice.status || 'draft'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="scale-75 origin-left">
                        <WorkflowNavigator 
                          currentType="invoice" 
                          currentId={invoice.id}
                          bookingId={invoice.booking_id}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        {invoice.status !== 'paid' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markInvoiceAsPaid(invoice.id)}
                            >
                              Mark Paid
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendInvoice(invoice.id)}
                            >
                              Send
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadInvoices();
          }}
        />
      )}
    </div>
  );
}

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    bookingId: '',
    customerName: '',
    customerEmail: '',
    dueDate: '',
    notes: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings?for_invoice=true');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = { ...newLineItems[index], [field]: value };
      
      // Recalculate total for this line item
      if (field === 'quantity' || field === 'unitPrice') {
        newLineItems[index].total = newLineItems[index].quantity * newLineItems[index].unitPrice;
      }
      
      return { ...prev, lineItems: newLineItems };
    });
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create invoice');
      
      onCreated();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Create New Invoice</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Booking</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.bookingId}
                onChange={(e) => {
                  const booking = bookings.find(b => b.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    bookingId: e.target.value,
                    customerName: booking?.customer_name || '',
                    customerEmail: booking?.customer_email || ''
                  }));
                }}
              >
                <option value="">Select a booking</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.reference_number} - {booking.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Line Items</h4>
              <Button type="button" onClick={addLineItem} variant="outline">
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-50"
                      value={`$${item.total.toFixed(2)}`}
                      readOnly
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or terms..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Expense Tracking Component
function ExpenseTracking() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      const { expenses } = await response.json();
      setExpenses(expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update expense');
      
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, status } : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense status');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const expenseCategories = [
    'Equipment', 'Supplies', 'Transportation', 'Maintenance', 
    'Marketing', 'Office', 'Utilities', 'Insurance', 'Other'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Expense Tracking</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-4 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {expenseCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          className="border rounded-md px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="reimbursed">Reimbursed</option>
        </select>
      </div>

      {/* Expenses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Description</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {expense.expense_date ? format(new Date(expense.expense_date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="p-4 font-medium">{expense.description}</td>
                    <td className="p-4">
                      <Badge variant="outline">{expense.category}</Badge>
                    </td>
                    <td className="p-4">{expense.vendor || 'N/A'}</td>
                    <td className="p-4 font-medium">${expense.amount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <Badge className={getExpenseStatusColor(expense.status || 'pending')}>
                        {expense.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {expense.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateExpenseStatus(expense.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateExpenseStatus(expense.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {expense.status === 'approved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateExpenseStatus(expense.id, 'reimbursed')}
                          >
                            Mark Reimbursed
                          </Button>
                        )}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <CreateExpenseModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadExpenses();
          }}
        />
      )}
    </div>
  );
}

// Helper function for expense status colors
function getExpenseStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'reimbursed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

// Create Expense Modal Component
function CreateExpenseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    description: '',
    category: 'Equipment',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    paymentMethod: 'company_card',
    notes: '',
    reimbursable: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const expenseCategories = [
    'Equipment', 'Supplies', 'Transportation', 'Maintenance', 
    'Marketing', 'Office', 'Utilities', 'Insurance', 'Other'
  ];

  const paymentMethods = [
    { value: 'company_card', label: 'Company Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'personal_reimbursement', label: 'Personal (Reimbursement)' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (!response.ok) throw new Error('Failed to create expense');
      
      onCreated();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Add New Expense</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expense description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={formData.expenseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vendor</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.reimbursable}
                onChange={(e) => setFormData(prev => ({ ...prev, reimbursable: e.target.checked }))}
              />
              <span className="text-sm font-medium">Reimbursable expense</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}




// Payment Tracking Component
function PaymentTracking() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/payments');
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const { payments } = await response.json();
      setPayments(payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update payment');
      
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? { ...payment, transaction_status: status } : payment
      ));
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.transaction_status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paymentMethods = [
    'cash', 'check', 'credit_card', 'bank_transfer', 'stripe', 'paypal', 'other'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Payment Tracking</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-xl font-semibold">
                ${payments.filter(p => p.transaction_status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-semibold">
                ${payments.filter(p => p.transaction_status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-semibold">
                ${payments.filter(p => p.transaction_status === 'failed').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search payments..."
            className="w-full pl-4 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className="border rounded-md px-4 py-2"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="all">All Methods</option>
          {paymentMethods.map(method => (
            <option key={method} value={method}>
              {method.replace('_', ' ').replace(/\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Method</th>
                <th className="text-left p-4 font-medium">Reference</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {payment.transaction_date ? format(new Date(payment.transaction_date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="p-4 font-medium">{payment.customerName || 'Unknown'}</td>
                    <td className="p-4 font-medium">${payment.amount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {payment.payment_method?.replace('_', ' ').replace(/\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-4">{payment.transaction_reference || 'N/A'}</td>
                    <td className="p-4">
                      <Badge className={getPaymentStatusColor(payment.transaction_status || 'pending')}>
                        {payment.transaction_status || 'pending'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {payment.transaction_status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updatePaymentStatus(payment.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updatePaymentStatus(payment.id, 'failed')}
                            >
                              Mark Failed
                            </Button>
                          </>
                        )}
                        {payment.transaction_status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, 'refunded')}
                          >
                            Refund
                          </Button>
                        )}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <CreatePaymentModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadPayments();
          }}
        />
      )}
    </div>
  );
}

// Helper function for payment status colors
function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'refunded': return 'bg-purple-100 text-purple-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

// Create Payment Modal Component
function CreatePaymentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    bookingId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'cash',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionReference: '',
    notes: ''
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
    loadInvoices();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (!response.ok) throw new Error('Failed to record payment');
      
      onCreated();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Record New Payment</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Booking</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.bookingId}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
              >
                <option value="">Select a booking</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.reference_number} - {booking.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Invoice (Optional)</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.invoiceId}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
              >
                <option value="">Select an invoice</option>
                {invoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - ${invoice.total_amount?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Date *</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={formData.transactionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Transaction Reference</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.transactionReference}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionReference: e.target.value }))}
                placeholder="Check number, transaction ID, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this payment..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
