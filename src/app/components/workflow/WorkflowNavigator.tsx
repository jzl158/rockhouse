'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, Calendar, Receipt } from 'lucide-react';

interface WorkflowStep {
  id: string;
  reference: string;
  status: string;
  type: 'quote' | 'booking' | 'invoice';
  href: string;
  isActive?: boolean;
}

interface WorkflowNavigatorProps {
  currentType: 'quote' | 'booking' | 'invoice';
  currentId: string;
  bookingId?: string; // For finding related quote and invoice
  quoteId?: string;   // For direct quote reference
}

export function WorkflowNavigator({ 
  currentType, 
  currentId, 
  bookingId, 
  quoteId 
}: WorkflowNavigatorProps) {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflowData();
  }, [currentId, bookingId, quoteId]);

  const loadWorkflowData = async () => {
    try {
      setIsLoading(true);
      const steps: WorkflowStep[] = [];

      // Build workflow based on current type
      if (currentType === 'quote') {
        // Add current quote
        const quoteResponse = await fetch(`/api/admin/quotes/${currentId}/details`);
        if (quoteResponse.ok) {
          const { quote } = await quoteResponse.json();
          steps.push({
            id: quote.id,
            reference: quote.reference_number,
            status: quote.status,
            type: 'quote',
            href: `/admin/quotes/${quote.id}`,
            isActive: true
          });

          // Check for associated booking
          if (quote.booking_id) {
            const bookingResponse = await fetch(`/api/admin/bookings?booking_id=${quote.booking_id}`);
            if (bookingResponse.ok) {
              const { bookings } = await bookingResponse.json();
              if (bookings && bookings.length > 0) {
                const booking = bookings[0];
                steps.push({
                  id: booking.id,
                  reference: booking.reference_number,
                  status: booking.status,
                  type: 'booking',
                  href: `/admin/bookings`, // Will filter to show this booking
                });

                // Check for invoice
                await checkForInvoice(booking.id, steps);
              }
            }
          }
        }
      } else if (currentType === 'booking') {
        // Find the quote that created this booking
        const quoteResponse = await fetch(`/api/admin/quotes/list`);
        if (quoteResponse.ok) {
          const { quotes } = await quoteResponse.json();
          const relatedQuote = quotes.find((q: any) => q.booking_id === currentId);
          
          if (relatedQuote) {
            steps.push({
              id: relatedQuote.id,
              reference: relatedQuote.reference_number,
              status: relatedQuote.status,
              type: 'quote',
              href: `/admin/quotes/${relatedQuote.id}`,
            });
          }
        }

        // Add current booking (placeholder - would need booking API)
        steps.push({
          id: currentId,
          reference: `BK-${currentId.slice(-6)}`, // Placeholder
          status: 'active',
          type: 'booking',
          href: `/admin/bookings`,
          isActive: true
        });

        // Check for invoice
        await checkForInvoice(currentId, steps);
      } else if (currentType === 'invoice') {
        // For invoice, work backwards to find booking and quote
        const invoiceResponse = await fetch(`/api/admin/invoices`);
        if (invoiceResponse.ok) {
          const { invoices } = await invoiceResponse.json();
          const currentInvoice = invoices.find((inv: any) => inv.id === currentId);
          
          if (currentInvoice && currentInvoice.booking_id) {
            // Find the quote
            const quoteResponse = await fetch(`/api/admin/quotes/list`);
            if (quoteResponse.ok) {
              const { quotes } = await quoteResponse.json();
              const relatedQuote = quotes.find((q: any) => q.booking_id === currentInvoice.booking_id);
              
              if (relatedQuote) {
                steps.push({
                  id: relatedQuote.id,
                  reference: relatedQuote.reference_number,
                  status: relatedQuote.status,
                  type: 'quote',
                  href: `/admin/quotes/${relatedQuote.id}`,
                });
              }
            }

            // Add booking
            steps.push({
              id: currentInvoice.booking_id,
              reference: currentInvoice.bookingReference || `BK-${currentInvoice.booking_id.slice(-6)}`,
              status: 'completed',
              type: 'booking',
              href: `/admin/bookings`,
            });

            // Add current invoice
            steps.push({
              id: currentInvoice.id,
              reference: currentInvoice.invoice_number,
              status: currentInvoice.status,
              type: 'invoice',
              href: `/admin/financials?tab=invoices`,
              isActive: true
            });
          }
        }
      }

      setWorkflowSteps(steps);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForInvoice = async (bookingId: string, steps: WorkflowStep[]) => {
    try {
      const invoiceResponse = await fetch(`/api/admin/invoices?booking_id=${bookingId}`);
      if (invoiceResponse.ok) {
        const { invoices } = await invoiceResponse.json();
        if (invoices && invoices.length > 0) {
          const invoice = invoices[0];
          steps.push({
            id: invoice.id,
            reference: invoice.invoice_number,
            status: invoice.status,
            type: 'invoice',
            href: `/admin/financials?tab=invoices`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking for invoice:', error);
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'invoice': return <Receipt className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStepColor = (type: WorkflowStep['type'], status: string, isActive?: boolean) => {
    if (isActive) return 'bg-blue-100 text-blue-800 border-blue-200';
    
    switch (type) {
      case 'quote':
        if (status === 'accepted') return 'bg-green-100 text-green-800';
        if (status === 'sent') return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
      case 'booking':
        if (status === 'completed') return 'bg-green-100 text-green-800';
        if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
        return 'bg-yellow-100 text-yellow-800';
      case 'invoice':
        if (status === 'paid') return 'bg-green-100 text-green-800';
        if (status === 'sent') return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (workflowSteps.length <= 1) {
    return null; // Don't show navigator if no workflow
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Workflow Progress</div>
      <div className="flex items-center space-x-2 text-sm">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <Link href={step.href} className="hover:opacity-80">
              <Badge 
                variant="outline" 
                className={`flex items-center space-x-1 px-2 py-1 ${getStepColor(step.type, step.status, step.isActive)}`}
              >
                {getStepIcon(step.type)}
                <span className="capitalize">{step.type}</span>
                <span className="font-mono text-xs">{step.reference}</span>
              </Badge>
            </Link>
            {index < workflowSteps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Click on any step to navigate to that stage of the workflow
      </div>
    </div>
  );
}