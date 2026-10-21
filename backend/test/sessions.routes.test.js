const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.DB_PASSWORD ||= 'test-only';

const pool = require('../src/config/db');
const app = require('../src/app');
const originalQuery = pool.query;

async function request(body, query) {
	pool.query = query;
	const server = app.listen(0, '127.0.0.1');
	await once(server, 'listening');

	try {
		const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/sessions`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				connection: 'close',
			},
			body: JSON.stringify(body),
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

test('POST /api/v1/sessions creates a session with deviceType', async () => {
	let queryValues;
	const result = await request({ deviceType: 'mobile' }, async (sql, values) => {
		assert.match(sql, /INSERT INTO user_sessions\s*\(session_id, device_type\)\s*VALUES \(\$1, \$2\)/);
		queryValues = values;
		return { rows: [] };
	});

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.match(result.body.data.sessionId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
	assert.deepEqual(queryValues, [result.body.data.sessionId, 'mobile']);
});

test('POST /api/v1/sessions creates a session without deviceType', async () => {
	let queryValues;
	const result = await request({}, async (_sql, values) => {
		queryValues = values;
		return { rows: [] };
	});

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.match(result.body.data.sessionId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
	assert.deepEqual(queryValues, [result.body.data.sessionId, null]);
});

test('POST /api/v1/sessions accepts a request with no body', async () => {
	let queryValues;
	const result = await request(undefined, async (_sql, values) => {
		queryValues = values;
		return { rows: [] };
	});

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.deepEqual(queryValues, [result.body.data.sessionId, null]);
});

test('POST /api/v1/sessions rejects invalid deviceType without querying the database', async (context) => {
	for (const [name, deviceType] of [
		['non-string', 123],
		['over 50 characters', 'd'.repeat(51)],
	]) {
		await context.test(name, async () => {
			const result = await request({ deviceType }, async () => {
				assert.fail('Database must not be queried for invalid deviceType');
			});

			assert.equal(result.status, 400);
			assertEnvelope(result.body, false);
			assert.equal(result.body.error, 'Invalid deviceType');
		});
	}
});

test('POST /api/v1/sessions returns a generic error when the database fails', async () => {
	const result = await request({ deviceType: 'mobile' }, async () => {
		throw new Error('sensitive database connection detail');
	});

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database connection detail/);
});
