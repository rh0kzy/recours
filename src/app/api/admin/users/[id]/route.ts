import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await verifySessionFromRequest(request);
    if (!sessionResult.success || !sessionResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, department, is_active, failed_login_attempts, locked_until, created_at, updated_at')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT: Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await verifySessionFromRequest(request);
    if (!sessionResult.success || !sessionResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, department, is_active } = body;

    // Build update object
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      const validRoles = ['viewer', 'reviewer', 'super_admin', 'department_admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }
    if (department !== undefined) updateData.department = department;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Reset failed login attempts if user is being unlocked
    if (is_active === true) {
      updateData.failed_login_attempts = 0;
      updateData.locked_until = null;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, name, email, role, department, is_active, created_at, updated_at')
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert([
      {
        user_id: sessionResult.user.id,
        action: 'UPDATE_USER',
        resource_type: 'admin_user',
        resource_id: params.id,
        details: body,
      },
    ]);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await verifySessionFromRequest(request);
    if (!sessionResult.success || !sessionResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent deleting yourself
    if (sessionResult.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Log audit
    await supabase.from('audit_logs').insert([
      {
        user_id: sessionResult.user.id,
        action: 'DELETE_USER',
        resource_type: 'admin_user',
        resource_id: params.id,
        details: {},
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
