import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
type UserRole = Database['public']['Enums']['user_role'];
import crypto from 'crypto';

// Get or create system user ID
async function getSystemUserId() {
  console.log('Starting getSystemUserId function');
  
  try {
    // First, try to find existing system user
    console.log('Searching for existing system user...');
    const { data: existingUser, error: searchError } = await supabase
    .from('user')
    .select('id')
    .eq('email', 'contact-form@rockhouse.com')
    .single();

  if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error searching for system user:', searchError);
    throw searchError;
  }

  if (existingUser) {
    console.log('Found existing system user:', existingUser.id);
    return existingUser.id;
  }

  console.log('No system user found, creating new one...');
  
  // Generate a UUID for the system user
  const systemUserId = crypto.randomUUID();
  console.log('Generated system user ID:', systemUserId);

  // If no system user exists, create one
  const { data: newUser, error: createError } = await supabase
    .from('user')
    .insert({
      id: systemUserId,
      email: 'contact-form@rockhouse.com',
      firstName: 'Contact',
      lastName: 'Form',
      role: 'Customer' as const, // Using Customer role for quote submissions
      is_active: true
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating system user:', {
      code: createError.code,
      message: createError.message,
      details: createError.details
    });
    throw createError;
  }

  console.log('Successfully created system user:', newUser.id);
  return newUser.id;
  } catch (error) {
    console.error('Error in getSystemUserId:', error);
    throw error;
  }
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient<Database>(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Log environment check (will only show in server console)
console.log('Environment check:', {
  hasUrl: !!process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  url: process.env.SUPABASE_URL?.substring(0, 10) + '...'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { firstName, lastName, email, phone, message, inquiryType, serviceType, customerAddress, projectStartDate, estimatedDuration, images } = body ?? {};

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: First Name, Last Name, Email, and Message are required." },
        { status: 400 }
      );
    }

    // Combine first and last name for legacy systems if needed
    const fullName = `${firstName} ${lastName}`;

    if (inquiryType === 'quote') {
      // Generate a reference number for the quote
      const referenceNumber = `Q${Date.now().toString().slice(-6)}`;

      // Get system user ID for the created_by field
      const systemUserId = await getSystemUserId();

      // Create the quote payload
      const quotePayload = {
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone || null,
        customer_address: customerAddress || null,
        service_type: serviceType || '',
        service_description: message,
        project_start_date: projectStartDate || null,
        estimated_duration: estimatedDuration || null,
        reference_number: referenceNumber,
        status: 'pending',
        created_by: systemUserId,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log('Attempting to create quote with payload:', quotePayload);

      // Create a quote record
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert(quotePayload)
        .select()
        .single();

      if (quoteError) {
        console.error('Detailed quote error:', {
          message: quoteError.message,
          details: quoteError.details,
          hint: quoteError.hint,
          code: quoteError.code
        });
        return NextResponse.json({ 
          error: "Failed to create quote.", 
          details: quoteError.message 
        }, { status: 500 });
      }

      // If there are images, link them to the quote
      if (images && images.length > 0) {
        const { error: galleryError } = await supabase
          .from('project_documents')
          .insert(
            images.map(image => ({
              booking_id: quoteData.id,
              title: image.originalName || 'Quote Image',
              document_type: 'quote_image',
              file_path: image.path,
              file_type: 'image',
              uploaded_by: 'system',
              status: 'active'
            }))
          );

        if (galleryError) {
          console.error('Error saving images:', galleryError);
          // Continue anyway since the quote was created
        }
      }

      return NextResponse.json({ 
        ok: true,
        quoteId: quoteData.id,
        referenceNumber 
      });
    } else {
      // Handle general inquiries (you might want to store these in a different table)
      const { error: contactError } = await supabase
        .from('contact_messages') // You'll need to create this table
        .insert({
          name: fullName,
          email,
          phone: phone || null,
          message,
          status: 'new'
        });

      if (contactError) {
        console.error('Error saving contact message:', contactError);
        return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error('Detailed error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Check if it's a Supabase error
    if (error && typeof error === 'object') {
      // Log the full error object to server console
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Extract all properties from the error object
      const errorDetails = Object.entries(error).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({ 
        error: "Database error", 
        details: errorDetails
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: "Unexpected error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


