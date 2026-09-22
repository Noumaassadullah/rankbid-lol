const pg = require('pg');
const { Pool } = pg;

// Use connection pooler for Vercel (serverless) - port 6543
// Use direct connection for local development - port 5432
const getConnectionString = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    console.error('DATABASE_URL not set');
    return null;
  }

  // For production/Vercel, use connection pooler (port 6543)
  if (process.env.NODE_ENV === 'production') {
    return baseUrl.replace(':5432', ':6543').replace('?', '?pgbouncer=true&');
  }

  return baseUrl;
};

const connectionString = getConnectionString();

if (!connectionString) {
  throw new Error('Database connection string not configured');
}

const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: any) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}
