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

    const result = await client.query('SELECT COUNT(*) as total FROM students');
    const count = result.rows[0].total;

    const students = await client.query('SELECT * FROM students LIMIT 5');

    return NextResponse.json({
      total_students: count,
      sample_students: students.rows
    });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json({ error: 'Failed to fetch students', details: (error as Error).message }, { status: 500 });
  } finally {
    await client.end();
  }
}