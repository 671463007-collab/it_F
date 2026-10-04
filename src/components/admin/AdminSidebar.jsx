import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { path: '/admin/dashboard', label: 'แดชบอร์ด' },
    { path: '/admin/posts', label: 'จัดการประกาศ' },
    { path: '/admin/users', label: 'จัดการผู้ใช้' },
    { path: '/admin/comments', label: 'จัดการความคิดเห็น' },
    { path: '/admin/categories', label: 'จัดการหมวดหมู่' },
    { path: '/admin/reports', label: 'รายงานของสมาชิก' },
];

export default function AdminSidebar({ onLogout }) {
    const location = useLocation();

    return (
        <aside className="col-12 col-lg-2 admin-sidebar text-white p-3 d-flex flex-column">
            <div className="border-bottom border-secondary pb-3 mb-3">
                <h1 className="h5 mb-1">ผู้ดูแลระบบ</h1>
                <p className="small text-white-50 mb-0">จัดการข้อมูลและตรวจสอบประกาศ</p>
            </div>
            <nav className="nav nav-pills flex-column gap-1" aria-label="เมนูผู้ดูแล">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${location.pathname === link.path ? 'active' : 'text-white'}`}
                        aria-current={location.pathname === link.path ? 'page' : undefined}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto pt-3 border-top border-secondary">
                <button type="button" onClick={onLogout} className="btn btn-danger btn-sm w-100">
                    ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}
