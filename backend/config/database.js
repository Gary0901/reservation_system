const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        // 嘗試連接到資料庫
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('資料庫連結成功');
        console.log(`連接到的資料庫: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('資料庫連結錯誤:', error);
        // 在這裡我們不終止進程，而是拋出錯誤讓呼叫者處理
        throw error;
    }
};

module.exports = connectDB;