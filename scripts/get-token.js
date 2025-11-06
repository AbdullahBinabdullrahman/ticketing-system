/**
 * Token Generator for Testing
 * Usage: node scripts/get-token.js [admin|partner]
 */

const axios = require('axios');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const accounts = {
  admin: {
    email: 'admin@ticketing.com',
    password: 'Admin123!',
  },
  partner: {
    email: 'partner@quickfix.com',
    password: 'Partner123!',
  },
};

async function getToken(role = 'admin') {
  if (!accounts[role]) {
    console.error('❌ Invalid role. Use: admin or partner');
    process.exit(1);
  }

  console.log(`🔐 Getting token for ${role}...`);
  console.log('');

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: accounts[role].email,
      password: accounts[role].password,
    });

    const { accessToken, refreshToken } = response.data.tokens;
    const user = response.data.user;

    console.log('✅ Login successful!');
    console.log('');
    console.log('👤 User Info:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.userType}`);
    console.log('');
    console.log('🎫 Access Token:');
    console.log(accessToken);
    console.log('');
    console.log('🔄 Refresh Token:');
    console.log(refreshToken);
    console.log('');
    console.log('📋 Copy for curl:');
    console.log(`-H 'Authorization: Bearer ${accessToken}'`);
    console.log('');
    console.log('🔗 Example curl command:');
    console.log(`curl 'http://localhost:3000/api/customer/requests' \\`);
    console.log(`  -H 'Content-Type: application/json' \\`);
    console.log(`  -H 'Authorization: Bearer ${accessToken}' \\`);
    console.log(`  --data-raw '{"categoryId":1,"pickupOptionId":2,"customerName":"Ahmed Al-Saud","customerPhone":"+966501234567","customerAddress":"Building 100, Street 50, Riyadh Center, Riyadh","customerLat":24.7136,"customerLng":46.6753}'`);
    console.log('');
    console.log('💾 To save token to file:');
    console.log(`node scripts/get-token.js ${role} > token.txt`);
    
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.message);
    } else {
      console.error('Error:', error.message);
    }
    console.error('');
    console.error('💡 Make sure:');
    console.error('   1. Server is running (npm run dev)');
    console.error('   2. Database is seeded (npm run db:seed)');
    console.error('   3. Test users exist in database');
    process.exit(1);
  }
}

// Get role from command line argument
const role = process.argv[2] || 'admin';
getToken(role);

