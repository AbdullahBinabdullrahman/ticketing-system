#!/bin/bash

# Generate random secrets for JWT
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file
cat > .env << EOF
# Database Configuration
# IMPORTANT: Replace this with your actual Supabase connection string!
DATABASE_URL=postgresql://username:password@localhost:5432/ticketing_system

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# i18n Configuration
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,ar

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Notification Configuration
NOTIFICATION_RETENTION_DAYS=30

# SLA Configuration
DEFAULT_SLA_TIMEOUT_MINUTES=15
DEFAULT_REMINDER_MINUTES=10

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Logging Configuration
LOG_LEVEL=info
NODE_ENV=development
EOF

echo "✅ .env file created successfully!"
echo "🔐 Random JWT secrets generated"
echo "⚠️  IMPORTANT: Update DATABASE_URL with your Supabase connection string!"


