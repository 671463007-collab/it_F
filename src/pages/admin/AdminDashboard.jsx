import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        new_users_7_days: 0,
        banned_users: 0,
        total_posts: 0,
        open_posts: 0,
        total_comments: 0,
        total_likes: 0,
        total_reviews: 0,
        pending_posts: 0,
        pending_reports: 0,
        average_rating: 0,
        average_post_rating: 0,
        posts_by_category: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูลแดชบอร์ด...</div>;

    const metrics = [
        ['ผู้ใช้ทั้งหมด', stats.total_users],
        ['ผู้ใช้ใหม่ใน 7 วัน', stats.new_users_7_days],
        ['บัญชีถูกแบน', stats.banned_users],
        ['โพสต์ทั้งหมด', stats.total_posts],
        ['โพสต์ที่เปิดอยู่', stats.open_posts],
        ['คอมเมนต์ทั้งหมด', stats.total_comments],
        ['ไลค์ทั้งหมด', stats.total_likes],
        ['รีวิวอุปกรณ์ทั้งหมด', stats.total_reviews],
        ['คะแนนเฉลี่ยโพสต์แลกเปลี่ยน', `${Number(stats.average_post_rating || 0).toFixed(2)} / 5`],
        ['คะแนนเฉลี่ยรีวิวอุปกรณ์', `${Number(stats.average_rating || 0).toFixed(2)} / 5`],
        ['รายงานค้างอยู่', stats.pending_reports],
    ];

    return (
        <main className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">แดชบอร์ดผู้ดูแล</h1>
            <p className="text-secondary mb-4">สรุปสถานะระบบแลกเปลี่ยนอุปกรณ์ไอที</p>

            <section className="mb-4" aria-label="โพสต์รอตรวจสอบ">
                <div className="card border-warning border-2 bg-warning-subtle">
                    <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div><div className="text-uppercase small fw-bold text-warning-emphasis">ต้องดำเนินการ</div><h2 className="h5 mb-0">โพสต์รอตรวจสอบ</h2></div>
                        <div className="display-5 fw-bold text-warning-emphasis">{stats.pending_posts}</div>
                    </div>
                </div>
            </section>

            <section className="row g-3 mb-4" aria-label="สถิติระบบ">
                {metrics.map(([label, value]) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={label}>
                        <article className="card h-100 border-0 shadow-sm"><div className="card-body">
                            <div className="small text-secondary">{label}</div>
                            <div className="h3 fw-bold mb-0 mt-2">{value}</div>
                        </div></article>
                    </div>
                ))}
            </section>

            <section className="card border-0 shadow-sm">
                <div className="card-body">
                    <h2 className="h5 mb-3">โพสต์แยกตามหมวดหมู่</h2>
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                            <thead><tr><th>หมวดหมู่</th><th className="text-end">จำนวนโพสต์</th></tr></thead>
                            <tbody>
                                {(stats.posts_by_category || []).map((item) => (
                                    <tr key={item.category_id}><td>{item.category?.name || 'ไม่ระบุหมวดหมู่'}</td><td className="text-end">{item.total}</td></tr>
                                ))}
                                {(!stats.posts_by_category || stats.posts_by_category.length === 0) && <tr><td colSpan="2" className="text-center text-secondary">ยังไม่มีข้อมูล</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    );
}