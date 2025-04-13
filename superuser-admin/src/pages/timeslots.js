import React, { useState, useEffect } from 'react';

const TimeSlotPage = () => {
  // courtId 映射表
  const courtIdMapping = {
    '67ecc9d54998ee57d673b053': 'ㄅ',
    '67ecc9de4998ee57d673b055': 'ㄆ',
    '67ecc9e64998ee57d673b057': 'ㄇ'
    // 可以根據需要添加更多映射
  };

  // 轉換 courtId 的函數
  const getCourtName = (courtId) => {
    // 如果 courtId 是物件，使用其 _id 屬性
    const id = typeof courtId === 'object' && courtId !== null ? courtId._id : courtId;
    
    // 返回映射的名稱，如果沒有找到則返回原始 id
    return courtIdMapping[id] || id;
  };

  // State for calendar and timeslots
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [groupedTimeSlots, setGroupedTimeSlots] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format date as YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    // 使用本地時間組件，而不是 toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 按場地ID對時段進行分組
  const groupTimeSlotsByCourt = (slots) => {
    const grouped = {};
    
    // 獲取所有不同的場地ID
    const courtIds = [...new Set(slots.map(slot => {
      // 處理courtId可能是物件的情況
      return typeof slot.courtId === 'object' && slot.courtId !== null 
        ? slot.courtId._id 
        : slot.courtId;
    }))];
    
    // 對每個場地ID，收集相關的時段
    courtIds.forEach(courtId => {
      grouped[courtId] = slots.filter(slot => {
        const slotCourtId = typeof slot.courtId === 'object' && slot.courtId !== null 
          ? slot.courtId._id 
          : slot.courtId;
        return slotCourtId === courtId;
      });
    });
    
    return grouped;
  };

  // Fetch timeslots for the selected date
  const fetchTimeSlots = async (date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = `https://liff-reservation.zeabur.app/api/time-slots?date=${formatDateForAPI(date)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("data = ", data);
      
      // 設置時段數據
      setTimeSlots(data);
      
      // 按場地分組時段
      const grouped = groupTimeSlotsByCourt(data);
      setGroupedTimeSlots(grouped);
      
    } catch (err) {
      console.error("Error fetching timeslots:", err);
      setError("無法取得時段資料，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots(selectedDate);
  }, [selectedDate]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const currentDate = new Date(selectedDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create array for calendar
    const days = [];
    
    // Add empty spaces for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Handle date selection from calendar
  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    return timeStr;
  };

  // Determine if a date is the currently selected date
  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Weekday headers
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Calendar and TimeSlots Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">時段查詢</h2>
        
        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={goToPreviousMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            &#8592; 上個月
          </button>
          <h3 className="text-xl font-medium">
            {selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
          </h3>
          <button 
            onClick={goToNextMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            下個月 &#8594;
          </button>
        </div>
        
        {/* Calendar */}
        <div className="mb-8">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map(day => (
              <div key={day} className="text-center font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => (
              <div 
                key={index} 
                className={`
                  p-2 text-center h-12 flex items-center justify-center
                  ${date ? 'cursor-pointer hover:bg-blue-100' : ''}
                  ${isSelectedDate(date) ? 'bg-blue-500 text-white rounded-lg' : ''}
                `}
                onClick={() => date && handleDateClick(date)}
              >
                {date ? date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Date and TimeSlots */}
        <div>
          <h3 className="text-xl font-medium mb-4">
            {formatDate(selectedDate)} 時段列表
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>載入中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>該日期沒有可用時段</p>
            </div>
          ) : (
            // 使用 flex 布局，在行動裝置上垂直排列，桌面上水平排列
            <div className="flex flex-col md:flex-row gap-6">
              {/* 對每個場地創建一個列 */}
              {Object.keys(groupedTimeSlots).map(courtId => (
                <div key={courtId} className="flex-1">
                  <h4 className="text-lg font-medium mb-3 text-center border-b pb-2">
                    場地: {getCourtName(courtId)}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {groupedTimeSlots[courtId].map(slot => (
                      <div key={slot._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</h4>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {slot.name || '時段'}
                          </span>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-600">
                          {slot.defaultPrice && (
                            <p><span className="font-medium">預設價格:</span> {slot.defaultPrice}</p>
                          )}
                          {slot.date && (
                            <p><span className="font-medium">日期:</span> {new Date(slot.date).toLocaleDateString('zh-TW')}</p>
                          )}
                          {slot.description && (
                            <p><span className="font-medium">描述:</span> {slot.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => fetchTimeSlots(selectedDate)}
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPage;