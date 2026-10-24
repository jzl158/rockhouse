'use client';

import { useState, useEffect } from 'react';
import { fetchQuotes, QuoteWithItems, QuoteStatus } from './quoteHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Search, FileText, Calendar, Receipt, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const response = await fetch('/api/admin/quotes/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        
        const { quotes, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }
        
        setQuotes(quotes);
        setError(null);
      } catch (err) {
        setError('Failed to load quotes');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotes();
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case QuoteStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case QuoteStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case QuoteStatus.SENT:
        return 'bg-blue-100 text-blue-800';
      case QuoteStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <Link href="/admin/quotes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotes..."
            className="pl-10 pr-4 py-2 w-full border rounded-md"
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
          {Object.values(QuoteStatus).map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredQuotes.map(quote => (
          <Link key={quote.id} href={`/admin/quotes/${quote.id}`}>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{quote.customer_name}</h3>
                    <Badge variant="outline">{quote.reference_number}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{quote.service_type}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {quote.quote_items.length} items · Total: ${quote.total_amount?.toFixed(2)}
                  </p>
                  
                  {/* Workflow Status Indicator */}
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 text-blue-500" />
                      <span className="ml-1">Quote</span>
                    </div>
                    
                    {(quote as any).workflow_status?.booking ? (
                      <>
                        <ArrowRight className="h-3 w-3 mx-1 text-green-500" />
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-green-500" />
                          <span className="ml-1 text-green-600">Booking</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-3 w-3 mx-1 text-gray-300" />
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-300" />
                          <span className="ml-1">Booking</span>
                        </div>
                      </>
                    )}
                    
                    {(quote as any).workflow_status?.invoice ? (
                      <>
                        <ArrowRight className="h-3 w-3 mx-1 text-green-500" />
                        <div className="flex items-center">
                          <Receipt className="h-3 w-3 text-green-500" />
                          <span className="ml-1 text-green-600">Invoice</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-3 w-3 mx-1 text-gray-300" />
                        <div className="flex items-center">
                          <Receipt className="h-3 w-3 text-gray-300" />
                          <span className="ml-1">Invoice</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status || 'Draft'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {format(new Date(quote.created_at!), 'MMM d, yyyy')}
                  </p>
                  {quote.valid_until && (
                    <p className="text-xs text-gray-500">
                      Valid until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No quotes found</p>
          </div>
        )}
      </div>
    </div>
  );
}