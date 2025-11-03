// Authentication helper functions for admin login
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'reviewer' | 'super_admin' | 'department_admin';
  department?: string;
  isActive: boolean;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Authenticate admin user with email and password
 */
export async function authenticateAdmin(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: AdminUser; token: string } | { error: string }> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Get user from database
    const userQuery = `
      SELECT id, email, password_hash, name, role, department, is_active, 
             failed_login_attempts, locked_until
      FROM admin_users 
      WHERE email = $1
    `;
    const userResult = await client.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000
      );
      return { error: `Account locked. Try again in ${lockMinutes} minutes.` };
    }

    // Check if account is active
    if (!user.is_active) {
      return { error: 'Account is deactivated. Contact administrator.' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 
        ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
        : null;

      await client.query(
        `UPDATE admin_users 
         SET failed_login_attempts = $1, locked_until = $2 
         WHERE id = $3`,
        [newAttempts, lockUntil, user.id]
      );

      // Log failed login attempt
      await logAuditAction(
        client,
        user.id,
        'auth:login_failed',
        'auth',
        user.id,
        { email, reason: 'Invalid password', attempts: newAttempts },
        ipAddress,
        userAgent
      );

      if (newAttempts >= 5) {
        return { error: 'Too many failed attempts. Account locked for 30 minutes.' };
      }

      return { error: 'Invalid email or password' };
    }

    // Reset failed attempts on successful login
    await client.query(
      `UPDATE admin_users 
       SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30m')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Create session in database
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    await client.query(
      `INSERT INTO admin_sessions (admin_user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, expiresAt, ipAddress, userAgent]
    );

    // Log successful login
    await logAuditAction(
      client,
      user.id,
      'auth:login',
      'auth',
      user.id,
      { email },
      ipAddress,
      userAgent
    );

    // Clean expired sessions
    await client.query(`DELETE FROM admin_sessions WHERE expires_at < NOW()`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: user.is_active,
      },
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed. Please try again.' };
  } finally {
    await client.end();
  }
}

/**
 * Verify JWT token and get user session
 */
export async function verifySession(token: string): Promise<AdminUser | null> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('verifySession: Verifying JWT token...');
    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('verifySession: JWT verified, userId:', payload.userId);

    console.log('verifySession: Connecting to database...');
    await client.connect();
    console.log('verifySession: Connected to database');

    // Check if session exists and is not expired
    const sessionQuery = `
      SELECT s.admin_user_id, u.email, u.name, u.role, u.department, u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_user_id = u.id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `;
    console.log('verifySession: Executing session query...');
    const result = await client.query(sessionQuery, [token]);
    console.log('verifySession: Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('verifySession: No active session found');
      return null;
    }

    const user = result.rows[0];
    console.log('verifySession: Found user:', user.email, 'active:', user.is_active);

    if (!user.is_active) {
      console.log('verifySession: User is not active');
      return null;
    }

    return {
      id: user.admin_user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.is_active,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  } finally {
    try {
      await client.end();
      console.log('verifySession: Database connection closed');
    } catch (e) {
      console.error('Error closing database connection:', e);
    }
  }
}

/**
 * Logout and destroy session
 */
export async function logout(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Get user ID before deleting session
    const sessionQuery = `SELECT admin_user_id FROM admin_sessions WHERE token = $1`;
    const result = await client.query(sessionQuery, [token]);

    if (result.rows.length > 0) {
      const userId = result.rows[0].admin_user_id;

      // Log logout action
      await logAuditAction(
        client,
        userId,
        'auth:logout',
        'auth',
        userId,
        {},
        ipAddress,
        userAgent
      );
    }

    // Delete session
    await client.query(`DELETE FROM admin_sessions WHERE token = $1`, [token]);

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  } finally {
    await client.end();
  }
}

/**
 * Helper function to log audit actions
 */
async function logAuditAction(
  client: Client,
  adminUserId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await client.query(
      `INSERT INTO audit_logs (admin_user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminUserId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
}

/**
 * Verify session from NextRequest (for API routes)
 * Extracts token from cookie and verifies it
 */
export async function verifySessionFromRequest(
  request: NextRequest
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    console.log('verifySessionFromRequest called');
    // Extract token from cookie
    const token = request.cookies.get('admin_session')?.value;
    console.log('Token from cookie:', token ? 'exists' : 'missing');

    if (!token) {
      return { success: false, error: 'No session token' };
    }

    // Verify the token
    const user = await verifySession(token);
    console.log('User from verifySession:', user ? user.email : 'null');

    if (!user) {
      return { success: false, error: 'Invalid or expired session' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Session verification failed' };
  }
}
