#!/usr/bin/env ts-node
/**
 * Check the actual database schema for user_sessions table
 */
import { db } from "../lib/db/connection";
import { sql } from "drizzle-orm";

async function checkSchema() {
  try {
    console.log("🔍 Checking user_sessions table schema...\n");

    // Query to get column information
    const result = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position;
    `);

    console.log("📋 Current columns in user_sessions table:");
    console.log("=" .repeat(80));
    
    const rows = Array.isArray(result) ? result : (result.rows || []);
    
    if (rows.length === 0) {
      console.log("❌ No columns found or table doesn't exist!");
    } else {
      rows.forEach((row: any) => {
        console.log(`Column: ${row.column_name}`);
        console.log(`  Type: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
        console.log(`  Nullable: ${row.is_nullable}`);
        console.log(`  Default: ${row.column_default || 'none'}`);
        console.log("-".repeat(80));
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();

