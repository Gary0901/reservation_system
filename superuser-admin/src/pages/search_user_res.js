import React, { useState } from 'react';
import axios from 'axios';

// 【請替換】將此處換成您 API 的基礎 URL
// 根據您的截圖，它可能是類似 'http://localhost:3000/api' 或您的線上伺服器網址
const API_BASE_URL = 'http://liff-reservation.zeabur.app/api';

function UserReservationSearchPage() {
  // 1. 狀態管理 (State Management)
  const [inputUserId, setInputUserId] = useState(''); // 用於綁定輸入框的值
  const [reservations, setReservations] = useState(null); // 儲存 API 返回的預約紀錄，初始為 null 表示尚未查詢
  const [loading, setLoading] = useState(false); // 控制加載動畫
  const [error, setError] = useState(null); // 儲存錯誤訊息
  const [searchedUserId, setSearchedUserId] = useState(''); // 儲存已查詢的 User ID，用於顯示標題

  // 2. 處理查詢事件 (Search Handler)
  const handleSearch = async (e) => {
    e.preventDefault(); // 防止表單提交時頁面重新整理

    if (!inputUserId.trim()) {
      alert('請輸入使用者 ID');
      return;
    }

    setLoading(true);
    setError(null);
    setReservations(null); // 清空上次的查詢結果
    setSearchedUserId(inputUserId); // 記錄下這次查詢的ID

    try {
      // 根據您的 API 結構呼叫 API
      const response = await axios.get(`${API_BASE_URL}/reservations/user/${inputUserId}`);
      
      // 將返回的數據按日期從新到舊排序
      const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setReservations(sortedData);

    } catch (err) {
      console.error('查詢使用者預約紀錄時出錯:', err);
      if (err.response && err.response.status === 404) {
        setError(`找不到 User ID 為 "${inputUserId}" 的使用者或其預約紀錄。`);
      } else {
        setError(`查詢失敗: ${err.message}`);
      }
      setReservations([]); // 即使出錯，也設為空陣列以顯示 "查無資料"
    } finally {
      setLoading(false);
    }
  };

  // 輔助函數：格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  // 3. 頁面渲染 (UI Rendering)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">查詢使用者預約紀錄</h2>
        
        {/* 查詢表單 */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            placeholder="請在此輸入 User ID"
            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              '查詢'
            )}
          </button>
        </form>

        {/* 結果顯示區域 */}
        <div className="mt-6">
          {loading && (
            <div className="text-center py-10">
              <p>查詢中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          {/* 只有在 reservations 不是 null (即已查詢過) 的情況下才顯示結果 */}
          {reservations && !loading && !error && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                查詢結果：<span className="font-mono text-gray-700">{searchedUserId}</span>
              </h3>
              {reservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預約日期</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">場地</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((res) => (
                        <tr key={res._id}>
                          <td className="px-4 py-4 whitespace-nowrap">{formatDate(res.date)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{res.startTime} - {res.endTime}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{res.courtId?.name || 'N/A'}</td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {res.status === 'confirmed' ? '已確認' : res.status === 'pending' ? '待確認' : '已取消'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">此使用者沒有任何預約紀錄。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserReservationSearchPage;