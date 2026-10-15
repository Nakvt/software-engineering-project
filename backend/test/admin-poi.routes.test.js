const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

process.env.DB_PASSWORD ||= 'test-only';

const pool = require('../src/config/db');
const app = require('../src/app');
const originalConnect = pool.connect;
const originalQuery = pool.query;

const poiId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const contentId = 'd62b5ba4-0328-4228-9888-6a3b2b739532';
const createBody = {
	code: 'POI_CHANHDIEN_01',
	name: 'Chánh Điện',
	location: { lat: 16.099123, lng: 108.277456 },
	radius: 20,
	imageUrl: 'https://cdn.example.com/chanhdien.jpg',
	content: {
		languageCode: 'vi',
		accent: 'central',
		title: 'Chánh Điện',
		ttsScript: 'Chào mừng bạn đến với Chánh Điện.',
		audioUrl: 'https://cdn.example.com/audio/chanhdien.mp3',
		audioDurationSeconds: 95,
	},
};
const contentBody = {
	languageCode: 'vi',
	accent: 'central',
	title: 'Chánh Điện',
	description: 'Khu chính điện.',
	ttsScript: 'Chào mừng bạn đến với Chánh Điện.',
	audioUrl: 'https://cdn.example.com/audio/chanhdien.mp3',
	audioDurationSeconds: 95,
};

