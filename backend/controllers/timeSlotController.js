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

// 根據模板生成時段
exports.generateTimeSlotsFromTemplates = async(req, res) => {
    try {
        const { startDate, daysToGenerate = 7 } = req.body;
        
        if (!startDate) {
            return res.status(400).json({ message: '必須提供開始日期 (startDate)' });
        }
        
        // 獲取所有啟用的球場
        const courts = await Court.find({ isActive: true });
        
        if (courts.length === 0) {
            return res.status(404).json({ message: '找不到可用的球場' });
        }
        
        // 獲取所有營業時間設定
        const operationHours = await OperationHour.find();
        
        if (operationHours.length === 0) {
            return res.status(404).json({ message: '找不到營業時間設定' });
        }
        
        // 獲取所有時段模板
        const templates = await TimeSlot.find({ isTemplate: true });
        
        if (templates.length === 0) {
            return res.status(404).json({ message: '找不到時段模板' });
        }
        
        // 開始生成時段
        const generatedTimeSlots = [];
        const startDateObj = new Date(startDate);
        
        // 將時間轉換為分鐘的輔助函數
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };
        
        // 檢查模板是否適用於營業時間的輔助函數
        const isTemplateApplicable = (template, operationHour) => {
            const templateStartMinutes = timeToMinutes(template.startTime);
            const templateEndMinutes = timeToMinutes(template.endTime);
            const openMinutes = timeToMinutes(operationHour.openTime);
            const closeMinutes = timeToMinutes(operationHour.closeTime);
            
            return templateStartMinutes >= openMinutes && templateEndMinutes <= closeMinutes;
        };
        
        // 對於每一天
        for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
            const currentDate = new Date(startDateObj);
            currentDate.setDate(startDateObj.getDate() + dayOffset);
            
            const dayOfWeek = currentDate.getDay(); // 0-6，0是週日
            
            // 查找當天的營業時間
            const operationHour = operationHours.find(oh => oh.dayOfWeek === dayOfWeek);
            
            // 如果當天不營業，跳過
            if (!operationHour || operationHour.isHoliday) {
                continue;
            }
            
            // 對於每個球場
            for (const court of courts) {
                // 找出所有適用於當天營業時間的模板
                const applicableTemplates = templates.filter(template => 
                    isTemplateApplicable(template, operationHour)
                );
                
                // 根據每個適用的模板生成時段
                for (const template of applicableTemplates) {
                    // 檢查該時段是否已存在
                    const existingTimeSlot = await TimeSlot.findOne({
                        courtId: court._id,
                        date: currentDate,
                        startTime: template.startTime,
                        endTime: template.endTime,
                        isTemplate: false
                    });
                    
                    // 如果時段已存在，跳過
                    if (existingTimeSlot) {
                        continue;
                    }
                    
                    // 創建新時段
                    const newTimeSlot = new TimeSlot({
                        courtId: court._id,
                        startTime: template.startTime,
                        endTime: template.endTime,
                        defaultPrice: template.defaultPrice,
                        isTemplate: false,
                        date: currentDate,
                        name: template.name // 可選擇是否保留模板名稱
                    });
                    
                    await newTimeSlot.save();
                    generatedTimeSlots.push(newTimeSlot);
                }
            }
        }
        
        res.status(201).json({
            message: `成功生成 ${generatedTimeSlots.length} 個時段`,
            generatedTimeSlots
        });
    } catch (error) {
        console.error('generateTimeSlotsFromTemplates 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
};