import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // Add status column if it doesn't exist
    await client.query(`
      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS admin_comment TEXT,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT
    `);

    return NextResponse.json({ message: 'Table updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  } finally {
    await client.end();
  }
}