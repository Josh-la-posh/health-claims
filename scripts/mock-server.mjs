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
      sendJson(res, 400, { requestSuccessful: false, responseData: null, message: 'Missing credentials', responseCode: '01' });
      return;
    }
    if (String(body.email).includes('fail')) {
      sendJson(res, 401, { requestSuccessful: false, responseData: null, message: 'Invalid credentials', responseCode: '01' });
      return;
    }
    const responseData = {
      accessToken: 'mock-access-token',
      expiredIn: 3600,
      aggregator: { aggregatorCode: 'MOCK', aggregatorName: 'Mock Aggregator' },
      merchants: [],
      user: {
        firstName: 'Mock', lastName: 'User', email: body.email, phoneNumber: '08123456789', isEmailConfirmed: true,
        emailConfirmationDate: new Date().toISOString(), isAdmin: false, id: 'user-1', isActive: true,
        createdDate: new Date().toISOString(), modifiedDate: new Date().toISOString(), modifiedBy: 'mock'
      }
    };
    sendJson(res, 200, { requestSuccessful: true, responseData, message: 'Login successful', responseCode: '00' });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/signup') {
    const body = await parseBody(req);
    if (!body.contactEmail) {
      sendJson(res, 400, { requestSuccessful: false, responseData: null, message: 'Missing email', responseCode: '01' });
      return;
    }
    const responseData = {
      id: Math.floor(Math.random() * 100000),
      contactEmail: body.contactEmail,
      countryCode: body.country || 'NG',
      status: 'PENDING',
      isWhitelisted: false,
      industryCategoryId: body.industryCategoryId || 0,
      businessType: 'MERCHANT',
      registrationType: 'STANDARD',
    };
    sendJson(res, 200, { requestSuccessful: true, responseData, message: 'Registration successful', responseCode: '00' });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/forget-password') {
    const body = await parseBody(req);
    if (!body.email) return sendJson(res, 400, { message: 'Missing email' });
    sendJson(res, 200, { message: 'Password reset email sent' });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/reset-password') {
    const body = await parseBody(req);
    if (!body.token || !body.password) return sendJson(res, 400, { message: 'Missing token or password' });
    sendJson(res, 200, { message: 'Password reset successful' });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/verify-email') {
    const body = await parseBody(req);
    if (!body.token) return sendJson(res, 400, { message: 'Missing token' });
    sendJson(res, 200, { message: 'Email verified' });
    return;
  }

  if (req.method === 'POST' && pathname === '/account/resend-confirm-account') {
    const body = await parseBody(req);
    if (!body.email) return sendJson(res, 400, { message: 'Missing email' });
    sendJson(res, 200, { message: 'Confirmation resent' });
    return;
  }

  // default
  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => console.log(`Mock auth server listening on http://localhost:${PORT}`));

// Export server for tests if imported
export { server };
