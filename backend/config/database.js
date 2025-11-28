import pkg from 'pg';
const { Pool } = pkg;
import { config } from './env.js';
import logger from '../utils/logger.js';

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.POSTGRES_HOST,
  port: config.POSTGRES_PORT,
  user: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // maximum time to wait for a connection
});

// Test database connection
pool.on('connect', () => {
  logger.info('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Error executing query', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout to release the client if it's not released manually
  const timeout = setTimeout(() => {
    logger.error('Client checkout timeout');
    client.release();
  }, 5000);

  client.query = (...args) => {
    return query(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW()');
    return {
      status: 'healthy',
      timestamp: result.rows[0].now
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

export default pool;
