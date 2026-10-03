import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateExchangePost() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    
    // ฟอร์มสเตตสำหรับเก็บข้อมูลสินค้า
    const [formData, setFormData] = useState({
        category_id: '',
        title: '',
        description: '',
        condition_percent: 100,
        looking_for: '',
    });
    
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // โหลดหมวดหมู่สินค้าทั้งหมดเมื่อเปิดหน้าเว็บ
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error('ไม่สามารถโหลดหมวดหมู่ได้:', err));
    }, []);

    // จัดการการเปลี่ยนแปลงของฟอร์มข้อความ
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // จัดการการเลือกรูปภาพหลายรูป
    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    // ส่งข้อมูลฟอร์มไปยัง Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const data = new FormData();
        data.append('category_id', formData.category_id);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('condition_percent', formData.condition_percent);
        data.append('looking_for', formData.looking_for);

        // แนบไฟล์รูปภาพทั้งหมดเข้า FormData
        for (let i = 0; i < images.length; i++) {
            data.append('images[]', images[i]);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/exchange-posts', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(response.data.message);
            navigate('/'); // พา กลับไปหน้าแรกหรือหน้าจัดการโพสต์
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            if (error.response && error.response.data.errors) {
                // ดึงข้อความแจ้งเตือน validation จาก Laravel มาแสดง
                const errors = Object.values(error.response.data.errors).flat();
                setErrorMessage(errors[0]);
            } else {
                setErrorMessage('เกิดข้อผิดพลาดในการสร้างโพสต์ กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 ลงประกาศขอแลกเปลี่ยนสินค้า IT</h1>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* เลือกหมวดหมู่ */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">หมวดหมู่สินค้า</label>
                    <select 
                        name="category_id" 
                        value={formData.category_id} 
                        onChange={handleChange} 
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* หัวข้อโพสต์ */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">หัวข้อประกาศ</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        placeholder="เช่น ต้องการแลกการ์ดจอ RTX 3060 กับรุ่นอื่น" 
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* รายละเอียดสินค้า */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">รายละเอียดสินค้าของคุณ</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="4" 
                        placeholder="ระบุสเปก ประกัน อุปกรณ์ที่มีให้ครบไหม ฯลฯ" 
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* สภาพสินค้า (%) */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">สภาพสินค้า ({formData.condition_percent}%)</label>
                    <input 
                        type="range" 
                        name="condition_percent" 
                        min="0" 
                        max="100" 
                        value={formData.condition_percent} 
                        onChange={handleChange} 
                        className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                    <span>0% (ใช้งานหนัก/มีตำหนิมาก)</span>
                        <span>50% (ปานกลาง)</span>
                        <span>100% (มือหนึ่ง / สภาพใหม่กริ๊ป)</span>
                    </div>
                </div>

                {/* สิ่งที่อยากแลก */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">สิ่งที่คุณอยากได้มาแลกเปลี่ยน (Looking For)</label>
                    <input 
                        type="text" 
                        name="looking_for" 
                        value={formData.looking_for} 
                        onChange={handleChange} 
                        placeholder="เช่น อยากแลกเป็น CPU Ryzen 5 หรือรุ่นที่เทียบเท่า" 
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* อัปโหลดรูปภาพหลายรูป */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">รูปภาพสินค้า (อัปได้หลายรูป)</label>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleImageChange} 
                        className="w-full border rounded-lg p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* ปุ่มกดส่งฟอร์ม */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 shadow-md disabled:bg-gray-400"
                >
                    {loading ? 'กำลังบันทึกข้อมูล...' : '🚀 ลงประกาศสินค้า'}
                </button>
            </form>
        </div>
    );
}