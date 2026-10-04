import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateExchangePost() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    condition_percent: 100,
    looking_for: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
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

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const validType = ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
      return validType && file.size <= 2 * 1024 * 1024;
    });

    if (validFiles.length !== files.length) {
      setErrorMessage("รูปภาพต้องเป็น JPG, PNG หรือ WEBP และมีขนาดไม่เกิน 2MB ต่อไฟล์");
    } else {
      setErrorMessage("");
    }

    setImages(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.category_id) {
      setErrorMessage("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }

    setLoading(true);
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    images.forEach((file) => data.append("images[]", file));

    try {
      const response = await api.post("/exchange-posts", data);
      alert(response.data.message || "ลงประกาศเรียบร้อยแล้ว");
      navigate("/my-posts");
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      setErrorMessage(firstError || error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 mb-5" style={{ maxWidth: "760px" }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4">
            <h2 className="fw-bold mb-1">ลงประกาศขอแลกเปลี่ยนอุปกรณ์ IT</h2>
            <p className="text-muted mb-0">กรอกรายละเอียดอุปกรณ์และสิ่งที่ต้องการแลก</p>
          </div>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">หมวดหมู่สินค้า</label>
              <select className="form-select" name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">หัวข้อประกาศ</label>
              <input className="form-control" name="title" value={form.title} onChange={handleChange}
                placeholder="เช่น ต้องการแลกการ์ดจอ RTX 3060" required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">รายละเอียดสินค้า</label>
              <textarea className="form-control" name="description" rows="5" value={form.description}
                onChange={handleChange} placeholder="ระบุสเปก การใช้งาน ตำหนิ ประกัน และอุปกรณ์ที่มีให้" required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex justify-content-between">
                <span>สภาพสินค้า</span><span>{form.condition_percent}%</span>
              </label>
              <input className="form-range" type="range" name="condition_percent" min="0" max="100"
                value={form.condition_percent} onChange={handleChange} />
              <div className="d-flex justify-content-between text-muted small">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">สิ่งที่ต้องการแลก</label>
              <input className="form-control" name="looking_for" value={form.looking_for} onChange={handleChange}
                placeholder="เช่น CPU Ryzen 5 หรือรุ่นที่ใกล้เคียง" />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">รูปภาพสินค้า</label>
              <input className="form-control" type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange} />
              <div className="form-text">เลือกได้หลายรูป ขนาดไม่เกิน 2MB ต่อไฟล์</div>
            </div>

            {previews.length > 0 && (
              <div className="row g-2 mb-4">
                {previews.map((src, index) => (
                  <div className="col-6 col-md-3" key={src}>
                    <img src={src} alt={`Preview ${index + 1}`} className="img-fluid rounded border"
                      style={{ width: "100%", height: "130px", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light border" onClick={() => navigate(-1)}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "ลงประกาศ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateExchangePost;
