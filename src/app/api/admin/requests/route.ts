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

    // Check if table exists and get data
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'requests'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return NextResponse.json([]);
    }

    // Table exists, fetch data
    const query = `
      SELECT id, matricule, nom, prenom, email, telephone,
             specialite_actuelle, specialite_souhaitee, raison,
             status, admin_comment, submitted_at as created_at, reviewed_at, reviewed_by
      FROM requests
      ORDER BY submitted_at DESC
    `;
    const result = await client.query(query);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}