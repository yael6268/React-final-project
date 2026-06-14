#!/usr/bin/env node
import jwt from 'jsonwebtoken';
import http from 'http';

const JWT_SECRET = 'super_secret_key_1234';
const userId = '6a2dbb459aee7414eacff580';
const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const token = jwt.sign({ userId, name: 'TestUser' }, JWT_SECRET, { expiresIn: '1h' });
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': body ? Buffer.byteLength(body) : 0
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing API endpoints...\n');

    // 1. Create transaction
    console.log('1. Creating transaction...');
    const createBody = JSON.stringify({
      title: 'Groceries',
      amount: 45.50,
      type: 'expense',
      category: 'Food',
      description: 'Weekly groceries'
    });
    const createRes = await makeRequest('POST', '/api/create-transaction', createBody);
    console.log(`   Status: ${createRes.status}`);
    console.log(`   Response:`, createRes.body);

    // 2. Check count
    console.log('\n2. Checking transaction count...');
    const countRes = await makeRequest('GET', '/api/debug/transactions-count', null);
    console.log(`   Status: ${countRes.status}`);
    console.log(`   Count: ${countRes.body.count}`);
    console.log(`   Sample:`, countRes.body.sample?.[0] || 'none');

    // 3. Test AI insights
    console.log('\n3. Testing AI insights...');
    const aiRes = await makeRequest('POST', '/api/ai/insights', JSON.stringify({}));
    console.log(`   Status: ${aiRes.status}`);
    const insight = typeof aiRes.body === 'string' ? aiRes.body : aiRes.body.insight;
    console.log(`   Insight (first 100 chars):`, (insight || 'N/A').slice(0, 100));

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    console.error('Stack:', error.stack || 'no stack');
    process.exit(1);
  }
}

test();
