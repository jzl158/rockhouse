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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quoteId = resolvedParams.id;

    // Fetch the quote with all its items
    const { data: quote, error } = await supabaseAdmin
      .from('quotes')
      .select(`
        *,
        quote_items (
          *
        )
      `)
      .eq('id', quoteId)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Fetch project documents if they exist
    const { data: documents, error: documentsError } = await supabaseAdmin
      .from('project_documents')
      .select(`
        id,
        title,
        file_path,
        file_type,
        document_type
      `)
      .eq('booking_id', quoteId);

    if (documentsError) {
      console.warn('Error fetching documents (non-fatal):', documentsError);
    }

    // Combine the results
    const quoteWithDocs = {
      ...quote,
      project_documents: documents || []
    };

    return NextResponse.json({ quote: quoteWithDocs });

  } catch (error) {
    console.error('Admin quote details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}