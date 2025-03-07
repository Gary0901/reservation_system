import { useState } from 'react';
import Head from 'next/head';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMonthPicker,setShowMonthPicker] = useState(false);
  
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
  
  // 處理日期選擇
  const handleDateSelect = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
    }
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
  }

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
          <div className="py-3 px-5 ml-4 text-base font-bold bg-[#719e85] text-white">臨打</div>
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
            <button onClick={goToPrevMonth} className="bg-transparent border-0 text-xl text-[#719e85] cursor-pointer">
              &#9664;
            </button>
            <button onClick={goToNextMonth} className="bg-transparent border-0 text-xl text-[#719e85] cursor-pointer">
              &#9654;
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
      </div>
    </div>
  );
}