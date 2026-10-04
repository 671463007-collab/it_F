import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import logout from '../utils/logout';

export default function AdminLayout() {
    const navigate = useNavigate();
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

    if (!localStorage.getItem('token') || user?.role !== 'admin') return null;

    return (
        <div className="container-fluid admin-shell">
            <div className="row min-vh-100">
                <AdminSidebar onLogout={() => logout(navigate)} />
                <main className="col-12 col-lg-10 admin-content p-3 p-md-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
