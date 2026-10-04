import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const navLinks = [
    { path: '/admin/dashboard', label: 'แดชบอร์ด' },
    { path: '/admin/posts', label: 'จัดการโพสต์' },
    { path: '/admin/users', label: 'จัดการผู้ใช้' },
    { path: '/admin/comments', label: 'จัดการความคิดเห็น' },
    { path: '/admin/categories', label: 'จัดการหมวดหมู่' },
    { path: '/admin/reports', label: 'รายงานปัญหา' },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        user = null;
    }

    useEffect(() => {
        if (!localStorage.getItem('token') || user?.role !== 'admin') {
            navigate('/login', { replace: true });
        }
    }, [navigate, user?.role]);

    const handleLogout = async () => {
        try {
            if (localStorage.getItem('token')) await api.post('/logout');
        } catch (error) {
            console.error('Admin logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (!localStorage.getItem('token') || user?.role !== 'admin') return null;

    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                <aside className="col-12 col-lg-2 bg-dark text-white p-3 d-flex flex-column">
                    <div className="border-bottom border-secondary pb-3 mb-3">
                        <h1 className="h5 mb-1">ผู้ดูแลระบบ</h1>
                        <p className="small text-white-50 mb-0">จัดการข้อมูลและตรวจสอบโพสต์</p>
                    </div>
                    <nav className="nav nav-pills flex-column gap-1" aria-label="เมนูผู้ดูแล">
                        {navLinks.map((link) => <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : 'text-white'}`}
                            aria-current={location.pathname === link.path ? 'page' : undefined}
                        >{link.label}</Link>)}
                    </nav>
                    <div className="mt-auto pt-3 border-top border-secondary">
                        <button type="button" onClick={handleLogout} className="btn btn-danger btn-sm w-100">ออกจากระบบผู้ดูแล</button>
                    </div>
                </aside>
                <main className="col-12 col-lg-10 p-3 p-md-4 bg-body-tertiary">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
