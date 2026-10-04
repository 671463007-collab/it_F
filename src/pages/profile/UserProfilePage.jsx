import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

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
                console.error('โหลดโปรไฟล์ไม่สำเร็จ:', error);
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
            alert(response.data.message || 'ส่งรายงานแล้ว ทีมงานจะตรวจสอบให้');
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setReportError(validationMessage || error.response?.data?.message || 'ส่งรายงานไม่สำเร็จ');
        }
    };

    if (loading) return <main className="container py-5 text-center">กำลังโหลดโปรไฟล์...</main>;
    if (!profile) return <main className="container py-5 text-center text-danger">ไม่พบผู้ใช้นี้</main>;

    return (
        <main className="container page-surface py-4 py-lg-5 mb-4" style={{ maxWidth: '1000px' }}>
            <section className="card public-profile-card mb-4">
                <div className="card-body p-4 d-flex flex-wrap align-items-center gap-4">
                    <img src={profile.avatar_url || 'https://via.placeholder.com/96'} alt={profile.name} className="rounded-circle border" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
                    <div className="flex-grow-1">
                        <h1 className="h3 fw-bold mb-1">{profile.name}</h1>
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

            <div className="page-heading mb-3"><h2 className="h4 fw-bold mb-0">ประกาศที่เปิดอยู่</h2></div>
            {profile.exchange_posts?.length ? <div className="row g-3">
                {profile.exchange_posts.map((post) => <div className="col-md-6" key={post.id}>
                    <article className="card h-100 border-0 shadow-sm">
                        {post.images?.[0]?.image_url && <img src={post.images[0].image_url} alt={post.title} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />}
                        <div className="card-body">
                            <span className={`badge mb-2 ${(post.post_type || 'exchange') === 'discussion' ? 'text-bg-info' : 'text-bg-primary'}`}>{(post.post_type || 'exchange') === 'discussion' ? 'รีวิว / พูดคุย' : 'แลกเปลี่ยน'}</span>
                            <div className="small text-secondary mb-1">{post.category?.name || 'ไม่ระบุหมวดหมู่'}{(post.post_type || 'exchange') === 'exchange' ? ` · สภาพ ${post.condition_percent}%` : ''}</div>
                            <h3 className="h5 fw-bold">{post.title}</h3>
                            <p className="text-secondary">{post.description}</p>
                            {(post.post_type || 'exchange') === 'discussion' && post.gadget_name && <p className="small text-secondary">อุปกรณ์: {post.gadget_name}</p>}
                            {(post.post_type || 'exchange') === 'exchange' && post.looking_for && <p className="small">ต้องการแลกกับ: {post.looking_for}</p>}
                            <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm">ดูรายละเอียด</Link>
                        </div>
                    </article>
                </div>)}
            </div> : <div className="alert alert-light border text-center">ผู้ใช้นี้ยังไม่มีประกาศที่เปิดอยู่</div>}
        </main>
    );
}
