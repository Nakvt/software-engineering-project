const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * 💡 GIẢI THÍCH LOGIC ROUTING:
 * Đăng ký 3 endpoint auth theo đúng api-contract.md:
 * - POST /api/v1/auth/login -> authController.login
 * - POST /api/v1/auth/refresh-token -> authController.refreshToken
 * - POST /api/v1/auth/logout -> authController.logout
 */
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;