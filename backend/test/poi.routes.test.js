const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.DB_PASSWORD ||= 'test-only';

const pool = require('../src/config/db');
const app = require('../src/app');
const originalQuery = pool.query;

const poiRow = {
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  code: 'POI_CHANHDIEN_01',
  name: 'Chánh Điện',
  latitude: '16.09912300',
  longitude: '108.27745600',
  radius: 20,
  priority: 10,
  cooldown_seconds: 300,
  image_url: 'https://cdn.example.com/chanhdien.jpg',
  audio_url: 'https://cdn.example.com/audio/cd_vi_north.mp3',
  tts_script: 'Chào mừng bạn đến với Chánh Điện.',
  audio_duration_seconds: 95,
};

async function request(path, query) {
  pool.query = query;
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      headers: { connection: 'close' },
    });
    return { status: response.status, body: await response.json() };
  } finally {
    pool.query = originalQuery;
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

function assertEnvelope(body, success) {
  assert.equal(body.success, success);
  assert.equal(body.error === null, success);
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
}

test('GET /api/v1/pois returns mapped POIs with default locale', async () => {
  const result = await request('/api/v1/pois', async (_sql, values) => {
    assert.deepEqual(values, ['vi', 'north']);
    return { rows: [poiRow] };
  });

  assert.equal(result.status, 200);
  assertEnvelope(result.body, true);
  assert.deepEqual(result.body.data, [
    {
      id: poiRow.id,
      code: poiRow.code,
      name: poiRow.name,
      location: { lat: 16.099123, lng: 108.277456 },
      radius: 20,
      priority: 10,
      cooldownSeconds: 300,
      imageUrl: poiRow.image_url,
      audio: {
        audioUrl: poiRow.audio_url,
        ttsScript: poiRow.tts_script,
        duration: 95,
      },
    },
  ]);
});

test('GET /api/v1/pois sorts POIs by distance when coordinates are provided', async () => {
  const nearestPoiId = '11111111-1111-1111-1111-111111111111';
  const fartherPoiId = '22222222-2222-2222-2222-222222222222';
  const result = await request(
    '/api/v1/pois?lat=16.1&lng=108.2&lang=en&accent=neutral',
    async (_sql, values) => {
      assert.deepEqual(values, ['en', 'neutral']);
      return {
        rows: [
          { ...poiRow, id: fartherPoiId, latitude: '16.2', longitude: '108.2' },
          { ...poiRow, id: nearestPoiId, latitude: '16.1', longitude: '108.2' },
        ],
      };
    },
  );

  assert.equal(result.status, 200);
  assertEnvelope(result.body, true);
  assert.deepEqual(result.body.data.map((poi) => poi.id), [nearestPoiId, fartherPoiId]);
});

test('GET /api/v1/pois returns an empty list when no POIs match the query', async () => {
  const result = await request('/api/v1/pois?lat=16.1&lng=108.2', async () => ({ rows: [] }));

  assert.equal(result.status, 200);
  assertEnvelope(result.body, true);
  assert.deepEqual(result.body.data, []);
});

test('GET /api/v1/pois rejects invalid coordinates without querying the database', async () => {
  const result = await request('/api/v1/pois?lat=91', async () => {
    assert.fail('Database must not be queried for invalid coordinates');
  });

  assert.equal(result.status, 400);
  assertEnvelope(result.body, false);
});

test('GET /api/v1/pois returns a generic error when the database fails', async () => {
  const result = await request('/api/v1/pois', async () => {
    throw new Error('sensitive database connection detail');
  });

  assert.equal(result.status, 500);
  assertEnvelope(result.body, false);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /sensitive database connection detail/);
});

test('GET /api/v1/pois/by-code/:code returns one POI for the requested locale', async () => {
  const result = await request(
    '/api/v1/pois/by-code/POI_CHANHDIEN_01?lang=vi&accent=north',
    async (_sql, values) => {
      assert.deepEqual(values, ['vi', 'north', 'POI_CHANHDIEN_01']);
      return { rows: [poiRow] };
    },
  );

  assert.equal(result.status, 200);
  assertEnvelope(result.body, true);
  assert.equal(result.body.data.code, poiRow.code);
  assert.equal(result.body.data.audio.ttsScript, poiRow.tts_script);
});

test('GET /api/v1/pois/by-code/:code returns 404 when the POI does not exist', async () => {
  const result = await request('/api/v1/pois/by-code/UNKNOWN', async () => ({ rows: [] }));

  assert.equal(result.status, 404);
  assertEnvelope(result.body, false);
  assert.equal(result.body.error, 'POI not found');
});

test('GET /api/v1/pois/by-code/:code rejects a blank code', async () => {
  const result = await request('/api/v1/pois/by-code/%20%20', async () => {
    assert.fail('Database must not be queried for a blank code');
  });

  assert.equal(result.status, 400);
  assertEnvelope(result.body, false);
});

test('GET /api/v1/pois/by-code/:code returns a generic error when the database fails', async () => {
  const result = await request('/api/v1/pois/by-code/POI_CHANHDIEN_01', async () => {
    throw new Error('sensitive database connection detail');
  });

  assert.equal(result.status, 500);
  assertEnvelope(result.body, false);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /sensitive database connection detail/);
});