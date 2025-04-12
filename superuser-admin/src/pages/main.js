import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MainPage() {
  const [statistics, setStatistics] = useState({
    todayReservations: 0,
    weekReservations: 0,
    availableSlots: 24, // 這個值可能需要從另一個 API 獲取
    registeredUsers: 0  // 將從 API 獲取
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 獲取預約數據
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
        
        // 計算今日和本週的預約數量
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 將時間設置為今天的 00:00:00
        
        const startOfWeek = new Date(today);
        // 根據需要調整週的開始日期，這裡假設週日是一週的開始
        const day = today.getDay(); // 0 = 週日, 1 = 週一, ..., 6 = 週六
        startOfWeek.setDate(today.getDate() - day); // 設置為本週開始日
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // 設置為本週結束日
        endOfWeek.setHours(23, 59, 59, 999); // 將時間設置為當天的 23:59:59.999
        
        // 計算今日和本週的預約數量
        let todayReservations = 0;
        let weekReservations = 0;
        
        reservationData.forEach(reservation => {
          if (!reservation.date) return;
          
          const reservationDate = new Date(reservation.date);
          // 只計算非取消的預約
          if (reservation.status !== 'cancelled') {
            // 檢查是否為今日預約
            if (reservationDate.toDateString() === today.toDateString()) {
              todayReservations++;
            }
            
            // 檢查是否為本週預約
            if (reservationDate >= startOfWeek && reservationDate <= endOfWeek) {
              weekReservations++;
            }
          }
        });
        
        setStatistics(prevStats => ({
          ...prevStats,
          todayReservations,
          weekReservations
        }));
        
        // 獲取用戶數據完成後設置載入狀態
        // 但不在這裡設置 setLoading(false)，會在獲取用戶數據後一併設置
      } catch (err) {
        console.error('獲取預約數據時出錯:', err);
        setError(`無法載入預約數據: ${err.message}`);
        setLoading(false);
      }
    };

    // 獲取用戶數據
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://liff-reservation.zeabur.app/api/users');
        
        console.log('API 返回的用戶數據:', response.data);
        
        // 計算註冊用戶數量
        let registeredUsers = 0;
        if (Array.isArray(response.data)) {
          registeredUsers = response.data.length;
        } else if (response.data && typeof response.data === 'object') {
          // 可能 API 返回的是包含用戶數據的對象
          const possibleArrays = Object.values(response.data).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            registeredUsers = possibleArrays[0].length;
          } else {
            // 如果找不到數組，嘗試看是否是一個用戶物件
            registeredUsers = Object.keys(response.data).length > 0 ? 1 : 0;
          }
        }
        
        setStatistics(prevStats => ({
          ...prevStats,
          registeredUsers
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('獲取用戶數據時出錯:', err);
        setError(prevError => prevError ? 
          `${prevError}; 無法載入用戶數據: ${err.message}` : 
          `無法載入用戶數據: ${err.message}`
        );
        setLoading(false);
      }
    };

    // 並行執行兩個 API 請求
    fetchReservations();
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">系統概覽</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">今日預約</h3>
            {loading ? (
              <div className="h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            ) : (
              <p className="text-2xl font-bold">{statistics.todayReservations}</p>
            )}
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">本週預約</h3>
            {loading ? (
              <div className="h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
            ) : (
              <p className="text-2xl font-bold">{statistics.weekReservations}</p>
            )}
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">可用時段</h3>
            <p className="text-2xl font-bold">{statistics.availableSlots}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">註冊用戶</h3>
            {loading ? (
              <div className="h-8 w-8 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
            ) : (
              <p className="text-2xl font-bold">{statistics.registeredUsers}</p>
            )}
          </div>
        </div>
        
        {/* <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">最近活動</h3>
          <div className="border rounded-lg divide-y">
            <div className="p-3 hover:bg-gray-50">
              <p className="text-sm text-gray-600">2025-04-12 09:15</p>
              <p>新增預約 - 王小明 (13:00-14:00)</p>
            </div>
            <div className="p-3 hover:bg-gray-50">
              <p className="text-sm text-gray-600">2025-04-12 08:30</p>
              <p>修改時段 - 週三下午</p>
            </div>
            <div className="p-3 hover:bg-gray-50">
              <p className="text-sm text-gray-600">2025-04-11 17:45</p>
              <p>取消預約 - 李大華 (15:00-16:00)</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default MainPage;