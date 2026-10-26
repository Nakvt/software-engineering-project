const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.JWT_ACCESS_SECRET = 'test-only-admin-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-only-admin-refresh-secret';

const jwt = require('jsonwebtoken');
const adminRepository = require('../src/repositories/adminRepository');
const pool = require('../src/config/db');
const app = require('../src/app');

const originalQuery = pool.query;
const originalFindById = adminRepository.findById;
const accountId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const sessionId = '0b7c1f1e-6a58-4c1e-9d3b-2f6f2d0f6a11';

async function call({ method = 'GET', path, body, accessToken, query = async () => ({ rows: [] }) }) {
  pool.query = query;
  adminRepository.findById = async () => ({ id: accountId, role: 'admin', is_active: true });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const headers = { connection: 'close' };
    if (body !== undefined) {
      headers['content-type'] = 'application/json';
    }
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    pool.query = originalQuery;
    adminRepository.findById = originalFindById;
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

test('POST /api/v1/sessions', async (context) => {
  await context.test('creates a session with a parameterized insert', async () => {
    const calls = [];
    const result = await call({
      method: 'POST',
      path: '/api/v1/sessions',
      body: { deviceType: ' android ' },
      query: async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [{ session_id: sessionId }] };
      },
    });
    assert.equal(result.status, 201);
    assert.equal(result.body.success, true);
    assert.deepEqual(result.body.data, { sessionId });
    assert.equal(calls.length, 1);
    assert.match(calls[0].sql, /INSERT INTO user_sessions/);
    assert.deepEqual(calls[0].params, ['android']);
  });

  for (const [name, body] of [
    ['missing body field', {}],
    ['non-string deviceType', { deviceType: 5 }],
    ['blank deviceType', { deviceType: '   ' }],
    ['too long deviceType', { deviceType: 'x'.repeat(51) }],
  ]) {
    await context.test(`rejects ${name}`, async () => {
      let queried = false;
      const result = await call({
        method: 'POST',
        path: '/api/v1/sessions',
        body,
        query: async () => {
          queried = true;
          return { rows: [] };
        },
      });
      assert.equal(result.status, 400);
      assert.equal(result.body.success, false);
      assert.equal(queried, false);
    });
  }

  await context.test('hides database errors', async () => {
    const result = await call({
      method: 'POST',
      path: '/api/v1/sessions',
      body: { deviceType: 'ios' },
      query: async () => {
        throw new Error('connection to secret-host failed');
      },
    });
    assert.equal(result.status, 500);
    assert.equal(result.body.error, 'Internal server error');
    assert.equal(JSON.stringify(result.body).includes('secret-host'), false);
  });
});

test('POST /api/v1/sessions/:sessionId/heartbeat', async (context) => {
  await context.test('updates last_active_at and is_online', async () => {
    const calls = [];
    const result = await call({
      method: 'POST',
      path: `/api/v1/sessions/${sessionId}/heartbeat`,
      query: async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [{ session_id: sessionId, last_active_at: '2026-01-01T00:00:00.000Z' }] };
      },
    });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data, { sessionId, lastActiveAt: '2026-01-01T00:00:00.000Z' });
    assert.match(calls[0].sql, /last_active_at = NOW\(\), is_online = TRUE/);
    assert.deepEqual(calls[0].params, [sessionId]);
  });

  await context.test('rejects an invalid UUID without querying', async () => {
    let queried = false;
    const result = await call({
      method: 'POST',
      path: "/api/v1/sessions/1'%20OR%20'1'='1/heartbeat",
      query: async () => {
        queried = true;
        return { rows: [] };
      },
    });
    assert.equal(result.status, 400);
    assert.equal(queried, false);
  });

  await context.test('returns 404 when the session does not exist', async () => {
    const result = await call({
      method: 'POST',
      path: `/api/v1/sessions/${sessionId}/heartbeat`,
      query: async () => ({ rows: [] }),
    });
    assert.equal(result.status, 404);
    assert.equal(result.body.success, false);
  });

  await context.test('hides database errors', async () => {
    const result = await call({
      method: 'POST',
      path: `/api/v1/sessions/${sessionId}/heartbeat`,
      query: async () => {
        throw new Error('boom');
      },
    });
    assert.equal(result.status, 500);
    assert.equal(result.body.error, 'Internal server error');
  });
});

test('GET /api/v1/admin/analytics/online-sessions', async (context) => {
  const path = '/api/v1/admin/analytics/online-sessions';
  const accessToken = jwt.sign({ id: accountId }, process.env.JWT_ACCESS_SECRET);

  await context.test('requires an access token', async () => {
    const result = await call({ path });
    assert.equal(result.status, 401);
  });

  await context.test('returns the count of sessions active in the last 5 minutes', async () => {
    const calls = [];
    const result = await call({
      path,
      accessToken,
      query: async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [{ online_sessions: 3, as_of: '2026-01-01T00:00:00.000Z' }] };
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.deepEqual(result.body.data, {
      onlineSessions: 3,
      windowMinutes: 5,
      asOf: '2026-01-01T00:00:00.000Z',
    });
    assert.match(calls[0].sql, /FROM user_sessions/);
    assert.match(calls[0].sql, /last_active_at >= NOW\(\)/);
    assert.deepEqual(calls[0].params, [5]);
  });

  await context.test('rejects query parameters', async () => {
    const result = await call({ path: `${path}?x=1`, accessToken });
    assert.equal(result.status, 400);
  });

  await context.test('hides database errors', async () => {
    const result = await call({
      path,
      accessToken,
      query: async () => {
        throw new Error('boom');
      },
    });
    assert.equal(result.status, 500);
    assert.equal(result.body.error, 'Internal server error');
  });
});
