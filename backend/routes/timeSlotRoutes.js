const express = require('express')
const router = express.Router()
const timeSlotController = require('../controllers/timeSlotController')

// 路由1 : 創建TimeSlot - POST /api/timeslot
router.post('/',timeSlotController.createTimeSlot);

// 路由2 : 獲取所有時間槽
router.get('/',timeSlotController.getAllTimeSlot)

// 路由3 : 獲取特定場地的時間槽
router.get('/court/:courtId',timeSlotController.getTimeSlotByCourt)

// 路由4 : 更新時間槽
router.put('/:id',timeSlotController.updateTimeSlot)

// 路由5 : 刪除時間槽
router.delete('/:id',timeSlotController.deleteTimeSlot)

module.exports = router;