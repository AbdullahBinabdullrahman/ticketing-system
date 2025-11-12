import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure postgres client with connection pooling and timeout settings
export const client = postgres(connectionString, { 
  prepare: false, // Disable prefetch as it is not supported for "Transaction" pool mode
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 30, // Connection timeout in seconds (increased from 10)
  max_lifetime: 60 * 30, // Max lifetime of connection (30 minutes)
  connection: {
    application_name: 'ticketing-system'
  },
  onnotice: () => {}, // Suppress notices
  debug: process.env.NODE_ENV === 'development' ? false : undefined, // Disable debug in production
});

export const db = drizzle(client);

// Handle process termination to cleanup connections
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections...');
    await client.end({ timeout: 5 });
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections...');
    await client.end({ timeout: 5 });
  });
}
