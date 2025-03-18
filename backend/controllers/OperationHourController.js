const OperationHour = require('../models/OperationHour')

// 創建新營業時間
exports.createOperationHour = async (req,res) => {
    try {
        const {dayOfWeek , openTime, closeTime,isHoliday } = req.body;

        // 檢查該星期是否已有營業時間設定
        const existingOperationHour = await OperationHour.findOne({ dayOfWeek });
        
        if (existingOperationHour) {
            return res.status(400).json({ message: `星期${dayOfWeek}已有營業時間設定` });
        }

        const operationHour = new OperationHour({
            dayOfWeek,
            openTime,
            closeTime,
            isHoliday: isHoliday || false
        });

        await operationHour.save();
        res.status(201).json(operationHour);
    } catch(error) {
        console.error('createOperationHour錯誤', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

// 獲取所有營業時間
exports.getAllOperationHours = async (req, res) => {
    try {
        const operationHours = await OperationHour.find().sort({ dayOfWeek: 1 });
        res.status(200).json(operationHours);
    } catch(error) {
        console.error('getAllOperationHours 錯誤', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 獲取特定星期的營業時間
exports.getOperationHourByDay = async (req, res) => {
    try {
        const { dayOfWeek } = req.params;
        const operationHour = await OperationHour.findOne({ dayOfWeek });
        
        if (!operationHour) {
            return res.status(404).json({ message: `找不到星期${dayOfWeek}的營業時間設定` });
        }
        
        res.status(200).json(operationHour);
    } catch(error) {
        console.error('getOperationHourByDay 錯誤', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 更新營業時間
exports.updateOperationHour = async (req, res) => {
    try {
        const { openTime, closeTime, isHoliday } = req.body;
        const { dayOfWeek } = req.params;

        const operationHour = await OperationHour.findOneAndUpdate(
            { dayOfWeek },
            { openTime, closeTime, isHoliday },
            { new: true }
        );
        
        if (!operationHour) {
            return res.status(404).json({ message: `找不到星期${dayOfWeek}的營業時間設定` });
        }
        
        res.status(200).json(operationHour);
    } catch(error) {
        console.error('updateOperationHour 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 刪除營業時間
exports.deleteOperationHour = async (req, res) => {
    try {
        const { dayOfWeek } = req.params;
        const operationHour = await OperationHour.findOneAndDelete({ dayOfWeek });
        
        if (!operationHour) {
            return res.status(404).json({ message: `找不到星期${dayOfWeek}的營業時間設定` });
        }
        
        res.status(200).json({ message: '營業時間設定已刪除' });
    } catch(error) {
        console.error('deleteOperationHour 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 批量創建或更新營業時間（整個星期）
exports.bulkCreateOrUpdateOperationHours = async (req, res) => {
    try {
        const { operationHours } = req.body;
        
        if (!Array.isArray(operationHours) || operationHours.length === 0) {
            return res.status(400).json({ message: '必須提供有效的營業時間設定陣列' });
        }
        
        const results = [];
        
        for (const oh of operationHours) {
            const { dayOfWeek, openTime, closeTime, isHoliday } = oh;
            
            // 查找現有設定
            let operationHour = await OperationHour.findOne({ dayOfWeek });
            
            if (operationHour) {
                // 更新現有設定
                operationHour.openTime = openTime;
                operationHour.closeTime = closeTime;
                operationHour.isHoliday = isHoliday || false;
                await operationHour.save();
            } else {
                // 創建新設定
                operationHour = new OperationHour({
                    dayOfWeek,
                    openTime,
                    closeTime,
                    isHoliday: isHoliday || false
                });
                await operationHour.save();
            }
            
            results.push(operationHour);
        }
        
        res.status(200).json({
            message: '營業時間設定已批量更新',
            results
        });
    } catch(error) {
        console.error('bulkCreateOrUpdateOperationHours 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};