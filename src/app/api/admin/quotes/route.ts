import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createSystemUser } from '../../contact/route';

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

export async function POST(request: NextRequest) {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      service_type,
      service_description,
      notes,
      total_amount,
      reference_number,
      status,
      quote_items
    } = await request.json();

    // Validate required fields
    if (!customer_name || !customer_email || !service_type || !reference_number) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, customer_email, service_type, and reference_number are required." },
        { status: 400 }
      );
    }

    // Get or create system user ID for created_by field
    let systemUserId;
    try {
      // Try to find existing system user
      const { data: existingUser } = await supabaseAdmin
        .from('user')
        .select('id')
        .eq('email', 'contact-form@rockhouse.com')
        .single();
      
      systemUserId = existingUser?.id;
      
      if (!systemUserId) {
        // Create system user if doesn't exist
        const { data: newUser } = await supabaseAdmin
          .from('user')
          .insert({
            email: 'contact-form@rockhouse.com',
            firstName: 'Contact',
            lastName: 'Form',
            role: 'Customer',
            is_active: true
          })
          .select('id')
          .single();
        
        systemUserId = newUser?.id;
      }
    } catch (err) {
      console.error('Error with system user:', err);
      // Use a default UUID if system user creation fails
      systemUserId = '00000000-0000-0000-0000-000000000000';
    }

    // Create the quote
    const { data: newQuote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        customer_address: customer_address || null,
        service_type,
        service_description: service_description || null,
        notes: notes || null,
        total_amount: total_amount || 0,
        reference_number,
        status: status || 'draft',
        created_by: systemUserId,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .select()
      .single();

    if (quoteError) {
      console.error('Quote creation error:', quoteError);
      return NextResponse.json(
        { error: `Failed to create quote: ${quoteError.message}` },
        { status: 500 }
      );
    }

    // Add quote items if provided
    if (quote_items && quote_items.length > 0) {
      const itemsToInsert = quote_items
        .filter((item: any) => item.description && item.description.trim())
        .map((item: any) => ({
          quote_id: newQuote.id,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0,
          item_type: item.item_type || 'service',
          unit: item.unit || 'each'
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from('quote_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Quote items creation error:', itemsError);
          // Don't fail the entire operation, just log the error
        }
      }
    }

    return NextResponse.json(newQuote);

  } catch (error) {
    console.error('Create quote error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create quote: ${message}` },
      { status: 500 }
    );
  }
}