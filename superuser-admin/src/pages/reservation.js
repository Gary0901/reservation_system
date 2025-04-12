import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' 或 'date'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://liff-reservation.zeabur.app/api/reservations');
        
        // 在控制台打印 API 返回的數據，幫助調試
        console.log('API 返回的預約數據:', response.data);
        
        // 檢查是否是數組或包含數組的對象
        let reservationData = [];
        if (Array.isArray(response.data)) {
          reservationData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // 可能 API 返回的是包含預約數據的對象
          const possibleArrays = Object.values(response.data).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            reservationData = possibleArrays[0];
          } else {
            // 如果找不到數組，可能是單個預約對象
            reservationData = [response.data];
          }
        } else {
          setError('API 返回了非預期格式的數據');
        }
        
        // 將日期字符串轉換為 Date 對象以便後續處理
        const formattedData = reservationData.map(reservation => ({
          ...reservation,
          dateObj: reservation.date ? new Date(reservation.date) : null
        }));

        setReservations(formattedData);
        setFilteredReservations(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('獲取預約數據時出錯:', err);
        setError(`無法載入預約數據: ${err.message}`);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // 當選擇的日期變更時過濾預約
  useEffect(() => {
    if (selectedDate && viewMode === 'date') {
      // 過濾當天的預約
      const filteredData = reservations.filter(reservation => {
        if (!reservation.dateObj) return false;
        
        return (
          reservation.dateObj.getFullYear() === selectedDate.getFullYear() &&
          reservation.dateObj.getMonth() === selectedDate.getMonth() &&
          reservation.dateObj.getDate() === selectedDate.getDate()
        );
      });
      
      setFilteredReservations(filteredData);
    } else {
      // 如果未選擇日期或是'all'模式，顯示所有預約
      setFilteredReservations(reservations);
    }
  }, [selectedDate, reservations, viewMode]);

  // 處理確認預約
  const handleConfirmReservation = async (reservationId) => {
    if (!reservationId) return;
    
    // 先向用戶確認
    if (!window.confirm('確定要將此預約設為已確認狀態嗎？')) {
      return;
    }
    
    try {
      setUpdateLoading(true);
      // 使用 API 更新預約狀態為 confirmed
      const response = await axios.put(
        `https://liff-reservation.zeabur.app/api/reservations/${reservationId}/status`,
        { status: "confirmed" }
      );
      
      // 如果 API 調用成功，更新本地狀態
      if (response.status === 200) {
        // 更新本地預約列表中的狀態
        const updatedReservations = reservations.map(reservation => {
          if (reservation._id === reservationId) {
            return { ...reservation, status: 'confirmed' };
          }
          return reservation;
        });
        
        setReservations(updatedReservations);
        
        // 同時更新過濾後的預約列表
        const updatedFilteredReservations = filteredReservations.map(reservation => {
          if (reservation._id === reservationId) {
            return { ...reservation, status: 'confirmed' };
          }
          return reservation;
        });
        
        setFilteredReservations(updatedFilteredReservations);
      }
      setUpdateLoading(false);
    } catch (err) {
      console.error('確認預約時出錯:', err);
      setError(`無法確認預約: ${err.message}`);
      setUpdateLoading(false);
    }
  };
  
  // 處理取消預約
  const handleCancelReservation = async (reservationId) => {
    if (!reservationId) return;
    
    // 先向用戶確認
    if (!window.confirm('確定要取消這個預約嗎？')) {
      return;
    }
    
    try {
      setUpdateLoading(true);
      // 使用 API 更新預約狀態為 cancelled
      const response = await axios.put(
        `https://liff-reservation.zeabur.app/api/reservations/${reservationId}/status`,
        { status: "cancelled" }
      );
      
      // 如果 API 調用成功，更新本地狀態
      if (response.status === 200) {
        // 更新本地預約列表中的狀態
        const updatedReservations = reservations.map(reservation => {
          if (reservation._id === reservationId) {
            return { ...reservation, status: 'cancelled' };
          }
          return reservation;
        });
        
        setReservations(updatedReservations);
        
        // 同時更新過濾後的預約列表
        const updatedFilteredReservations = filteredReservations.map(reservation => {
          if (reservation._id === reservationId) {
            return { ...reservation, status: 'cancelled' };
          }
          return reservation;
        });
        
        setFilteredReservations(updatedFilteredReservations);
      }
      setUpdateLoading(false);
    } catch (err) {
      console.error('取消預約時出錯:', err);
      setError(`無法取消預約: ${err.message}`);
      setUpdateLoading(false);
    }
  };

  // 處理日期選擇
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setViewMode('date');
  };

  // 處理查看所有預約
  const handleViewAllReservations = () => {
    setSelectedDate(null);
    setViewMode('all');
    setFilteredReservations(reservations);
  };

  // 檢查日期是否有預約
  const hasReservationsOnDate = (date) => {
    return reservations.some(reservation => 
      reservation.dateObj &&
      reservation.dateObj.getFullYear() === date.getFullYear() &&
      reservation.dateObj.getMonth() === date.getMonth() &&
      reservation.dateObj.getDate() === date.getDate()
    );
  };
  
  // 獲取當月的日期
  const getDaysInMonth = (year, month) => {
    // 月份從0開始（0 = 一月）
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    
    // 添加前一個月的天數來填充第一週的前幾天
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    // 添加當月的天數
    while (date.getMonth() === month) {
      days.push({
        date: new Date(date),
        isCurrentMonth: true
      });
      date.setDate(date.getDate() + 1);
    }
    
    // 添加下個月的天數來填充最後一週的剩餘天數
    const lastDay = new Date(year, month + 1, 0);
    const remainingDays = 7 - lastDay.getDay() - 1;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };
  
  // 前進到下一個月
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // 返回上一個月
  const goToPrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  // 返回今天所在的月份
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // 格式化日期顯示
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">預約管理</h2>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* 日曆和過濾區塊 */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 lg:w-1/3">
              <div className="w-full border rounded-lg p-4 bg-white">
                {/* 日曆頭部 */}
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={goToPrevMonth}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    &lt;
                  </button>
                  <div className="font-semibold">
                    {currentMonth.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
                  </div>
                  <button 
                    onClick={goToNextMonth}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    &gt;
                  </button>
                </div>
                
                {/* 星期列 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                    <div key={day} className="text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* 日期格子 */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()).map((dayInfo, index) => {
                    const { date, isCurrentMonth } = dayInfo;
                    const isSelected = selectedDate && 
                                      date.getFullYear() === selectedDate.getFullYear() &&
                                      date.getMonth() === selectedDate.getMonth() &&
                                      date.getDate() === selectedDate.getDate();
                    
                    const hasReservation = hasReservationsOnDate(date);
                    
                    return (
                      <button 
                        key={index}
                        onClick={() => handleDateChange(date)}
                        className={`
                          h-10 flex flex-col justify-center items-center rounded-full
                          ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                          ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                        `}
                      >
                        <span>{date.getDate()}</span>
                        {hasReservation && isCurrentMonth && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'} mt-0.5`}></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* 返回今日按鈕 */}
                <div className="mt-4 text-center">
                  <button 
                    onClick={goToCurrentMonth}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    返回今日
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 lg:w-2/3 flex flex-col">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {viewMode === 'date' && selectedDate
                    ? `${formatDate(selectedDate)} 的預約記錄`
                    : '所有預約記錄'}
                </h3>
                <div className="flex space-x-2">
                  {viewMode === 'date' && (
                    <button 
                      onClick={handleViewAllReservations}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      查看全部預約
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {viewMode === 'date' ? 
                  `找到 ${filteredReservations.length} 個預約` : 
                  `總共 ${reservations.length} 個預約`}
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序號</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預約日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預約者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">場地</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation, index) => (
                    <tr key={reservation._id || `reservation-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(reservation.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.startTime || 'N/A'} - {reservation.endTime || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.userId && reservation.userId.name ? reservation.userId.name : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.courtId && reservation.courtId.name ? reservation.courtId.name : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {reservation.status === 'confirmed' ? '已確認' :
                           reservation.status === 'pending' ? '待確認' :
                           reservation.status === 'cancelled' ? '已取消' :
                           reservation.isActive !== undefined ? (reservation.isActive ? '使用中' : '未使用') :
                           '未知狀態'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {updateLoading ? (
                          <div className="inline-block animate-spin h-4 w-4 border border-gray-600 border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          reservation.status !== 'cancelled' ? (
                            <>
                              <button 
                                onClick={() => handleConfirmReservation(reservation._id)}
                                disabled={reservation.status === 'confirmed' || updateLoading}
                                className={`text-blue-600 hover:text-blue-900 mr-3 ${
                                  reservation.status === 'confirmed' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                確認
                              </button>
                              <button 
                                onClick={() => handleCancelReservation(reservation._id)}
                                disabled={updateLoading}
                                className="text-red-600 hover:text-red-900"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400">無操作</span>
                          )
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {viewMode === 'date' ? '這一天沒有預約記錄' : '沒有找到預約數據'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReservationPage;