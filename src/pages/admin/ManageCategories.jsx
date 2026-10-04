import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); // เก็บข้อมูลหมวดหมู่ที่กำลังแก้ไข
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันเพิ่มหรือบันทึกการแก้ไขหมวดหมู่
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (editingCategory) {
                // อัปเดตหมวดหมู่เดิม
                await api.put(`/admin/categories/${editingCategory.id}`, {
                    name,
                    is_active: editingCategory.is_active,
                });
                alert('แก้ไขหมวดหมู่เรียบร้อยแล้ว');
            } else {
                // สร้างหมวดหมู่ใหม่
                await api.post('/admin/categories', { name });
                alert('เพิ่มหมวดหมู่สำเร็จ');
            }

            setName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        }
    };

    // กดปุ่มแก้ไข
    const handleEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
    };

    // ยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setEditingCategory(null);
        setName('');
    };

    // สลับสถานะ Active / Inactive ของหมวดหมู่
    const handleToggleActive = async (category) => {
        setErrorMessage('');
        try {
            await api.put(`/admin/categories/${category.id}`, {
                name: category.name,
                is_active: !category.is_active
            });
            fetchCategories();
        } catch (error) {
            console.error('ไม่สามารถเปลี่ยนสถานะได้:', error);
            setErrorMessage(error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะหมวดหมู่ได้');
        }
    };

    // ลบหมวดหมู่
    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?')) return;

        try {
            await api.delete(`/admin/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
            alert('ลบหมวดหมู่เรียบร้อยแล้ว');
        } catch (error) {
            console.error('ไม่สามารถลบได้:', error);
            if (error.response && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('ไม่สามารถลบหมวดหมู่นี้ได้');
            }
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดหมวดหมู่...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">🏷️ จัดการหมวดหมู่สินค้า IT</h1>
            <p className="text-sm text-gray-500 mb-6">เพิ่ม แก้ไข หรือปิดใช้งานหมวดหมู่สำหรับโพสต์แลกเปลี่ยนอุปกรณ์</p>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {errorMessage}
                </div>
            )}

            {/* ฟอร์มเพิ่ม / แก้ไขหมวดหมู่ */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border mb-8 flex flex-col sm:flex-row gap-3 items-center">
                <input 
                    type="text" 
                    placeholder="ชื่อหมวดหมู่ (เช่น การ์ดจอ, CPU, โน้ตบุ๊ก)" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                    {editingCategory && (
                        <button 
                            type="button" 
                            onClick={handleCancelEdit}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto"
                        >
                            ยกเลิก
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition shadow w-full sm:w-auto ${
                            editingCategory ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {editingCategory ? 'บันทึกการแก้ไข' : '+ เพิ่มหมวดหมู่'}
                    </button>
                </div>
            </form>

            {/* ตารางแสดงรายการหมวดหมู่ */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b">
                            <th className="p-3">ID</th>
                            <th className="p-3">ชื่อหมวดหมู่</th>
                            <th className="p-3 text-center">สถานะ</th>
                            <th className="p-3 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 text-gray-500">#{cat.id}</td>
                                <td className="p-3 font-semibold text-gray-800">{cat.name}</td>
                                <td className="p-3 text-center">
                                    <button 
                                        onClick={() => handleToggleActive(cat)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                                            cat.is_active 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        {cat.is_active ? 'ใช้งานอยู่ (Active)' : 'ปิดใช้งาน (Inactive)'}
                                    </button>
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button 
                                        onClick={() => handleEdit(cat)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                                    >
                                        แก้ไข
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(cat.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}