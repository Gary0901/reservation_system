import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 導入組件
import Header from './component/header';
import MainPage from './pages/main';
import ReservationPage from './pages/reservation';
import TemplatePage from './pages/template';
import TimeslotsPage from './pages/timeslots';
import UserPage from './pages/user';
import SeasonCreate from './pages/season_create';
import SearchUserRes from './pages/search_user_res';

const API_URL = 'https://liff-reservation.zeabur.app';


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      // 呼叫後端 API 進行驗證
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('登入成功:', data.user);
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        
        // 如果勾選了記住我，可以保存到 localStorage
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      } else {
        setErrorMessage(data.message || '登入失敗，請重試');
        console.log('登入失敗:', data.message);
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      setErrorMessage('連接服務器時發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };
  
  // 載入記住的電子郵件
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // 登入成功後的路由系統
  if (isLoggedIn && currentUser) {
    return (
      <Router>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7ede2' }}>
          <Header user={currentUser} onLogout={handleLogout} />
          <div className="flex-1">
            <Routes>
              <Route path="/main" element={<MainPage />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/template" element={<TemplatePage />} />
              <Route path="/timeslots" element={<TimeslotsPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/season_create" element={<SeasonCreate/>}/>
              <Route path="/search_user_res" element={<SearchUserRes />} />
              <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }

  // 登入表單
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7ede2' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#d8e2d3' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">管理員登入</h1>
          <p className="text-gray-600 mt-2">請輸入您的登入資訊</p>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors"
              placeholder="請輸入您的電子郵件"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors"
              placeholder="請輸入您的密碼"
              required
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-200"
              />
              <label htmlFor="remember" className="ml-2 block text-gray-700 text-sm">
                記住我
              </label>
            </div>
            
            <a href="#forgot-password" className="text-sm text-green-700 hover:text-green-900">
              忘記密碼?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
          >
            登入
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>superuser login port</p>
          <p className="mt-1">© 2025 預約系統訂位系統</p>
        </div>
      </div>
    </div>
  );
}

export default App;