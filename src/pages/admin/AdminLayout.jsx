import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../../api/axios';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!localStorage.getItem('token') || user?.role !== 'admin') navigate('/admin/login', { replace: true });
    }, [navigate, user?.role]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Admin logout failed:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    // เช็คว่าลิงก์ไหนกำลัง active อยู่
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/admin/dashboard', label: '📊 แดชบอร์ด', icon: '' },
        { path: '/admin/posts', label: '📦 จัดการโพสต์', icon: '' },
        { path: '/admin/users', label: '👥 จัดการผู้ใช้', icon: '' },
        { path: '/admin/comments', label: '💬 จัดการความคิดเห็น', icon: '' },
        { path: '/admin/categories', label: '🏷️ จัดการหมวดหมู่', icon: '' },
        { path: '/admin/reports', label: '🚨 รายงานปัญหา', icon: '' },
    ];

    if (!localStorage.getItem('token') || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar สำหรับแอดมิน */}
            <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col justify-between shadow-lg">
                <div>
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold tracking-wider text-blue-400">🛡️ Admin Panel</h2>
                        <p className="text-xs text-gray-400 mt-1">ระบบจัดการเว็บไอที</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                    isActive(link.path)
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <Link 
                        to="/" 
                        className="block px-4 py-2 text-sm text-gray-400 hover:text-white transition mb-2"
                    >
                        🏠 กลับสู่หน้าเว็บไซต์หลัก
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition text-center"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* ส่วนแสดงเนื้อหาหลัก (Content Area) */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}