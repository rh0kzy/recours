import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    return NextResponse.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ error: 'Database connection failed', details: (error as Error).message }, { status: 500 });
  } finally {
    await client.end();
  }
}