import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusLabels = {
    pending: 'รอตรวจสอบ',
    open: 'เปิดแลกเปลี่ยน',
    closed: 'ปิดการแลกเปลี่ยน',
    hidden: 'ซ่อนโดยผู้ดูแล',
};

export default function MyPostsPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [draft, setDraft] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [postTypeFilter, setPostTypeFilter] = useState('all');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMyPosts = async () => {
        try {
            const response = await api.get('/my/posts');
            setPosts(response.data?.data || []);
        } catch (error) {
            console.error('ไม่สามารถโหลดโพสต์ของคุณได้:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
        api.get('/categories')
            .then((response) => setCategories(response.data?.data || response.data || []))
            .catch((error) => console.error('ไม่สามารถโหลดหมวดหมู่ได้:', error));
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?')) return;
        try {
            await api.delete(`/exchange-posts/${postId}`);
            setPosts((current) => current.filter((post) => post.id !== postId));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถลบโพสต์ได้');
        }
    };

    const handleToggleStatus = async (post) => {
        if (!['open', 'closed'].includes(post.status)) return;
        const status = post.status === 'open' ? 'closed' : 'open';
        try {
            const payload = {
                post_type: post.post_type || 'exchange',
                category_id: post.category_id,
                title: post.title,
                description: post.description,
                status,
            };
            if (payload.post_type === 'exchange') {
                payload.condition_percent = post.condition_percent;
                payload.looking_for = post.looking_for;
            } else {
                payload.gadget_name = post.gadget_name;
            }
            await api.post(`/exchange-posts/${post.id}`, payload);
            await fetchMyPosts();
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        const postType = post.post_type || 'exchange';
        const postDraft = {
            post_type: postType,
            category_id: String(post.category_id),
            title: post.title,
            description: post.description,
        };
        if (postType === 'exchange') {
            postDraft.condition_percent = post.condition_percent;
            postDraft.looking_for = post.looking_for || '';
        } else {
            postDraft.gadget_name = post.gadget_name || '';
        }
        setDraft(postDraft);
        setNewImages([]);
    };

    const savePost = async (event) => {
        event.preventDefault();
        setSaving(true);
        const formData = new FormData();
        Object.entries(draft).forEach(([key, value]) => formData.append(key, value));
        Array.from(newImages).forEach((image) => formData.append('images[]', image));
        try {
            await api.post(`/exchange-posts/${editingPostId}`, formData);
            setEditingPostId(null);
            setDraft(null);
            setNewImages([]);
            await fetchMyPosts();
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            alert(validationMessage || error.response?.data?.message || 'แก้ไขโพสต์ไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container py-5 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <main className="container py-4" style={{ maxWidth: '1000px' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h1 className="h3 fw-bold mb-0">โพสต์ของฉัน</h1>
                <Link to="/create-post" className="btn btn-primary">+ สร้างโพสต์ใหม่</Link>
            </div>
            <ul className="nav nav-tabs mb-4">
                {[["all", "ทั้งหมด"], ["exchange", "แลกเปลี่ยน"], ["discussion", "รีวิว / พูดคุย"]].map(([type, label]) => (
                    <li className="nav-item" key={type}><button className={`nav-link ${postTypeFilter === type ? 'active' : ''}`} onClick={() => setPostTypeFilter(type)}>{label}</button></li>
                ))}
            </ul>
            {posts.filter((post) => postTypeFilter === 'all' || (post.post_type || 'exchange') === postTypeFilter).length === 0 ? (
                <div className="alert alert-light border text-center">คุณยังไม่มีประกาศขอแลกเปลี่ยนสินค้า</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {posts.filter((post) => postTypeFilter === 'all' || (post.post_type || 'exchange') === postTypeFilter).map((post) => (
                        <article key={post.id} className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex flex-wrap justify-content-between gap-3">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className={`badge ${(post.post_type || 'exchange') === 'discussion' ? 'text-bg-info' : 'text-bg-primary'}`}>{(post.post_type || 'exchange') === 'discussion' ? 'รีวิว / พูดคุย' : 'แลกเปลี่ยน'}</span>
                                            <span className={`badge ${post.status === 'open' ? 'text-bg-success' : post.status === 'pending' ? 'text-bg-warning' : post.status === 'hidden' ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                                                {statusLabels[post.status] || post.status}
                                            </span>
                                            {(post.post_type || 'exchange') === 'exchange' ? <span className="small text-secondary">สภาพ {post.condition_percent}%</span> : post.gadget_name && <span className="small text-secondary">{post.gadget_name}</span>}
                                        </div>
                                        <h2 className="h5 fw-bold">{post.title}</h2>
                                        <p className="text-secondary mb-2">{post.description}</p>
                                        {(post.post_type || 'exchange') === 'exchange' && post.looking_for && <div className="small">ต้องการแลกกับ: {post.looking_for}</div>}
                                    </div>
                                    <div className="d-flex align-items-start gap-2">
                                        {['open', 'closed'].includes(post.status) && (
                                            <button className={`btn btn-sm ${post.status === 'open' ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => handleToggleStatus(post)}>
                                                {post.status === 'open' ? 'ปิดการแลก' : 'เปิดอีกครั้ง'}
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => startEditing(post)}>แก้ไข</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(post.id)}>ลบ</button>
                                    </div>
                                </div>
                                {editingPostId === post.id && (
                                    <form onSubmit={savePost} className="row g-3 border-top mt-3 pt-3">
                                        <div className="col-md-6">
                                            <label className="form-label">หมวดหมู่</label>
                                            <select className="form-select" value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} required>
                                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">หัวข้อ</label>
                                            <input className="form-control" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength="255" required />
                                        </div>
                                        {draft.post_type === 'discussion' && <div className="col-md-6">
                                            <label className="form-label">ชื่ออุปกรณ์ (ไม่บังคับ)</label>
                                            <input className="form-control" value={draft.gadget_name} onChange={(event) => setDraft({ ...draft, gadget_name: event.target.value })} maxLength="255" />
                                        </div>}
                                        <div className="col-12">
                                            <label className="form-label">รายละเอียด</label>
                                            <textarea className="form-control" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
                                        </div>
                                        {draft.post_type === 'exchange' && <div className="col-md-6">
                                            <label className="form-label">สภาพสินค้า: {draft.condition_percent}%</label>
                                            <input className="form-range" type="range" min="0" max="100" value={draft.condition_percent} onChange={(event) => setDraft({ ...draft, condition_percent: event.target.value })} />
                                        </div>}
                                        {draft.post_type === 'exchange' && <div className="col-md-6">
                                            <label className="form-label">สิ่งที่ต้องการแลก</label>
                                            <input className="form-control" value={draft.looking_for} onChange={(event) => setDraft({ ...draft, looking_for: event.target.value })} />
                                        </div>}
                                        <div className="col-12">
                                            <label className="form-label">เพิ่มรูปภาพ (ไม่เกิน 2MB ต่อรูป)</label>
                                            <input className="form-control" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setNewImages(event.target.files || [])} />
                                        </div>
                                        <div className="col-12 d-flex justify-content-end gap-2">
                                            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
                                            <button className="btn btn-outline-secondary" type="button" onClick={() => setEditingPostId(null)}>ยกเลิก</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
