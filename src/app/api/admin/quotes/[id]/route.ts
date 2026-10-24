import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Use service role client to bypass RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { notes, total_amount, quote_items } = await request.json();
    const resolvedParams = await params;
    const quoteId = resolvedParams.id;

    // Update the main quote
    const { error: quoteError } = await supabaseAdmin
      .from('quotes')
      .update({
        notes,
        total_amount,
        status: 'draft'
      })
      .eq('id', quoteId);

    if (quoteError) {
      throw new Error(`Failed to update quote: ${quoteError.message}`);
    }

    // Handle quote items if provided
    if (quote_items) {
      // Delete existing items
      const { error: deleteError } = await supabaseAdmin
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);

      if (deleteError) {
        console.warn('Error deleting existing items:', deleteError);
      }

      // Insert new items
      const itemsToInsert = quote_items
        .filter((item: any) => item.description && item.description.trim())
        .map((item: any) => ({
          quote_id: quoteId,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0,
          item_type: item.item_type || 'service', // Default to 'service'
          unit: item.unit || 'each' // Default to 'each'
        }));

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('quote_items')
          .insert(itemsToInsert);

        if (insertError) {
          throw new Error(`Failed to save quote items: ${insertError.message}`);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin quote update error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}