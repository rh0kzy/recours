const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check if environment variables are available
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing');
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database configuration missing' })
    };
  }

  let client;
  try {
    console.log('Initializing database client...');
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Connecting to database...');
    await client.connect();
    console.log('Database connected successfully');

    // Check if table exists first
    console.log('Checking if requests table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'requests'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Requests table does not exist');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }

    console.log('Requests table exists, fetching data...');

    // First, let's check what columns actually exist
    const columnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'requests' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Available columns:', columnsCheck.rows.map(row => row.column_name));

    // Fetch data with error handling for missing columns
    const query = `
      SELECT 
        id, 
        matricule, 
        nom, 
        prenom, 
        email, 
        COALESCE(telephone, '') as telephone,
        specialite_actuelle, 
        specialite_souhaitee, 
        COALESCE(raison, '') as raison,
        COALESCE(status, 'pending') as status, 
        COALESCE(admin_comment, '') as admin_comment, 
        submitted_at, 
        reviewed_at, 
        COALESCE(reviewed_by, '') as reviewed_by
      FROM requests
      ORDER BY submitted_at DESC
    `;
    
    console.log('Executing main query...');
    const result = await client.query(query);
    console.log(`Found ${result.rows.length} requests`);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('Admin API Error Details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      internalPosition: error.internalPosition,
      internalQuery: error.internalQuery,
      where: error.where,
      schema: error.schema,
      table: error.table,
      column: error.column,
      dataType: error.dataType,
      constraint: error.constraint
    });
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch requests',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      })
    };
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
};