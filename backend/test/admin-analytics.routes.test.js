const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.DB_PASSWORD ||= 'test-only';

const pool = require('../src/config/db');
const app = require('../src/app');
const originalQuery = pool.query;

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

test('GET /api/v1/admin/analytics/heatmap groups exact coordinates into weighted points', async () => {
	const result = await request('/api/v1/admin/analytics/heatmap', async (sql) => {
		assert.match(sql, /FROM tracking_logs/);
		assert.match(sql, /GROUP BY latitude, longitude/);
		assert.doesNotMatch(sql, /tour_pois|ST_\w+|grid|bucket/i);
		return {
			rows: [
				{ latitude: '16.09912000', longitude: '108.27745000', count: '3' },
				{ latitude: '16.10000000', longitude: '108.27800000', count: '1' },
			],
		};
	});

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, [
		[16.09912, 108.27745, 3],
		[16.1, 108.278, 1],
	]);
});

test('GET /api/v1/admin/analytics/heatmap returns an empty list when no logs exist', async () => {
	const result = await request('/api/v1/admin/analytics/heatmap', async () => ({ rows: [] }));

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, []);
});

test('GET /api/v1/admin/analytics/heatmap rejects unsupported query parameters', async () => {
	const result = await request('/api/v1/admin/analytics/heatmap?tourId=example', async () => {
		assert.fail('Unsupported filters must not be silently ignored');
	});

	assert.equal(result.status, 400);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Heatmap query parameters are not supported');
});

test('GET /api/v1/admin/analytics/heatmap hides database errors', async () => {
	const result = await request('/api/v1/admin/analytics/heatmap', async () => {
		throw new Error('sensitive database connection detail');
	});

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database connection detail/);
});

test('GET /api/v1/admin/analytics/dashboard returns POI play counts and average duration', async () => {
	const result = await request('/api/v1/admin/analytics/dashboard', async (sql) => {
		if (sql.includes('AVG(duration_listened_seconds)')) {
			assert.doesNotMatch(sql, /WHERE\s+completed/i);
			return { rows: [{ average_listening_seconds: '42.5' }] };
		}

		assert.match(sql, /FROM play_history ph\s+JOIN pois p ON p.id = ph.poi_id/);
		assert.match(sql, /ORDER BY play_count DESC, p.id ASC/);
		return {
			rows: [
				{
					poi_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
					code: 'POI_CHANHDIEN_01',
					name: 'Chánh Điện',
					play_count: '7',
				},
				{
					poi_id: '11111111-1111-1111-1111-111111111111',
					code: 'POI_TAMTHE_01',
					name: 'Điện Tam Thế',
					play_count: '3',
				},
			],
		};
	});

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, {
		topPois: [
			{
				poiId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
				code: 'POI_CHANHDIEN_01',
				name: 'Chánh Điện',
				playCount: 7,
			},
			{
				poiId: '11111111-1111-1111-1111-111111111111',
				code: 'POI_TAMTHE_01',
				name: 'Điện Tam Thế',
				playCount: 3,
			},
		],
		averageListeningSeconds: 42.5,
	});
});

test('GET /api/v1/admin/analytics/dashboard returns empty rankings and zero average without history', async () => {
	const result = await request('/api/v1/admin/analytics/dashboard', async (sql) => {
		if (sql.includes('AVG(duration_listened_seconds)')) {
			return { rows: [{ average_listening_seconds: '0' }] };
		}
		return { rows: [] };
	});

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, { topPois: [], averageListeningSeconds: 0 });
});

test('GET /api/v1/admin/analytics/dashboard rejects unsupported query parameters', async () => {
	const result = await request('/api/v1/admin/analytics/dashboard?from=invalid', async () => {
		assert.fail('Unsupported filters must not be silently ignored');
	});

	assert.equal(result.status, 400);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Dashboard query parameters are not supported');
});

test('GET /api/v1/admin/analytics/dashboard hides database errors', async () => {
	const result = await request('/api/v1/admin/analytics/dashboard', async (sql) => {
		if (sql.includes('AVG(duration_listened_seconds)')) {
			throw new Error('sensitive database connection detail');
		}
		return { rows: [] };
	});

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database connection detail/);
});