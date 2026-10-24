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
const originalConnect = pool.connect;
const poiId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const poiBody = {
  code: 'POI_CHANHDIEN_01',
  name: 'Chánh Điện',
  location: { lat: 16.099123, lng: 108.277456 },
  radius: 20,
  content: {
    languageCode: 'vi',
    accent: 'central',
    title: 'Chánh Điện',
    ttsScript: 'Chào mừng bạn đến với Chánh Điện.',
    audioUrl: 'https://example.test/audio.mp3',
    audioDurationSeconds: 95,
  },
};

function token(role = 'untrusted-claim', expiresIn, id = poiId) {
  const options = expiresIn === undefined ? {} : { expiresIn };
  const payload = { role };
  if (id) {
    payload.id = id;
  }
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
}

async function request({
  method = 'POST',
  path = '/api/v1/admin/pois',
  accessToken,
  account = { id: poiId, role: 'admin', is_active: true },
  body = poiBody,
  query = originalQuery,
  connect = originalConnect,
} = {}) {
  adminRepository.findById = async () => {
    if (account instanceof Error) {
      throw account;
    }
    return account;
  };
  pool.query = query;
  pool.connect = connect;

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const headers = { connection: 'close' };
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }
    if (body !== undefined) {
      headers['content-type'] = 'application/json';
    }
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    adminRepository.findById = originalFindById;
    pool.query = originalQuery;
    pool.connect = originalConnect;
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

function createClient() {
  const queries = [];
  return {
    queries,
    async query(sql) {
      queries.push(sql);
      if (sql.includes('INSERT INTO pois')) {
        return {
          rows: [{
            id: poiId,
            code: poiBody.code,
            name_default: poiBody.name,
            latitude: '16.09912300',
            longitude: '108.27745600',
            radius: 20,
            priority: 1,
            cooldown_seconds: 300,
            image_url: null,
          }],
        };
      }
      return { rows: [] };
    },
    release() {},
  };
}

test('admin POI API rejects missing, invalid and expired access tokens', async (context) => {
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

test('admin POI API rejects missing, inactive and unauthorized accounts', async (context) => {
  for (const [name, account] of [
    ['missing account', null],
    ['inactive account', { id: poiId, role: 'admin', is_active: false }],
    ['disallowed role', { id: poiId, role: 'viewer', is_active: true }],
  ]) {
    await context.test(name, async () => {
      const result = await request({ accessToken: token('super_admin'), account });
      assert.equal(result.status, 403);
    });
  }
});

test('active super_admin, admin and editor accounts can create POIs', async (context) => {
  for (const role of ['super_admin', 'admin', 'editor']) {
    await context.test(role, async () => {
      const client = createClient();
      const result = await request({
        accessToken: token('viewer'),
        account: { id: poiId, role, is_active: true },
        connect: async () => client,
      });
      assert.equal(result.status, 201);
      assert.equal(result.body.data.id, poiId);
      assert.equal(result.body.data.location.lat, poiBody.location.lat);
      assert.ok(client.queries.includes('BEGIN'));
      assert.ok(client.queries.includes('COMMIT'));
    });
  }
});

test('admin POI API rejects repository failures without exposing details', async () => {
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

test('POST /api/v1/admin/pois/:id/contents upserts multilingual content', async () => {
  let queryCount = 0;
  const result = await request({
    path: `/api/v1/admin/pois/${poiId}/contents`,
    accessToken: token(),
    body: poiBody.content,
    query: async (sql) => {
      queryCount++;
      if (sql.includes('FROM pois p')) {
        return { rows: [{ id: poiId, content_id: null }] };
      }
      return {
        rows: [{
          id: 'd62b5ba4-0328-4228-9888-6a3b2b739532',
          poi_id: poiId,
          language_code: 'vi',
          accent: 'central',
          title: poiBody.content.title,
          description: null,
          tts_script: poiBody.content.ttsScript,
          audio_url: poiBody.content.audioUrl,
          audio_duration_seconds: 95,
        }],
      };
    },
  });
  assert.equal(result.status, 201);
  assert.equal(queryCount, 2);
  assert.equal(result.body.data.language_code, 'vi');
});

test('PUT /api/v1/admin/pois/:id updates coordinates and radius', async () => {
  const result = await request({
    method: 'PUT',
    path: `/api/v1/admin/pois/${poiId}`,
    accessToken: token(),
    body: { location: { lat: 16.2, lng: 108.3 }, radius: 25 },
    query: async (sql, values) => {
      assert.match(sql, /UPDATE pois/);
      assert.deepEqual(values, [16.2, 108.3, 25, poiId]);
      return { rows: [{ id: poiId, latitude: '16.2', longitude: '108.3', radius: 25 }] };
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data.location, { lat: 16.2, lng: 108.3 });
  assert.equal(result.body.data.radius, 25);
});

test('admin POI database failures return a generic server error', async () => {
  const result = await request({
    accessToken: token(),
    connect: async () => {
      throw new Error('sensitive database connection details');
    },
  });
  assert.equal(result.status, 500);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /sensitive database/);
});
