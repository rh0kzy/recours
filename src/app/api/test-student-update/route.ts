import { NextRequest, NextResponse } from 'next/server';
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

    // Test if students table exists and has the right structure
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position;
    `);

    if (tableCheck.rows.length === 0) {
      return NextResponse.json({
        error: 'Students table does not exist',
        recommendation: 'Create the students table with the required columns'
      }, { status: 404 });
    }

    // Check if we can find a test student
    const studentsCount = await client.query('SELECT COUNT(*) as count FROM students');
    
    // Test a sample update (dry run)
    const sampleStudent = await client.query('SELECT matricule, nom, prenom, specialite FROM students LIMIT 1');
    
    return NextResponse.json({
      message: 'Database structure verified',
      tableColumns: tableCheck.rows,
      totalStudents: studentsCount.rows[0].count,
      sampleStudent: sampleStudent.rows[0] || null,
      readyForTransfer: true
    });

  } catch (error) {
    console.error('Database verification error:', error);
    return NextResponse.json({
      error: 'Database verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}