const TimeSlot = require('../models/TimeSlot')
const Court = require('../models/Court')

// 創建新時間槽
exports.createTimeSlot = async(req,res) => {
    try{
        const { courtId, startTime , endTime, defaultPrice } = req.body;

        //檢查場地是否存在
        const court = await Court.findById(courtId)
        
        if (!court){
            return res.status(404).json({message: '找不到場地'})
        }

        const timeSlot = new TimeSlot({
            courtId,
            startTime,
            endTime,
            defaultPrice
        })

        await timeSlot.save();
        res.status(201).json(timeSlot);
    } catch(error){
        console.error('createTimeSlot錯誤',error);
        res.status(500).json({message:'服務器錯誤'})

    }
};

// 獲取所有時間槽
exports.getAllTimeSlot = async(req,res) => {
    try{
        const timeSlots = await TimeSlot.find().populate('courtId');
        res.status(200).json(timeSlots);
    } catch(error){
        console.error('getAllTimeSlots 錯誤',error)
        res.status(500).json({message:'服務器錯誤'})
    }
};

// 獲取特定場地的時間槽
exports.getTimeSlotByCourt = async(req,res) => {
    try{
        const {courtId} = req.params;

        const timeSlots = await TimeSlot.find({courtId}).populate('courtId');
        res.status(200).json(timeSlots)
    } catch(error){
        console.error('getTimeSlotByCourt 錯誤',error)
        res.status(500).json({message:'服務器錯誤'})
    }
};

// 更新時間槽
exports.updateTimeSlot = async(req,res) => {
    try{
        const {courtId,startTime,endTime,defaultPrice } = req.body

        const timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            { courtId, startTime, endTime, defaultPrice },
            { new: true }
        );
        if(!timeSlot){
            return res.status(404).json({ message: '找不到TimeSlot' });
        }
        res.status(200).json(timeSlot);
    } catch(error){
        console.error('updateTimeSlot 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 刪除時間槽
exports.deleteTimeSlot = async(req,res) =>{
    try{
        const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id)
        if (!timeSlot) {
            return res.status(404).json({ message: '找不到TimeSlot' });
          }
          
          res.status(200).json({ message: 'TimeSlot已刪除' });
    } catch(error) {
        console.error('deleteTimeSlot 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};