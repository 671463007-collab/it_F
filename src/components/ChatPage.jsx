import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    // 1. ดึงรายชื่อบทสนทนาทั้งหมดเมื่อเปิดหน้าแชท
    useEffect(() => {
        let isCurrent = true;
        const openRequestedConversation = async () => {
            await fetchConversations();
            const requestedUserId = Number(searchParams.get('user_id'));
            if (!requestedUserId || requestedUserId === Number(currentUser?.id)) return;

            try {
                const response = await api.get(`/users/${requestedUserId}`);
                if (isCurrent) await selectConversation(response.data);
            } catch (error) {
                if (isCurrent) setErrorMessage(error.response?.data?.message || 'เปิดบทสนทนาไม่สำเร็จ');
            }
        };
        openRequestedConversation();
        return () => { isCurrent = false; };
    }, [searchParams]);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดรายชื่อแชท:', error);
        }
    };

    // 2. เมื่อคลิกเลือกคนคุย จะโหลดประวัติแชทของคนนั้น
    const selectConversation = async (user) => {
        if (!user || Number(user.id) === Number(currentUser?.id)) return;
        setActiveChatUser(user);
        setErrorMessage('');
        try {
            const response = await api.get('/messages', { params: { user_id: user.id } });
            setMessages(response.data);
            setConversations((current) => current.map((conversation) => (
                conversation.user.id === user.id ? { ...conversation, unread_count: 0 } : conversation
            )));
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อความ:', error);
            setErrorMessage(error.response?.data?.message || 'โหลดข้อความไม่สำเร็จ');
        }
    };

    // 3. ฟังก์ชันกดส่งข้อความใหม่
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatUser || Number(activeChatUser.id) === Number(currentUser?.id)) return;

        try {
            setErrorMessage('');
            const payload = {
                receiver_id: activeChatUser.id,
                message: newMessage.trim(),
            };
            const exchangePostId = searchParams.get('exchange_post_id');
            if (exchangePostId) payload.exchange_post_id = Number(exchangePostId);
            const response = await api.post('/messages', {
                ...payload,
            });

            setMessages((currentMessages) => [...currentMessages, response.data.data]);
            setNewMessage('');
            fetchConversations(); // อัปเดตข้อความล่าสุดที่ฝั่งซ้าย
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งข้อความ:', error);
            setErrorMessage(error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ');
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
                            key={conv.user.id}
                            onClick={() => selectConversation(conv.user)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b ${activeChatUser?.id === conv.user.id ? 'bg-blue-50' : ''}`}
                        >
                            <img 
                                src={conv.user.avatar_url || 'https://via.placeholder.com/150'}
                                alt="avatar" 
                                className="w-12 h-12 rounded-full object-cover mr-3 border" 
                            />
                            <div className="overflow-hidden">
                                <h4 className="font-semibold text-gray-800">{conv.user.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                                {conv.unread_count > 0 && <span className="badge bg-danger">{conv.unread_count} ยังไม่อ่าน</span>}
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
                                src={activeChatUser.avatar_url || 'https://via.placeholder.com/150'}
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover mr-3 border" 
                            />
                            <h3 className="font-semibold text-gray-800">{activeChatUser.name}</h3>
                        </div>

                        {/* กล่องข้อความแชท */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            {messages.map((msg, index) => {
                                // เช็คว่าเป็นข้อความที่เราส่งเองหรือคนอื่นส่งมา
                                const isMyMessage = msg.sender_id !== activeChatUser.id;
                                return (
                                    <div key={msg.id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
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
                        {errorMessage || 'เลือกบทสนทนาทางด้านซ้ายเพื่อเริ่มพูดคุย'}
                    </div>
                )}
            </div>
        </div>
    );
}