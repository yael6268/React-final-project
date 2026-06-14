#!/usr/bin/env node
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = 'super_secret_key_1234';
const userId = '6a2dbb459aee7414eacff580';
const API_BASE = 'http://localhost:5000';

// Generate token
const token = jwt.sign({ userId, name: 'Test User' }, JWT_SECRET, { expiresIn: '1h' });
console.log('Generated token:', token);

async function test() {
  try {
    // 1. Create a transaction
    console.log('\n=== Creating Transaction ===');
    const createRes = await fetch(`${API_BASE}/api/create-transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Expense',
        amount: 150,
        type: 'expense',
        category: 'Food',
        description: 'Lunch'
      })
    });
    console.log('Create status:', createRes.status);
    const createData = await createRes.json();
    console.log('Create response:', JSON.stringify(createData, null, 2));

    // 2. Check transaction count
    console.log('\n=== Checking Transaction Count ===');
    const debugRes = await fetch(`${API_BASE}/api/debug/transactions-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Debug status:', debugRes.status);
    const debugData = await debugRes.json();
    console.log('Debug response:', JSON.stringify(debugData, null, 2));

    // 3. Test AI insights
    console.log('\n=== Testing AI Insights ===');
    const aiRes = await fetch(`${API_BASE}/api/ai/insights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    console.log('AI status:', aiRes.status);
    const aiData = await aiRes.json();
    console.log('AI insight:', aiData.insight?.slice(0, 200));

  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
