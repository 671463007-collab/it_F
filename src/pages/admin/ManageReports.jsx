import { useEffect, useState } from "react";
import api from "../../api/axios";

function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await api.get("/admin/reports");
      setReports(response.data?.data || []);
    } catch (error) {
      console.error("ไม่สามารถโหลดรายงานได้:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status });
      setReports((current) =>
        current.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะรายงานได้");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center text-muted">กำลังโหลดรายงาน...</div>;
  }

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-1">รายงานปัญหา</h2>
      <p className="text-muted mb-4">ตรวจสอบและจัดการรายงานจากผู้ใช้งาน</p>

      <div className="table-responsive bg-white border rounded">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>ผู้รายงาน</th>
              <th>ผู้ถูกรายงาน</th>
              <th>โพสต์</th>
              <th>เหตุผล</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {reports.length ? reports.map((report) => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>{report.reporter?.name || "-"}</td>
                <td>{report.reported_user?.name || "-"}</td>
                <td>{report.exchange_post?.title || "-"}</td>
                <td>{report.reason}</td>
                <td style={{ minWidth: "160px" }}>
                  <select
                    className="form-select form-select-sm"
                    value={report.status}
                    onChange={(e) => updateStatus(report.id, e.target.value)}
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="resolved">ดำเนินการแล้ว</option>
                    <option value="dismissed">ยกเลิก</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center text-muted py-4">ยังไม่มีรายงาน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageReports;
