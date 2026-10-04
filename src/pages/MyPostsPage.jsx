import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function MyPostsPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // โหลดรายการโพสต์ของฉันเมื่อเปิดหน้าเว็บ
    useEffect(() => {
        fetchMyPosts();
        api.get('/categories').then((response) => setCategories(response.data));
    }, []);

    const fetchMyPosts = async () => {
        try {
            const response = await api.get('/my/posts');
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
            await api.delete(`/exchange-posts/${id}`);
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
        if (!['open', 'closed'].includes(post.status)) return;
        const nextStatus = post.status === 'open' ? 'closed' : 'open';

        try {
            // ส่งข้อมูลอัปเดตสถานะไปที่ API update โพสต์
            await api.post(`/exchange-posts/${post.id}`, {
                category_id: post.category_id,
                title: post.title,
                description: post.description,
                condition_percent: post.condition_percent,
                looking_for: post.looking_for,
                status: nextStatus,
            });

            // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าจอ
            fetchMyPosts();
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', error);
            alert('ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setDraft({
            category_id: String(post.category_id),
            title: post.title,
            description: post.description,
            condition_percent: post.condition_percent,
            looking_for: post.looking_for || '',
        });
        setNewImages([]);
    };

    const savePost = async (event) => {
        event.preventDefault();
        setSaving(true);
        const formData = new FormData();
        Object.entries(draft).forEach(([key, value]) => formData.append(key, value));
        Array.from(newImages).forEach((image) => formData.append('images[]', image));

        try {
            await api.post(`/exchange-posts/${editingPostId}`, formData);
            setEditingPostId(null);
            setDraft(null);
            setNewImages([]);
            await fetchMyPosts();
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'แก้ไขโพสต์ไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📦 โพสต์ขอแลกเปลี่ยนของฉัน</h1>
                <Link
                    to="/create-post"
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
                                        {{ open: 'เปิดแลกเปลี่ยน', closed: 'ปิดการแลกเปลี่ยน', pending: 'รอตรวจสอบ', hidden: 'ซ่อนโดยผู้ดูแล' }[post.status] || post.status}
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
                                {['open', 'closed'].includes(post.status) && <button
                                    onClick={() => handleToggleStatus(post)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                                        post.status === 'open' 
                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {post.status === 'open' ? 'ปิดการแลกเปลี่ยน' : 'เปิดประกาศอีกครั้ง'}
                                </button>}
                                <button className="px-3 py-1.5 rounded text-xs font-medium border border-blue-600 text-blue-700" onClick={() => startEditing(post)}>แก้ไข</button>
                                <button 
                                    onClick={() => handleDelete(post.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                                >
                                    ลบโพสต์
                                </button>
                            </div>
                            {editingPostId === post.id && (
                                <form onSubmit={savePost} className="w-full border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <select className="form-select" value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} required>
                                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                    </select>
                                    <input className="form-control" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength="255" required />
                                    <textarea className="form-control md:col-span-2" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
                                    <label className="form-label">สภาพสินค้า: {draft.condition_percent}%<input className="form-range" type="range" min="0" max="100" value={draft.condition_percent} onChange={(event) => setDraft({ ...draft, condition_percent: event.target.value })} /></label>
                                    <input className="form-control" placeholder="ต้องการแลกกับ" value={draft.looking_for} onChange={(event) => setDraft({ ...draft, looking_for: event.target.value })} />
                                    <input className="form-control md:col-span-2" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setNewImages(event.target.files || [])} />
                                    <div className="md:col-span-2 flex gap-2 justify-end">
                                        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setEditingPostId(null)}>ยกเลิก</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}