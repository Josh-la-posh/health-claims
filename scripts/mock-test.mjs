import { server } from './mock-server.mjs';

async function req(path, body) {
  const res = await fetch(`http://localhost:4001${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

(async function run() {
  console.log('Testing login (success)...');
  console.log(await req('/account', { email: 'user@example.com', password: 'pass123' }));

  console.log('\nTesting login (fail)...');
  console.log(await req('/account', { email: 'fail@example.com', password: 'pass123' }));

  console.log('\nTesting signup...');
  console.log(await req('/account/signup', { contactEmail: 'new@example.com', country: 'NG', businessName: 'Test' }));

  console.log('\nTesting forget-password...');
  console.log(await req('/account/forget-password', { email: 'new@example.com' }));

  console.log('\nTesting reset-password...');
  console.log(await req('/account/reset-password', { token: 'abc', password: 'newpass' }));

  console.log('\nTesting verify-email...');
  console.log(await req('/account/verify-email', { token: 'abc' }));

  console.log('\nTesting resend-confirm-account...');
  console.log(await req('/account/resend-confirm-account', { email: 'new@example.com' }));

  // close server
  server.close(() => console.log('Server closed'));
})();
