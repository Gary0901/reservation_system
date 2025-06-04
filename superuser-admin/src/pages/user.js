import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://liff-reservation.zeabur.app/api/users');
        
        // 在控制台打印 API 返回的數據，幫助調試
        console.log('API 返回的數據:', response.data);
        
        // 檢查是否是數組
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // 可能 API 返回的是 { users: [...] } 或其他格式
          // 嘗試找到可能包含用戶數據的屬性
          const possibleArrays = Object.values(response.data).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            setUsers(possibleArrays[0]);
          } else {
            // 如果找不到數組，可能是單個用戶對象
            setUsers([response.data]);
          }
        } else {
          setError('API 返回了非預期格式的數據');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('獲取用戶數據時出錯:', err);
        setError(`無法載入用戶數據: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">用戶管理</h2>
          {/* <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            新增用戶
          </button> */}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序號</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶id</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user._id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">編輯</button>
                        <button className="text-red-600 hover:text-red-900 mr-3">刪除</button>
                        <button className="text-yellow-600 hover:text-yellow-900">重設</button>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      沒有找到用戶數據
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPage;