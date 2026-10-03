import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReviewPage() {
    const { userId } = useParams(); // รับ ID ของผู้ใช้ที่ต้องการรีวิวจาก URL Params
    const navigate = useNavigate();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const token = localStorage.getItem('token');
            // สมมติ Endpoints สำหรับบันทึกรีวิวผู้ใช้
            await axios.post(`http://127.0.0.1:8000/api/users/${userId}/reviews`, {
                rating: rating,
                comment: comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('ส่งรีวิวสำเร็จ ขอบคุณสำหรับการแบ่งปันความคิดเห็น!');
            navigate(-1); // ย้อนกลับไปหน้าก่อนหน้า
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งรีวิว:', error);
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('ไม่สามารถส่งรีวิวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">⭐ เขียนรีวิวผู้ใช้งาน</h1>
            <p className="text-sm text-gray-500 mb-6">แบ่งปันประสบการณ์การแลกเปลี่ยนอุปกรณ์ไอทีกับสมาชิกท่านนี้</p>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="block text-gray-700 font-medium mb-1">ความคิดเห็นเพิ่มเติม</label>
                    <textarea 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
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