
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/Garci/Documents/perricos-app/server/.env' });

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'perricos',
});

async function cleanDuplicates() {
  try {
    console.log('Cleaning duplicate products...');
    // SQL to delete duplicates: keep the one with minimum id for each name
    const query = `
      DELETE FROM productos 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM productos 
        GROUP BY nombre
      );
    `;
    const res = await pool.query(query);
    console.log(`Successfully removed ${res.rowCount} duplicate products.`);
  } catch (err) {
    console.error('Error cleaning duplicates:', err);
  } finally {
    await pool.end();
  }
}

cleanDuplicates();
