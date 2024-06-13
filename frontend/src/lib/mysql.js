import mysql from "mysql2/promise";

// Validate environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_SCHEMA) {
  throw new Error("Missing necessary environment variables for database connection");
}

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
    waitForConnections: true,
  });

  // Test the connection
  pool.getConnection();
} catch (error) {
  console.error("Failed to create a database connection pool:", error);
  process.exit(1);
}

export default pool;
