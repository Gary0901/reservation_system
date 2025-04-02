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

// 路由5 : 刪除所有非模板timeslots
router.delete('/clean-non-templates', timeSlotController.deleteAllNonTemplateTimeSlots);

// 路由6 : 刪除時間槽
router.delete('/:id',timeSlotController.deleteTimeSlot)

// 路由7 : 根據模板生成時段 - POST /api/timeslot/gererate 
router.post('/generate',timeSlotController.generateTimeSlotsFromTemplates);



module.exports = router;