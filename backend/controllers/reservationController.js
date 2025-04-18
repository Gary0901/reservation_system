const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Court = require('../models/Court');
const Notification = require('../models/Notification');

// 創建新預約
exports.createReservation = async(req,res) => {
    try{
        const {userId,courtId,date,startTime,endTime,price,people_num,phone,password} = req.body;
        
        // 檢查用戶是否存在
        const user = await User.findById(userId)
        if (!user){
            return res.status(404).json({ message: '找不到用戶' });
        }
        // 檢查場地是否存在
        const court = await Court.findById(courtId);
        if(!court) {
            return res.status(404).json({message:'找不到場地'})
        }

        //檢查電話是否提供
        if(!phone) {
            return res.status(400).json({message:'電話號碼為必填項'})
        }

        //檢查時間槽是否已經被預約
        const existingReservation = await Reservation.findOne({
            courtId,
            date:new Date(date),
            startTime,
            status:{$ne:'cancelled'}
        })

        if(existingReservation) {
            return res.status(400).json({message:'此時間已被預約'});
        }

        const reservation = new Reservation({
            userId,
            courtId,
            date: new Date(date),
            startTime,
            endTime,
            price,
            people_num,
            phone,
            password:password || "******" // 使用提供的密碼或使用默認值
        })

        await reservation.save()

        // 創建通知
        const notificaiton = new Notification({
            userId,
            type:'reservation_created',
            relatedId: reservation._id,
            onModel:'Reservation' 
        })

        await notificaiton.save()

        res.status(201).json(reservation);
    } catch(error) {
        console.error('createReservation錯誤',error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}
// 獲取用戶預約
exports.getUserReservation = async(req,res) =>{
    try{
        const { userId } = req.params;

        const reservations = await Reservation.find({userId})
            .populate('courtId')
            .sort({date:-1});

        res.status(200).json(reservations);

    } catch (error) {
        console.error('getUserReservations 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}
// 獲取所有預約
exports.getAllReservations = async(req, res)=>{
    try{
        const reservations = await Reservation.find()
            .populate('userId')
            .populate('courtId')
            .sort({ date: -1 });

        res.status(200).json(reservations);
    } catch (error) {
        console.error('getAllReservations 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

// 更新預約狀態
exports.updateReservationStatus = async(req,res) =>{
    try{
        const {status,password} = req.body 
        if (!['pending','confirmed','cancelled'].includes(status)){
            return res.status(400).json({message:'無效的狀態'})
        }

        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({message:'找不到預約'});
        }
        // 更新狀態
        reservation.status = status;
        
        //  如果提供了密碼，則更新密碼
        if (password !== undefined) {
            reservation.password = password
        }
        
        await reservation.save();

        const notificaiton = new Notification({
            userId:reservation.userId,
            type: status === 'confirmed' ? 'reservation_confirmed' : 'reservation_cancelled',
            relatedId: reservation._id,
            onModel: 'Reservation'
        });

        await notificaiton.save();
        
        res.status(200).json(reservation);
    } catch(error) {
        console.error('updateReservationStatus 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 更新預約（包括電話）
exports.updateReservation = async(req, res) => {
    try {
        const { phone, date, startTime, endTime, people_num, price } = req.body;
        
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: '找不到預約' });
        }
        
        // 更新電話和其他可能的欄位
        if (phone) reservation.phone = phone;
        if (date) reservation.date = new Date(date);
        if (startTime) reservation.startTime = startTime;
        if (endTime) reservation.endTime = endTime;
        if (people_num) reservation.people_num = people_num;
        if (price) reservation.price = price;
        
        await reservation.save();
        
        res.status(200).json(reservation);
    } catch (error) {
        console.error('updateReservation 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 刪除預約
exports.deleteReservation = async(req,res) => {
    try{
        const reservation = await Reservation.findByIdAndDelete(req.params.id)
        if(!reservation) {
            return res.status(404).json({ message: '找不到預約' });
        }
        res.status(200).json({ message: '預約已刪除' });
    } catch(error) {
        console.error('deleteReservation 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
    
}
