const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.JWT_ACCESS_SECRET = 'test-only-admin-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-only-admin-refresh-secret';

const jwt = require('jsonwebtoken');
const adminRepository = require('../src/repositories/adminRepository');
const pool = require('../src/config/db');
const app = require('../src/app');
const originalFindById = adminRepository.findById;
const originalQuery = pool.query;
const accountId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

function token(role = 'untrusted-claim', expiresIn, id = accountId) {
  const options = expiresIn === undefined ? {} : { expiresIn };
  const payload = { role };
  if (id) {
    payload.id = id;
  }
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
}

async function request({
  path = '/api/v1/admin/analytics/heatmap',
  accessToken,
  account = { id: accountId, role: 'admin', is_active: true },
  query = async () => ({ rows: [] }),
} = {}) {
  adminRepository.findById = async () => {
    if (account instanceof Error) {
      throw account;
    }
    return account;
  };
  pool.query = query;

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const headers = { connection: 'close' };
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { headers });
    return { status: response.status, body: await response.json() };
  } finally {
    adminRepository.findById = originalFindById;
    pool.query = originalQuery;
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

test('admin analytics API rejects missing, invalid and expired access tokens', async (context) => {
  await context.test('missing token', async () => {
    const result = await request({ accessToken: undefined });
    assert.equal(result.status, 401);
  });
  await context.test('invalid token', async () => {
    const result = await request({ accessToken: 'not-a-jwt' });
    assert.equal(result.status, 401);
  });
  await context.test('expired token', async () => {
    const result = await request({ accessToken: token('admin', -1) });
    assert.equal(result.status, 401);
  });
  await context.test('token without an account id', async () => {
    const result = await request({ accessToken: token('admin', undefined, null) });
    assert.equal(result.status, 401);
  });
});

test('admin analytics API rejects missing, inactive and unauthorized accounts', async (context) => {
  for (const [name, account] of [
    ['missing account', null],
    ['inactive account', { id: accountId, role: 'admin', is_active: false }],
    ['disallowed role', { id: accountId, role: 'viewer', is_active: true }],
  ]) {
    await context.test(name, async () => {
      const result = await request({ accessToken: token('super_admin'), account });
      assert.equal(result.status, 403);
    });
  }
});

test('active super_admin, admin and editor accounts can read analytics', async (context) => {
  for (const role of ['super_admin', 'admin', 'editor']) {
    await context.test(role, async () => {
      const result = await request({
        accessToken: token('viewer'),
        account: { id: accountId, role, is_active: true },
        query: async () => ({
          rows: [{ latitude: '16.1', longitude: '108.2', count: '2' }],
        }),
      });
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.data, [[16.1, 108.2, 2]]);
    });
  }
});

test('admin analytics API rejects repository failures without exposing details', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const result = await request({
      accessToken: token(),
      account: new Error('sensitive database connection details'),
    });
    assert.equal(result.status, 500);
    assert.equal(result.body.error, 'Internal server error');
    assert.doesNotMatch(JSON.stringify(result.body), /sensitive database/);
  } finally {
    console.error = originalConsoleError;
  }
});

test('GET /api/v1/admin/analytics/heatmap returns weighted coordinate arrays', async () => {
  const result = await request({
    accessToken: token(),
    query: async (sql) => {
      assert.match(sql, /FROM tracking_logs/);
      assert.match(sql, /GROUP BY latitude, longitude/);
      return {
        rows: [
          { latitude: '16.09912000', longitude: '108.27745000', count: '3' },
          { latitude: '16.10000000', longitude: '108.27800000', count: '1' },
        ],
      };
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data, [[16.09912, 108.27745, 3], [16.1, 108.278, 1]]);
});

test('GET /api/v1/admin/analytics/dashboard returns POI counts and average listening duration', async () => {
  const result = await request({
    path: '/api/v1/admin/analytics/dashboard',
    accessToken: token(),
    query: async (sql) => {
      if (sql.includes('AVG(duration_listened_seconds)')) {
        return { rows: [{ average_listening_seconds: '42.5' }] };
      }
      assert.match(sql, /FROM play_history ph\s+JOIN pois p/);
      return {
        rows: [{
          poi_id: accountId,
          code: 'POI_CHANHDIEN_01',
          name: 'Chánh Điện',
          play_count: '7',
        }],
      };
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data, {
    topPois: [{
      poiId: accountId,
      code: 'POI_CHANHDIEN_01',
      name: 'Chánh Điện',
      playCount: 7,
    }],
    averageListeningSeconds: 42.5,
  });
});

test('admin analytics database failures return a generic server error', async () => {
  const result = await request({
    accessToken: token(),
    query: async () => {
      throw new Error('sensitive database connection details');
    },
  });
  assert.equal(result.status, 500);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /sensitive database/);
});
