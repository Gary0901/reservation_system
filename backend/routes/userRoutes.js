const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 路由 1: 創建或更新用戶 - POST /api/users
// 此路由用於當用戶通過 LINE 登入時，創建新用戶或更新現有用戶資訊
router.post('/', userController.createOrUpdateUser);

// 路由 2: 獲取特定用戶 - GET /api/users/:id
// 透過用戶 ID 獲取單個用戶的詳細資訊
router.get('/:id', userController.getUser);

// 路由 3: 獲取所有用戶 - GET /api/users
// 獲取系統中所有用戶的列表，通常僅供管理員使用
router.get('/', userController.getAllUsers);

// 如果後續需要添加更多功能，可以繼續添加路由
// 例如：更新用戶角色、刪除用戶等

module.exports = router 