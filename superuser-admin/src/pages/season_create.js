import React, { useState } from 'react';

function SeasonCreate() {
  const [formData, setFormData] = useState({
    startDate: '2025-06-01',
    endDate: '2025-09-30',
    startTime: '12:00',
    endTime: '15:00',
    userId: '',
    courtId: '67ecc9de4998ee57d673b055', // Court B
    phone: '',
    price: 350,
    peopleNum: 4,
    weekday: 4 // 預設週四
  });

  const [previewDates, setPreviewDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // 用戶選項
  /* const users = [
    { id: '67f24fbc5f236271da4bfd60', name: '丁丁', phone: '0979040742' },
    { id: '68131e969176a0d4b6994130', name: 'Yuming', phone: '0931070114' }
  ]; */

  // 場地選項
  const courts = [
    { id: '67ecc9d54998ee57d673b053', name: 'Court ㄅ' },
    { id: '67ecc9de4998ee57d673b055', name: 'Court ㄆ' },
    { id: '67ecc9e64998ee57d673b057', name: 'Court ㄇ' }
  ];

  // 星期選項
  const weekdayOptions = [
    { value: 0, label: '週日' },
    { value: 1, label: '週一' },
    { value: 2, label: '週二' },
    { value: 3, label: '週三' },
    { value: 4, label: '週四' },
    { value: 5, label: '週五' },
    { value: 6, label: '週六' }
  ];

  // 獲取指定星期的日期
  const getWeekdayDates = (startDate, endDate, targetWeekday) => {
    const dates = [];
    let current = new Date(startDate);
    
    // 找到第一個目標星期
    while (current.getDay() !== targetWeekday) {
      current.setDate(current.getDate() + 1);
    }
    
    // 收集所有目標星期的日期直到結束日期
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return dates;
  };

  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // 獲取中文星期
  const getChineseWeekday = (date) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[date.getDay()];
  };

  // 預覽日期
  const handlePreview = () => {
    if (!formData.userId.trim()) {
      alert('請輸入用戶ID');
      return;
    }
    // 檢查時間格式
    const timeSlots = calculateHourlySlots(formData.startTime, formData.endTime);
    if (timeSlots.length === 0) {
      alert('請確認開始時間早於結束時間');
      return;
    }
    
    const dates = getWeekdayDates(formData.startDate, formData.endDate, parseInt(formData.weekday));
    setPreviewDates(dates);
    setShowPreview(true);
    setResults([]);
  };

  // 處理表單變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // 計算小時時段
  const calculateHourlySlots = (startTime, endTime) => {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5);
      current.setHours(current.getHours() + 1);
      const slotEnd = current.toTimeString().slice(0, 5);
      
      slots.push({
        startTime: slotStart,
        endTime: slotEnd
      });
    }
    
    return slots;
  };

  // 創建單個時段預約
  const createSingleReservation = async (date, startTime, endTime) => {
    const payload = {
      userId: formData.userId,
      courtId: formData.courtId,
      date: formatDate(date),
      startTime: startTime,
      endTime: endTime,
      price: parseInt(formData.price),
      people_num: parseInt(formData.peopleNum),
      phone: formData.phone
    };

    try {
      const response = await fetch('https://liff-reservation.zeabur.app/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { 
        success: true, 
        date: formatDate(date), 
        timeSlot: `${startTime}-${endTime}`,
        data 
      };
    } catch (error) {
      return { 
        success: false, 
        date: formatDate(date), 
        timeSlot: `${startTime}-${endTime}`,
        error: error.message 
      };
    }
  };

  // 創建日期的所有時段預約
  const createReservationsForDate = async (date) => {
    const timeSlots = calculateHourlySlots(formData.startTime, formData.endTime);
    const results = [];
    
    for (const slot of timeSlots) {
      const result = await createSingleReservation(date, slot.startTime, slot.endTime);
      results.push(result);
      
      // 每次API請求後稍作延遲
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return results;
  };

  const handleCreateReservations = async () => {
    setLoading(true);
    setResults([]);

    const allResults = [];
    
    for (const date of previewDates) {
      const dateResults = await createReservationsForDate(date);
      allResults.push(...dateResults);
    }

    setResults(allResults);
    setLoading(false);
  };

  const selectedCourt = courts.find(court => court.id === formData.courtId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">季租生成</h2>
        
        {/* 設定表單 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 日期範圍 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 時間範圍 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">結束時間</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 用戶ID輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用戶ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              placeholder="請輸入用戶ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 星期選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">預約星期</label>
            <select
              name="weekday"
              value={formData.weekday}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {weekdayOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 場地選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">場地</label>
            <select
              name="courtId"
              value={formData.courtId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {courts.map(court => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>

          {/* 電話 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 價格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">價格</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 人數 */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">人數</label>
            <input
              type="number"
              name="peopleNum"
              value={formData.peopleNum}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div> */}
        </div>

        {/* 預覽按鈕 */}
        <div className="mb-6">
          <button
            onClick={handlePreview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            預覽預約日期
          </button>
        </div>

        {/* 預覽結果 */}
        {showPreview && previewDates.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">預約詳情預覽</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>用戶ID：</strong>{formData.userId}</p>
                <p><strong>電話：</strong>{formData.phone}</p>
              </div>
              <div>
                <p><strong>場地：</strong>{selectedCourt?.name}</p>
                <p><strong>時間：</strong>{formData.startTime} - {formData.endTime}</p>
                <p><strong>預約星期：</strong>{weekdayOptions.find(w => w.value === parseInt(formData.weekday))?.label}</p>
              </div>
            </div>

            <h4 className="font-medium mb-2">將預約以下{weekdayOptions.find(w => w.value === parseInt(formData.weekday))?.label}日期：</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {previewDates.map((date, index) => (
                <div key={index} className="p-2 bg-white rounded border text-sm">
                  {index + 1}. {formatDate(date)} (週{getChineseWeekday(date)})
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateReservations}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? '預約中...' : '確認創建所有預約'}
            </button>
          </div>
        )}

        {/* 載入中 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">正在創建預約，請稍候...</span>
          </div>
        )}

        {/* 結果顯示 */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">預約結果</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {result.date} - {result.success ? '預約成功' : '預約失敗'}
                    </span>
                    <span className={`text-sm ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                  {!result.success && (
                    <p className="text-sm text-red-600 mt-1">
                      錯誤：{result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                預約程序完成！成功：{results.filter(r => r.success).length}，
                失敗：{results.filter(r => !r.success).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeasonCreate;