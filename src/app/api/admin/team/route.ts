import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, role, position, hire_date, is_active, is_admin, address, specialties } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, role' },
        { status: 400 }
      );
    }

    // Log the received data for debugging
    console.log('Creating team member with data:', {
      firstName,
      lastName,
      email,
      role,
      position,
      hire_date,
      is_active,
      is_admin
    });

    // Check if user already exists in Auth
    let authUserId = null;
    let temporaryPassword = null;
    
    // First, try to find existing user
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists in Auth, using existing user ID:', existingUser.id);
      authUserId = existingUser.id;
      temporaryPassword = 'EXISTING_USER'; // Placeholder since we're not creating a new password
    } else {
      // Generate a temporary password for new users
      temporaryPassword = generateTemporaryPassword();

      // Create new user account in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: temporaryPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          firstName: firstName,
          lastName: lastName,
          role: role,
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        console.error('Auth error details:', {
          status: authError.status,
          message: authError.message
        });
        
        return NextResponse.json(
          { error: 'Failed to create user account: ' + authError.message },
          { status: 500 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
      
      authUserId = authData.user.id;
    }

    // Create user profile in the database
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user')
      .insert({
        id: authUserId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone || null,
        role: role,
        position: position || null,
        hire_date: hire_date || new Date().toISOString(),
        is_active: is_active !== undefined ? is_active : true,
        is_admin: is_admin !== undefined ? is_admin : false,
        address: address || null,
        specialties: specialties || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      console.error('Profile error details:', {
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        message: profileError.message
      });
      
      // Clean up the auth user if profile creation fails (only for newly created users)
      if (temporaryPassword !== 'EXISTING_USER') {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUserId);
          console.log('Successfully cleaned up auth user:', authUserId);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create user profile: ' + profileError.message,
          details: profileError.details,
          hint: profileError.hint
        },
        { status: 500 }
      );
    }

    // TODO: Send email with login credentials
    // For now, we'll just log the credentials
    if (temporaryPassword === 'EXISTING_USER') {
      console.log(`Team member profile created for existing user: ${email}`);
    } else {
      console.log(`New user created: ${email} with temporary password: ${temporaryPassword}`);
    }

    return NextResponse.json({
      success: true,
      user: profileData,
      temporaryPassword: temporaryPassword === 'EXISTING_USER' ? null : temporaryPassword,
      message: temporaryPassword === 'EXISTING_USER' ? 
        'Team member profile created for existing user' : 
        'New team member created with temporary password'
    });

  } catch (error) {
    console.error('Error in team creation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}