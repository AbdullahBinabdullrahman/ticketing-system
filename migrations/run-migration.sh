#!/bin/bash
# Run database migration to replace token columns with sessionId

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the migration
echo "Running migration: Replace token columns with sessionId..."
psql $DATABASE_URL -f migrations/0005_increase_token_column_size.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

