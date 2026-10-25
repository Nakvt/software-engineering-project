const assert = require('node:assert/strict');
const test = require('node:test');

process.env.JWT_ACCESS_SECRET = 'test-only-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-only-refresh-secret';

const authController = require('../src/controllers/authController');
const authService = require('../src/services/authService');
const adminRepository = require('../src/repositories/adminRepository');

async function invokeLogin(error) {
  const originalLogin = authService.login;
  authService.login = async () => {
    throw error;
  };

  const result = { statusCode: null, body: null };
  const response = {
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  try {
    await authController.login({ body: { username: 'user', password: 'password' } }, response);
  } finally {
    authService.login = originalLogin;
  }

  return result;
}

async function invokeController(method, serviceMethod, body, error) {
  const originalMethod = authService[serviceMethod];
  authService[serviceMethod] = async () => {
    throw error;
  };

  const result = { statusCode: null, body: null };
  const response = {
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(responseBody) {
      result.body = responseBody;
      return this;
    },
  };

  try {
    await authController[method]({ body }, response);
  } finally {
    authService[serviceMethod] = originalMethod;
  }

  return result;
}

test('returns a generic authentication response for invalid credentials', async () => {
  const error = new Error('Mật khẩu hoặc tên đăng nhập không đúng');
  error.code = 'INVALID_CREDENTIALS';
  const result = await invokeLogin(error);

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.error, 'Mật khẩu hoặc tên đăng nhập không đúng');
});

test('auth service marks missing accounts as invalid credentials', async () => {
  const originalFindByUsername = adminRepository.findByUsername;
  adminRepository.findByUsername = async () => null;

  try {
    await assert.rejects(authService.login('user', 'password'), (error) => {
      assert.equal(error.code, 'INVALID_CREDENTIALS');
      return true;
    });
  } finally {
    adminRepository.findByUsername = originalFindByUsername;
  }
});

test('does not expose database or runtime error details during login', async () => {
  const result = await invokeLogin(new Error('internal database connection detail'));

  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /internal database connection detail/);
});

test('does not expose refresh-token database errors', async () => {
  const result = await invokeController(
    'refreshToken',
    'refreshToken',
    { refreshToken: 'provided-token' },
    new Error('internal database connection detail'),
  );

  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /internal database connection detail/);
});

test('does not expose logout database errors', async () => {
  const result = await invokeController(
    'logout',
    'logout',
    { refreshToken: 'provided-token' },
    new Error('internal database connection detail'),
  );

  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error, 'Internal server error');
  assert.doesNotMatch(JSON.stringify(result.body), /internal database connection detail/);
});
