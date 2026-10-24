'use client';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteItem = Database['public']['Tables']['quote_items']['Row'];

type ProjectDocument = Database['public']['Tables']['project_documents']['Row'];

export interface QuoteWithItems extends Quote {
  quote_items: QuoteItem[];
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  project_documents?: ProjectDocument[];
}

export const QuoteStatus = {
  PENDING: 'pending',
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', quoteId);

  if (error) {
    console.error('Error updating quote status:', error);
    throw new Error('Failed to update quote status');
  }

  return await fetchQuoteById(quoteId);
}

export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus];

export async function getPendingQuotesCount() {
  const { count, error } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending quotes count:', error);
    throw new Error('Failed to fetch pending quotes count');
  }

  return count || 0;
}

export async function fetchQuotes() {
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items (
        *
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    throw new Error('Failed to fetch quotes');
  }

  return quotes as QuoteWithItems[];
}

export async function fetchQuoteById(quoteId: string) {
  console.log('fetchQuoteById called with ID:', quoteId);
  
  // First fetch the quote basic data
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items (
        *
      )
    `)
    .eq('id', quoteId)
    .single();

  console.log('Quote basic query result:', { quote, error });

  if (error) {
    console.error('Error fetching quote:', error);
    throw new Error(`Failed to fetch quote details: ${error.message}`);
  }

  // Separately fetch project documents where booking_id = quote.id
  // (This is how the API stores quote images)
  const { data: documents, error: documentsError } = await supabase
    .from('project_documents')
    .select(`
      id,
      title,
      file_path,
      file_type,
      document_type
    `)
    .eq('booking_id', quoteId);

  console.log('Documents query result:', { documents, documentsError });

  if (documentsError) {
    console.warn('Error fetching documents (non-fatal):', documentsError);
  }

  // Combine the results
  const quoteWithDocs = {
    ...quote,
    project_documents: documents || []
  };

  return quoteWithDocs as QuoteWithItems;
}

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at'>, items: Omit<QuoteItem, 'id' | 'created_at' | 'quote_id'>[]) {
  const { data: newQuote, error: quoteError } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();

  if (quoteError) {
    console.error('Error creating quote:', quoteError);
    throw new Error('Failed to create quote');
  }

  if (items.length > 0) {
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: newQuote.id
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsWithQuoteId);

    if (itemsError) {
      console.error('Error creating quote items:', itemsError);
      throw new Error('Failed to create quote items');
    }
  }

  return newQuote;
}

export async function updateQuote(
  quoteId: string,
  quote: Partial<Quote>,
  items?: {
    create?: Omit<QuoteItem, 'id' | 'created_at' | 'quote_id'>[],
    update?: Partial<QuoteItem>[],
    delete?: string[]
  }
) {
  const { error: quoteError } = await supabase
    .from('quotes')
    .update(quote)
    .eq('id', quoteId);

  if (quoteError) {
    console.error('Error updating quote:', quoteError);
    throw new Error('Failed to update quote');
  }

  if (items) {
    // Delete items if specified
    if (items.delete?.length) {
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .in('id', items.delete);

      if (deleteError) {
        console.error('Error deleting quote items:', deleteError);
        throw new Error('Failed to delete quote items');
      }
    }

    // Update existing items
    if (items.update?.length) {
      for (const item of items.update) {
        const { error: updateError } = await supabase
          .from('quote_items')
          .update(item)
          .eq('id', item.id!);

        if (updateError) {
          console.error('Error updating quote item:', updateError);
          throw new Error('Failed to update quote items');
        }
      }
    }

    // Create new items
    if (items.create?.length) {
      const newItems = items.create.map(item => ({
        ...item,
        quote_id: quoteId
      }));

      const { error: createError } = await supabase
        .from('quote_items')
        .insert(newItems);

      if (createError) {
        console.error('Error creating quote items:', createError);
        throw new Error('Failed to create quote items');
      }
    }
  }

  // Fetch and return the updated quote
  return await fetchQuoteById(quoteId);
}

export async function deleteQuote(quoteId: string) {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId);

  if (error) {
    console.error('Error deleting quote:', error);
    throw new Error('Failed to delete quote');
  }
}

export function calculateQuoteTotals(items: QuoteItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  return {
    subtotal,
    total: subtotal // You can add tax calculation logic here if needed
  };
}

export function generateReferenceNumber() {
  const prefix = 'Q';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}
