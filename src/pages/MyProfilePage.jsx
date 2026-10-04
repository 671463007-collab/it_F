import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyProfile = {
    name: '',
    email: '',
    phone: '',
    line_id: '',
    facebook_contact: '',
    role: '',
    status: '',
    avatar_url: '',
};

export default function MyProfilePage() {
    const [profile, setProfile] = useState(emptyProfile);
    const [avatar, setAvatar] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        api.get('/me')
            .then((response) => setProfile({ ...emptyProfile, ...response.data }))
            .catch((error) => setMessage(error.response?.data?.message || 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        setErrors({});

        const formData = new FormData();
        ['name', 'email', 'phone', 'line_id', 'facebook_contact'].forEach((field) => {
            formData.append(field, profile[field] || '');
        });
        if (password) {
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);
        }
        if (avatar) formData.append('avatar', avatar);

        try {
            const response = await api.post('/profile', formData);
            const updatedProfile = response.data.user;
            setProfile({ ...emptyProfile, ...updatedProfile });
            localStorage.setItem('user', JSON.stringify(updatedProfile));
            setPassword('');
            setPasswordConfirmation('');
            setAvatar(null);
            setMessage(response.data.message || 'อัปเดตโปรไฟล์เรียบร้อยแล้ว');
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setMessage(error.response?.data?.message || 'บันทึกโปรไฟล์ไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container py-5 text-center">กำลังโหลดโปรไฟล์...</div>;

    const fieldError = (field) => errors[field]?.[0];

    return (
        <main className="container py-4" style={{ maxWidth: '760px' }}>
            <h1 className="h3 fw-bold mb-4">โปรไฟล์ของฉัน</h1>
            <form className="card shadow-sm" onSubmit={handleSubmit}>
                <div className="card-body p-4">
                    {message && <div className={`alert ${Object.keys(errors).length ? 'alert-danger' : 'alert-info'}`} role="status">{message}</div>}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <img src={profile.avatar_url || 'https://via.placeholder.com/96'} alt="รูปโปรไฟล์" width="88" height="88" className="rounded-circle object-fit-cover border" />
                        <div>
                            <div className="fw-semibold">{profile.name}</div>
                            <div className="text-secondary small">{profile.role} · {profile.status}</div>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-name">ชื่อ</label>
                            <input id="profile-name" className={`form-control ${fieldError('name') ? 'is-invalid' : ''}`} value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} maxLength="255" required />
                            {fieldError('name') && <div className="invalid-feedback">{fieldError('name')}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-email">อีเมล</label>
                            <input id="profile-email" type="email" className={`form-control ${fieldError('email') ? 'is-invalid' : ''}`} value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
                            {fieldError('email') && <div className="invalid-feedback">{fieldError('email')}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-phone">เบอร์โทรศัพท์</label>
                            <input id="profile-phone" className="form-control" value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} maxLength="20" />
                            {fieldError('phone') && <div className="text-danger small mt-1">{fieldError('phone')}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-line">Line ID</label>
                            <input id="profile-line" className="form-control" value={profile.line_id || ''} onChange={(event) => setProfile({ ...profile, line_id: event.target.value })} maxLength="50" />
                            {fieldError('line_id') && <div className="text-danger small mt-1">{fieldError('line_id')}</div>}
                        </div>
                        <div className="col-12">
                            <label className="form-label" htmlFor="profile-facebook">Facebook</label>
                            <input id="profile-facebook" className="form-control" value={profile.facebook_contact || ''} onChange={(event) => setProfile({ ...profile, facebook_contact: event.target.value })} maxLength="255" />
                            {fieldError('facebook_contact') && <div className="text-danger small mt-1">{fieldError('facebook_contact')}</div>}
                        </div>
                        <div className="col-12">
                            <label className="form-label" htmlFor="profile-avatar">รูปโปรไฟล์ (JPG/PNG ไม่เกิน 2MB)</label>
                            <input id="profile-avatar" type="file" accept="image/jpeg,image/png" className={`form-control ${fieldError('avatar') ? 'is-invalid' : ''}`} onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
                            {fieldError('avatar') && <div className="invalid-feedback">{fieldError('avatar')}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-password">รหัสผ่านใหม่</label>
                            <input id="profile-password" type="password" className={`form-control ${fieldError('password') ? 'is-invalid' : ''}`} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
                            {fieldError('password') && <div className="invalid-feedback">{fieldError('password')}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="profile-password-confirmation">ยืนยันรหัสผ่านใหม่</label>
                            <input id="profile-password-confirmation" type="password" className="form-control" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" />
                        </div>
                    </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-end">
                    <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}</button>
                </div>
            </form>
        </main>
    );
}