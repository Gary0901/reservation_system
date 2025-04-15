// backend app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

const app = express();
const userRoutes = require('./routes/userRoutes')
const courtRoutes = require('./routes/courtRoutes')
const timeSlotRoutes = require('./routes/timeSlotRoutes')
const reservationRoutes = require('./routes/reservationRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const operationHourRoutes = require('./routes/OperationHourRoutes')

const authRoutes = require('./routes/authRoutes')

const initSchedulers = require('./schedulers');

// CORS 配置 - 允許前端網域存取
const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://192.168.50.232:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); 

// 中間件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// 註冊路由
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/time-slots',timeSlotRoutes)
app.use('/api/reservations',reservationRoutes)
app.use('/api/notifications',notificationRoutes)
app.use('/api/operationhour',operationHourRoutes)

// 註冊認證路由
app.use('/api/auth', authRoutes);

//簡單的測試路由
app.get('/api/test',(req,res) => {
    res.json({message:'API 正常運行!'});
});

const PORT = process.env.PORT || 5000 

// 連接資料庫並啟動服務器
connectDB()
  .then(() => {
    console.log('資料庫連接成功');
    
    // 初始化排程任務
    initSchedulers();
    
    // 啟動服務器
    app.listen(PORT, () => {
      console.log(`服務器運行於http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('無法連接到資料庫:', err.message);
    process.exit(1);
  });

module.exports = app;