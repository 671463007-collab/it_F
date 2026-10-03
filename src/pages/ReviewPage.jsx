import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function ReviewPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    gadget_name: "",
    rating: 5,
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const data = res.data?.data || res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setErrorMessage("ไม่สามารถโหลดหมวดหมู่ได้"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.category_id) {
      setErrorMessage("กรุณาเลือกหมวดหมู่");
      return;
    }

    setLoading(true);
    try {
      await api.post("/reviews", form);
      alert("เพิ่มรีวิวเรียบร้อยแล้ว");
      navigate("/");
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      setErrorMessage(firstError || error.response?.data?.message || "ไม่สามารถเพิ่มรีวิวได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 mb-5" style={{ maxWidth: "700px" }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h2 className="fw-bold mb-1">เขียนรีวิวอุปกรณ์ IT</h2>
          <p className="text-muted mb-4">แบ่งปันประสบการณ์การใช้งานให้สมาชิกคนอื่น</p>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">หมวดหมู่</label>
              <select className="form-select" value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">ชื่ออุปกรณ์</label>
              <input className="form-control" value={form.gadget_name}
                onChange={(e) => setForm({ ...form, gadget_name: e.target.value })}
                placeholder="เช่น Logitech G Pro X Superlight" required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">คะแนน</label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star}
                    className={`btn ${star <= form.rating ? "btn-warning" : "btn-outline-secondary"}`}
                    onClick={() => setForm({ ...form, rating: star })}>
                    {star} ดาว
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">รายละเอียดรีวิว</label>
              <textarea className="form-control" rows="5" value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="เขียนข้อดี ข้อสังเกต หรือประสบการณ์การใช้งาน" required />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light border" onClick={() => navigate(-1)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "ส่งรีวิว"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;
