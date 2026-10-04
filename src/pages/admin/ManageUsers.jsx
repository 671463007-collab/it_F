import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [keyword, status, page]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users', { params: { keyword, status, page } });
            // รองรับทั้งแบบ pagination (response.data.data) และแบบ array ตรงๆ
            setUsers(response.data.data || response.data);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันสลับสถานะบัญชี (แบน / ปลดแบน)
    const handleToggleStatus = async (userId) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/toggle-status`);
            
            // อัปเดตสเตตหน้าจอทันทีหลังจาก API ตอบกลับ
            const updatedUser = response.data.user;
            setUsers((current) => current.map(user => user.id === userId ? { ...user, status: updatedUser.status } : user));
            alert('เปลี่ยนสถานะผู้ใช้งานเรียบร้อยแล้ว');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', error);
            alert(error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะผู้ใช้งานได้');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">👥 จัดการผู้ใช้งานในระบบ</h1>
            <p className="text-sm text-gray-500 mb-6">ตรวจสอบรายชื่อสมาชิก ควบคุมสถานะบัญชี และจัดการสิทธิ์ผู้ใช้งาน</p>

            <div className="row g-2 mb-4">
                <div className="col-md-8"><input className="form-control" value={keyword} placeholder="ค้นหาชื่อหรืออีเมล" onChange={(event) => { setKeyword(event.target.value); setPage(1); }} /></div>
                <div className="col-md-4"><select className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">ทุกสถานะ</option><option value="active">ใช้งานปกติ</option><option value="banned">ถูกแบน</option></select></div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b">
                            <th className="p-3">ID</th>
                            <th className="p-3">ชื่อ - นามสกุล</th>
                            <th className="p-3">อีเมล</th>
                            <th className="p-3 text-center">สถานะบัญชี</th>
                            <th className="p-3 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 text-gray-500">#{user.id}</td>
                                <td className="p-3 font-semibold text-gray-800">{user.name}</td>
                                <td className="p-3 text-gray-600">{user.email}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        user.status === 'banned' 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {user.status === 'banned' ? 'ถูกแบน (Banned)' : 'ใช้งานปกติ (Active)'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition text-white ${
                                            user.status === 'banned' 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                    >
                                        {user.status === 'banned' ? 'ปลดแบน' : 'แบนผู้ใช้'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-4" aria-label="หน้าผู้ใช้"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </div>
    );
}