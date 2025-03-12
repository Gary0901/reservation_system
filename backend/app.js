const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

const app = express();
const userRoutes = require('./routes/userRoutes')
const courtRoutes = require('./routes/courtRoutes')

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// 註冊路由
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);

//簡單的測試路由
app.get('/api/test',(req,res) => {
    res.json({message:'API 正常運行!'});
});

const PORT = process.env.PORT || 5000 

// 啟動服務器
app.listen(PORT,()=>{
    console.log(`服務器運行於http://localhost:${PORT}`);
});

// 連接資料庫
connectDB()

module.exports = app 