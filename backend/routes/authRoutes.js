const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登入路由
router.post('/login', authController.login);

// 如果需要，可以添加其他認證相關路由
// router.post('/register', authController.register);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;