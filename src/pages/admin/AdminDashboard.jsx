import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        banned_users: 0,
        total_posts: 0,
        pending_posts: 0,
        total_reports: 0,
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

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 ภาพรวมระบบ (Dashboard)</h1>
            <p className="text-sm text-gray-500 mb-6">สรุปสถิติต่างๆ ภายในเว็บไซต์แลกเปลี่ยนและรีวิวอุปกรณ์ไอที</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">ผู้ใช้งานทั้งหมด</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.total_users}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">👥</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">โพสต์ทั้งหมด</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.total_posts}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xl">📦</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">โพสต์รอตรวจสอบ</p>
                        <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending_posts}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl text-xl">⏳</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">รายงานปัญหาค้างอยู่</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.total_reports}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xl">🚨</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">บัญชีที่ถูกแบน</p>
                        <h3 className="text-3xl font-bold text-gray-600 mt-1">{stats.banned_users}</h3>
                    </div>
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-xl text-xl">🚫</div>
                </div>
            </div>
        </div>
    );
}