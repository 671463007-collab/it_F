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
            .then((response) => setCategories(response.data))
            .catch((error) => {
                console.error('ไม่สามารถโหลดหมวดหมู่ได้:', error);
                setErrorMessage('ไม่สามารถโหลดหมวดหมู่ได้');
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            navigate('/');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งรีวิว:', error);
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setErrorMessage(validationMessage || error.response?.data?.message || 'ไม่สามารถส่งรีวิวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">เขียนรีวิวอุปกรณ์</h1>
            <p className="text-sm text-gray-500 mb-6">รีวิวอุปกรณ์ไอทีตามหมวดหมู่และรุ่นสินค้า</p>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="review-category">หมวดหมู่</label>
                    <select id="review-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required className="w-full border rounded-lg px-3 py-2">
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="gadget-name">ชื่ออุปกรณ์</label>
                    <input id="gadget-name" value={gadgetName} onChange={(event) => setGadgetName(event.target.value)} required maxLength="255" className="w-full border rounded-lg px-3 py-2" placeholder="เช่น Mechanical Keyboard รุ่น..." />
                </div>

                {/* เลือกระดับคะแนนดาว */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">คะแนนความพึงพอใจ ({rating} / 5 ดาว)</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-3xl focus:outline-none transition ${
                                    star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                                }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* กล่องข้อความรีวิว */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="review-content">เนื้อหารีวิว</label>
                    <textarea 
                        id="review-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="4" 
                        placeholder="เช่น จัดส่งไว สินค้าตรงปกตามที่คุยกัน นิสัยเป็นกันเอง แนะนำเลยครับ!" 
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                {/* ปุ่มกดส่งรีวิว */}
                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition duration-200 text-sm"
                    >
                        ย้อนกลับ
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 shadow-md disabled:bg-gray-400 text-sm"
                    >
                        {loading ? 'กำลังบันทึก...' : '🚀 ส่งรีวิว'}
                    </button>
                </div>
            </form>
        </div>
    );
}