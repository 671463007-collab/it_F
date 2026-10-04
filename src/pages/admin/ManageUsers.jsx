import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/admin/users', { params: { keyword, status, page } })
            .then((response) => {
                setUsers(response.data.data || []);
                setLastPage(response.data.last_page || 1);
            })
            .catch((error) => console.error('ไม่สามารถโหลดรายชื่อผู้ใช้ได้:', error))
            .finally(() => setLoading(false));
    }, [keyword, status, page]);

    const toggleStatus = async (userId) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/toggle-status`);
            const updatedUser = response.data.user;
            setUsers((current) => current.map((user) => user.id === userId ? { ...user, status: updatedUser.status } : user));
        } catch (error) {
            alert(error.response?.data?.message || 'เปลี่ยนสถานะผู้ใช้ไม่สำเร็จ');
        }
    };

    const resetPage = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    if (loading && users.length === 0) return <div className="py-5 text-center">กำลังโหลดผู้ใช้...</div>;

    return (
        <section className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">จัดการผู้ใช้</h1>
            <p className="text-secondary mb-4">ค้นหาสมาชิกและจัดการสถานะบัญชี</p>
            <div className="row g-2 mb-3">
                <div className="col-md-8"><input className="form-control" value={keyword} placeholder="ค้นหาชื่อหรืออีเมล" onChange={resetPage(setKeyword)} /></div>
                <div className="col-md-4"><select className="form-select" value={status} onChange={resetPage(setStatus)}><option value="">ทุกสถานะ</option><option value="active">ใช้งานปกติ</option><option value="banned">ถูกแบน</option></select></div>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>ชื่อ</th><th>อีเมล</th><th>สถานะบัญชี</th><th>จัดการ</th></tr></thead>
                    <tbody>
                        {users.map((user) => <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span className={`badge ${user.status === 'banned' ? 'text-bg-danger' : 'text-bg-success'}`}>{user.status}</span></td>
                            <td><button type="button" className={`btn btn-sm ${user.status === 'banned' ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => toggleStatus(user.id)}>{user.status === 'banned' ? 'ปลดแบน' : 'แบนผู้ใช้'}</button></td>
                        </tr>)}
                        {users.length === 0 && <tr><td colSpan="4" className="text-center text-secondary py-4">ไม่พบผู้ใช้</td></tr>}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-3" aria-label="หน้าผู้ใช้"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </section>
    );
}
