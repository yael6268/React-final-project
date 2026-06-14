const http = require('http');
const makeRequest = (options, data) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => resolve({ statusCode: res.statusCode, body }));
  });
  req.on('error', reject);
  if (data) req.write(JSON.stringify(data));
  req.end();
});

(async () => {
  try {
    console.log('Registering user...');
    const reg = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { name: 'Demo', email: 'demo@example.com', password: 'Demo1234!' });
    console.log('Register response:', reg.statusCode, reg.body);

    console.log('Logging in...');
    const login = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'demo@example.com', password: 'Demo1234!' });
    console.log('Login response:', login.statusCode, login.body);
    const token = JSON.parse(login.body).token;

    console.log('Creating transaction...');
    const tx = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/transactions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }, { title: 'Groceries', amount: 120, type: 'expense', category: 'מזון' });
    console.log('Transaction response:', tx.statusCode, tx.body);

    console.log('Requesting AI insight...');
    const ai = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/ai/insights', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }, {});
    console.log('AI response:', ai.statusCode, ai.body);
  } catch (e) {
    console.error('Test script error', e);
  }
})();
