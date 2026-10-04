import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [editCommentRating, setEditCommentRating] = useState('');
    const [reporting, setReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');

    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        user = null;
    }

    const fetchPostDetail = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await api.get(`/exchange-posts/${id}`);
            setPost(response.data);
            setActiveImageIndex(0);
        } catch (error) {
            console.error('Failed to fetch post detail:', error);
            setPost(null);
            setLoadError(error.response?.status === 404
                ? 'ไม่พบโพสต์นี้ หรือโพสต์ยังไม่เปิดให้ผู้ใช้ทั่วไปดู'
                : error.response?.data?.message || 'ไม่สามารถโหลดรายละเอียดโพสต์ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostDetail();
    }, [id]);

    const handleToggleLike = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        setLiking(true);
        try {
            const response = await api.post(`/exchange-posts/${id}/like`);
            setPost((current) => ({ ...current, is_liked: response.data.liked, likes_count: response.data.likes_count }));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถกดถูกใจได้');
        } finally {
            setLiking(false);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!token) {
            navigate('/login');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/exchange-posts/${id}/comments`, {
                content: commentText,
                rating: rating ? Number(rating) : null,
            });
            setCommentText('');
            setRating('');
            await fetchPostDetail();
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'ไม่สามารถส่งความคิดเห็นได้');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentUpdate = async (event, commentId) => {
        event.preventDefault();
        try {
            await api.put(`/comments/${commentId}`, {
                content: editCommentText,
                rating: editCommentRating ? Number(editCommentRating) : null,
            });
            setEditingCommentId(null);
            await fetchPostDetail();
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'ไม่สามารถแก้ไขความคิดเห็นได้');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('ต้องการลบความคิดเห็นนี้หรือไม่?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            setPost((current) => ({ ...current, comments: current.comments.filter((comment) => comment.id !== commentId) }));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถลบความคิดเห็นได้');
        }
    };

    const handleReport = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/reports', {
                reported_user_id: post.user_id,
                exchange_post_id: post.id,
                reason: reportReason,
            });
            setReporting(false);
            setReportReason('');
            setReportError('');
            alert(response.data.message || 'ส่งรายงานเรียบร้อยแล้ว');
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setReportError(validationMessage || error.response?.data?.message || 'ส่งรายงานไม่สำเร็จ');
        }
    };

    if (loading) return <div className="container py-5 text-center">กำลังโหลดรายละเอียด...</div>;
    if (!post) {
        return (
            <main className="container py-5 text-center">
                <h1 className="h4 text-secondary">{loadError || 'ไม่พบข้อมูลรายการที่คุณค้นหา'}</h1>
                <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/')}>กลับสู่หน้าหลัก</button>
                {loadError && <button className="btn btn-primary mt-3 ms-2" onClick={fetchPostDetail}>ลองอีกครั้ง</button>}
            </main>
        );
    }

    const images = post.images || [];
    const isOwner = Number(user?.id) === Number(post.user_id);

    return (
        <main className="bg-light min-vh-100 py-4">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <button className="btn btn-link text-secondary text-decoration-none px-0 mb-3" onClick={() => navigate(-1)}>ย้อนกลับ</button>
                <section className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3 p-md-4">
                        <div className="row g-4">
                            <div className="col-md-5">
                                <img
                                    src={images[activeImageIndex]?.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                    alt={post.title}
                                    className="w-100 rounded object-fit-cover"
                                    style={{ height: '320px' }}
                                />
                                {images.length > 1 && <div className="d-flex gap-2 mt-2 overflow-auto">
                                    {images.map((image, index) => (
                                        <button key={image.id || image.image_path} className={`btn p-0 border ${index === activeImageIndex ? 'border-primary' : ''}`} onClick={() => setActiveImageIndex(index)} aria-label={`ดูรูปที่ ${index + 1}`}>
                                            <img src={image.image_url} alt={`${post.title} รูปที่ ${index + 1}`} width="64" height="54" className="object-fit-cover" />
                                        </button>
                                    ))}
                                </div>}
                            </div>
                            <div className="col-md-7 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                                    <span className="badge text-bg-success">สภาพ {post.condition_percent}%</span>
                                    <button type="button" className={`btn btn-sm ${post.is_liked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={handleToggleLike} disabled={liking}>
                                        {liking ? 'กำลังบันทึก...' : `ถูกใจ (${post.likes_count || 0})`}
                                    </button>
                                </div>
                                <h1 className="h3 fw-bold">{post.title}</h1>
                                <p className="small text-secondary mb-2">หมวดหมู่: {post.category?.name || 'ไม่ระบุหมวดหมู่'}</p>
                                <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{post.description}</p>
                                {post.looking_for && <p><strong>สิ่งที่ต้องการแลก:</strong> {post.looking_for}</p>}
                                <div className="mt-auto pt-3 border-top small text-secondary">
                                    ผู้โพสต์: <Link to={`/users/${post.user_id}`}>{post.user?.name || 'ผู้ใช้งาน'}</Link>
                                    <span className="ms-3">{new Date(post.created_at).toLocaleDateString('th-TH')}</span>
                                </div>
                                {token && !isOwner && <div className="d-flex flex-wrap gap-2 mt-3">
                                    <Link className="btn btn-primary btn-sm" to={`/messages?user_id=${post.user_id}&exchange_post_id=${post.id}`}>ส่งข้อความเกี่ยวกับประกาศนี้</Link>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => setReporting((current) => !current)}>{reporting ? 'ยกเลิกรายงาน' : 'รายงานโพสต์'}</button>
                                </div>}
                                {reporting && <form className="mt-3" onSubmit={handleReport}>
                                    <label className="form-label" htmlFor="post-report-reason">เหตุผลที่รายงาน</label>
                                    <textarea id="post-report-reason" className="form-control mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
                                    {reportError && <div className="text-danger small mb-2">{reportError}</div>}
                                    <button className="btn btn-danger btn-sm" type="submit">ส่งรายงาน</button>
                                </form>}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="card border-0 shadow-sm">
                    <div className="card-body p-3 p-md-4">
                        <h2 className="h5 fw-bold mb-4">ความคิดเห็นและคะแนน</h2>
                        {token ? <form className="bg-light rounded p-3 mb-4" onSubmit={handleCommentSubmit}>
                            <label className="form-label" htmlFor="comment-content">แสดงความคิดเห็น</label>
                            <textarea id="comment-content" className="form-control mb-2" rows="3" maxLength="1000" value={commentText} onChange={(event) => setCommentText(event.target.value)} required />
                            <div className="d-flex flex-wrap justify-content-between gap-2">
                                <select className="form-select" style={{ maxWidth: '220px' }} value={rating} onChange={(event) => setRating(event.target.value)}>
                                    <option value="">ไม่ให้คะแนน</option>
                                    {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} ดาว</option>)}
                                </select>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</button>
                            </div>
                        </form> : <div className="alert alert-light text-center">กรุณา <Link to="/login">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น</div>}

                        {post.comments?.length ? <div className="d-flex flex-column gap-3">
                            {post.comments.map((comment) => <article key={comment.id} className="border rounded p-3">
                                <div className="d-flex justify-content-between gap-3">
                                    <strong>{comment.user?.name || 'ผู้ใช้งาน'}</strong>
                                    <time className="small text-secondary">{new Date(comment.created_at).toLocaleString('th-TH')}</time>
                                </div>
                                {comment.rating && <div className="text-warning" aria-label={`${comment.rating} จาก 5 ดาว`}>{'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}</div>}
                                <p className="mb-2 mt-2" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                {Number(user?.id) === Number(comment.user_id) && <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); setEditCommentRating(comment.rating ? String(comment.rating) : ''); }}>แก้ไข</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleCommentDelete(comment.id)}>ลบ</button>
                                </div>}
                                {editingCommentId === comment.id && <form className="mt-3" onSubmit={(event) => handleCommentUpdate(event, comment.id)}>
                                    <textarea className="form-control mb-2" maxLength="1000" value={editCommentText} onChange={(event) => setEditCommentText(event.target.value)} required />
                                    <div className="d-flex gap-2">
                                        <select className="form-select" style={{ maxWidth: '180px' }} value={editCommentRating} onChange={(event) => setEditCommentRating(event.target.value)}>
                                            <option value="">ไม่ให้คะแนน</option>
                                            {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} ดาว</option>)}
                                        </select>
                                        <button className="btn btn-primary btn-sm" type="submit">บันทึก</button>
                                        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEditingCommentId(null)}>ยกเลิก</button>
                                    </div>
                                </form>}
                            </article>)}
                        </div> : <p className="text-center text-secondary py-4 mb-0">ยังไม่มีความคิดเห็น</p>}
                    </div>
                </section>
            </div>
        </main>
    );
}
