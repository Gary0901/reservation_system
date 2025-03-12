const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController')

// 如果需要身份驗證，可以導入 auth 中間件
// const auth = require('../middleware/auth');

// 路由 1: 創建新場地 - POST /api/courts
// 此路由用於添加新的場地，通常需要管理員權限
// 如需添加身份驗證: router.post('/', auth, courtController.createCourt);
router.post('/', courtController.createCourt);

// 路由 2: 獲取所有場地 - GET /api/courts
// 獲取所有可用場地的列表，用於顯示給用戶選擇
router.get('/', courtController.getAllCourts);

// 路由 3: 獲取特定場地 - GET /api/courts/:id
// 獲取單個場地的詳細信息
router.get('/:id', courtController.getCourt);

// 路由 4: 更新場地 - PUT /api/courts/:id
// 更新特定場地的信息，如名稱、編號或狀態
router.put('/:id', courtController.updateCourt);

// 路由 5: 刪除場地 - DELETE /api/courts/:id
// 刪除特定場地，通常需要管理員權限
router.delete('/:id', courtController.deleteCourt);

// 可以添加更多特定功能的路由
// 例如：獲取活躍場地、按某種條件篩選場地等

module.exports = router;