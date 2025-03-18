const express = require('express');
const router = express.Router();
const operationHourController = require('../controllers/OperationHourController')

// 路由1 : 創建營業時間設定 - POST /api/operationhour
router.post('/', operationHourController.createOperationHour);

// 路由2 : 獲取所有營業時間設定
router.get('/', operationHourController.getAllOperationHours);

// 路由3 : 獲取特定星期的營業時間設定
router.get('/:dayOfWeek', operationHourController.getOperationHourByDay);

// 路由4 : 更新營業時間設定
router.put('/:dayOfWeek', operationHourController.updateOperationHour);

// 路由5 : 刪除營業時間設定
router.delete('/:dayOfWeek', operationHourController.deleteOperationHour);

// 路由6 : 批量創建或更新營業時間設定
router.post('/bulk', operationHourController.bulkCreateOrUpdateOperationHours);

module.exports = router;