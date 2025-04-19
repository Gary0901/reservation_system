import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import DaySheets from './day_sheet';
import { CourtBookingTable } from './courtBookingTable'; // 引入新的表格組件

// 設定API base URL - 根據環境調整
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showBookingList, setShowBookingList] = useState(false);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 處理日期格式化為 YYYY-MM-DD
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 取得當前月份的天數
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // 取得當月第一天是星期幾
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // 產生月曆日期
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // 月曆前面的空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // 填入日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // 從API獲取時段資料
  const fetchTimeslots = async (date) => {
    if (!date) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 從API獲取指定日期的時段
      const formattedDate = formatDateForAPI(date);
      // console.log('正在獲取日期:', formattedDate, '的時段資料');
      
      const response = await axios.get(`${API_BASE_URL}/time-slots`, {
        params: { 
          date: formattedDate,
          isTemplate:'false'
        }
      });
      
      // console.log('API 回傳的時段資料:', response.data);
      
      // 將API返回的資料轉換為前端所需格式
      const formattedData = response.data.map(slot => {
        // 嘗試從courtId獲取場地名稱
        let courtName = "";
        if (slot.courtId && typeof slot.courtId === 'object') {
          courtName = slot.courtId.name || "";
        } else if (slot.courtId) {
          // 如果courtId只是ID而不是對象，嘗試用它來判斷場地
          courtName = slot.courtId.includes("A") ? "A" : 
                      slot.courtId.includes("B") ? "B" : "";
        }
        
        // 或者直接從name屬性判斷
        let courtLetter = "";
        if (slot.name) {
          // 如果名稱包含 "A" 或 "B"，直接提取
          if (slot.name.includes("A")) courtLetter = "A";
          else if (slot.name.includes("B")) courtLetter = "B";
        }
        
        return {
          id: slot._id,
          title: `羽球場${courtLetter || courtName}${slot.name ? ` ${slot.name}` : ""}`,
          time: `${slot.startTime} ~ ${slot.endTime}`,
          occupancy: 0, // 這個可能需要從另一個API獲取
          maxOccupancy: 4, // 暫時設定為固定值
          price: slot.defaultPrice
        };
      });
      
      setBookingsData(formattedData);
    } catch (err) {
      console.error('獲取時段資料失敗:', err);
      setError('獲取時段資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 處理日期選擇
  const handleDateSelect = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
      fetchTimeslots(newDate);
      setShowBookingList(true); // 選擇日期後顯示預約列表
    }
  };

  // 關閉預約列表
  const closeBookingList = () => {
    setShowBookingList(false);
    setSelectedDate(null);
  };
  
  // 切換到前一個月
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // 切換到下一個月
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // 取得月份名稱（中文）
  const getMonthName = (month) => {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return monthNames[month];
  };

  // 處理月份選擇
  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  // 切換月份選擇器顯示狀態
  const toggleMonthPicker = () => {
    setShowMonthPicker(!showMonthPicker);
  };
  
  // 判斷是否為今天
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  // 判斷是否為選中的日期
  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="font-sans max-w-md mx-auto bg-black text-white">
      <Head>
        <title>預約系統</title>
        <meta name="description" content="預約系統日曆" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col h-screen overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* 標籤欄 */}
        <div className="flex bg-amber-50">
          <div className="py-3 px-5 ml-4 text-base font-bold bg-[#719e85] text-white">場地預約</div>
        </div>

        <hr className="border-t-1 border-[#719e85]"></hr>

        {/* 月份選擇器 */}
        <div className="flex justify-between items-center py-2 px-4 bg-amber-50 relative">
          <div 
            className="text-2xl font-bold text-[#719e85]"
            onClick={toggleMonthPicker}
          >
            {currentDate.getFullYear()} {getMonthName(currentDate.getMonth())} &#9660;
          </div>
          <div className="flex gap-5">
          <button onClick={goToPrevMonth} className="bg-transparent border-0 cursor-pointer p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L5 10L12 16" stroke="#719e85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={goToNextMonth} className="bg-transparent border-0 cursor-pointer p-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4L15 10L8 16" stroke="#719e85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          </div>
        </div>

        {/* 月份選擇下拉菜單 */}
        {showMonthPicker && (
            <div className="absolute top-16 left-4 bg-white shadow-lg rounded-md z-10 p-2 border border-amber-200">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`p-2 text-center cursor-pointer rounded hover:bg-amber-100 ${
                    currentDate.getMonth() === index ? 'bg-[#719e85] text-white' : 'text-[#719e85]'
                  }`}
                  onClick={() => handleMonthSelect(index)}
                >
                  {getMonthName(index)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 星期 */}
        <div className="grid grid-cols-7 text-center py-3 bg-amber-50 text-[#719e85] font-medium">
          <div>日</div>
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div>六</div>
        </div>
        
        {/* 日期 */}
        <div className="grid grid-cols-7 auto-rows-fr text-center bg-amber-50 flex-grow pb-40">
          {calendarDays.map((day, index) => (
            <div
                key={index}
                className={`flex justify-center items-center cursor-pointer mx-1 my-1 aspect-square ${
                !day ? '' : 'text-[#719e85] text-lg'
                }`}
                onClick={() => handleDateSelect(day)}
            >
            <div className={`flex justify-center items-center ${
                isToday(day) || isSelected(day) 
                    ? 'bg-[#719e85] text-white rounded-full aspect-square w-10 h-10' 
                    : 'w-10 h-10 flex items-center justify-center'
                }`}>
                {day}
            </div>
          </div>
          ))}
        </div>

        {/* 顯示新的表格式預約介面 */}
        {showBookingList && selectedDate && (
          <CourtBookingTable
            selectedDate={selectedDate}
            onClose={closeBookingList}
            bookings={bookingsData}
          />
        )}

        {/* 載入中狀態 */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-md shadow-md">
              <p className="text-gray-800">載入中...</p>
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="fixed bottom-20 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}