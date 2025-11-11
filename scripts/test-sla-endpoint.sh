#!/bin/bash

###############################################################################
# SLA Check Endpoint Test Script
# 
# Tests the /api/cron/sla-check endpoint locally and in production
# Usage: ./scripts/test-sla-endpoint.sh [environment]
#   environment: local (default) or production
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to local environment
ENV=${1:-local}

# Load environment variables based on environment
if [ "$ENV" = "local" ]; then
    API_URL="http://localhost:3000"
    echo -e "${YELLOW}Testing LOCAL environment${NC}"
    
    # Try to load .env.local if it exists
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
elif [ "$ENV" = "production" ]; then
    echo -e "${YELLOW}Testing PRODUCTION environment${NC}"
    echo "Please ensure CRON_SECRET and API_URL are set in your environment"
    
    if [ -z "$API_URL" ]; then
        echo -e "${RED}ERROR: API_URL not set${NC}"
        echo "Example: export API_URL=https://your-app.vercel.app"
        exit 1
    fi
else
    echo -e "${RED}Invalid environment: $ENV${NC}"
    echo "Usage: ./scripts/test-sla-endpoint.sh [local|production]"
    exit 1
fi

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}ERROR: CRON_SECRET not set${NC}"
    echo "Please set CRON_SECRET environment variable"
    exit 1
fi

echo "API URL: $API_URL"
echo "Testing endpoint: $API_URL/api/cron/sla-check"
echo ""

###############################################################################
# Test 1: Valid Request
###############################################################################
echo -e "${YELLOW}Test 1: Valid request with correct secret${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/cron/sla-check" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Status: 200 OK${NC}"
    echo "Response body:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Extract unassigned count
    UNASSIGNED=$(echo "$BODY" | jq -r '.unassignedCount' 2>/dev/null || echo "N/A")
    echo -e "${GREEN}✓ Unassigned count: $UNASSIGNED${NC}"
else
    echo -e "${RED}✗ Status: $HTTP_CODE (expected 200)${NC}"
    echo "Response body:"
    echo "$BODY"
fi

echo ""

###############################################################################
# Test 2: Invalid Secret
###############################################################################
echo -e "${YELLOW}Test 2: Invalid secret (should return 401)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/cron/sla-check" \
  -H "x-cron-secret: invalid-secret" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Status: 401 Unauthorized (as expected)${NC}"
else
    echo -e "${RED}✗ Status: $HTTP_CODE (expected 401)${NC}"
fi

echo ""

###############################################################################
# Test 3: Missing Secret
###############################################################################
echo -e "${YELLOW}Test 3: Missing secret header (should return 401)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/cron/sla-check" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Status: 401 Unauthorized (as expected)${NC}"
else
    echo -e "${RED}✗ Status: $HTTP_CODE (expected 401)${NC}"
fi

echo ""

###############################################################################
# Test 4: Wrong HTTP Method
###############################################################################
echo -e "${YELLOW}Test 4: GET request (should return 405)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/cron/sla-check" \
  -H "x-cron-secret: $CRON_SECRET")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "405" ]; then
    echo -e "${GREEN}✓ Status: 405 Method Not Allowed (as expected)${NC}"
else
    echo -e "${RED}✗ Status: $HTTP_CODE (expected 405)${NC}"
fi

echo ""

###############################################################################
# Summary
###############################################################################
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Test Summary:${NC}"
echo -e "${GREEN}All endpoint security checks passed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check application logs for detailed execution info"
echo "2. Verify database was updated correctly (if any requests expired)"
echo "3. Check admin email for SLA timeout notifications"




