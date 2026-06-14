#!/usr/bin/env node
/**
 * Simple E2E test for transaction creation and AI insights.
 * Generates JWT, creates transaction, checks count, and tests AI.
 */

import jwt from 'jsonwebtoken';
import http from 'http';

const JWT_SECRET = 'super_secret_key_1234';
const userId = '6a2dbb459aee7414eacff580';
const API_BASE = 'http://localhost:5000';

// Helper: POST request
function makeRequest(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  try {
    const token = jwt.sign({ userId, name: 'Test User' }, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Token generated:', token.slice(0, 20) + '...');

    // 1. Create transaction
    console.log('\n📝 Creating transaction...');
    const createRes = await makeRequest('POST', '/api/create-transaction', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }, {
      title: 'Lunch',
      amount: 25,
      type: 'expense',
      category: 'Food',
      description: 'Business lunch'
    });
    console.log(`  Status: ${createRes.status}`);
    console.log(`  Response:`, createRes.data);

    // 2. Check transaction count
    console.log('\n📊 Checking transaction count...');
    const debugRes = await makeRequest('GET', '/api/debug/transactions-count', {
      'Authorization': `Bearer ${token}`
    });
    console.log(`  Status: ${debugRes.status}`);
    console.log(`  Count: ${debugRes.data.count}`);
    console.log(`  Sample:`, debugRes.data.sample ? debugRes.data.sample[0] : 'none');

    // 3. Test AI insights
    console.log('\n🤖 Testing AI insights...');
    const aiRes = await makeRequest('POST', '/api/ai/insights', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }, {});
    console.log(`  Status: ${aiRes.status}`);
    console.log(`  Insight (first 150 chars): ${aiRes.data.insight ? aiRes.data.insight.slice(0, 150) : 'N/A'}`);

    console.log('\n✅ E2E test completed!');
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();
