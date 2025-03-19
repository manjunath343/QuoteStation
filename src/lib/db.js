import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config"; // Ensure dotenv is loaded

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from environment variables
  ssl: false // Disable SSL
});

export default pool;

