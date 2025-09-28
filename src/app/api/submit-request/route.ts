import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  const { matricule, nom, prenom, email, telephone, specialiteActuelle, specialiteSouhaitee, raison } = await request.json();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const query = `
      INSERT INTO requests (matricule, nom, prenom, email, telephone, specialite_actuelle, specialite_souhaitee, raison)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [matricule, nom, prenom, email, telephone, specialiteActuelle, specialiteSouhaitee, raison];
    await client.query(query, values);
    return NextResponse.json({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  } finally {
    await client.end();
  }
}