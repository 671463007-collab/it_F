import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            if (response.data.user?.role !== 'admin') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setErrorMessage('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
                return;
            }
            sessionStorage.removeItem('banned-session-notified');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/admin/dashboard', { replace: true });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'เกิดข้อผิดพลาด ไม่สามารถเข้าสู่ระบบได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container py-5" style={{ maxWidth: '440px' }}>
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white"><h1 className="h5 mb-0">เข้าสู่ระบบผู้ดูแล</h1></div>
                <div className="card-body p-4">
                    {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input id="admin-email" type="email" className="form-control" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
                            <label htmlFor="admin-email">อีเมลผู้ดูแล</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input id="admin-password" type="password" className="form-control" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
                            <label htmlFor="admin-password">รหัสผ่าน</label>
                        </div>
                        <button className="btn btn-dark w-100" type="submit" disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบผู้ดูแล'}</button>
                    </form>
                    <p className="text-center mt-3 mb-0"><Link to="/login">กลับไปหน้าเข้าสู่ระบบสมาชิก</Link></p>
                </div>
            </div>
        </main>
    );
}