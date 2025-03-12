const User = require('../models/User')

// 創建或更新用戶
exports.createOrUpdateUser = async(req, res) => {
    try{
        const {lineId, name} = req.body;

        //檢查用戶是否存在
        let user = await User.findOne({ lineId })
        if (user) {
            // 更新用戶
            user.name = name;
            await user.save();
        } else {
            user = new User({
                lineId,
                name 
            });
            await user.save();
        }
        res.status(200).json(user)
    } catch (error) {
        console.error('創建或更新用戶錯誤:',error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

// 獲取用戶
exports.getUser = async(req,res) =>{
    try{
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ message: '找不到用戶' });
        }

        res.status(200).json(user)
    } catch (error){
        console.error('getUser 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

// 獲取所有用戶
exports.getAllUsers = async(req,res) => {
    try{
        const users = await User.find();
        res.status(200).json(users)
    } catch (error) {
        console.error('getAllUsers 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}