// 使用MongoDB Node.js 驅動程式設置羽球預約系統資料庫
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://pinzhenyuqiuguan:BW14Ypl0UhG2vNmK@line-reservation-cluste.leyus.mongodb.net/?retryWrites=true&w=majority&appName=line-reservation-cluster0';
const dbName = 'badminton_reservation_system';

async function setupDatabase(){
    const client = new MongoClient(uri);

    try{
        // 連接到MongoDB
        await client.connect();
        console.log('成功連接到MongoDB');

        const db = client.db(dbName)

        //1. 創建USERS 集合
        const usersCollection = db.collection('users');
        await usersCollection.insertOne({
            _id:'user_test',
            lineId:'TEST123',
            name:'test1',
            role:'member'
        });
        console.log('USERS集合已創建並插入示例數據')

        // 2. 創建COURTS集合
        const courtsCollection = db.collection('courts');
        await courtsCollection.insertOne({
        _id: 'court1',
        name: 'A場地',
        courtNumber: 1,
        isActive: true
        });
        console.log('COURTS集合已創建並插入示例數據');

        // 3. 創建PRICE_POLICIES集合
        const policiesCollection = db.collection('pricePolicies');
        await policiesCollection.insertOne({
            _id: 'policy1',
            name: '週日價格',
            applicableDays: [0], // 0表示週日
            price: 500,
            priority: 1
            });
        console.log('PRICE_POLICIES集合已創建並插入示例數據');
        
        // 4. 創建TIME_SLOTS集合
        const timeSlotsCollection = db.collection('timeSlots');
        await timeSlotsCollection.insertOne({
            _id: 'slot1',
            courtId: 'court1',
            startTime: '09:00',
            endTime: '10:00',
            defaultPrice: 300
            });
        console.log('TIME_SLOTS集合已創建並插入示例數據');

        // 5. 創建RESERVATIONS集合
        const reservationsCollection = db.collection('reservations');
        await reservationsCollection.insertOne({
            _id: 'res1',
            userId: 'user1',
            courtId: 'court1',
            date: new Date('2025-03-05'),
            startTime: '09:00',
            endTime: '10:00',
            status: 'confirmed',
            price: 300,
            people_num: 2
        });
        console.log('RESERVATIONS集合已創建並插入示例數據');

        // 6. 創建NOTIFICATIONS集合
        const notificationsCollection = db.collection('notifications');
        await notificationsCollection.insertOne({
            _id: 'notif1',
            userId: 'user1',
            type: 'reservation_confirmation',
            isRead: false,
            relatedId: 'res1'
        });
        console.log('NOTIFICATIONS集合已創建並插入示例數據');

        // 7. 創建OPERATION_HOURS集合
        const hoursCollection = db.collection('operationHours');
        await hoursCollection.insertOne({
            _id: 'hours1',
            dayOfWeek: 1, // 1表示週一
            openTime: '08:00',
            closeTime: '22:00',
            isHoliday: false
        });
        console.log('OPERATION_HOURS集合已創建並插入示例數據');
        
        // 8. 創建SETTINGS集合
        const settingsCollection = db.collection('settings');
        await settingsCollection.insertOne({
            _id: 'setting1',
            key: 'max_advance_booking_days',
            value: 14
        });
        
        console.log('SETTINGS集合已創建並插入示例數據');
        
        console.log('所有集合已成功創建並已插入示例數據');

    } catch(error) {
        console.error('設置資料庫時出錯:',error)
    } finally {
        await client.close();
        console.log('MongoDB連接已關閉');
    }
}

// 執行設置
setupDatabase().catch(console.error)