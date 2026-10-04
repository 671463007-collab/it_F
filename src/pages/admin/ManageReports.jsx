import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusLabels = {
    pending: 'รอตรวจสอบ',
    resolved: 'ดำเนินการแล้ว',
    dismissed: 'ยกเลิกคำร้อง',
};

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

    const updateStatus = async (reportId, status) => {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/status`, { status });
            setReports((currentReports) => currentReports.map((report) => (
                report.id === reportId ? response.data.report : report
            )));
        } catch (error) {
            alert(error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะรายงานได้');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลดรายงาน...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg mt-8 mb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">รายงานปัญหา</h1>
            <div className="mb-4" style={{ maxWidth: '320px' }}>
                <select className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                    <option value="">ทุกสถานะ</option>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase border-b">
                            <th className="p-3">ผู้รายงาน</th>
                            <th className="p-3">ผู้ถูกรายงาน</th>
                            <th className="p-3">โพสต์</th>
                            <th className="p-3">เหตุผล</th>
                            <th className="p-3">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {reports.map((report) => (
                            <tr key={report.id}>
                                <td className="p-3">{report.reporter?.name || '-'}</td>
                                <td className="p-3">{report.reported_user?.name || '-'}</td>
                                <td className="p-3">{report.exchange_post?.title || '-'}</td>
                                <td className="p-3">{report.reason}</td>
                                <td className="p-3">
                                    <select
                                        value={report.status}
                                        onChange={(event) => updateStatus(report.id, event.target.value)}
                                        className="border rounded px-2 py-1 bg-white"
                                    >
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr><td className="p-6 text-center text-gray-500" colSpan="5">ไม่มีรายงาน</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {lastPage > 1 && <nav className="mt-4" aria-label="หน้ารายงาน"><ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pageNumber) => <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(pageNumber)}>{pageNumber}</button></li>)}
            </ul></nav>}
        </div>
    );
}
