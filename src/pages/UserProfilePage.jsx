import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function UserProfilePage() {
    const { userId } = useParams(); // รับ ID ของผู้ใช้จาก URL
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            // ดึงข้อมูลโปรไฟล์ผู้ใช้และรีวิวที่ได้รับ
            const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`);
            setProfile(response.data.user);
            setReviews(response.data.reviews);
        } catch (error) {
            console.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดโปรไฟล์...</div>;
    if (!profile) return <div className="text-center py-10 text-red-500">ไม่พบข้อมูลผู้ใช้งานนี้</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            {/* ข้อมูลส่วนหัวโปรไฟล์ */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6 mb-6">
                <img 
                    src={profile.avatar ? `http://127.0.0.1:8000/storage/${profile.avatar}` : 'https://via.placeholder.com/150'} 
                    alt={profile.name} 
                    className="w-24 h-24 rounded-full object-cover shadow-md border"
                />
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                    <p className="text-sm text-gray-500 mb-2">สมาชิกตั้งแต่: {new Date(profile.created_at).toLocaleDateString('th-TH')}</p>
                    
                    {/* คะแนนเฉลี่ยดาว */}
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="font-semibold text-gray-700">
                            {profile.average_rating ? Number(profile.average_rating).toFixed(1) : 'ยังไม่มีเรตติ้ง'}
                        </span>
                        <span className="text-xs text-gray-400">({reviews.length} รีวิว)</span>
                    </div>
                </div>

                {/* ปุ่มไปหน้าเขียนรีวิว */}
                <Link 
                    to={`/users/${profile.id}/review`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow"
                >
                    ⭐ เขียนรีวิวผู้ใช้นี้
                </Link>
            </div>

            {/* รายการรีวิวทั้งหมด */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">💬 ความคิดเห็นจากสมาชิกท่านอื่น</h2>

                {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">ยังไม่มีรีวิวสำหรับผู้ใช้นี้</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div key={rev.id} className="border border-gray-100 bg-gray-50 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={rev.reviewer?.avatar ? `http://127.0.0.1:8000/storage/${rev.reviewer.avatar}` : 'https://via.placeholder.com/40'} 
                                            alt={rev.reviewer?.name} 
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{rev.reviewer?.name || 'ผู้ใช้งานทั่วไป'}</h4>
                                            <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString('th-TH')}</span>
                                        </div>
                                    </div>
                                    {/* ดาวรีวิวในแต่ละโพสต์ */}
                                    <div className="text-yellow-400 text-sm">
                                        {Array.from({ length: rev.rating }).map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm pl-13">{rev.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}