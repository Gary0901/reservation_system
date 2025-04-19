import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookingFormDialog } from './popup_reservation';
import { useUserContext } from '../../components/UseProvider';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 新的表格式預約視圖
export const CourtBookingTable = ({ selectedDate, onClose, bookings = [] }) => {
  // 場地列表
  const courts = ['ㄅ', 'ㄆ', 'ㄇ'];
  
  // 獲取用戶上下文
  const { userId } = useUserContext();
  
  // 預約記錄
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 預約表單彈窗狀態
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // 時間段列表 (0-24小時)
  const timeSlots = Array.from({ length: 24 }, (_, index) => {
    const start = `${String(index).padStart(2, '0')}:00`;
    const end = `${String((index + 1) % 24).padStart(2, '0')}:00`;
    return {
      id: index,
      label: `${start} ~ ${end}`,
      time: `${start} ~ ${end}`,
      startTime: start,
      endTime: end
    };
  });

  // 場地ID映射
  const courtIdMapping = {
    'ㄅ': '67ecc9d54998ee57d673b053',
    'ㄆ': '67ecc9de4998ee57d673b055',
    'ㄇ': '67ecc9e64998ee57d673b057'
  };

  // 格式化日期為 YYYY-MM-DD
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 獲取預約記錄
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchReservations = async () => {
      try {
        setLoading(true);
        
        // 格式化日期為 API 需要的格式
        const formattedDate = formatDateForAPI(selectedDate);
        
        // 獲取所有預約 - 注意可能需要根據您的 API 修改這個 URL
        const response = await axios.get(`${API_BASE_URL}/reservations`, {
          params: { date: formattedDate }
        });
        
        // 過濾出當天有效的預約 (狀態不是 cancelled)
        const validReservations = response.data.filter(res => 
          res.status !== 'cancelled' && 
          new Date(res.date).toISOString().split('T')[0] === formattedDate
        );
        
        setReservations(validReservations);
        // console.log('獲取到的預約數據:', validReservations);
      } catch (err) {
        console.error('獲取預約記錄失敗:', err);
        setError('獲取預約記錄時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [selectedDate]);

  // 格式化日期顯示
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 (${weekday})`;
  };

  // 將場地ID轉換為顯示用的標識 (ㄅ, ㄆ, ㄇ)
  const convertCourtId = (courtId) => {
    // 根據您的數據結構調整這個映射
    // 這裡假設有預設的courtId映射
    const courtMapping = {
      '67ecc9d54998ee57d673b053': 'ㄅ',
      '67ecc9de4998ee57d673b055': 'ㄆ',
      '67ecc9e64998ee57d673b057': 'ㄇ'
      // 添加更多場地映射...
    };
    
    if (courtMapping[courtId]) {
      return courtMapping[courtId];
    }
    
    // 如果是對象且有 name 屬性
    if (courtId && typeof courtId === 'object' && courtId.name) {
      const name = courtId.name;
      if (name.includes('A') || name.includes('ㄅ')) return 'ㄅ';
      if (name.includes('B') || name.includes('ㄆ')) return 'ㄆ';
      if (name.includes('C') || name.includes('ㄇ')) return 'ㄇ';
    }
    
    // 如果是字串
    if (typeof courtId === 'string') {
      if (courtId.includes('A')) return 'ㄅ';
      if (courtId.includes('B')) return 'ㄆ';
      if (courtId.includes('C')) return 'ㄇ';
    }
    
    // 默認返回第一個場地
    return 'ㄅ';
  };

  // 檢查時段是否已被預約
  const isTimeSlotBooked = (slotStartTime, court) => {
    if (!reservations || reservations.length === 0) return false;
    
    // 將時間格式標準化 (去掉可能的前導零)
    const normalizedSlotTime = slotStartTime.replace(/^0/, '');
    
    // 檢查是否有匹配的預約
    return reservations.some(reservation => {
      // 標準化預約的開始時間
      const reservationStartTime = reservation.startTime.replace(/^0/, '');
      
      // 獲取場地標識
      let reservationCourt;
      if (reservation.courtId && typeof reservation.courtId === 'object') {
        reservationCourt = convertCourtId(reservation.courtId);
      } else {
        reservationCourt = convertCourtId(reservation.courtId);
      }
      
      // 檢查時間和場地是否匹配
      return reservationStartTime === normalizedSlotTime && reservationCourt === court;
    });
  };

  // 將bookings數據轉換成表格所需的格式
  const generateBookingMatrix = () => {
    // 初始化一個空的預約矩陣
    const matrix = {};
    
    // 填充矩陣
    timeSlots.forEach(slot => {
      matrix[slot.id] = {};
      courts.forEach(court => {
        // 檢查是否有預約
        const isBooked = isTimeSlotBooked(slot.startTime, court);
        
        matrix[slot.id][court] = {
          available: !isBooked, // 如果沒有預約，則可用
          price: null, // 默認價格為空
          id: null,
          court: court
        };
      });
    });

    // 根據booking數據更新價格信息
    bookings.forEach(booking => {
      // 從booking.time中提取時間段 (例如: "00:00 ~ 01:00")
      const timeMatch = booking.time.match(/(\d+):(\d+)\s*~\s*(\d+):(\d+)/);
      if (!timeMatch) return;

      const startHour = parseInt(timeMatch[1]);
      const courtLetter = booking.title.includes('羽球場') ? 
        booking.title.replace('羽球場', '').trim().charAt(0) : 'ㄅ';
      
      // 找到對應的場地代號 (將A->ㄅ, B->ㄆ, C->ㄇ)
      let courtKey;
      switch(courtLetter) {
        case 'A': courtKey = 'ㄅ'; break;
        case 'B': courtKey = 'ㄆ'; break;
        case 'C': courtKey = 'ㄇ'; break;
        default: courtKey = courtLetter; // 如果已經是ㄅㄆㄇ就直接使用
      }
      
      // 更新矩陣中對應位置的價格數據
      if (matrix[startHour] && matrix[startHour][courtKey]) {
        matrix[startHour][courtKey].price = booking.price;
        matrix[startHour][courtKey].id = booking.id;
      }
    });

    return matrix;
  };

  const bookingMatrix = generateBookingMatrix();

  // 處理預約按鈕點擊，打開預約表單
  const handleBooking = (timeSlotId, court) => {
    const bookingInfo = bookingMatrix[timeSlotId][court];
    
    // 如果可預約，則打開預約表單
    if (bookingInfo.available && bookingInfo.price !== null) {
      setSelectedBooking({
        timeSlotId,
        court,
        timeSlot: timeSlots[timeSlotId].time,
        startTime: timeSlots[timeSlotId].startTime,
        endTime: timeSlots[timeSlotId].endTime,
        price: bookingInfo.price,
        courtId: courtIdMapping[court]
      });
      setShowBookingForm(true);
    }
  };

  // 處理預約表單提交
  const handleBookingSubmit = async (formData) => {
    if (!userId) {
      throw new Error('請先登入');
    }

    if (!selectedBooking) {
      throw new Error('請選擇預約時段');
    }

    try {
      setLoading(true);
      
      // 準備預約數據
      const bookingData = {
        userId: userId,
        courtId: selectedBooking.courtId,
        date: formatDateForAPI(selectedDate),
        startTime: selectedBooking.startTime,
        endTime: selectedBooking.endTime,
        price: selectedBooking.price,
        people_num: formData.people_num,
        phone: formData.phone
      };
      
      // console.log('發送預約數據:', bookingData);
      
      // 發送預約請求
      const response = await axios.post(`${API_BASE_URL}/reservations`, bookingData);
      
      // console.log('預約成功:', response.data);
      
      // 更新預約列表
      setReservations([...reservations, response.data]);
      
      // 顯示成功消息
      setSuccessMessage('預約成功！');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      return response.data;
    } catch (error) {
      console.error('預約失敗:', error);
      
      // 顯示錯誤消息
      const errorMsg = error.response?.data?.message || '預約失敗，請稍後再試';
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full md:max-w-3xl md:h-auto md:max-h-screen bg-amber-50 md:rounded-md shadow-md flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#719e85]">
            {formatDate(selectedDate)} 場地預約
          </h2>
          <button onClick={onClose} className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 成功消息 */}
        {successMessage && (
          <div className="mx-4 mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* 表格頭部 */}
          <div className="grid grid-cols-4 mb-2 text-center font-medium border-b-2 border-[#719e85] pb-2">
            <div className="text-[#719e85]">時間</div>
            {courts.map(court => (
              <div key={court} className="text-[#719e85]">羽球場{court}</div>
            ))}
          </div>
          
          {/* 表格內容 */}
          <div className="space-y-2">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot.id} className="grid grid-cols-4 text-sm border-b border-gray-200 py-2">
                <div className="flex items-center justify-center text-gray-600">{timeSlot.label}</div>
                
                {courts.map(court => {
                  const bookingInfo = bookingMatrix[timeSlot.id][court];
                  const isAvailable = bookingInfo.available && bookingInfo.price !== null;
                  const isFull = !isAvailable && bookingInfo.price !== null;
                  
                  return (
                    <div key={court} className="flex flex-col items-center justify-center p-1">
                      {bookingInfo.price !== null ? (
                        <>
                          <div className="text-center mb-1">
                            {!isFull && <span className="text-md font-medium text-gray-700">${bookingInfo.price}</span>}
                          </div>
                          <button 
                            className={`w-full py-1 px-2 rounded-md text-white text-sm ${
                              isFull 
                                ? 'bg-red-500 cursor-not-allowed' 
                                : 'bg-[#719e85] hover:bg-green-600 transition-colors'
                            }`}
                            disabled={isFull}
                            onClick={() => handleBooking(timeSlot.id, court)}
                          >
                            {isFull ? '已滿' : '預約'}
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">不可預約</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* 預約表單彈窗 */}
        {selectedBooking && (
          <BookingFormDialog
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSubmit={handleBookingSubmit}
            timeSlot={selectedBooking.timeSlot}
            court={selectedBooking.court}
            courtId={selectedBooking.courtId}
            price={selectedBooking.price}
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
};

export default CourtBookingTable;