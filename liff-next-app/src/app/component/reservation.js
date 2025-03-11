import React from 'react';

export default function MyReservation({ reservations = [] }) {
  // 如果沒有傳入預約資料，顯示預設的空狀態
  const hasReservations = reservations.length > 0;
  
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4 px-4">我的預約</h1>
      
      {hasReservations ? (
        // 有預約資料時，顯示預約列表
        <div className="space-y-4">
          {reservations.map((reservation, index) => (
            <div key={index} className="bg-[#f9f5ea] p-4 rounded-md shadow mb-4">
              <div className="mb-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  {reservation.title}
                  {/* <span className='text-sm font-normal'>預約成功</span> */}
                </h2>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#7B7B7B]">{reservation.date} {reservation.startTime} ~ {reservation.endTime}</span>
                </div>
              </div>
              
              {/* 按鈕放到底部，且更扁平、更寬 */}
              <div className="flex space-x-3 mt-4">
                <button
                  className="flex-1 bg-[#4D9E50] text-white py-1 px-3 rounded transition duration-200 text-sm"
                  onClick={() => reservation.onViewDetails?.(reservation)}
                >
                  明細
                </button>
                <button
                  className="flex-1 bg-[#E57373] text-white py-1 px-3 rounded transition duration-200 text-sm"
                  onClick={() => reservation.onCancel?.(reservation)}
                >
                  取消
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 沒有預約資料時，顯示空狀態
        <div className="text-center py-8 text-gray-500 bg-[#f9f5ea] rounded-md shadow">
          目前沒有預約
        </div>
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