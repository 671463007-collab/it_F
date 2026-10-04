import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data || []);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'โหลดหมวดหมู่ไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        try {
            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, { name, is_active: editingCategory.is_active });
            } else {
                await api.post('/admin/categories', { name });
            }
            setName('');
            setEditingCategory(null);
            await fetchCategories();
        } catch (error) {
            const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
            setErrorMessage(validationMessage || error.response?.data?.message || 'บันทึกหมวดหมู่ไม่สำเร็จ');
        }
    };

    const toggleActive = async (category) => {
        setErrorMessage('');
        try {
            await api.put(`/admin/categories/${category.id}`, { name: category.name, is_active: !category.is_active });
            await fetchCategories();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'เปลี่ยนสถานะหมวดหมู่ไม่สำเร็จ');
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('ต้องการลบหมวดหมู่นี้หรือไม่?')) return;
        setErrorMessage('');
        try {
            await api.delete(`/admin/categories/${id}`);
            setCategories((current) => current.filter((category) => category.id !== id));
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'ลบหมวดหมู่ไม่สำเร็จ');
        }
    };

    if (loading) return <div className="py-5 text-center">กำลังโหลดหมวดหมู่...</div>;

    return (
        <section className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">จัดการหมวดหมู่</h1>
            <p className="text-secondary mb-4">เพิ่ม แก้ไข เปิด/ปิด และลบหมวดหมู่</p>
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            {editingCategory && <div className="alert alert-primary" role="status">กำลังแก้ไขหมวดหมู่: {editingCategory.name}</div>}
            <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                <div className="col-12 col-md-7"><label className="visually-hidden" htmlFor="category-name">ชื่อหมวดหมู่</label><input id="category-name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} placeholder="ชื่อหมวดหมู่" maxLength="255" required /></div>
                <div className="col-auto d-flex gap-2">
                    <button type="submit" className="btn btn-primary">{editingCategory ? 'บันทึกชื่อ' : 'เพิ่มหมวดหมู่'}</button>
                    {editingCategory && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditingCategory(null); setName(''); }}>ยกเลิก</button>}
                </div>
            </form>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>ชื่อหมวดหมู่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                    <tbody>
                        {categories.map((category) => <tr key={category.id}>
                            <td>{category.name}</td>
                            <td><button type="button" className={`btn btn-sm ${category.is_active ? 'btn-outline-success' : 'btn-outline-secondary'}`} onClick={() => toggleActive(category)}>{category.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}</button></td>
                            <td><div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setEditingCategory(category); setName(category.name); }}>แก้ไข</button><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(category.id)}>ลบ</button></div></td>
                        </tr>)}
                        {categories.length === 0 && <tr><td colSpan="3" className="text-center text-secondary py-4">ยังไม่มีหมวดหมู่</td></tr>}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
