import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ user, onLogout }) {
  const location = useLocation();
  
  // 判斷當前頁面，用於高亮顯示對應的導航項
  const isActive = (path) => {
    return location.pathname === path ? 'bg-[#4c7d62]' : '';
  };

  return (
    <header className="bg-[#719e85]  text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-8">預約系統</h1>
            <nav className="hidden md:flex space-x-1">
              <Link to="/main" className={`px-4 py-2 rounded-lg hover:bg-[#4c7d62] transition-colors ${isActive('/main')}`}>
                首頁
              </Link>
              <Link to="/reservation" className={`px-4 py-2 rounded-lg hover:bg-[#4c7d62] transition-colors ${isActive('/reservation')}`}>
                預約管理
              </Link>
              <Link to="/template" className={`px-4 py-2 rounded-lg hover:bg-[#4c7d62] transition-colors ${isActive('/template')}`}>
                模板設定
              </Link>
              <Link to="/timeslots" className={`px-4 py-2 rounded-lg hover:bg-[#4c7d62] transition-colors ${isActive('/timeslots')}`}>
                預約紀錄
              </Link>
              <Link to="/user" className={`px-4 py-2 rounded-lg hover:bg-[#4c7d62] transition-colors ${isActive('/user')}`}>
                用戶管理
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user.name} ({user.role})</span>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;