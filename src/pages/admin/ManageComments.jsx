import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageComments() {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/admin/comments', { params: { page } })
            .then((response) => {
                setComments(response.data.data || []);
                setLastPage(response.data.last_page || 1);
            })
            .catch((error) => console.error('ไม่สามารถโหลดความคิดเห็นได้:', error))
            .finally(() => setLoading(false));
    }, [page]);

    const deleteComment = async (commentId) => {
        if (!window.confirm('ต้องการลบความคิดเห็นนี้หรือไม่?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            setComments((current) => current.filter((comment) => comment.id !== commentId));
        } catch (error) {
            alert(error.response?.data?.message || 'ลบความคิดเห็นไม่สำเร็จ');
        }
    };

    if (loading && comments.length === 0) return <div className="py-5 text-center">กำลังโหลดความคิดเห็น...</div>;

    return (
        <section className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">จัดการความคิดเห็น</h1>
            <p className="text-secondary mb-4">ความคิดเห็นและคำตอบจากทุกโพสต์</p>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>ผู้แสดงความคิดเห็น</th><th>โพสต์</th><th>ชนิด</th><th>คะแนน</th><th>ข้อความ</th><th>จัดการ</th></tr></thead>
                    <tbody>
                        {comments.map((comment) => <tr key={comment.id}>
                            <td>{comment.user?.name || '-'}</td>
                            <td>{comment.exchange_post?.title || '-'}</td>
                            <td>{comment.parent_id ? 'Reply' : 'Comment'}</td>
                            <td>{comment.rating ? `${comment.rating} / 5` : '—'}</td>
                            <td style={{ minWidth: '240px', whiteSpace: 'pre-wrap' }}>{comment.content}</td>
                            <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteComment(comment.id)}>ลบ</button></td>
                        </tr>)}
                        {comments.length === 0 && <tr><td colSpan="6" className="text-center text-secondary py-4">ไม่มีความคิดเห็น</td></tr>}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-3" aria-label="หน้าคอมเมนต์"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </section>
    );
}
