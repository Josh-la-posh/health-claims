import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4001;

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(obj));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    // CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname.replace(/\/+$/, ''); // remove trailing slash

  // Simulate small delay
  await new Promise((r) => setTimeout(r, 150));

  if (req.method === 'POST' && pathname === '/account') {
    const body = await parseBody(req);
    // login
    if (!body.email || !body.password) {
      sendJson(res, 400, { title: 'Missing credentials', instance: '/account' });
      return;
    }
    if (String(body.email).includes('fail')) {
      sendJson(res, 401, { title: 'Invalid credentials.', instance: '/account' });
      return;
    }
    const data = {
      id: 'mock-user-id-123',
      fullName: 'Mock User',
      emailAddress: body.email,
      token: 'mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      role: 'ADMIN',
      hmoId: '8e4c6fa4-6ac3-43bb-b78f-326dccac990c',
      isProvider: false,
      providerId: '00000000-0000-0000-0000-000000000000'
    };
    sendJson(res, 200, { data, message: 'Login in successfully.', isSuccess: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/signup') {
    const body = await parseBody(req);
    if (!body.contactEmail) {
      sendJson(res, 400, { title: 'Missing email', instance: '/account/signup' });
      return;
    }
    const data = {
      id: Math.floor(Math.random() * 100000),
      contactEmail: body.contactEmail,
      countryCode: body.country || 'NG',
      status: 'PENDING',
      isWhitelisted: false,
      industryCategoryId: body.industryCategoryId || 0,
      businessType: 'MERCHANT',
      registrationType: 'STANDARD',
    };
    sendJson(res, 200, { data, message: 'Registration successful', isSuccess: true });
    return;
  }

  if (req.method === 'PUT' && pathname === '/account/reset-password') {
    const body = await parseBody(req);
    if (!body.email) {
      sendJson(res, 400, { title: 'Missing email', instance: '/account/reset-password' });
      return;
    }
    if (String(body.email).includes('notfound')) {
      sendJson(res, 404, { title: 'User not found', instance: '/account/reset-password' });
      return;
    }
    sendJson(res, 200, { data: null, message: 'Password reset link sent to your email', isSuccess: true });
    return;
  }

  if (req.method === 'PUT' && pathname === '/account/password/reset') {
    const body = await parseBody(req);
    if (!body.token || !body.password || !body.email) {
      sendJson(res, 400, { title: 'Missing token, password, or email', instance: '/account/password/reset' });
      return;
    }
    // Return user data like a login response
    const data = {
      id: 'reset-user-id-123',
      fullName: 'Reset User',
      emailAddress: body.email,
      token: 'mock-jwt-token-after-reset-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      role: 'USER',
      hmoId: '8e4c6fa4-6ac3-43bb-b78f-326dccac990c',
      isProvider: false,
      providerId: '00000000-0000-0000-0000-000000000000'
    };
    sendJson(res, 200, { data, message: 'Password reset successful', isSuccess: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/verify-email') {
    const body = await parseBody(req);
    if (!body.token) {
      sendJson(res, 400, { title: 'Missing token', instance: '/account/verify-email' });
      return;
    }
    sendJson(res, 200, { data: null, message: 'Email verified successfully', isSuccess: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/resend-confirm-account') {
    const body = await parseBody(req);
    if (!body.email) {
      sendJson(res, 400, { title: 'Missing email', instance: '/account/resend-confirm-account' });
      return;
    }
    sendJson(res, 200, { data: null, message: 'Confirmation email resent successfully', isSuccess: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/confirm-account') {
    const body = await parseBody(req);
    if (!body.token || !body.password) {
      sendJson(res, 400, { title: 'Missing token or password', instance: '/account/confirm-account' });
      return;
    }
    sendJson(res, 200, { data: null, message: 'Password set successfully', isSuccess: true });
    return;
  }

  // default
  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => console.log(`Mock auth server listening on http://localhost:${PORT}`));

// Export server for tests if imported
export { server };
