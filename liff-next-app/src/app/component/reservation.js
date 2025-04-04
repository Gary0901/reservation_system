import React from 'react';
import axios from 'axios';
import { useState,useEffect } from 'react';
import { useUserContext } from '@/components/UseProvider';

// 設定API base URL - 根據環境調整
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// 新增的預約詳情彈出視窗組件
const ReservationDetailsPopup = ({ reservation,onClose }) => {
  if(!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">預約明細</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="bg-[#f9f5ea] p-3 rounded">
            <h3 className="font-semibold text-lg">{reservation.title}</h3>
            <p className="text-sm text-[#7B7B7B] mt-1">狀態: {getStatusText(reservation.status)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium">預約日期</p>
              <p className="text-sm text-[#7B7B7B]">{reservation.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium">預約時間</p>
              <p className="text-sm text-[#7B7B7B]">{reservation.startTime} ~ {reservation.endTime}</p>
            </div>
            {/* {reservation.people_num && (
              <div>
                <p className="text-sm font-medium">預約人數</p>
                <p className="text-sm text-[#7B7B7B]">{reservation.people_num}人</p>
              </div>
            )} */}
            <div>
              <p className="text-sm font-medium">預約價格</p>
              <p className="text-sm text-[#7B7B7B]">${reservation.price}</p>
            </div>
            {/* <div>
              <p className="text-sm font-medium">預約編號</p>
              <p className="text-sm text-[#7B7B7B]">{reservation.id}</p>
            </div> */}
          </div>
          
          {reservation.status !== 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onClose()} 
                className="w-full bg-[#4D9E50] text-white py-2 px-4 rounded transition duration-200"
              >
                確認
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 取得狀態文字函數 (需要在組件外定義以便共享)
const getStatusText = (status) => {
  switch(status) {
    case 'pending': return '待確認';
    case 'confirmed': return '已確認';
    case 'cancelled': return '已取消';
    default: return '未知狀態';
  }
};

export default function MyReservation() {
  const {userId} = useUserContext();
  const [reservations, setReservations] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null); 
  // 新增狀態用於控制彈出視窗
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  useEffect(()=>{
    if (userId) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchReservations = async () =>{
    try{
      setLoading(true);
      console.log('獲取用戶預約，userId:',userId);
      const response = await axios.get(`${API_BASE_URL}/reservations/user/${userId}`);

      const formattedReservations = response.data.map(res =>({
        id: res._id,
        title: res.courtId ? `${res.courtId.name}` : '未知場地',
        date: new Date(res.date).toLocaleDateString('zh-TW'),
        startTime: res.startTime,
        endTime: res.endTime,
        price: res.price,
        status: res.status,
        people_num: res.people_num
      }))

      setReservations(formattedReservations);
    } catch(error) {
      console.error('獲取預約失敗：', error);
      setError('無法獲取預約資料，請稍後再試。');
    } finally{
      setLoading(false);
    }
  }

  // 改進後的明細按鈕處理函數
  const handleViewDetails = (reservation) => {
    console.log('查看預約明細：', reservation);
    setSelectedReservation(reservation);
    setShowDetailsPopup(true);
  };

  // 關閉彈出視窗的函數
  const handleCloseDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedReservation(null);
  };

  // 取消按鈕
  const handleCancelReservation = async (reservationId) => {
    try {
      // 呼叫API更新預約狀態為 cancelled
      await axios.put(`${API_BASE_URL}/reservations/${reservationId}/status`, {
        status: 'cancelled'
      });
      
      // 重新獲取預約清單
      fetchReservations();
      
      // 如果目前正在查看的預約被取消，則更新彈出視窗內容
      if (selectedReservation && selectedReservation.id === reservationId) {
        setSelectedReservation({
          ...selectedReservation,
          status: 'cancelled'
        });
      }
    } catch (error) {
      console.error('取消預約失敗：', error);
      alert('取消預約失敗，請稍後再試。');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <p>正在載入預約資料...</p>
      </div>
    );
  }

  // 如果沒有傳入預約資料，顯示預設的空狀態
  const hasReservations = reservations.length > 0;
  
  return (
    <div className="max-w-lg mx-auto pb-24">
      <h1 className="text-xl font-bold mb-4 px-4">我的預約</h1>
      
      {hasReservations ? (
        // 有預約資料時，顯示預約列表
        <div className="space-y-4">
          {reservations.map((reservation, index) => (
            <div key={index} className="bg-[#f9f5ea] p-4 rounded-md shadow mb-4">
              <div className="mb-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  {reservation.title}
                  <span className='text-sm font-normal'>{getStatusText(reservation.status)}</span>
                </h2>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#7B7B7B]">{reservation.date} {reservation.startTime} ~ {reservation.endTime}</span>
                </div>
                <div className="mt-2">
                  {/* <span className="text-sm text-[#7B7B7B]">人數: {reservation.people_num}人</span> */}
                  <span className="text-sm text-[#7B7B7B] ml-4">價格: ${reservation.price}</span>
                </div>
              </div>
              
              {/* 按鈕只在非取消狀態時顯示 */}
              {reservation.status !== 'cancelled' && (
                <div className="flex space-x-3 mt-4">
                  <button
                    className="flex-1 bg-[#4D9E50] text-white py-1 px-3 rounded transition duration-200 text-sm"
                    onClick={() => handleViewDetails(reservation)}
                  >
                    明細
                  </button>
                  <button
                    className="flex-1 bg-[#E57373] text-white py-1 px-3 rounded transition duration-200 text-sm"
                    onClick={() => handleCancelReservation(reservation.id)}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // 沒有預約資料時，顯示空狀態
        <div className="text-center py-8 text-gray-500 bg-[#f9f5ea] rounded-md shadow">
          目前沒有預約
        </div>
      )}
      {/* 預約詳情彈出視窗 */}
      {showDetailsPopup && selectedReservation && (
        <ReservationDetailsPopup 
          reservation={selectedReservation} 
          onClose={handleCloseDetailsPopup} 
        />
      )}
    </div>
  );
}

// 使用示例:
// 
// // 頁面組件中
// import MyReservation from '../components/MyReservation';
// 
// export default function ReservationPage() {
//   // 這些資料可以從API獲取
//   const reservationData = [
//     {
//       id: '1',
//       title: '女網混排四小時$230',
//       date: '2025-01-22',
//       startTime: '10:00',
//       endTime: '14:00',
//       price: 230,
//       onViewDetails: (res) => console.log('查看明細', res),
//       onCancel: (res) => console.log('取消預約', res)
//     },
//     {
//       id: '2',
//       title: '男網男排三小時$180',
//       date: '2025-01-30',
//       startTime: '18:00',
//       endTime: '21:00',
//       price: 180,
//       onViewDetails: (res) => console.log('查看明細', res),
//       onCancel: (res) => console.log('取消預約', res)
//     }
//   ];
// 
//   return (
//     <div>
//       <MyReservation reservations={reservationData} />
//     </div>
//   );
// }