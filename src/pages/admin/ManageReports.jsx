import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusLabels = { pending: 'รอตรวจสอบ', resolved: 'จัดการแล้ว', dismissed: 'ปิดรายงาน' };

export default function ManageReports() {
    const [reports, setReports] = useState([]);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/admin/reports', { params: { status, page } })
            .then((response) => {
                setReports(response.data.data || []);
                setLastPage(response.data.last_page || 1);
            })
            .catch((error) => console.error('ไม่สามารถโหลดรายงานได้:', error))
            .finally(() => setLoading(false));
    }, [status, page]);

    const updateStatus = async (reportId, nextStatus) => {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/status`, { status: nextStatus });
            setReports((current) => current.map((report) => report.id === reportId ? response.data.report : report));
        } catch (error) {
            alert(error.response?.data?.message || 'อัปเดตสถานะรายงานไม่สำเร็จ');
        }
    };

    if (loading && reports.length === 0) return <div className="py-5 text-center">กำลังโหลดรายงาน...</div>;

    return (
        <section className="container-fluid px-0">
            <h1 className="h3 fw-bold mb-1">รายงานปัญหา</h1>
            <p className="text-secondary mb-4">ตรวจสอบและอัปเดตสถานะรายงาน</p>
            <div className="mb-3" style={{ maxWidth: '320px' }}>
                <label className="form-label" htmlFor="report-status-filter">กรองตามสถานะ</label>
                <select id="report-status-filter" className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                    <option value="">ทุกสถานะ</option>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </div>
            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>ผู้รายงาน</th><th>ผู้ถูกรายงาน</th><th>ประกาศ</th><th>เหตุผล</th><th>สถานะ</th></tr></thead>
                    <tbody>
                        {reports.map((report) => <tr key={report.id}>
                            <td>{report.reporter?.name || '-'}</td><td>{report.reported_user?.name || '-'}</td><td>{report.exchange_post?.title || '—'}</td><td>{report.reason}</td>
                            <td><select className="form-select form-select-sm" value={report.status} onChange={(event) => updateStatus(report.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                        </tr>)}
                        {reports.length === 0 && <tr><td colSpan="5" className="text-center text-secondary py-4">ไม่มีรายงาน</td></tr>}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-3" aria-label="หน้ารายงาน"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </section>
    );
}
