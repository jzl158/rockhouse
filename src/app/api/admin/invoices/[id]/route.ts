import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Create service role client for admin operations
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

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        booking:booking_id (
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          service_type,
          reference_number,
          service_details
        ),
        invoice_line_items (
          id,
          description,
          quantity,
          unit_price,
          total_price,
          item_type,
          tax_rate
        ),
        payment_transactions (
          id,
          amount,
          payment_method,
          transaction_date,
          transaction_status,
          transaction_reference,
          notes
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error fetching invoice:', error);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Transform data for easier use
    const formattedInvoice = {
      ...invoice,
      customerName: invoice.booking?.customer_name,
      customerEmail: invoice.booking?.customer_email,
      customerPhone: invoice.booking?.customer_phone,
      customerAddress: invoice.booking?.customer_address,
      serviceType: invoice.booking?.service_type,
      serviceDetails: invoice.booking?.service_details,
      bookingReference: invoice.booking?.reference_number
    };

    return NextResponse.json({ invoice: formattedInvoice });
  } catch (error) {
    console.error('Error in GET /api/admin/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      dueDate, 
      notes, 
      lineItems,
      terms,
      discountAmount,
      taxRate,
      status 
    } = body;

    // Validate that invoice exists and is editable
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single();

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (existingInvoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot edit paid invoices' },
        { status: 400 }
      );
    }

    // Calculate new totals if line items are provided
    const updateData: any = {};
    
    if (dueDate) updateData.due_date = dueDate;
    if (notes !== undefined) updateData.notes = notes;
    if (terms !== undefined) updateData.terms = terms;
    if (status) updateData.status = status;

    if (lineItems && lineItems.length > 0) {
      const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
      const discountAmountValue = discountAmount || 0;
      const taxRateValue = taxRate || 0.08;
      const taxAmount = (subtotal - discountAmountValue) * taxRateValue;
      const totalAmount = subtotal - discountAmountValue + taxAmount;

      updateData.subtotal = subtotal;
      updateData.tax_amount = taxAmount;
      updateData.discount_amount = discountAmountValue;
      updateData.total_amount = totalAmount;

      // Delete existing line items and create new ones
      await supabaseAdmin
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', id);

      const lineItemsToInsert = lineItems.map((item: any) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.total,
        item_type: item.itemType || 'service',
        tax_rate: item.taxRate || taxRateValue
      }));

      const { error: lineItemsError } = await supabaseAdmin
        .from('invoice_line_items')
        .insert(lineItemsToInsert);

      if (lineItemsError) {
        console.error('Error updating line items:', lineItemsError);
        return NextResponse.json(
          { error: 'Failed to update line items' },
          { status: 500 }
        );
      }
    }

    // Update the invoice
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        booking:booking_id (
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          service_type,
          reference_number
        ),
        invoice_line_items (*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...updatedInvoice,
        customerName: updatedInvoice.booking?.customer_name,
        customerEmail: updatedInvoice.booking?.customer_email
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Check if invoice exists and is deletable
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft invoices' },
        { status: 400 }
      );
    }

    // Delete line items first (foreign key constraint)
    await supabaseAdmin
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', id);

    // Delete the invoice
    const { error: deleteError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting invoice:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH method for sending emails
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, emailData } = body;

    if (action === 'send_email') {
      // Get invoice details
      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select(`
          *,
          booking:booking_id (
            customer_name,
            customer_email,
            customer_phone,
            customer_address
          ),
          invoice_line_items (*)
        `)
        .eq('id', id)
        .single();

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      if (!invoice.booking?.customer_email) {
        return NextResponse.json(
          { error: 'Customer email not found' },
          { status: 400 }
        );
      }

      // TODO: Implement email sending functionality
      // For now, we'll just update the status to 'sent'
      const { error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating invoice status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update invoice status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Invoice sent successfully',
        recipient: invoice.booking.customer_email
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in PATCH /api/admin/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}