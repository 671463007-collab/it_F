import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ReviewPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [gadgetName, setGadgetName] = useState('');
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        api.get('/categories')
            .then((response) => setCategories(response.data?.data || response.data || []))
            .catch((error) => {
                console.error('ไม่สามารถโหลดหมวดหมู่ได้:', error);
                setErrorMessage('ไม่สามารถโหลดหมวดหมู่ได้');
            });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');
        try {
            const response = await api.post('/reviews', {
                category_id: Number(categoryId),
                gadget_name: gadgetName,
                rating: Number(rating),
                content,
            });
            alert(response.data.message || 'เพิ่มรีวิวสำเร็จ');
            navigate('/reviews');
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setErrorMessage(validationMessage || error.response?.data?.message || 'ไม่สามารถเพิ่มรีวิวได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container py-4 mb-5" style={{ maxWidth: '700px' }}>
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                    <h1 className="h3 fw-bold mb-1">เขียนรีวิวอุปกรณ์ IT</h1>
                    <p className="text-secondary mb-4">แบ่งปันประสบการณ์การใช้งานอุปกรณ์</p>
                    {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold" htmlFor="review-category">หมวดหมู่</label>
                            <select id="review-category" className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold" htmlFor="gadget-name">ชื่ออุปกรณ์</label>
                            <input id="gadget-name" className="form-control" value={gadgetName} onChange={(event) => setGadgetName(event.target.value)} maxLength="255" required />
                        </div>
                        <fieldset className="mb-3">
                            <legend className="form-label fw-semibold">คะแนน: {rating} / 5 ดาว</legend>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" className={`btn ${score <= rating ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setRating(score)}>{score} ดาว</button>)}
                            </div>
                        </fieldset>
                        <div className="mb-4">
                            <label className="form-label fw-semibold" htmlFor="review-content">รายละเอียดรีวิว</label>
                            <textarea id="review-content" className="form-control" rows="5" value={content} onChange={(event) => setContent(event.target.value)} required />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light border" onClick={() => navigate(-1)}>ยกเลิก</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'ส่งรีวิว'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
