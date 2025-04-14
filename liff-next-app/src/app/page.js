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
  const [loading, setLoading] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const infoImages = [
    '/images/reservation-info-1.png',
    '/images/reservation-info-2.png',
    '/images/reservation-info-3.png',
    '/images/reservation-info-4.png',
    '/images/reservation-info-5.png',
  ]

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
      // console.log('即將發送請求到:', `${API_BASE_URL}/users`);

      const response = await axios.post(`${API_BASE_URL}/users`,userData);
      // console.log('用戶資料已同步到後端',response.data)

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
    const placeId = "ChIJy_g1ZEgjaDQR8UbtDK1mZro"; 
    const placeName = "品朕羽球館"; // 請替換為您想去的地點名稱
    const encodedPlaceName = encodeURIComponent(placeName);
    const mapsUrlWithPlaceId = `https://www.google.com/maps/search/?api=1&query=${encodedPlaceName}&query_place_id=${placeId}`;

    window.open(mapsUrlWithPlaceId, '_blank');
  }

  // 更新預約須知函數
  const handleReservationInfo = () => {
    setShowInfoModal(true);
    setActiveImageIndex(0);
  }

  // 下一張圖片
  const nextImage = () =>{
    setActiveImageIndex((prev) => (prev === infoImages.length - 1 ? 0 : prev + 1));
  }

  // 上一張圖片
  const prevImage = () =>{
    setActiveImageIndex((prev) => (prev === 0 ? infoImages.length - 1 : prev - 1));
  }

  // 關閉模態彈窗
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

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
          <div className='flex flex-col justify-center '>
            <button 
              onClick={handleLogin}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 mb-2"
            >
              < i class="ri-line-line mr-2"></i>使用LINE登入
            </button>

            {/* 地圖標示按鈕 */}
            <button
              onClick = {handleMap}
              className="bg-[#51669e] hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 mb-2"
            >
              <i className="ri-map-pin-line mr-2"></i>位置資訊
            </button>

            {/* 預約須知按鈕 */}
            <button
              onClick={handleReservationInfo}
              className="bg-[#f2e275] hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
              <i class="ri-reserved-line text-[#23360a]"></i><span className='text-[#23360a]'>預約須知</span>
            </button>
          </div>
        </div>
        {/* 預約須知模態彈窗 */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
              <div className="p-4 bg-[#719e85] text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">預約須知</h3>
                <button 
                  onClick={closeInfoModal}
                  className="text-white hover:text-gray-200"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              
              <div className="relative">
                {/* 圖片輪播 */}
                <div className="w-full overflow-hidden" style={{ height: '70vh' }}>
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <img 
                      src={infoImages[activeImageIndex]} 
                      alt={`預約須知 ${activeImageIndex + 1}`} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                
                {/* 導航按鈕 */}
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                  <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                  <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
              </div>
              
              {/* 分頁指示器 */}
              <div className="p-3 bg-white flex justify-center">
                <div className="flex space-x-2">
                  {infoImages.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${activeImageIndex === index ? 'bg-[#719e85]' : 'bg-gray-300'}`}
                    ></button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 flex justify-center">
                <button 
                  onClick={closeInfoModal}
                  className="bg-[#719e85] hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        )}
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