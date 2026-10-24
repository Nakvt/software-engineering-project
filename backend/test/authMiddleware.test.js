const assert = require('node:assert/strict');
const test = require('node:test');
process.env.JWT_ACCESS_SECRET = 'test-only-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-only-refresh-secret';
const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/authMiddleware');
const jwtConfig = require('../src/config/jwt');

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('accepts a valid bearer access token and attaches its payload', () => {
  const payload = { id: 42, role: 'user' };
  const token = jwt.sign(payload, jwtConfig.accessSecret);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(req.user.id, payload.id);
  assert.equal(req.user.role, payload.role);
  assert.equal(typeof req.user.iat, 'number');
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('rejects a request without a bearer access token', () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.data, null);
  assert.equal(res.body.error, 'Không tìm thấy access token xác thực');
  assert.doesNotThrow(() => new Date(res.body.timestamp).toISOString());
  assert.equal(nextCalled, false);
});

test('rejects an invalid access token', () => {
  const req = { headers: { authorization: 'Bearer invalid-token' } };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.data, null);
  assert.equal(res.body.error, 'Access Token không hợp lệ hoặc đã hết hạn');
  assert.equal(nextCalled, false);
});

test('rejects an expired access token', () => {
  const token = jwt.sign({ id: 42 }, jwtConfig.accessSecret, { expiresIn: -1 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Access Token không hợp lệ hoặc đã hết hạn');
  assert.equal(nextCalled, false);
});
