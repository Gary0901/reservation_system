const express = require('express')
const router = express.Router();
const notificationController = require('../controllers/notificationController')

// 路由1 獲取用戶通知
router.get('/user/:userId',notificationController.getUserNotifications)

// 路由2 將通知標記為已讀
router.put('/:id/read',notificationController.markAsRead)

// 路由3 刪除通知
router.delete('/:id',notificationController.deleteNotification);

module.exports = router 
