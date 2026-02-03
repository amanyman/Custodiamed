// Script to run database migrations
// Run with: node scripts/run-migrations.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jawsrfccpjigfjhgpddb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd3NyZmNjcGppZ2ZqaGdwZGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA5MzM4NSwiZXhwIjoyMDg1NjY5Mzg1fQ.hupo4KjIqCBaosYWhx4t1Oq1gPntrw_Neev7QKFvQAg';

async function runMigration(sql, name) {
  console.log(`Running migration: ${name}...`);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to run ${name}:`, error);
    return false;
  }

  console.log(`✓ ${name} completed`);
  return true;
}

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_storage_setup.sql',
  ];

  console.log('Starting database migrations...\n');
  console.log('NOTE: You need to run these migrations in the Supabase SQL Editor.');
  console.log('Go to: https://supabase.com/dashboard/project/jawsrfccpjigfjhgpddb/sql/new\n');

  for (const file of migrations) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n--- ${file} ---\n`);
    console.log(sql);
  }

  console.log('\n\nCopy and paste each migration SQL into the Supabase SQL Editor and run them in order.');
}

main().catch(console.error);
