import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all admin users
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching users - checking session...');
    const sessionResult = await verifySessionFromRequest(request);
    console.log('Session result:', sessionResult);
    
    if (!sessionResult.success || !sessionResult.user) {
      console.log('Session verification failed:', sessionResult.error);
      return NextResponse.json({ error: sessionResult.error || 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can view users
    if (sessionResult.user.role !== 'super_admin') {
      console.log('User is not super_admin:', sessionResult.user.role);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('Fetching users from database...');
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, department, is_active, failed_login_attempts, locked_until, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${users?.length || 0} users`);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Create new admin user
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await verifySessionFromRequest(request);
    if (!sessionResult.success || !sessionResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can create users
    if (sessionResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, department } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['viewer', 'reviewer', 'super_admin', 'department_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Department is required for department_admin
    if (role === 'department_admin' && !department) {
      return NextResponse.json(
        { error: 'Department is required for department_admin role' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('admin_users')
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          role,
          department: role === 'department_admin' ? department : null,
          is_active: true,
        },
      ])
      .select('id, name, email, role, department, is_active, created_at')
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert([
      {
        user_id: sessionResult.user.id,
        action: 'CREATE_USER',
        resource_type: 'admin_user',
        resource_id: newUser.id,
        details: { name, email, role, department },
      },
    ]);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
