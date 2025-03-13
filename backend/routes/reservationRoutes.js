const express = require('express')
const router = express.Router()
const reservationController = require('../controllers/reservationController')

// 路由 1 創建新預約
router.post('/',reservationController.createReservation);

// 路由 2 獲取用戶預約
router.get('/user/:userId',reservationController.getUserReservation)

// 路由 3 獲取所有預約
router.get('/',reservationController.getAllReservations)

// 路由 4 更新預約狀態
router.put('/:id/status',reservationController.updateReservationStatus)

// 路由 5 刪除預約
router.delete('/:id',reservationController.deleteReservation)

modeule.exports = router 