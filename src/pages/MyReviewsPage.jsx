import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const loadReviews = async (pageNumber = page) => {
        try {
            const response = await api.get('/my/reviews', { params: { page: pageNumber } });
            setReviews(response.data.data || []);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error('โหลดรีวิวของฉันไม่สำเร็จ:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get('/categories').then((response) => setCategories(response.data));
        loadReviews(1);
    }, []);

    const saveReview = async (event) => {
        event.preventDefault();
        try {
            await api.put(`/reviews/${editingId}`, {
                category_id: Number(draft.category_id),
                gadget_name: draft.gadget_name,
                rating: Number(draft.rating),
                content: draft.content,
            });
            setEditingId(null);
            setDraft(null);
            loadReviews(page);
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'แก้ไขรีวิวไม่สำเร็จ');
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('ต้องการลบรีวิวนี้หรือไม่?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews((current) => current.filter((review) => review.id !== reviewId));
        } catch (error) {
            alert(error.response?.data?.message || 'ลบรีวิวไม่สำเร็จ');
        }
    };

    if (loading) return <div className="container py-5 text-center">กำลังโหลดรีวิว...</div>;

    return (
        <main className="container py-4" style={{ maxWidth: '900px' }}>
            <h1 className="h3 fw-bold mb-4">รีวิวของฉัน</h1>
            {reviews.length === 0 && <div className="alert alert-light text-center">คุณยังไม่มีรีวิว</div>}
            <div className="d-flex flex-column gap-3">
                {reviews.map((review) => (
                    <article key={review.id} className="border rounded p-3 bg-white">
                        {editingId === review.id ? (
                            <form onSubmit={saveReview} className="d-grid gap-3">
                                <select className="form-select" value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} required>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                                <input className="form-control" value={draft.gadget_name} onChange={(event) => setDraft({ ...draft, gadget_name: event.target.value })} maxLength="255" required />
                                <select className="form-select" value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: event.target.value })}>
                                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} ดาว</option>)}
                                </select>
                                <textarea className="form-control" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} required />
                                <div className="d-flex gap-2"><button className="btn btn-primary" type="submit">บันทึก</button><button className="btn btn-outline-secondary" type="button" onClick={() => setEditingId(null)}>ยกเลิก</button></div>
                            </form>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between gap-3">
                                    <div><h2 className="h5 mb-1">{review.gadget_name}</h2><div className="small text-secondary">{review.category?.name || 'ไม่ระบุหมวดหมู่'}</div></div>
                                    <div className="text-warning text-nowrap">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                </div>
                                <p className="my-3" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingId(review.id); setDraft({ category_id: String(review.category_id), gadget_name: review.gadget_name, rating: String(review.rating), content: review.content }); }}>แก้ไข</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(review.id)}>ลบ</button>
                                </div>
                            </>
                        )}
                    </article>
                ))}
            </div>
            {lastPage > 1 && <nav className="mt-4" aria-label="หน้ารีวิวของฉัน"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => (
                    <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => { setPage(pageNumber); loadReviews(pageNumber); }}>{pageNumber}</button>
                    </li>
                ))}
            </ul></nav>}
        </main>
    );
}