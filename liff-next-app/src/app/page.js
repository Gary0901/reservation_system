'use client';
import { useLiffContext } from '@/components/LiffProvider';
import { useEffect, useState } from 'react';
import Calendar from './component/calender';
import MyReservation from './component/reservation';

export default function Home() {
  const { liff, error } = useLiffContext();
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab ] = useState('calendar')

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
      const profile = await liff.getProfile();
      setProfile(profile);
    } catch (error) {
      console.error('獲取用戶資料失敗：', error);
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
    setProfile(null);
    window.location.reload();
  };

  if (error) {
    return <div>初始化LIFF時發生錯誤：{error.message}</div>;
  }

  if (!liff) {
    return <div>正在載入LIFF...</div>;
  }

  // 示範預約數據，實際使用從後端api獲取
  const reservationData = [
    {
      id: '1',
      title: '女網混排四小時$230',
      date: '2025-01-22',
      startTime: '10:00',
      endTime: '14:00',
      price: 230,
      onViewDetails: (res) => console.log('查看明細', res),
      onCancel: (res) => console.log('取消預約', res)
    }
  ];

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">品朕羽球館</h1>
      
      {!isLoggedIn ? (
        <div className='flex justify-center'>
          <button 
            onClick={handleLogin}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            使用LINE登入
          </button> 
        </div>
      ) : (
        <div>
          {/* {profile && (
            <div className="mb-4">
              <img 
                src={profile.pictureUrl} 
                alt="用戶頭像" 
                className="w-16 h-16 rounded-full mb-2"
              />
              <p>歡迎，{profile.displayName}</p>
            </div>
          )} */}
          {/* 內容區域，根據activaTab顯示不同組件 */}
          <div className = 'flex-grow'>
            {activeTab === 'calendar' && <Calendar/>}
            {activeTab === 'myReservation' && <MyReservation reservations = {reservationData}/>}
          </div>
          <footer className="fixed bottom-0 left-0 right-0 bg-[#719e85] flex justify-around items-center py-4">
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