import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function UserProfilePage() {
    const { userId } = useParams();
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

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        user = null;
    }
    const isSignedIn = Boolean(localStorage.getItem('token'));
    const isSelf = Number(user?.id) === Number(userId);

    const handleReport = async (event) => {
        event.preventDefault();
        setReportError('');
        try {
            const response = await api.post('/reports', {
                reported_user_id: Number(userId),
                reason: reportReason,
            });
            setReporting(false);
            setReportReason('');
            alert(response.data.message || 'ส่งรายงานเรียบร้อยแล้ว');
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setReportError(validationMessage || error.response?.data?.message || 'ส่งรายงานไม่สำเร็จ');
        }
    };

    if (loading) return <main className="container py-5 text-center">กำลังโหลดโปรไฟล์...</main>;
    if (!profile) return <main className="container py-5 text-center text-danger">ไม่พบข้อมูลผู้ใช้งานนี้</main>;

    return (
        <main className="container py-4 mb-5" style={{ maxWidth: '1000px' }}>
            <section className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4 d-flex flex-wrap align-items-center gap-4">
                    <img src={profile.avatar_url || 'https://via.placeholder.com/96'} alt={profile.name} className="rounded-circle border" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
                    <div className="flex-grow-1">
                        <h1 className="h3 fw-bold mb-1">{profile.name}</h1>
                        {profile.phone && <div className="small text-secondary">โทรศัพท์: {profile.phone}</div>}
                        {profile.line_id && <div className="small text-secondary">Line: {profile.line_id}</div>}
                        {profile.facebook_contact && <div className="small text-secondary">Facebook: {profile.facebook_contact}</div>}
                    </div>
                    {isSignedIn && !isSelf && <div className="d-flex flex-wrap gap-2">
                        <Link className="btn btn-primary btn-sm" to={`/messages?user_id=${profile.id}`}>ส่งข้อความ</Link>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => setReporting((current) => !current)}>{reporting ? 'ยกเลิก' : 'รายงานผู้ใช้'}</button>
                    </div>}
                </div>
            </section>

            {reporting && <form className="card card-body mb-4" onSubmit={handleReport}>
                <label className="form-label fw-semibold" htmlFor="report-reason">เหตุผลที่รายงาน</label>
                <textarea id="report-reason" className="form-control mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
                {reportError && <div className="text-danger small mb-2">{reportError}</div>}
                <button className="btn btn-danger btn-sm align-self-start" type="submit">ส่งรายงาน</button>
            </form>}

            <h2 className="h4 fw-bold mb-3">ประกาศแลกเปลี่ยนที่เปิดอยู่</h2>
            {profile.exchange_posts?.length ? <div className="row g-3">
                {profile.exchange_posts.map((post) => <div className="col-md-6" key={post.id}>
                    <article className="card h-100 border-0 shadow-sm">
                        {post.images?.[0]?.image_url && <img src={post.images[0].image_url} alt={post.title} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />}
                        <div className="card-body">
                            <div className="small text-secondary mb-1">{post.category?.name || 'ไม่ระบุหมวดหมู่'} · สภาพ {post.condition_percent}%</div>
                            <h3 className="h5 fw-bold">{post.title}</h3>
                            <p className="text-secondary">{post.description}</p>
                            {post.looking_for && <p className="small">ต้องการแลกกับ: {post.looking_for}</p>}
                            <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm">ดูรายละเอียด</Link>
                        </div>
                    </article>
                </div>)}
            </div> : <div className="alert alert-light border text-center">ผู้ใช้งานนี้ยังไม่มีประกาศที่เปิดอยู่</div>}
        </main>
    );
}
