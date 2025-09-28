import { NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

export async function GET() {
  console.log('Admin API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      error: 'Database configuration missing'
    }, { status: 500 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting database connection...');
    await client.connect();
    console.log('Database connected successfully');

    // Check if table exists and get data
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'requests'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Table does not exist, returning empty array');
      return NextResponse.json([]);
    }

    console.log('Table exists, fetching data...');
    // Simple query first
    const countResult = await client.query('SELECT COUNT(*) as count FROM requests');
    console.log(`Found ${countResult.rows[0].count} total records`);

    // Table exists, fetch data
    const query = `
      SELECT id, matricule, nom, prenom, email, telephone,
             specialite_actuelle, specialite_souhaitee, raison,
             status, admin_comment, submitted_at as created_at, reviewed_at, reviewed_by
      FROM requests
      ORDER BY submitted_at DESC
    `;
    const result = await client.query(query);
    console.log(`Successfully fetched ${result.rows.length} requests`);

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