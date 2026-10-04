import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ManagePosts() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, [keyword, status, categoryId, page]);

    useEffect(() => {
        api.get('/admin/categories').then((response) => setCategories(response.data));
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/admin/exchange-posts', {
                params: { keyword, status, category_id: categoryId, page },
            });
            setPosts(response.data.data || response.data);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error('ไม่สามารถโหลดข้อมูลโพสต์ได้:', error);
        } finally {
            setLoading(false);
        }
    };

    // เปลี่ยนสถานะโพสต์ (เช่น pending, open, closed, banned)
    const handleUpdateStatus = async (postId, newStatus) => {
        try {
            await api.patch(`/admin/exchange-posts/${postId}/status`, {
                status: newStatus
            });

            // อัปเดตสเตตหน้าจอทันที
            setPosts((current) => current.map(post => post.id === postId ? { ...post, status: newStatus } : post));
            alert('อัปเดตสถานะโพสต์เรียบร้อยแล้ว');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะโพสต์:', error);
            alert(error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะโพสต์ได้');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดรายการโพสต์...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📦 จัดการโพสต์ทั้งหมดในระบบ</h1>
            <p className="text-sm text-gray-500 mb-6">อนุมัติ ซ่อน หรือเปลี่ยนสถานะโพสต์แลกเปลี่ยน</p>

            <div className="row g-2 mb-4">
                <div className="col-md-6"><input className="form-control" value={keyword} placeholder="ค้นหาหัวข้อหรือรายละเอียด" onChange={(event) => { setKeyword(event.target.value); setPage(1); }} /></div>
                <div className="col-md-3"><select className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">ทุกสถานะ</option><option value="pending">รอตรวจสอบ</option><option value="open">เปิดอยู่</option><option value="closed">ปิดแล้ว</option><option value="hidden">ซ่อน</option></select></div>
                <div className="col-md-3"><select className="form-select" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}><option value="">ทุกหมวดหมู่</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b">
                            <th className="p-3">ID</th>
                            <th className="p-3">ชื่อสินค้า / หัวข้อ</th>
                            <th className="p-3">ผู้โพสต์</th>
                            <th className="p-3">หมวดหมู่</th>
                            <th className="p-3 text-center">สถานะ</th>
                            <th className="p-3 text-right">เปลี่ยนสถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 text-gray-500">#{post.id}</td>
                                <td className="p-3 font-semibold text-gray-800 max-w-xs truncate">{post.title}</td>
                                <td className="p-3 text-gray-600">{post.user?.name || 'ไม่ระบุ'}</td>
                                <td className="p-3 text-gray-500 text-xs">{post.category?.name || '-'}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        post.status === 'open' 
                                            ? 'bg-green-100 text-green-700' 
                                            : post.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : post.status === 'hidden'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <select 
                                        value={post.status}
                                        onChange={(e) => handleUpdateStatus(post.id, e.target.value)}
                                        className="border rounded px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-4" aria-label="หน้าโพสต์"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </div>
    );
}