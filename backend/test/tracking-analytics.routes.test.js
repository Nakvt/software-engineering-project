const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.DB_PASSWORD ||= 'test-only';

const pool = require('../src/config/db');
const app = require('../src/app');
const originalConnect = pool.connect;
const originalQuery = pool.query;

const sessionId = 'a73985d2-f67a-42c2-8419-58b9f36fba7c';
const poiId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const pingBody = {
	sessionId,
	latitude: 16.09912,
	longitude: 108.27745,
	lang: 'vi',
	accent: 'central',
};
const listenBody = {
	sessionId,
	poiId,
	triggerType: 'geofence',
	durationListenedSeconds: 45,
	completed: false,
};

function createPoi(overrides = {}) {
	return {
		id: poiId,
		name: 'Chánh Điện',
		latitude: '16.09912000',
		longitude: '108.27745000',
		radius: 20,
		priority: 10,
		cooldown_seconds: 300,
		audio_url: 'https://cdn.example.com/audio/chanhdien.mp3',
		on_cooldown: false,
		...overrides,
	};
}

async function request(path, body, { clientQuery, poolQuery } = {}) {
	pool.connect = async () => ({
		query: clientQuery || (async () => ({ rows: [] })),
		release() {},
	});
	pool.query = poolQuery || originalQuery;

	const server = app.listen(0, '127.0.0.1');
	await once(server, 'listening');

	try {
		const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				connection: 'close',
			},
			body: JSON.stringify(body),
		});
		return { status: response.status, body: await response.json() };
	} finally {
		pool.connect = originalConnect;
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

function createTrackingQuery({ sessionExists = true, previousLocation = null, pois = [] } = {}) {
	const queries = [];
	return {
		queries,
		async query(sql, values) {
			queries.push({ sql, values });
			if (sql.includes('SELECT session_id FROM user_sessions')) {
				return { rows: sessionExists ? [{ session_id: sessionId }] : [] };
			}
			if (sql.includes('SELECT latitude, longitude, recorded_at')) {
				return { rows: previousLocation ? [previousLocation] : [] };
			}
			if (sql.includes('INSERT INTO tracking_logs')) return { rows: [] };
			if (sql.includes('FROM pois p')) return { rows: pois };
			return { rows: [] };
		},
	};
}

test('POST /api/v1/tracking/ping logs a valid location and does not trigger without a prior sample', async () => {
	const db = createTrackingQuery();
	const result = await request('/api/v1/tracking/ping', pingBody, { clientQuery: db.query });

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, { shouldTrigger: false, poi: null });
	const insert = db.queries.find(({ sql }) => sql.includes('INSERT INTO tracking_logs'));
	assert.ok(insert);
	assert.deepEqual(insert.values, [sessionId, pingBody.latitude, pingBody.longitude]);
});

test('POST /api/v1/tracking/ping selects the highest-priority eligible POI after debounce', async () => {
	const previousLocation = {
		latitude: pingBody.latitude,
		longitude: pingBody.longitude,
		recorded_at: new Date(Date.now() - 4000),
	};
	const db = createTrackingQuery({
		previousLocation,
		pois: [
			createPoi({ id: '11111111-1111-1111-1111-111111111111', priority: 5 }),
			createPoi({ priority: 10 }),
		],
	});
	const result = await request('/api/v1/tracking/ping', pingBody, { clientQuery: db.query });

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, {
		shouldTrigger: true,
		poi: {
			id: poiId,
			name: 'Chánh Điện',
			priority: 10,
			audioUrl: 'https://cdn.example.com/audio/chanhdien.mp3',
		},
	});
});

test('POST /api/v1/tracking/ping returns no trigger for cooldown, missing audio, or no POIs', async (context) => {
	const previousLocation = {
		latitude: pingBody.latitude,
		longitude: pingBody.longitude,
		recorded_at: new Date(Date.now() - 4000),
	};
	const cases = [
		{ name: 'cooldown', pois: [createPoi({ on_cooldown: true })] },
		{ name: 'missing audio URL', pois: [createPoi({ audio_url: null })] },
		{ name: 'no POIs', pois: [] },
	];

	for (const scenario of cases) {
		await context.test(scenario.name, async () => {
			const db = createTrackingQuery({ previousLocation, pois: scenario.pois });
			const result = await request('/api/v1/tracking/ping', pingBody, {
				clientQuery: db.query,
			});

			assert.equal(result.status, 200);
			assert.deepEqual(result.body.data, { shouldTrigger: false, poi: null });
		});
	}
});

test('POST /api/v1/tracking/ping validates input and rejects an unknown session', async () => {
	const invalid = await request('/api/v1/tracking/ping', { ...pingBody, latitude: 91 });
	assert.equal(invalid.status, 400);
	assertEnvelope(invalid.body, false);

	const db = createTrackingQuery({ sessionExists: false });
	const missingSession = await request('/api/v1/tracking/ping', pingBody, {
		clientQuery: db.query,
	});
	assert.equal(missingSession.status, 404);
	assertEnvelope(missingSession.body, false);
	assert.equal(db.queries.some(({ sql }) => sql.includes('INSERT INTO tracking_logs')), false);
});

test('POST /api/v1/tracking/ping hides database errors and rolls back', async () => {
	const db = createTrackingQuery();
	db.query = async (sql, values) => {
		db.queries.push({ sql, values });
		if (sql.includes('INSERT INTO tracking_logs')) {
			throw new Error('sensitive database detail');
		}
		if (sql.includes('SELECT session_id FROM user_sessions')) {
			return { rows: [{ session_id: sessionId }] };
		}
		if (sql === 'ROLLBACK') return { rows: [] };
		return { rows: [] };
	};
	const result = await request('/api/v1/tracking/ping', pingBody, { clientQuery: db.query });

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.match(db.queries.at(-1).sql, /ROLLBACK/);
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database detail/);
});

test('POST /api/v1/analytics/listen-event writes a valid event to play_history', async () => {
	let values;
	const result = await request('/api/v1/analytics/listen-event', listenBody, {
		poolQuery: async (sql, queryValues) => {
			assert.match(sql, /INSERT INTO play_history/);
			values = queryValues;
			return { rowCount: 1 };
		},
	});

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, {});
	assert.deepEqual(values, [sessionId, poiId, 'geofence', 45, false]);
});

test('POST /api/v1/analytics/listen-event rejects invalid fields without querying the database', async () => {
	const result = await request(
		'/api/v1/analytics/listen-event',
		{ ...listenBody, durationListenedSeconds: -1 },
		{
			poolQuery: async () => assert.fail('Database must not be queried for invalid input'),
		},
	);

	assert.equal(result.status, 400);
	assertEnvelope(result.body, false);
});

test('POST /api/v1/analytics/listen-event maps foreign-key violations to 404', async () => {
	const result = await request('/api/v1/analytics/listen-event', listenBody, {
		poolQuery: async () => {
			const error = new Error('foreign key violation');
			error.code = '23503';
			throw error;
		},
	});

	assert.equal(result.status, 404);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Session or POI not found');
});

test('POST /api/v1/analytics/listen-event hides unexpected database errors', async () => {
	const result = await request('/api/v1/analytics/listen-event', listenBody, {
		poolQuery: async () => {
			throw new Error('sensitive database detail');
		},
	});

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database detail/);
});