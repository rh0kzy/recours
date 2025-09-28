import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matricule = searchParams.get('matricule');

  if (!matricule) {
    return NextResponse.json({ error: 'Matricule is required' }, { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT * FROM students WHERE matricule = $1',
      [matricule]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = result.rows[0];

    // Format the data for the form
    const studentData = {
      matricule: student.matricule,
      nom: student.nom,
      prenom: student.prenom,
      email: '', // Will be filled by user
      telephone: '', // Will be filled by user
      specialiteActuelle: student.specialite,
      specialiteSouhaitee: '', // Will be filled by user
      raison: '', // Will be filled by user
    };

    return NextResponse.json(studentData);
  } catch (error) {
    console.error('Failed to fetch student:', error);
    return NextResponse.json({ error: 'Failed to fetch student', details: (error as Error).message }, { status: 500 });
  } finally {
    await client.end();
  }
}