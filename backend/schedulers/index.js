// backend/schedulers/index.js

const cron = require('node-cron');
const axios = require('axios');
const TimeSlot = require('../models/TimeSlot');

const initSchedulers = () => {
  // 每週日凌晨 2 點生成未來兩週的時段
  cron.schedule('0 2 * * 0', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`開始生成從 ${today} 開始的未來兩週時段`);
      
      // 調用自己的 API
      const response = await axios.post('http://localhost:' + (process.env.PORT || 5000) + '/api/timeslot/generate', {
        startDate: today,
        daysToGenerate: 14
      });
      
      console.log(`成功生成 ${response.data.generatedTimeSlots.length} 個時段`);
    } catch (error) {
      console.error('時段生成失敗:', error);
    }
  });
  
  // 每月1日凌晨3點執行清理過期時段
  cron.schedule('0 3 1 * *', async () => {
    try {
      const thresholdDate = new Date();
      thresholdDate.setMonth(thresholdDate.getMonth() - 3); // 保留3個月數據
      
      const result = await TimeSlot.deleteMany({
        isTemplate: false,
        date: { $lt: thresholdDate }
      });
      
      console.log(`已刪除 ${result.deletedCount} 個過期時段`);
    } catch (error) {
      console.error('刪除過期時段錯誤:', error);
    }
  });
  
  console.log('排程任務已初始化');
};

module.exports = initSchedulers;