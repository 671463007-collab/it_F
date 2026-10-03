import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // โหลดรายการโพสต์ของฉันเมื่อเปิดหน้าเว็บ
    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/my/posts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // เนื่องจาก Backend ใช้ paginate(10) ข้อมูลโพสต์จะอยู่ใน .data
            setPosts(response.data.data);
        } catch (error) {
            console.error('ไม่สามารถโหลดโพสต์ของคุณได้:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันลบโพสต์
    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:8000/api/exchange-posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // กรองโพสต์ที่ถูกลบออกจาก State หน้าจอทันที
            setPosts(posts.filter(post => post.id !== id));
            alert('ลบโพสต์เรียบร้อยแล้ว');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการลบโพสต์:', error);
            alert('ไม่สามารถลบโพสต์ได้');
        }
    };

    // ฟังก์ชันสลับสถานะเปิด/ปิด (Open / Closed)
    const handleToggleStatus = async (post) => {
        const nextStatus = post.status === 'open' ? 'closed' : 'open';

        try {
            const token = localStorage.getItem('token');
            // ส่งข้อมูลอัปเดตสถานะไปที่ API update โพสต์
            await axios.post(`http://127.0.0.1:8000/api/exchange-posts/${post.id}`, {
                category_id: post.category_id,
                title: post.title,
                description: post.description,
                condition_percent: post.condition_percent,
                looking_for: post.looking_for,
                status: nextStatus,
                _method: 'PUT' // จำลองวิธี PUT ผ่าน POST สำหรับ Laravel
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าจอ
            fetchMyPosts();
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', error);
            alert('ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📦 โพสต์ขอแลกเปลี่ยนของฉัน</h1>
                <Link 
                    to="/exchange-posts/create" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + สร้างโพสต์ใหม่
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    คุณยังไม่มีประกาศขอแลกเปลี่ยนสินค้าในขณะนี้
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        post.status === 'open' 
                                            ? 'bg-green-100 text-green-700' 
                                            : post.status === 'closed'
                                            ? 'bg-gray-200 text-gray-600'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {post.status === 'open' ? 'เปิดแลกเปลี่ยน' : post.status === 'closed' ? 'ปิดการแลกเปลี่ยน' : 'รอตรวจสอบ (Pending)'}
                                    </span>
                                    <span className="text-xs text-gray-500">สภาพสินค้า: {post.condition_percent}%</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{post.description}</p>
                                {post.looking_for && (
                                    <p className="text-xs text-blue-600 mt-1 font-medium">ต้องการแลกกับ: {post.looking_for}</p>
                                )}
                            </div>

                            {/* ปุ่มจัดการโพสต์ */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <button 
                                    onClick={() => handleToggleStatus(post)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                                        post.status === 'open' 
                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {post.status === 'open' ? 'ปิดการแลกเปลี่ยน' : 'เปิดประกาศอีกครั้ง'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(post.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                                >
                                    ลบโพสต์
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}