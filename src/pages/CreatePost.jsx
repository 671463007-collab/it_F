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

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

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

  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
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

    imageFiles.forEach((file) => formData.append("images[]", file));

    api
      .post("/exchange-posts", formData)
      .then((res) => {
        alert(res.data.message || "สร้างประกาศเรียบร้อยแล้ว");
        navigate("/my-posts");
      })
      .catch((err) => {
        console.error("Create post error:", err);
        const validationMessage = Object.values(
          err.response?.data?.errors || {}
        ).flat()[0];
        const msg =
          validationMessage ||
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
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
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
              />
              <div className="form-text">
                เลือกได้หลายรูป รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 2MB ต่อรูป
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="mb-3">
                <p className="small text-muted mb-1">ตัวอย่างรูปภาพ:</p>
                <div className="d-flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <img key={url} src={url} alt={`Preview ${index + 1}`} className="img-thumbnail" style={{ width: "120px", height: "100px", objectFit: "contain" }} />
                  ))}
                </div>
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
