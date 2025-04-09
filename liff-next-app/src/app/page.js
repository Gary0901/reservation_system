'use client';
import { useLiffContext } from '@/components/LiffProvider';
import { useUserContext } from '../components/UseProvider';
import { useEffect, useState } from 'react';
import Calendar from './component/calender';
import MyReservation from './component/reservation';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';

// 設定API base URL - 根據環境調整
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' 

export default function Home() {
  const { liff, error } = useLiffContext();
  const { userId, setUserId, lineProfile, setLineProfile, clearUserData } = useUserContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab ] = useState('calendar');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!liff) return;

    // 檢查用戶是否已登入
    if (liff.isLoggedIn()) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  }, [liff]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await liff.getProfile();

      // 更新 context 中的 LINE 資料
      setLineProfile(profile);

      // 將用戶資料傳送到後端API 
      const userData = {
        lineId : profile.userId,
        name: profile.displayName
      };

      // 在這裡添加日誌，查看完整的 URL
      console.log('即將發送請求到:', `${API_BASE_URL}/users`);

      const response = await axios.post(`${API_BASE_URL}/users`,userData);
      console.log('用戶資料已同步到後端',response.data)

      setUserId(response.data._id);
    } catch (error) {
      console.error('獲取用戶資料失敗：', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!liff) return;
    liff.login();
  };

  const handleLogout = () => {
    if (!liff) return;
    liff.logout();
    setIsLoggedIn(false);

    // 清除任何儲存的用戶資料
    clearUserData();

    window.location.reload();
  };

  const handleMap = () => {
    
  }

  const handleReservationInfo = () => {

  }

  if (error) {
    return <div>初始化LIFF時發生錯誤：{error.message}</div>;
  }

  if (!liff) {
    return <div>正在載入LIFF...</div>;
  }

  return (
    <main className="min-h-screen p-4">
      
      {!isLoggedIn ? (
        <div className="relative min-h-screen flex flex-col items-center justify-center">
        {/* 背景圖片容器 */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
          style={{
            backgroundImage: "url('/background.jpg')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        ></div>
        {/* 登入內容 */}
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold mb-4 text-center">品朕羽球館</h1>
          <div className='flex justify-center'>
            <button 
              onClick={handleLogin}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
              使用LINE登入
            </button>

            {/* 地圖標示按鈕 */}
            <button
              onClick = {handleMap}
            >
              <i className="ri-map-pin-line mr-2"></i> 地圖標示
            </button>

            {/* 預約須知按鈕 */}
            <button
              onClick={handleReservationInfo}
            >
              <i className="ri-reserved-fill mr-2"></i> 預約須知
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div>
          {/* 內容區域，根據activaTab顯示不同組件 */}
          <div className = 'flex-grow'>
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'myReservation' && <MyReservation />}
          </div>
          <footer className="fixed bottom-0 left-0 right-0 bg-[#719e85] flex justify-around items-center py-4 z-10">
            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`flex flex-col items-center p-2 ${activeTab === 'calendar' ? 'text-[#f7ede2]' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-base mt-1">立即預約</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('myReservation')} 
              className={`flex flex-col items-center p-2 ${activeTab === 'myReservation' ? 'text-[#f7ede2]' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-base mt-1">我的預約</span>
            </button>
          </footer>
        </div>
      )}
    </main>
  );
}