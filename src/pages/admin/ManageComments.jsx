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

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดความคิดเห็น...</div>;

    return (
        <section className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการความคิดเห็น</h1>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-100 text-gray-600 text-xs uppercase border-b">
                        <th className="p-3">ผู้แสดงความคิดเห็น</th>
                        <th className="p-3">โพสต์</th>
                        <th className="p-3">คะแนน</th>
                        <th className="p-3">ข้อความ</th>
                        <th className="p-3">จัดการ</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {comments.map((comment) => (
                            <tr key={comment.id}>
                                <td className="p-3">{comment.user?.name || '-'}</td>
                                <td className="p-3">{comment.exchange_post?.title || '-'}</td>
                                <td className="p-3">{comment.rating ? `${comment.rating} / 5` : 'ไม่ให้คะแนน'}</td>
                                <td className="p-3 max-w-lg whitespace-pre-wrap">{comment.content}</td>
                                <td className="p-3"><button className="btn btn-sm btn-outline-danger" onClick={() => deleteComment(comment.id)}>ลบ</button></td>
                            </tr>
                        ))}
                        {comments.length === 0 && <tr><td className="p-6 text-center text-gray-500" colSpan="5">ไม่มีความคิดเห็น</td></tr>}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-4" aria-label="หน้าคอมเมนต์"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </section>
    );
}