import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // 1. ดึงรายชื่อบทสนทนาทั้งหมดเมื่อเปิดหน้าแชท
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดรายชื่อแชท:', error);
        }
    };

    // 2. เมื่อคลิกเลือกคนคุย จะโหลดประวัติแชทของคนนั้น
    const selectConversation = async (user) => {
        setActiveChatUser(user);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://127.0.0.1:8000/api/messages?user_id=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อความ:', error);
        }
    };

    // 3. ฟังก์ชันกดส่งข้อความใหม่
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatUser) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/messages', {
                receiver_id: activeChatUser.id,
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // เพิ่มข้อความใหม่เข้าไปแสดงผลทันทีโดยไม่ต้องรีเฟรชหน้า
            setMessages([...messages, response.data.message]);
            setNewMessage('');
            fetchConversations(); // อัปเดตข้อความล่าสุดที่ฝั่งซ้าย
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งข้อความ:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* คอลัมน์ซ้าย: รายชื่อบทสนทนา */}
            <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b font-bold text-lg text-gray-800">แชทของฉัน</div>
                {conversations.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">ยังไม่มีประวัติการสนทนา</div>
                ) : (
                    conversations.map(conv => (
                        <div 
                            key={conv.id} 
                            onClick={() => selectConversation(conv.user)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b ${activeChatUser?.id === conv.user.id ? 'bg-blue-50' : ''}`}
                        >
                            <img 
                                src={conv.user.avatar ? `http://127.0.0.1:8000/storage/${conv.user.avatar}` : 'https://via.placeholder.com/150'} 
                                alt="avatar" 
                                className="w-12 h-12 rounded-full object-cover mr-3 border" 
                            />
                            <div className="overflow-hidden">
                                <h4 className="font-semibold text-gray-800">{conv.user.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* คอลัมน์ขวา: ห้องแชทพูดคุย */}
            <div className="flex-1 flex flex-col">
                {activeChatUser ? (
                    <>
                        {/* Header ด้านบนของแชท */}
                        <div className="p-4 bg-white border-b flex items-center shadow-sm">
                            <img 
                                src={activeChatUser.avatar ? `http://127.0.0.1:8000/storage/${activeChatUser.avatar}` : 'https://via.placeholder.com/150'} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover mr-3 border" 
                            />
                            <h3 className="font-semibold text-gray-800">{activeChatUser.name}</h3>
                        </div>

                        {/* กล่องข้อความแชท */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {messages.map((msg, index) => {
                                // เช็คว่าเป็นข้อความที่เราส่งเองหรือคนอื่นส่งมา
                                const isMyMessage = msg.sender_id !== activeChatUser.id;
                                return (
                                    <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ช่องพิมพ์ข้อความด้านล่าง */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t flex">
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                placeholder="พิมพ์ข้อความ..." 
                                className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-6 rounded-r-lg hover:bg-blue-700 transition">
                                ส่ง
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        เลือกบทสนทนาทางด้านซ้ายเพื่อเริ่มพูดคุย
                    </div>
                )}
            </div>
        </div>
    );
}