import React, { useState } from 'react';

// 預約表單彈窗組件
export const BookingFormDialog = ({ isOpen, onClose, onSubmit, timeSlot, court, courtId, price }) => {
  const [phone, setPhone] = useState('');
  const [people_num, setPeopleNum] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 電話號碼驗證 : 必須是10碼且以09開頭 
    const phoneRegex = /^09\d{8}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setError('請輸入有效的手機號碼');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 將表單數據傳送給父組件
      await onSubmit({
        phone,
        people_num,
      });
      
      // 清空表單
      setPhone('');
      setPeopleNum(4);
      
      // 關閉彈窗
      onClose();
    } catch (err) {
      setError(err.message || '預約失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 處理電話號碼輸入變更，可以在這裡添加即時驗證
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // 只允許輸入數字
    if (value === '' || /^\d+$/.test(value)) {
      setPhone(value);
      // 清除錯誤提示，如果用戶正在修改
      if (error) setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">預約確認</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className="mb-2 p-3 bg-amber-50 rounded">
              <p className="text-[#719e85]">
                <span className="font-medium">時間：</span> {timeSlot}
              </p>
              <p className="text-[#719e85]">
                <span className="font-medium">場地：</span> 羽球場{court}
              </p>
              <p className="text-[#719e85]">
                <span className="font-medium">價格：</span> ${price}
              </p>
            </div>

            <div className="mt-3 mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-700 text-sm mb-1">
                <span className="font-medium">注意：</span> 第一次預約完請到官方Line告知
                <a href="https://lin.ee/RElVfnS" className="font-medium">官方line 連結</a>
              </p>
              <p className="text-blue-700 text-sm">
                <span className="font-medium">提醒：</span> 預約匯款完成後，會使用預約程式提供密碼給您
              </p>
            </div>
            
            <label className="block text-gray-700 text-sm font-bold mb-2">
              電話號碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="請輸入您的電話號碼"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">手機號碼必須為10碼且以09開頭</p>
          </div>
          
          {/* <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              預約人數
            </label>
            <select
              value={people_num}
              onChange={(e) => setPeopleNum(parseInt(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value={1}>1 人</option>
              <option value={2}>2 人</option>
              <option value={3}>3 人</option>
              <option value={4}>4 人</option>
            </select>
          </div> */}
          
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-[#719e85] hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? '處理中...' : '確認預約'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormDialog;