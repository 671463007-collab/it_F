import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = { pending: 'รอตรวจสอบ', open: 'เปิดอยู่', closed: 'ปิดแล้ว', hidden: 'ซ่อน' };

export default function ManagePosts() {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState(() => ['pending', 'open', 'closed', 'hidden'].includes(searchParams.get('status')) ? searchParams.get('status') : '');
    const [postType, setPostType] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/admin/exchange-posts', { params: { keyword, status, post_type: postType, category_id: categoryId, only_trashed: showDeleted, page } })
            .then((response) => {
                setPosts(response.data.data || []);
                setLastPage(response.data.last_page || 1);
            })
            .catch((error) => console.error('โหลดประกาศไม่สำเร็จ:', error))
            .finally(() => setLoading(false));
    }, [keyword, status, postType, categoryId, showDeleted, page]);

    useEffect(() => {
        api.get('/admin/categories').then((response) => setCategories(response.data || []))
            .catch((error) => console.error('ไม่สามารถโหลดหมวดหมู่ได้:', error));
    }, []);

    const updateStatus = async (postId, nextStatus) => {
        try {
            const response = await api.patch(`/admin/exchange-posts/${postId}/status`, { status: nextStatus });
            setPosts((current) => current.map((post) => post.id === postId ? { ...post, status: response.data.post.status } : post));
        } catch (error) {
            alert(error.response?.data?.message || 'เปลี่ยนสถานะประกาศไม่สำเร็จ');
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm('ย้ายประกาศนี้ไปถังขยะหรือไม่?')) return;
        try {
            await api.delete(`/exchange-posts/${postId}`);
            setPosts((current) => current.filter((post) => post.id !== postId));
        } catch (error) {
            alert(error.response?.data?.message || 'ย้ายประกาศไปถังขยะไม่สำเร็จ');
        }
    };

    const restorePost = async (postId) => {
        try {
            await api.patch(`/admin/exchange-posts/${postId}/restore`);
            setPosts((current) => current.filter((post) => post.id !== postId));
        } catch (error) {
            alert(error.response?.data?.message || 'กู้คืนประกาศไม่สำเร็จ');
        }
    };

    const resetPage = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    if (loading && posts.length === 0) return <div className="py-5 text-center">กำลังโหลดประกาศ...</div>;

    return (
        <section className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">จัดการประกาศ</h1>
            <p className="text-secondary mb-4">ตรวจสอบและจัดการประกาศแลกเปลี่ยนหรือรีวิว / พูดคุย</p>
            <div className="row g-2 mb-3">
                <div className="col-12 col-lg-4"><input className="form-control" value={keyword} placeholder="ค้นหาประกาศ" onChange={resetPage(setKeyword)} /></div>
                <div className="col-6 col-lg-2"><select className="form-select" value={postType} onChange={resetPage(setPostType)}><option value="">ทุกประเภท</option><option value="exchange">แลกเปลี่ยน</option><option value="discussion">รีวิว / พูดคุย</option></select></div>
                <div className="col-6 col-lg-3"><select className="form-select" value={status} onChange={resetPage(setStatus)}><option value="">ทุกสถานะ</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                <div className="col-12 col-lg-3"><select className="form-select" value={categoryId} onChange={resetPage(setCategoryId)}><option value="">ทุกหมวดหมู่</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                <div className="col-12"><select className="form-select" value={showDeleted ? 'deleted' : 'active'} onChange={(event) => { setShowDeleted(event.target.value === 'deleted'); setPage(1); }}><option value="active">ประกาศปกติ</option><option value="deleted">ถังขยะ</option></select></div>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>ประเภท</th><th>หัวข้อ</th><th>ผู้ลงประกาศ</th><th>หมวดหมู่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                    <tbody>
                        {posts.map((post) => <tr key={post.id}>
                            <td><span className={`badge ${(post.post_type || 'exchange') === 'discussion' ? 'text-bg-info' : 'text-bg-primary'}`}>{(post.post_type || 'exchange') === 'discussion' ? 'รีวิว / พูดคุย' : 'แลกเปลี่ยน'}</span></td>
                            <td className="text-truncate" style={{ maxWidth: '260px' }}>{post.title}</td>
                            <td>{post.user?.name || '-'}</td>
                            <td>{post.category?.name || '-'}</td>
                            <td>{showDeleted ? <span className="badge text-bg-secondary">ลบแล้ว</span> : <span className={`badge ${post.status === 'open' ? 'text-bg-success' : post.status === 'pending' ? 'text-bg-warning' : post.status === 'hidden' ? 'text-bg-danger' : 'text-bg-secondary'}`}>{statusLabels[post.status] || post.status}</span>}</td>
                            <td>{showDeleted
                                ? <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => restorePost(post.id)}>กู้คืน</button>
                                : <div className="d-flex flex-column flex-sm-row gap-2"><select aria-label={`สถานะประกาศ ${post.id}`} className="form-select form-select-sm" value={post.status} onChange={(event) => updateStatus(post.id, event.target.value)}><option value="pending">รอตรวจสอบ</option><option value="open">เปิดอยู่</option><option value="closed">ปิดแล้ว</option><option value="hidden">ซ่อน</option></select><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deletePost(post.id)}>ลบ</button></div>}</td>
                        </tr>)}
                        {posts.length === 0 && <tr><td colSpan="6" className="text-center text-secondary py-4">ไม่พบประกาศ</td></tr>}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-3" aria-label="หน้าประกาศ"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </section>
    );
}
