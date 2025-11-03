import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    const results = {
      tables: {} as Record<string, boolean>,
      adminUser: false,
      errors: [] as string[],
    };

    // Check if admin_users table exists
    try {
      const res1 = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users')");
      results.tables.admin_users = res1.rows[0].exists;
    } catch (error) {
      results.errors.push(`admin_users check failed: ${error}`);
    }

    // Check if admin_sessions table exists
    try {
      const res2 = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_sessions')");
      results.tables.admin_sessions = res2.rows[0].exists;
    } catch (error) {
      results.errors.push(`admin_sessions check failed: ${error}`);
    }

    // Check if audit_logs table exists
    try {
      const res3 = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs')");
      results.tables.audit_logs = res3.rows[0].exists;
    } catch (error) {
      results.errors.push(`audit_logs check failed: ${error}`);
    }

    // Check if default admin user exists
    if (results.tables.admin_users) {
      try {
        const res4 = await client.query("SELECT COUNT(*) FROM admin_users WHERE email = 'admin@usthb.dz'");
        results.adminUser = parseInt(res4.rows[0].count) > 0;
      } catch (error) {
        results.errors.push(`Admin user check failed: ${error}`);
      }
    }

    return NextResponse.json({
      status: 'Database status check',
      results,
      ready: results.tables.admin_users && 
             results.tables.admin_sessions && 
             results.tables.audit_logs && 
             results.adminUser,
      message: results.errors.length > 0 
        ? 'Some checks failed - see errors' 
        : results.adminUser 
          ? 'All tables exist and admin user is created'
          : 'Tables exist but admin user needs to be created',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to database or check status',
    }, { status: 500 });
  } finally {
    await client.end();
  }
}