async function request(method, path, body, { clientQuery, poolQuery, onConnect } = {}) {
	pool.connect = async () => {
		onConnect?.();
		return {
			query: clientQuery || (async () => ({ rows: [] })),
			release() {},
		};
	};
	pool.query = poolQuery || originalQuery;

	const server = app.listen(0, '127.0.0.1');
	await once(server, 'listening');

	try {
		const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
			method,
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

function createPoiRow() {
	return {
		id: poiId,
		code: createBody.code,
		name_default: createBody.name,
		latitude: '16.09912300',
		longitude: '108.27745600',
		radius: 20,
		priority: 1,
		cooldown_seconds: 300,
		image_url: createBody.imageUrl,
	};
}

function createClientQuery({ onContentInsert, onPoiInsert } = {}) {
	const queries = [];
	return {
		queries,
		async query(sql, values) {
			queries.push({ sql, values });
			if (sql.includes('INSERT INTO pois')) {
				if (onPoiInsert) return onPoiInsert(sql, values);
				return { rows: [createPoiRow()] };
			}
			if (sql.includes('INSERT INTO poi_contents') && onContentInsert) {
				return onContentInsert(sql, values);
			}
			return { rows: [] };
		},
	};
}

function createContentRow(overrides = {}) {
	return {
		id: contentId,
		poi_id: poiId,
		language_code: contentBody.languageCode,
		accent: contentBody.accent,
		title: contentBody.title,
		description: contentBody.description,
		tts_script: contentBody.ttsScript,
		audio_url: contentBody.audioUrl,
		audio_duration_seconds: contentBody.audioDurationSeconds,
		...overrides,
	};
}

test('POST /api/v1/admin/pois creates a POI and initial content transactionally', async () => {
	const client = createClientQuery();
	const result = await request('POST', '/api/v1/admin/pois', createBody, {
		clientQuery: client.query,
	});

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.equal(result.body.data.id, poiId);
	assert.equal(result.body.data.code, createBody.code);
	assert.deepEqual(result.body.data.location, createBody.location);
	assert.equal(result.body.data.audio.ttsScript, createBody.content.ttsScript);
	assert.match(client.queries[0].sql, /^BEGIN$/);
	assert.ok(client.queries.some(({ sql }) => sql.includes('INSERT INTO pois')));
	assert.ok(client.queries.some(({ sql }) => sql.includes('INSERT INTO poi_contents')));
	assert.match(client.queries.at(-1).sql, /^COMMIT$/);
	assert.equal(client.queries[2].values[1], 'vi');
	assert.equal(client.queries[2].values[2], 'central');
});

test('POST /api/v1/admin/pois rejects invalid fields before database access', async () => {
	let connectCount = 0;
	const result = await request('POST', '/api/v1/admin/pois', {
		...createBody,
		location: { lat: 91, lng: 108.2 },
	}, {
		clientQuery: async () => assert.fail('Database must not be queried'),
		onConnect: () => connectCount++,
	});

	assert.equal(result.status, 400);
	assertEnvelope(result.body, false);
	assert.equal(connectCount, 0);
});

test('POST /api/v1/admin/pois maps a duplicate code to 409 and rolls back', async () => {
	const client = createClientQuery({
		onPoiInsert: async () => {
			const error = new Error('duplicate key');
			error.code = '23505';
			throw error;
		},
	});
	const result = await request('POST', '/api/v1/admin/pois', createBody, {
		clientQuery: client.query,
	});

	assert.equal(result.status, 409);
	assertEnvelope(result.body, false);
	assert.match(client.queries.at(-1).sql, /^ROLLBACK$/);
});

test('POST /api/v1/admin/pois rolls back when initial content insert fails', async () => {
	const client = createClientQuery({
		onContentInsert: async () => {
			throw new Error('database unavailable');
		},
	});
	const result = await request('POST', '/api/v1/admin/pois', createBody, {
		clientQuery: client.query,
	});

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.match(client.queries.at(-1).sql, /^ROLLBACK$/);
});

test('POST /api/v1/admin/pois/:id/contents inserts content for a new locale', async () => {
	const calls = [];
	const result = await request(
		'POST',
		`/api/v1/admin/pois/${poiId}/contents`,
		contentBody,
		{
			poolQuery: async (sql, values) => {
				calls.push({ sql, values });
				if (sql.includes('FROM pois p')) return { rows: [{ id: poiId, content_id: null }] };
				assert.match(sql, /ON CONFLICT\s+\(poi_id,\s*language_code,\s*accent\)\s+DO UPDATE/);
				return { rows: [createContentRow()] };
			},
		},
	);

	assert.equal(result.status, 201);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, createContentRow());
	assert.deepEqual(calls[0].values, [poiId, 'vi', 'central']);
	assert.deepEqual(calls[1].values, [
		poiId,
		'vi',
		'central',
		'Chánh Điện',
		'Khu chính điện.',
		'Chào mừng bạn đến với Chánh Điện.',
		'https://cdn.example.com/audio/chanhdien.mp3',
		95,
		true,
		true,
		true,
		true,
	]);
});

test('POST /api/v1/admin/pois/:id/contents updates an existing locale without clearing omitted fields', async () => {
	const updateBody = { languageCode: 'vi', accent: 'central', title: 'Chánh Điện mới', ttsScript: 'Script mới.' };
	let upsertValues;
	const result = await request(
		'POST',
		`/api/v1/admin/pois/${poiId}/contents`,
		updateBody,
		{
			poolQuery: async (sql, values) => {
				if (sql.includes('FROM pois p')) return { rows: [{ id: poiId, content_id: contentId }] };
				upsertValues = values;
				return { rows: [createContentRow({ title: updateBody.title, tts_script: updateBody.ttsScript })] };
			},
		},
	);

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.equal(result.body.data.title, updateBody.title);
	assert.equal(upsertValues[8], false);
	assert.equal(upsertValues[9], true);
	assert.equal(upsertValues[10], false);
	assert.equal(upsertValues[11], false);
});

test('POST /api/v1/admin/pois/:id/contents returns 404 for a missing POI', async () => {
	let queryCount = 0;
	const result = await request('POST', `/api/v1/admin/pois/${poiId}/contents`, contentBody, {
		poolQuery: async () => {
			queryCount++;
			return { rows: [] };
		},
	});

	assert.equal(result.status, 404);
	assertEnvelope(result.body, false);
	assert.equal(queryCount, 1);
});

test('POST /api/v1/admin/pois/:id/contents validates id and content fields', async () => {
	const invalidId = await request('POST', '/api/v1/admin/pois/not-a-uuid/contents', contentBody);
	assert.equal(invalidId.status, 400);

	const invalidContent = await request(
		'POST',
		`/api/v1/admin/pois/${poiId}/contents`,
		{ ...contentBody, audioDurationSeconds: -1 },
	);
	assert.equal(invalidContent.status, 400);
});

test('POST /api/v1/admin/pois/:id/contents maps duplicate locale to upsert instead of conflict', async () => {
	let insertCalled = false;
	const result = await request(
		'POST',
		`/api/v1/admin/pois/${poiId}/contents`,
		contentBody,
		{
			poolQuery: async (sql) => {
				if (sql.includes('FROM pois p')) return { rows: [{ id: poiId, content_id: contentId }] };
				insertCalled = true;
				assert.match(sql, /ON CONFLICT\s+\(poi_id,\s*language_code,\s*accent\)\s+DO UPDATE/);
				return { rows: [createContentRow()] };
			},
		},
	);

	assert.equal(result.status, 200);
	assert.equal(insertCalled, true);
});

test('POST /api/v1/admin/pois/:id/contents handles POI deletion races and database errors', async (context) => {
	await context.test('foreign key violation returns not found', async () => {
		const result = await request(
			'POST',
			`/api/v1/admin/pois/${poiId}/contents`,
			contentBody,
			{
				poolQuery: async (sql) => {
					if (sql.includes('FROM pois p')) return { rows: [{ id: poiId, content_id: null }] };
				const error = new Error('foreign key violation');
				 error.code = '23503';
				throw error;
				},
			},
		);

		assert.equal(result.status, 404);
		assertEnvelope(result.body, false);
	});

	await context.test('database failure is hidden', async () => {
		const result = await request(
			'POST',
			`/api/v1/admin/pois/${poiId}/contents`,
			contentBody,
			{
				poolQuery: async () => {
					throw new Error('sensitive database detail');
				},
			},
		);

		assert.equal(result.status, 500);
		assertEnvelope(result.body, false);
		assert.equal(result.body.error, 'Internal server error');
		assert.doesNotMatch(JSON.stringify(result.body), /sensitive database detail/);
	});
});

test('PUT /api/v1/admin/pois/:id updates coordinates and radius', async () => {
	let queryValues;
	const result = await request(
		'PUT',
		`/api/v1/admin/pois/${poiId}`,
		{ location: { lat: 16.2, lng: 108.3 }, radius: 25 },
		{
			poolQuery: async (sql, values) => {
				assert.match(sql, /UPDATE pois/);
				queryValues = values;
				return {
					rows: [{ id: poiId, latitude: '16.2', longitude: '108.3', radius: 25 }],
				};
			},
		},
	);

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, {
		id: poiId,
		location: { lat: 16.2, lng: 108.3 },
		radius: 25,
	});
	assert.deepEqual(queryValues, [16.2, 108.3, 25, poiId]);
});

