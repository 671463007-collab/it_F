import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function UserProfilePage() {
    const { userId } = useParams(); // รับ ID ของผู้ใช้จาก URL
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reporting, setReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');

    useEffect(() => {
        setLoading(true);
        api.get(`/users/${userId}`)
            .then((response) => setProfile(response.data))
            .catch((error) => {
                console.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้:', error);
                setProfile(null);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleReport = async (event) => {
        event.preventDefault();
        setReportError('');
        try {
            const response = await api.post('/reports', {
                reported_user_id: Number(userId),
                reason: reportReason,
            });
            setReportReason('');
            setReporting(false);
            alert(response.data.message || 'ส่งรายงานเรียบร้อยแล้ว');
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setReportError(validationMessage || error.response?.data?.message || 'ส่งรายงานไม่สำเร็จ');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดโปรไฟล์...</div>;
    if (!profile) return <div className="text-center py-10 text-red-500">ไม่พบข้อมูลผู้ใช้งานนี้</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            {/* ข้อมูลส่วนหัวโปรไฟล์ */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6 mb-6">
                <img
                    src={profile.avatar_url || 'https://via.placeholder.com/150'}
                    alt={profile.name} 
                    className="w-24 h-24 rounded-full object-cover shadow-md border"
                />
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                    {profile.phone && <p className="text-sm text-gray-600 mt-2 mb-0">โทรศัพท์: {profile.phone}</p>}
                    {profile.line_id && <p className="text-sm text-gray-600 mb-0">Line: {profile.line_id}</p>}
                    {profile.facebook_contact && <p className="text-sm text-gray-600 mb-0">Facebook: {profile.facebook_contact}</p>}
                </div>
                {localStorage.getItem('token') && Number(userId) !== Number(JSON.parse(localStorage.getItem('user') || 'null')?.id) && (
                    <div className="d-flex flex-column gap-2">
                        <Link to={`/messages?user_id=${profile.id}`} className="btn btn-primary btn-sm">ส่งข้อความ</Link>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => setReporting((value) => !value)}>
                            {reporting ? 'ปิดแบบฟอร์มรายงาน' : 'รายงานผู้ใช้'}
                        </button>
                    </div>
                )}
            </div>

            {reporting && (
                <form className="border rounded p-3 mb-4" onSubmit={handleReport}>
                    <label htmlFor="report-reason" className="form-label fw-semibold">เหตุผลที่รายงาน</label>
                    <textarea id="report-reason" className="form-control mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
                    {reportError && <div className="text-danger small mb-2">{reportError}</div>}
                    <button className="btn btn-danger btn-sm" type="submit">ส่งรายงาน</button>
                </form>
            )}

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">ประกาศแลกเปลี่ยน</h2>
                {profile.exchange_posts?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">ไม่มีประกาศที่เปิดอยู่</p>
                ) : (
                    <div className="space-y-4">
                        {profile.exchange_posts?.map((post) => (
                            <Link key={post.id} to={`/posts/${post.id}`} className="block border border-gray-100 bg-gray-50 rounded-lg p-4 text-decoration-none">
                                <div className="font-semibold text-gray-800">{post.title}</div>
                                <div className="text-sm text-gray-500">{post.category?.name || 'หมวดหมู่ทั่วไป'} · สภาพ {post.condition_percent}%</div>
                                <p className="text-gray-600 text-sm mt-2 mb-0">{post.description}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}