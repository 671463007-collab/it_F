import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';

const statusLabels = {
    pending: { label: 'รอดำเนินการ', className: 'text-bg-warning' },
    resolved: { label: 'จัดการแล้ว', className: 'text-bg-success' },
    dismissed: { label: 'ปิดรายงาน', className: 'text-bg-secondary' },
};

export default function MyReportsPage() {
    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReports = useCallback(async () => {
        try {
            const response = await api.get('/my/reports', { params: { page } });
            setReports(response.data.data || []);
            setLastPage(response.data.last_page || 1);
            setError('');
        } catch (requestError) {
            console.error('ไม่สามารถโหลดรายงานของฉันได้:', requestError);
            setError(requestError.response?.data?.message || 'โหลดรายงานไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        Promise.resolve().then(fetchReports);
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') fetchReports();
        }, 10000);
        return () => window.clearInterval(intervalId);
    }, [fetchReports]);

    return (
        <main className="container page-surface py-4 py-lg-5">
            <div className="page-heading mb-4">
            <span className="marketplace-kicker">ติดตามเรื่องที่แจ้งไว้</span>
            <h1 className="h3 fw-bold mb-1">รายงานของฉัน</h1>
            <p className="text-secondary mb-4">ติดตามความคืบหน้าของรายงานที่คุณส่งให้ทีมงาน</p>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {loading && reports.length === 0 && !error && <div className="py-5 text-center">กำลังโหลดรายงาน...</div>}

            {!loading && !error && reports.length === 0 && (
                <div className="card card-body text-center text-secondary py-5">
                    ยังไม่มีรายงานที่คุณส่ง
                </div>
            )}

            {reports.length > 0 && (
                <div className="table-responsive report-table">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr><th>วันที่ส่ง</th><th>ผู้ถูกรายงาน</th><th>ประกาศ</th><th>เหตุผล</th><th>สถานะ</th></tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => {
                                const status = statusLabels[report.status] || { label: report.status, className: 'text-bg-secondary' };
                                return (
                                    <tr key={report.id}>
                                        <td>{new Date(report.created_at).toLocaleDateString('th-TH')}</td>
                                        <td>{report.reported_user?.name || 'ไม่พบข้อมูลผู้ใช้'}</td>
                                        <td>{report.exchange_post?.title || '—'}</td>
                                        <td className="text-break" style={{ minWidth: '180px' }}>{report.reason}</td>
                                        <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {lastPage > 1 && (
                <nav className="mt-3" aria-label="หน้ารายงานของฉัน">
                    <ul className="pagination justify-content-center">
                        {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => (
                            <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
                                <button type="button" className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </main>
    );
}
