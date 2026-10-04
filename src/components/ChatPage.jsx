import { useEffect, useState } from 'react';
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

    const fetchConversations = async () => {
        try {
            const response = await api.get('/conversations');
            setConversations(response.data || []);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'โหลดกล่องข้อความไม่สำเร็จ');
        }
    };

    const selectConversation = async (user) => {
        if (!user || Number(user.id) === Number(currentUser?.id)) return;
        setActiveChatUser(user);
        setErrorMessage('');
        try {
            const response = await api.get('/messages', { params: { user_id: user.id } });
            setMessages(response.data || []);
            setConversations((current) => current.map((conversation) => (
                Number(conversation.user.id) === Number(user.id)
                    ? { ...conversation, unread_count: 0 }
                    : conversation
            )));
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'โหลดข้อความไม่สำเร็จ');
        }
    };

    useEffect(() => {
        let active = true;
        const openRequestedConversation = async () => {
            await fetchConversations();
            const userId = Number(searchParams.get('user_id'));
            if (!userId || userId === Number(currentUser?.id)) return;
            try {
                const response = await api.get(`/users/${userId}`);
                if (active) await selectConversation(response.data);
            } catch (error) {
                if (active) setErrorMessage(error.response?.data?.message || 'เปิดบทสนทนาไม่สำเร็จ');
            }
        };
        openRequestedConversation();
        return () => { active = false; };
    }, [searchParams]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!newMessage.trim() || !activeChatUser || Number(activeChatUser.id) === Number(currentUser?.id)) return;
        const payload = {
            receiver_id: activeChatUser.id,
            message: newMessage.trim(),
        };
        const postId = searchParams.get('exchange_post_id');
        if (postId) payload.exchange_post_id = Number(postId);
        try {
            setErrorMessage('');
            const response = await api.post('/messages', payload);
            setMessages((current) => [...current, response.data.data]);
            setNewMessage('');
            await fetchConversations();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ');
        }
    };

    return (
        <main className="container-fluid py-3">
            <h1 className="h3 fw-bold mb-3">ข้อความ</h1>
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            <div className="row g-0 border rounded overflow-hidden bg-white" style={{ height: 'min(75vh, 760px)' }}>
                <aside className="col-12 col-md-4 col-lg-3 border-end d-flex flex-column" aria-label="กล่องข้อความ">
                    <h2 className="h6 p-3 mb-0 border-bottom">บทสนทนา</h2>
                    <div className="list-group list-group-flush overflow-auto">
                        {conversations.length === 0 ? <p className="text-secondary text-center p-3 mb-0">ยังไม่มีบทสนทนา</p> : conversations.map((conversation) => (
                            <button key={conversation.user.id} type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${Number(activeChatUser?.id) === Number(conversation.user.id) ? 'active' : ''}`} onClick={() => selectConversation(conversation.user)}>
                                <img src={conversation.user.avatar_url || 'https://via.placeholder.com/40'} alt="" className="rounded-circle flex-shrink-0" width="40" height="40" />
                                <span className="text-truncate flex-grow-1 text-start">
                                    <span className="d-block fw-semibold">{conversation.user.name}</span>
                                    <span className="small text-truncate d-block">{conversation.last_message}</span>
                                </span>
                                {conversation.unread_count > 0 && <span className="badge text-bg-danger">{conversation.unread_count}</span>}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="col-12 col-md-8 col-lg-9 d-flex flex-column" aria-label="ข้อความสนทนา">
                    {activeChatUser ? <>
                        <header className="d-flex align-items-center gap-2 p-3 border-bottom">
                            <img src={activeChatUser.avatar_url || 'https://via.placeholder.com/40'} alt="" className="rounded-circle" width="40" height="40" />
                            <h2 className="h6 mb-0">{activeChatUser.name}</h2>
                        </header>
                        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
                            {messages.map((message) => {
                                const isMine = Number(message.sender_id) === Number(currentUser?.id);
                                return <div key={message.id} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                                    <article className={`rounded px-3 py-2 ${isMine ? 'bg-primary text-white' : 'bg-light border'}`} style={{ maxWidth: 'min(80%, 560px)' }}>
                                        <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{message.message}</p>
                                        {message.exchange_post && <div className="small border-top pt-1 mt-1">ประกาศ: {message.exchange_post.title}</div>}
                                        <time className="small opacity-75">{new Date(message.created_at).toLocaleString('th-TH')}</time>
                                    </article>
                                </div>;
                            })}
                        </div>
                        <form className="d-flex gap-2 p-3 border-top" onSubmit={sendMessage}>
                            <input className="form-control" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="พิมพ์ข้อความ..." maxLength="5000" required />
                            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>ส่ง</button>
                        </form>
                    </> : <div className="flex-grow-1 d-flex align-items-center justify-content-center text-secondary p-3">เลือกบทสนทนาเพื่อดูข้อความ</div>}
                </section>
            </div>
        </main>
    );
}
