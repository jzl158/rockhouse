// Email templates for team member onboarding
// You can integrate this with services like:
// - Resend
// - SendGrid  
// - Nodemailer
// - Postmark

export interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  role: string;
  companyName?: string;
  loginUrl?: string;
}

export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  const companyName = data.companyName || 'Sauvage Outdoors';
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/login`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to ${companyName}!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #255756; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials-box { background: white; padding: 15px; border-left: 4px solid #255756; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; }
        .button { display: inline-block; background: #255756; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${companyName}!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${data.firstName} ${data.lastName},</h2>
          
          <p>Welcome to the ${companyName} team! We're excited to have you join us as a ${data.role}.</p>
          
          <p>Your account has been created and you can now access our team portal using the credentials below:</p>
          
          <div class="credentials-box">
            <h3>Login Credentials</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> <code>${data.temporaryPassword}</code></p>
            <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          </div>
          
          <div class="warning">
            <strong>Important Security Notice:</strong>
            <ul>
              <li>This is a temporary password that you must change after your first login</li>
              <li>Please keep these credentials secure and do not share them</li>
              <li>If you have any issues logging in, contact your administrator</li>
            </ul>
          </div>
          
          <a href="${loginUrl}" class="button">Login to Portal</a>
          
          <p>If you have any questions or need assistance, please don't hesitate to reach out to your team lead or administrator.</p>
          
          <p>Welcome aboard!</p>
          
          <p>
            Best regards,<br>
            The ${companyName} Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const companyName = data.companyName || 'Sauvage Outdoors';
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/login`;

  return `
Welcome to ${companyName}!

Hello ${data.firstName} ${data.lastName},

Welcome to the ${companyName} team! We're excited to have you join us as a ${data.role}.

Your account has been created and you can now access our team portal using the credentials below:

LOGIN CREDENTIALS:
- Email: ${data.email}
- Temporary Password: ${data.temporaryPassword}
- Login URL: ${loginUrl}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that you must change after your first login
- Please keep these credentials secure and do not share them
- If you have any issues logging in, contact your administrator

Login to Portal: ${loginUrl}

If you have any questions or need assistance, please don't hesitate to reach out to your team lead or administrator.

Welcome aboard!

Best regards,
The ${companyName} Team
  `;
}

// Invoice email templates
export interface InvoiceEmailData {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  companyName?: string;
  paymentInstructions?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export function generateInvoiceEmailHtml(data: InvoiceEmailData): string {
  const companyName = data.companyName || 'Sauvage Outdoors';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${data.invoiceNumber} from ${companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #255756; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .line-items { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .line-items table { width: 100%; border-collapse: collapse; }
        .line-items th, .line-items td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .line-items th { background: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background: #f8f9fa; }
        .payment-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; background: #255756; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice from ${companyName}</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${data.customerName},</h2>
          
          <p>Thank you for your business! Please find your invoice details below:</p>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Issue Date:</strong> ${data.issueDate}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
          </div>
          
          <div class="line-items">
            <h3>Services & Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.lineItems.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3"><strong>Total</strong></td>
                  <td><strong>$${data.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="payment-info">
            <h3>Payment Instructions</h3>
            <p>${data.paymentInstructions || 'Please remit payment by the due date. Contact us if you have any questions about this invoice.'}</p>
          </div>
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p>
            Best regards,<br>
            The ${companyName} Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInvoiceEmailText(data: InvoiceEmailData): string {
  const companyName = data.companyName || 'Sauvage Outdoors';
  
  return `
Invoice from ${companyName}

Hello ${data.customerName},

Thank you for your business! Please find your invoice details below:

INVOICE DETAILS:
- Invoice Number: ${data.invoiceNumber}
- Issue Date: ${data.issueDate}
- Due Date: ${data.dueDate}
- Total Amount: $${data.totalAmount.toFixed(2)}

SERVICES & ITEMS:
${data.lineItems.map(item => 
  `${item.description} - Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`
).join('\n')}

Total: $${data.totalAmount.toFixed(2)}

PAYMENT INSTRUCTIONS:
${data.paymentInstructions || 'Please remit payment by the due date. Contact us if you have any questions about this invoice.'}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
The ${companyName} Team
  `;
}

// Example integration with Resend (popular email service)
// Uncomment and configure if you want to add email functionality

/*
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'team@sauvageoutdoors.com', // Your verified sender
      to: [data.email],
      subject: \`Welcome to \${data.companyName || 'Sauvage Outdoors'}!\`,
      html: generateWelcomeEmailHtml(data),
      text: generateWelcomeEmailText(data),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'billing@sauvageoutdoors.com', // Your verified sender
      to: [data.customerEmail],
      subject: \`Invoice \${data.invoiceNumber} from \${data.companyName || 'Sauvage Outdoors'}\`,
      html: generateInvoiceEmailHtml(data),
      text: generateInvoiceEmailText(data),
    });

    if (error) {
      console.error('Error sending invoice email:', error);
      return { success: false, error };
    }

    console.log('Invoice email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return { success: false, error };
  }
}
*/