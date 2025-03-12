const Notification = require('../models/Notification');

// 獲取用戶通知
exports.getUserNotifications = async(req,res)=>{
    try{
        const { userId } = req.params;

        const notifications = await Notification.find({ userId })
            .populate('relatedId')
            .sort({createdAt:-1});
        res.status(200).json(notifications)
    } catch (error) {
        console.error('getUserNotifications 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

// 將通知標記為已讀
exports.markAsRead = async(req,res) => {
    try{
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {isread:true},
            {new:true}
        );

        if(!notification){
            res.status(404).json({message:'找不到通知'});
        }

        res.status(200).json(notification);
    } catch (error){
        console.error('markAsRead 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}


// 刪除通知
exports.deleteNotification = async(req,res) => {
    try{
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if(!notification){
            return res.status(404).json({ message: '找不到通知' });
        }   
        res.status(200).json({ message: '通知已刪除' });
    } catch(error){
        console.error('deleteNotification 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}