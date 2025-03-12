const mongoose = require('mongoose')
require('dotenv').config();  // 確保這行在文件的頂部

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('資料庫連結成功');
        console.log(`連接到的資料庫: ${mongoose.connection.name}`);

    } catch (error) {
        console.error('資料庫連結錯誤:',error);
        process.exit(1);
    }
};

module.exports = connectDB;