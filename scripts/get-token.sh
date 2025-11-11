#!/bin/bash
# Quick token generator for testing
# Usage: ./scripts/get-token.sh [admin|partner]

ROLE=${1:-admin}

if [ "$ROLE" = "admin" ]; then
  EMAIL="admin@ticketing.com"
  PASSWORD="Admin123!"
elif [ "$ROLE" = "partner" ]; then
  EMAIL="partner@quickfix.com"
  PASSWORD="Partner123!"
else
  echo "Usage: $0 [admin|partner]"
  exit 1
fi

echo "🔐 Getting token for $ROLE..."
echo ""

RESPONSE=$(curl -s -X POST 'http://localhost:3000/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Token retrieved successfully!"
echo ""
echo "Access Token:"
echo "$TOKEN"
echo ""
echo "📋 Copy this for curl:"
echo "-H 'Authorization: Bearer $TOKEN'"
echo ""
echo "🔗 Full curl example:"
echo "curl 'http://localhost:3000/api/customer/requests' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  --data-raw '{\"categoryId\":1,\"pickupOptionId\":2,\"customerName\":\"Test\",\"customerPhone\":\"+966501234567\",\"customerAddress\":\"Test Address\",\"customerLat\":24.7136,\"customerLng\":46.6753}'"

