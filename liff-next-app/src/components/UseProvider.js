'use client'
import {createContext, useContext, useState, useEffect } from 'react'

//創建用戶上下文 
const UserContext = createContext({
    userId:null,
    lineProfile:null,
    setUserId: () => {},
    setLineProfile : () => {},
    clearUserData: () => {},
});

// 提供使用用戶上下文的自定義hook 
export const useUserContext = () => useContext(UserContext)

// 用戶提供者組件
export const UserProvider = ({children}) => {
    const [userId, setUserId] = useState(null);
    const [lineProfile, setLineProfile] = useState(null);

    // 當組件掛載時，從localStorage讀取用戶資料
    useEffect(()=>{
        const storedUserId = localStorage.getItem('userId');
        const storedProfile = localStorage.getItem('lineProfile')

        if (storedUserId) {
            setUserId(storedUserId)
        }

        if (storedProfile) {
            try{
                setLineProfile(JSON.parse(storedProfile));
            } catch (e) {
                console.error('解析儲存的用戶資料失敗', e);
            }
        }
    },[])

    // 當userId或lineProfile改變時，更新localStorage
    useEffect(() => {
        if (userId) {
            localStorage.setItem('userId', userId);
        } else {
            localStorage.removeItem('userId');
        }
        
        if (lineProfile) {
            localStorage.setItem('lineProfile', JSON.stringify(lineProfile));
        } else {
            localStorage.removeItem('lineProfile');
        }
    }, [userId, lineProfile]);

    // 清除用戶資料的函數
    const clearUserData = () => {
        setUserId(null);
        setLineProfile(null);
        localStorage.removeItem('userId');
        localStorage.removeItem('lineProfile');
    }

    return (
        <UserContext.Provider
            value={{
                userId,
                lineProfile,
                setUserId,
                setLineProfile,
                clearUserData,
            }}
            >
            {children}
        </UserContext.Provider>
    )
}