import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ReviewListPage() {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/categories').then((response) => setCategories(response.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        api.get('/reviews', { params: { keyword, category_id: categoryId, page } })
            .then((response) => {
                setReviews(response.data.data || []);
                setLastPage(response.data.last_page || 1);
            })
            .catch((error) => console.error('โหลดรีวิวไม่สำเร็จ:', error))
            .finally(() => setLoading(false));
    }, [keyword, categoryId, page]);

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h1 className="h3 fw-bold mb-0">รีวิวอุปกรณ์ไอที</h1>
                {localStorage.getItem('token') && <Link className="btn btn-primary" to="/reviews/create">เขียนรีวิว</Link>}
            </div>
            <div className="row g-2 mb-4">
                <div className="col-md-8">
                    <input className="form-control" value={keyword} placeholder="ค้นหาชื่ออุปกรณ์" onChange={(event) => { setKeyword(event.target.value); setPage(1); }} />
                </div>
                <div className="col-md-4">
                    <select className="form-select" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}>
                        <option value="">ทุกหมวดหมู่</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </div>
            </div>

            {loading ? <div className="text-center py-5">กำลังโหลดรีวิว...</div> : reviews.length === 0 ? (
                <div className="alert alert-light text-center">ยังไม่มีรีวิวอุปกรณ์</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {reviews.map((review) => (
                        <article key={review.id} className="border rounded p-3 bg-white">
                            <div className="d-flex justify-content-between gap-3">
                                <div>
                                    <h2 className="h5 mb-1">{review.gadget_name}</h2>
                                    <div className="small text-secondary">{review.category?.name || 'ไม่ระบุหมวดหมู่'} · โดย {review.user?.name || 'สมาชิก'}</div>
                                </div>
                                <div className="text-warning text-nowrap" aria-label={`${review.rating} จาก 5 ดาว`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                            </div>
                            <p className="mb-0 mt-3" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>
                        </article>
                    ))}
                </div>
            )}

            {lastPage > 1 && <nav className="mt-4" aria-label="หน้ารายการรีวิว"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => (
                    <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button>
                    </li>
                ))}
            </ul></nav>}
        </main>
    );
}