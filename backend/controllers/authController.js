// 使用 dotenv 環境變量 (已在 app.js 中載入)
const mongoose = require('mongoose');

// 注意：這裡我們使用現有的數據庫連接設置，而不是直接連接
// 假設有一個名為 Superuser 的模型，如果沒有，需要創建

/**
 * 登入控制器 - 驗證超級用戶憑證
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 獲取 superuser 集合
    const db = mongoose.connection.db;
    const collection = db.collection('superuser');
    
    // 根據電子郵件查找用戶
    const user = await collection.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '電子郵件或密碼不正確，請重試' 
      });
    }
    
    // 如果是明文密碼比較
    if (password === user.password) {
      // 不要將密碼發送回客戶端
      const { password, passwordHash, ...userWithoutSensitiveInfo } = user;
      return res.status(200).json({ 
        success: true, 
        user: userWithoutSensitiveInfo 
      });
    }
    
    // 如果使用 passwordHash 欄位
    // 如果將來你想實現密碼加密，可以取消注釋這部分
    /*
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordValid) {
      const { password, passwordHash, ...userWithoutSensitiveInfo } = user;
      return res.status(200).json({ 
        success: true, 
        user: userWithoutSensitiveInfo 
      });
    }
    */
    
    return res.status(401).json({ 
      success: false, 
      message: '電子郵件或密碼不正確，請重試' 
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤，請稍後再試' 
    });
  }
};

module.exports = {
  login
};