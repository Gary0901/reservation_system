import React from 'react';

// DaySheets 組件 - 顯示單個預約選項
const DaySheets = ({ title, time, occupancy, maxOccupancy, price }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-600">{title}</h3>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <span className="inline-flex items-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time}
          </span>
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {occupancy}/{maxOccupancy}
          </span>
        </div>
      </div>
      <div className="ml-4 flex items-center">
        {price !== null ? (
          occupancy === maxOccupancy ? (
            <span className="text-sm text-red-500">已滿額</span>
          ) : (
            <>
              <span className="text-lg font-medium mr-3 text-gray-600">${price}</span>
              <button className="bg-[#719e85] text-white py-1 px-4 rounded-md text-sm hover:bg-green-600 transition-colors">
                預約
              </button>
            </>
          )
        ) : (
          <span className="text-sm text-gray-500">無法預約</span>
        )}
      </div>
    </div>
  );
};

// BookingList 組件 - 全螢幕高度的預約列表模態視窗
export const BookingList = ({ selectedDate, onClose, bookings = [] }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full md:max-w-md md:h-auto md:max-h-screen bg-amber-50 md:rounded-md shadow-md flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#719e85]">
            {formatDate(selectedDate)} 當日臨打
          </h2>
          <button onClick={onClose} className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {bookings.map(booking => (
            <DaySheets
              key={booking.id}
              title={booking.title}
              time={booking.time}
              occupancy={booking.occupancy}
              maxOccupancy={booking.maxOccupancy}
              price={booking.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 默認導出 DaySheets 組件
export default DaySheets;