const TimeSlot = require('../models/TimeSlot')
const Court = require('../models/Court')
const OperationHour = require('../models/OperationHour')

// 創建新時間槽
exports.createTimeSlot = async(req,res) => {
    try{
        const { courtId, startTime , endTime, defaultPrice,isTemplate, name, date } = req.body;

        //檢查場地是否存在
        const court = await Court.findById(courtId)
        
        if (!court){
            return res.status(404).json({message: '找不到場地'})
        }

        const timeSlot = new TimeSlot({
            courtId,
            startTime,
            endTime,
            defaultPrice,
            isTemplate:isTemplate || false,
            name,
            date : date? new Date(date) : undefined
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
        console.log("有呼喚這支api")
        // 增加查詢參數，可以根據模板還是實際時段進行篩選
        const { isTemplate, date  } = req.query;

        let query = {}
        if (isTemplate !== undefined) {
            query.isTemplate = isTemplate === 'true'
        }
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0,0,0,0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = { $gte: startDate, $lte: endDate };
        }

        console.log("查詢條件:",query); // 調適用

        const timeSlots = await TimeSlot.find(query).populate('courtId');
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
        const { date, isTemplate } = req.query;

        let query = { courtId };
        
        // 如果提供了日期，則過濾該日期的時段
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        // 如果指定了是否為模板
        if (isTemplate !== undefined) {
            query.isTemplate = isTemplate === 'true';
        }

        const timeSlots = await TimeSlot.find(query).populate('courtId');
        res.status(200).json(timeSlots)
    } catch(error){
        console.error('getTimeSlotByCourt 錯誤',error)
        res.status(500).json({message:'服務器錯誤'})
    }
};

// 更新時間槽
exports.updateTimeSlot = async(req,res) => {
    try{
        const {courtId,startTime,endTime,defaultPrice, isTemplate, name, date  } = req.body
        
        const updateData = { courtId, startTime, endTime, defaultPrice };

       // 只有當這些欄位存在於請求中時才更新
       if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
       if (name !== undefined) updateData.name = name;
       if (date !== undefined) updateData.date = new Date(date);

       const timeSlot = await TimeSlot.findByIdAndUpdate(
           req.params.id,
           updateData,
           { new: true }
       );
       
       if(!timeSlot) {
           return res.status(404).json({ message: '找不到TimeSlot' });
       }
       
       res.status(200).json(timeSlot);
   } catch(error) {
       console.error('updateTimeSlot 錯誤:', error);
       res.status(500).json({ message: '服務器錯誤' });
   }
};

// 刪除時間槽
exports.deleteTimeSlot = async(req, res) => {
    try {
        const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
        
        if (!timeSlot) {
            return res.status(404).json({ message: '找不到TimeSlot' });
        }
        
        res.status(200).json({ message: 'TimeSlot已刪除' });
    } catch(error) {
        console.error('deleteTimeSlot 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};

// 根據模板生成時段（修正版）
exports.generateTimeSlotsFromTemplates = async(req, res) => {
    try {
        const { startDate, daysToGenerate = 7 } = req.body;
        console.log(`開始生成從 ${startDate} 起 ${daysToGenerate} 天的時段`);
        
        if (!startDate) {
            return res.status(400).json({ message: '必須提供開始日期 (startDate)' });
        }
        
        // 獲取基礎數據
        const [courts, operationHours, allTemplates] = await Promise.all([
            Court.find({ isActive: true }),
            OperationHour.find(),
            TimeSlot.find({ isTemplate: true })
        ]);
        
        // 數據驗證
        if (courts.length === 0 || operationHours.length === 0 || allTemplates.length === 0) {
            return res.status(404).json({ 
                message: `缺少必要數據：球場(${courts.length})、營業時間(${operationHours.length})或模板(${allTemplates.length})` 
            });
        }
        
        console.log(`找到 ${courts.length} 個球場, ${operationHours.length} 個營業時間設定, ${allTemplates.length} 個時段模板`);
        
        // 按場地ID組織模板
        const templatesByCourtId = {};
        allTemplates.forEach(template => {
            const courtIdStr = template.courtId.toString();
            if (!templatesByCourtId[courtIdStr]) {
                templatesByCourtId[courtIdStr] = [];
            }
            templatesByCourtId[courtIdStr].push(template);
        });
        
        // 準備日期範圍
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0); // 重設時分秒，確保一致性
        
        const dateRange = [];
        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(startDateObj);
            date.setDate(startDateObj.getDate() + i);
            dateRange.push(date);
        }
        
        console.log(`準備生成 ${dateRange.length} 天的時段`);
        
        // 輔助函數：時間轉分鐘
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };
        
        // 獲取日期範圍內所有已存在的時段
        const existingTimeSlots = await TimeSlot.find({
            isTemplate: false,
            date: { 
                $gte: dateRange[0], 
                $lte: new Date(dateRange[dateRange.length - 1].getTime() + 24 * 60 * 60 * 1000 - 1) 
            }
        });
        
        console.log(`發現 ${existingTimeSlots.length} 個已存在的時段`);
        
        // 創建一個哈希表來快速檢查時段是否存在 (改進版)
        const existingSlotMap = {};
        existingTimeSlots.forEach(slot => {
            // 格式化為 YYYY-MM-DD 格式
            const slotDate = slot.date.toISOString().split('T')[0];
            const courtId = slot.courtId.toString();
            const key = `${courtId}-${slotDate}-${slot.startTime}-${slot.endTime}`;
            existingSlotMap[key] = true;
        });
        
        // 準備新增的時段
        const newTimeSlots = [];
        const processedKeys = new Set(); // 用於追蹤本次處理中已添加的時段
        
        // 對於每個日期
        for (const currentDate of dateRange) {
            const dayOfWeek = currentDate.getDay();
            const operationHour = operationHours.find(oh => oh.dayOfWeek === dayOfWeek);
            
            // 如果當天不營業，跳過
            if (!operationHour || operationHour.isHoliday) {
                console.log(`${currentDate.toISOString().split('T')[0]} 不營業，跳過`);
                continue;
            }
            
            const dateStr = currentDate.toISOString().split('T')[0];
            console.log(`處理 ${dateStr} (星期${dayOfWeek})`);
            console.log(`營業時間: ${operationHour.openTime} - ${operationHour.closeTime}`);
            
            const openMinutes = timeToMinutes(operationHour.openTime);
            const closeMinutes = timeToMinutes(operationHour.closeTime);
            
            // 對於每個球場
            for (const court of courts) {
                const courtId = court._id.toString();
                console.log(`處理球場: ${court.name || courtId}`);
                
                // 獲取該球場的模板
                const courtTemplates = templatesByCourtId[courtId] || [];
                console.log(`找到 ${courtTemplates.length} 個該球場的模板`);
                
                // 對於該球場的每個模板
                for (const template of courtTemplates) {
                    const templateStartMinutes = timeToMinutes(template.startTime);
                    const templateEndMinutes = timeToMinutes(template.endTime);
                    
                    // 檢查模板是否適用
                    if (templateStartMinutes >= openMinutes && templateEndMinutes <= closeMinutes) {
                        // 生成唯一鍵來檢查重複
                        const key = `${courtId}-${dateStr}-${template.startTime}-${template.endTime}`;
                        
                        // 檢查是否已存在於資料庫或已在當前批次中添加
                        if (!existingSlotMap[key] && !processedKeys.has(key)) {
                            newTimeSlots.push({
                                courtId: court._id,
                                startTime: template.startTime,
                                endTime: template.endTime,
                                defaultPrice: template.defaultPrice,
                                isTemplate: false,
                                date: new Date(currentDate),
                                name: template.name
                            });
                            
                            // 將新時段加入跟踪集合，防止在同一批次中重複添加
                            processedKeys.add(key);
                            existingSlotMap[key] = true;
                        } else {
                            console.log(`時段已存在或已處理，跳過: ${template.startTime}-${template.endTime} @ ${dateStr} (${courtId})`);
                        }
                    } else {
                        console.log(`模板 ${template.startTime}-${template.endTime} 不適用於當前營業時間`);
                    }
                }
            }
        }
        
        console.log(`準備創建 ${newTimeSlots.length} 個新時段`);
        
        // 批量插入新時段
        let result = [];
        if (newTimeSlots.length > 0) {
            result = await TimeSlot.insertMany(newTimeSlots);
            console.log(`成功批量創建 ${result.length} 個時段`);
        } else {
            console.log('沒有新時段需要創建');
        }
        
        res.status(201).json({
            message: `成功生成 ${result.length} 個時段`,
            generatedCount: result.length,
            totalExisting: existingTimeSlots.length
        });
    } catch (error) {
        console.error('generateTimeSlotsFromTemplates 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤', error: error.message });
    }
};

// 刪除所有非模板時段
exports.deleteAllNonTemplateTimeSlots = async(req,res) => {
    try {
        console.log('開始刪除所有非模板時段...');

        const result = await TimeSlot.deleteMany({isTemplate : false});

        console.log(`成功刪除${result.deletedCount} 個非模板時段`);

        res.status(200).json({
            message:`成功刪除${result.deletedCount} 個非模板時段`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('deleteAllNonTemplateTimeSlots 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}