test('PUT /api/v1/admin/pois/:id validates UUID and location', async () => {
	const invalidId = await request('PUT', '/api/v1/admin/pois/not-a-uuid', {
		location: { lat: 16.2, lng: 108.3 },
		radius: 25,
	});
	assert.equal(invalidId.status, 400);

	const invalidLocation = await request('PUT', `/api/v1/admin/pois/${poiId}`, {
		location: { lat: 16.2, lng: 181 },
		radius: 25,
	});
	assert.equal(invalidLocation.status, 400);
});

test('PUT /api/v1/admin/pois/:id returns 404 when the POI does not exist', async () => {
	const result = await request(
		'PUT',
		`/api/v1/admin/pois/${poiId}`,
		{ location: { lat: 16.2, lng: 108.3 }, radius: 25 },
		{ poolQuery: async () => ({ rows: [] }) },
	);

	assert.equal(result.status, 404);
	assertEnvelope(result.body, false);
});

test('PUT /api/v1/admin/pois/:id hides database errors', async () => {
	const result = await request(
		'PUT',
		`/api/v1/admin/pois/${poiId}`,
		{ location: { lat: 16.2, lng: 108.3 }, radius: 25 },
		{
			poolQuery: async () => {
				throw new Error('sensitive database detail');
			},
		},
	);

	assert.equal(result.status, 500);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'Internal server error');
	assert.doesNotMatch(JSON.stringify(result.body), /sensitive database detail/);
});

test('DELETE /api/v1/admin/pois/:id deletes an existing POI', async () => {
	let queryValues;
	const result = await request('DELETE', `/api/v1/admin/pois/${poiId}`, undefined, {
		poolQuery: async (sql, values) => {
			assert.match(sql, /DELETE FROM pois\s+WHERE id = \$1\s+RETURNING id/);
			queryValues = values;
			return { rows: [{ id: poiId }] };
		},
	});

	assert.equal(result.status, 200);
	assertEnvelope(result.body, true);
	assert.deepEqual(result.body.data, { id: poiId });
	assert.deepEqual(queryValues, [poiId]);
});

test('DELETE /api/v1/admin/pois/:id returns 404 when the POI does not exist', async () => {
	const result = await request('DELETE', `/api/v1/admin/pois/${poiId}`, undefined, {
		poolQuery: async () => ({ rows: [] }),
	});

	assert.equal(result.status, 404);
	assertEnvelope(result.body, false);
	assert.equal(result.body.error, 'POI not found');
});

test('DELETE /api/v1/admin/pois/:id rejects an invalid UUID before database access', async () => {
	const result = await request('DELETE', '/api/v1/admin/pois/not-a-uuid', undefined, {
		poolQuery: async () => assert.fail('Database must not be queried for an invalid id'),
	});

	assert.equal(result.status, 400);
	assertEnvelope(result.body, false);
});