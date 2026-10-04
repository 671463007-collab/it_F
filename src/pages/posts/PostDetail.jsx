import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

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
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [reporting, setReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');
    const commentSubmissionVersionRef = useRef(0);

    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        user = null;
    }

    const fetchPostDetail = useCallback(async () => {
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
                ? 'ไม่พบประกาศนี้ หรือประกาศยังไม่เปิดให้ดู'
                : error.response?.data?.message || 'โหลดรายละเอียดประกาศไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPostDetail();
    }, [fetchPostDetail]);

    useEffect(() => {
        if (!post?.id) return undefined;

        let cancelled = false;
        let timeoutId;
        const refreshPost = async () => {
            if (document.visibilityState === 'visible') {
                const submissionVersion = commentSubmissionVersionRef.current;
                try {
                    const response = await api.get(`/exchange-posts/${id}`);
                    if (!cancelled && submissionVersion === commentSubmissionVersionRef.current) {
                        setPost(response.data);
                    }
                } catch (error) {
                    if (!cancelled) console.error('ไม่สามารถอัปเดตโพสต์และความคิดเห็นได้:', error);
                }
            }

            if (!cancelled) timeoutId = window.setTimeout(refreshPost, 5000);
        };

        timeoutId = window.setTimeout(refreshPost, 5000);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [id, post?.id]);

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
            alert(error.response?.data?.message || 'กดถูกใจไม่สำเร็จ');
        } finally {
            setLiking(false);
        }
    };

    const handleCommentSubmit = async (event, parentId = null) => {
        event.preventDefault();
        const content = parentId ? replyText : commentText;
        if (!content.trim()) return;
        if (!token) {
            navigate('/login');
            return;
        }
        setSubmitting(true);
        try {
            const payload = { content: content.trim() };
            if (post.post_type === 'exchange') payload.rating = rating ? Number(rating) : null;
            if (parentId) payload.parent_id = parentId;
            const response = await api.post(`/exchange-posts/${id}/comments`, payload);
            commentSubmissionVersionRef.current += 1;
            const responseComment = response.data?.comment
                || response.data?.data?.comment
                || response.data?.data
                || response.data;
            const savedComment = responseComment
                && typeof responseComment === 'object'
                && responseComment.id != null
                && typeof responseComment.content === 'string'
                ? { ...responseComment, replies: responseComment.replies || [] }
                : null;

            if (savedComment) {
                setPost((current) => {
                    if (parentId) {
                        return {
                            ...current,
                            comments: (current.comments || []).map((comment) => comment.id === parentId
                                ? { ...comment, replies: [...(comment.replies || []), savedComment] }
                                : comment),
                        };
                    }
                    return {
                        ...current,
                        comments: [savedComment, ...(current.comments || [])],
                    };
                });
            }

            try {
                const refreshedPost = await api.get(`/exchange-posts/${id}`);
                setPost(refreshedPost.data);
            } catch (error) {
                console.error('ส่งความคิดเห็นแล้ว แต่โหลดข้อมูลความคิดเห็นล่าสุดไม่สำเร็จ:', error);
                if (!savedComment) {
                    alert('ส่งความคิดเห็นแล้ว แต่แสดงผลไม่สำเร็จ กรุณารีเฟรชหน้า');
                }
            }
            if (parentId) {
                setReplyText('');
                setReplyingToId(null);
            } else {
                setCommentText('');
                setRating('');
            }
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'ส่งความคิดเห็นไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentUpdate = async (event, commentId) => {
        event.preventDefault();
        try {
            const payload = { content: editCommentText };
            if (post.post_type === 'exchange') payload.rating = editCommentRating ? Number(editCommentRating) : null;
            const response = await api.put(`/comments/${commentId}`, payload);
            const updatedComment = response.data.comment;
            setPost((current) => ({
                ...current,
                comments: current.comments.map((comment) => comment.id === commentId
                    ? { ...comment, ...updatedComment }
                    : {
                        ...comment,
                        replies: (comment.replies || []).map((reply) => reply.id === commentId
                            ? { ...reply, ...updatedComment }
                            : reply),
                    }),
            }));
            setEditingCommentId(null);
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'แก้ไขความคิดเห็นไม่สำเร็จ');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('ต้องการลบความคิดเห็นนี้หรือไม่?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            setPost((current) => ({
                ...current,
                comments: current.comments
                    .filter((comment) => comment.id !== commentId)
                    .map((comment) => ({
                        ...comment,
                        replies: (comment.replies || []).filter((reply) => reply.id !== commentId),
                    })),
            }));
        } catch (error) {
            alert(error.response?.data?.message || 'ลบความคิดเห็นไม่สำเร็จ');
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
                <h1 className="h4 text-secondary">{loadError || 'ไม่พบประกาศนี้'}</h1>
                <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/')}>กลับหน้าหลัก</button>
                {loadError && <button className="btn btn-primary mt-3 ms-2" onClick={fetchPostDetail}>ลองอีกครั้ง</button>}
            </main>
        );
    }

    const images = post.images || [];
    const isOwner = Number(user?.id) === Number(post.user_id);

    const renderComment = (comment, isReply = false) => (
        <article key={comment.id} className={`border rounded p-3 ${isReply ? 'bg-light ms-3 ms-md-4' : ''}`}>
            <div className="d-flex align-items-start gap-2">
                {comment.user?.avatar_url && <img src={comment.user.avatar_url} alt="" className="rounded-circle" width="36" height="36" />}
                <div className="flex-grow-1">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                        <strong>{comment.user?.name || 'ผู้ใช้'}</strong>
                        <time className="small text-secondary">{new Date(comment.created_at).toLocaleString('th-TH')}</time>
                    </div>
                    {post.post_type === 'exchange' && comment.rating && <div className="text-warning" aria-label={`${comment.rating} จาก 5 ดาว`}>{'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}</div>}
                    <p className="mb-2 mt-2" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                    <div className="d-flex gap-3">
                        {!isReply && token && <button className="btn btn-link btn-sm p-0" onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}>ตอบกลับ</button>}
                        {Number(user?.id) === Number(comment.user_id) && <>
                            <button className="btn btn-link btn-sm p-0" onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); setEditCommentRating(comment.rating ? String(comment.rating) : ''); }}>แก้ไข</button>
                            <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleCommentDelete(comment.id)}>ลบ</button>
                        </>}
                    </div>
                    {editingCommentId === comment.id && <form className="mt-3" onSubmit={(event) => handleCommentUpdate(event, comment.id)}>
                        <textarea className="form-control mb-2" maxLength="1000" value={editCommentText} onChange={(event) => setEditCommentText(event.target.value)} required />
                        <div className="d-flex flex-wrap gap-2">
                            {post.post_type === 'exchange' && <select className="form-select" style={{ maxWidth: '180px' }} value={editCommentRating} onChange={(event) => setEditCommentRating(event.target.value)}>
                                <option value="">ไม่ให้คะแนน</option>
                                {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} ดาว</option>)}
                            </select>}
                            <button className="btn btn-primary btn-sm" type="submit">บันทึก</button>
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEditingCommentId(null)}>ยกเลิก</button>
                        </div>
                    </form>}
                </div>
            </div>
        </article>
    );

    return (
        <main className="post-detail-page min-vh-100 py-4">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <button className="btn btn-link text-secondary text-decoration-none px-0 mb-3" onClick={() => navigate(-1)}>ย้อนกลับ</button>
                <section className="card post-detail-card mb-4">
                    <div className="card-body p-3 p-md-4">
                        <div className="row g-4">
                            <div className="col-md-5">
                                <img
                                    src={images[activeImageIndex]?.image_url || 'https://placehold.co/600x400?text=%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A1%E0%B8%B5%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%A0%E0%B8%B2%E0%B8%9E'}
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
                                    {post.post_type === 'exchange' && <span className="badge text-bg-success">สภาพ {post.condition_percent}%</span>}
                                    <button type="button" className={`btn btn-sm ${post.is_liked ? 'btn-danger btn-liked' : 'btn-outline-danger'}`} onClick={handleToggleLike} disabled={liking}>
                                        {liking ? 'กำลังบันทึก...' : `ถูกใจ ${post.likes_count || 0}`}
                                    </button>
                                </div>
                                <h1 className="h3 fw-bold">{post.title}</h1>
                                <p className="small text-secondary mb-2">หมวดหมู่: {post.category?.name || 'ไม่ระบุ'}</p>
                                {post.post_type === 'discussion' && post.gadget_name && <p className="small text-secondary">อุปกรณ์: {post.gadget_name}</p>}
                                <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{post.description}</p>
                                {post.post_type === 'exchange' && post.looking_for && <p><strong>ต้องการแลกกับ:</strong> {post.looking_for}</p>}
                                <div className="mt-auto pt-3 border-top small text-secondary">
                                    ผู้ลงประกาศ: <Link to={`/users/${post.user_id}`}>{post.user?.name || 'ผู้ใช้'}</Link>
                                    <span className="ms-3">{new Date(post.created_at).toLocaleDateString('th-TH')}</span>
                                </div>
                                {post.post_type === 'exchange' && token && !isOwner && <div className="d-flex flex-wrap gap-2 mt-3">
                                    <Link className="btn btn-primary btn-sm" to={`/messages?user_id=${post.user_id}&exchange_post_id=${post.id}`}>ส่งข้อความ</Link>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => setReporting((current) => !current)}>{reporting ? 'ยกเลิกรายงาน' : 'รายงานประกาศ'}</button>
                                </div>}
                                {post.post_type === 'exchange' && reporting && <form className="mt-3" onSubmit={handleReport}>
                                    <label className="form-label" htmlFor="post-report-reason">เหตุผลที่รายงาน</label>
                                    <textarea id="post-report-reason" className="form-control mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
                                    {reportError && <div className="text-danger small mb-2">{reportError}</div>}
                                    <button className="btn btn-danger btn-sm" type="submit">ส่งรายงาน</button>
                                </form>}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="card post-comments-card">
                    <div className="card-body p-3 p-md-4">
                        <h2 className="h5 fw-bold mb-4">ความคิดเห็น</h2>
                        {token ? <form className="bg-light rounded p-3 mb-4" onSubmit={handleCommentSubmit}>
                            <label className="form-label" htmlFor="comment-content">แสดงความคิดเห็น</label>
                            <textarea id="comment-content" className="form-control mb-2" rows="3" maxLength="1000" value={commentText} onChange={(event) => setCommentText(event.target.value)} required />
                            <div className="d-flex flex-wrap justify-content-between gap-2">
                                {post.post_type === 'exchange' && <select className="form-select" style={{ maxWidth: '220px' }} value={rating} onChange={(event) => setRating(event.target.value)}>
                                    <option value="">ไม่ให้คะแนน</option>
                                    {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} ดาว</option>)}
                                </select>}
                                <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</button>
                            </div>
                        </form> : <div className="alert alert-light text-center">                        <Link to="/login">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น</div>}

                        {post.comments?.length ? <div className="d-flex flex-column gap-3">
                            {post.comments.map((comment) => <div key={comment.id}>
                                {renderComment(comment)}
                                {replyingToId === comment.id && token && <form className="mt-2 ms-3 ms-md-4" onSubmit={(event) => handleCommentSubmit(event, comment.id)}>
                                    <label className="form-label" htmlFor={`reply-${comment.id}`}>ตอบกลับ {comment.user?.name || 'ความคิดเห็น'}</label>
                                    <div className="input-group">
                                        <input id={`reply-${comment.id}`} className="form-control" value={replyText} onChange={(event) => setReplyText(event.target.value)} maxLength="1000" required />
                                        <button className="btn btn-outline-primary" type="submit">ส่ง</button>
                                    </div>
                                </form>}
                                {comment.replies?.length > 0 && <div className="d-flex flex-column gap-2 mt-2 border-start ps-2 ps-md-3">
                                    {comment.replies.map((reply) => renderComment(reply, true))}
                                </div>}
                            </div>)}
                        </div> : <p className="text-center text-secondary py-4 mb-0">ยังไม่มีความคิดเห็น</p>}
                    </div>
                </section>
            </div>
        </main>
    );
}
