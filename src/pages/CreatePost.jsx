import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreatePost() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [conditionPercent, setConditionPercent] = useState(100);
  const [lookingFor, setLookingFor] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ดึงรายการหมวดหมู่
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const data = res.data?.data || res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error categories:", err));
  }, []);

  // เมื่อเลือกรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  // ส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!categoryId) {
      setErrorMsg("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category_id", categoryId);
    formData.append("condition_percent", conditionPercent);
    formData.append("looking_for", lookingFor);
    formData.append("description", description);

    // ส่งชื่อฟิลด์เป็น "images[]" เพื่อให้ตรงกับ $request->hasFile('images') ใน Laravel Controller
    if (imageFile) {
      formData.append("images[]", imageFile);
    }

    api
      .post("/exchange-posts", formData, )
      .then((res) => {
        alert(res.data.message || "สร้างประกาศเรียบร้อยแล้ว");
        navigate("/");
      })
      .catch((err) => {
        console.error("Create post error:", err);
        const msg =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0 fs-5 fw-bold">ลงประกาศแลกเปลี่ยนอุปกรณ์</h4>
        </div>
        <div className="card-body">
          {errorMsg && (
            <div className="alert alert-danger" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">
                หัวข้อประกาศ <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="เช่น ต้องการแลก จอมอนิเตอร์ 24 นิ้ว"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  หมวดหมู่ <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  สภาพสินค้า (%) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="100"
                  value={conditionPercent}
                  onChange={(e) => setConditionPercent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                สิ่งของที่สนใจแลกเปลี่ยน (Looking For)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="เช่น คีย์บอร์ด Mechanical, เมาส์ไร้สาย หรือ สนใจทุกข้อเสนอ"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                รายละเอียดสินค้า <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="อธิบายรายละเอียดการใช้งาน ตำหนิ หรือเงื่อนไขเพิ่มเติม..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">อัปโหลดรูปภาพสินค้า</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="form-text">
                รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 2MB
              </div>
            </div>

            {previewUrl && (
              <div className="mb-3 text-center">
                <p className="small text-muted mb-1">ตัวอย่างรูปภาพ:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "บันทึกประกาศ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;