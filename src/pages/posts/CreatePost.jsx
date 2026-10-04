import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { addTimestampToImageFilename, validateImageFile } from "../../utils/imageUpload";

const allowedPostImageTypes = ["image/jpeg", "image/png", "image/webp"];

function CreatePost() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [postType, setPostType] = useState("exchange");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gadgetName, setGadgetName] = useState("");
  const [conditionPercent, setConditionPercent] = useState(100);
  const [lookingFor, setLookingFor] = useState("");
  const [description, setDescription] = useState("");

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [imageSelectionError, setImageSelectionError] = useState("");

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
    const selectedFiles = Array.from(e.target.files || []);
    const files = selectedFiles
      .filter((file) => !validateImageFile(file, allowedPostImageTypes))
      .map((file, index) => addTimestampToImageFilename(file, "post-image", index));
    setImageFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    if (files.length !== selectedFiles.length) {
      const validationMessage = "รูปภาพต้องเป็น JPG, PNG หรือ WEBP และมีขนาดไม่เกิน 2MB ต่อรูป";
      setImageSelectionError(validationMessage);
      setErrorMsg(validationMessage);
    } else {
      setImageSelectionError("");
      setErrorMsg("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageSelectionError) {
      setErrorMsg(imageSelectionError);
      return;
    }
    setErrorMsg("");

    if (!categoryId) {
      setErrorMsg("กรุณาเลือกหมวดหมู่");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("post_type", postType);
    formData.append("title", title);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    if (postType === "exchange") {
      formData.append("condition_percent", conditionPercent);
      formData.append("looking_for", lookingFor);
    } else {
      formData.append("gadget_name", gadgetName);
    }

    imageFiles.forEach((file) => formData.append("images[]", file));

    api
      .post("/exchange-posts", formData)
      .then((res) => {
        alert(res.data.message || "ลงประกาศแล้ว");
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
          "บันทึกประกาศไม่สำเร็จ กรุณาลองใหม่";
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container post-form-page py-4 py-lg-5 mb-4" style={{ maxWidth: "820px" }}>
      <div className="card listing-form-card">
        <div className="card-header listing-form-header">
          <span className="marketplace-kicker">ส่งต่ออุปกรณ์ให้คนที่กำลังหา</span>
          <h1 className="mb-0 fs-3 fw-bold">โพสต์</h1>
        </div>
        <div className="card-body">
          {errorMsg && (
            <div className="alert alert-danger" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset className="mb-4">
              <legend className="form-label fw-bold">ประเภทโพสต์</legend>
              <div className="btn-group" role="group" aria-label="ประเภทโพสต์">
                <input className="btn-check" type="radio" name="postType" id="post-type-exchange" checked={postType === "exchange"} onChange={() => setPostType("exchange")} />
                <label className="btn btn-outline-primary" htmlFor="post-type-exchange">แลกเปลี่ยน</label>
                <input className="btn-check" type="radio" name="postType" id="post-type-discussion" checked={postType === "discussion"} onChange={() => setPostType("discussion")} />
                <label className="btn btn-outline-primary" htmlFor="post-type-discussion">รีวิว</label>
              </div>
            </fieldset>

            <div className="mb-3">
              <label className="form-label fw-bold">หัวข้อ <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="ต้องการแลกกับอะไรครับ"
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

              {postType === "exchange" ? <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  สภาพ (%) <span className="text-danger">*</span>
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
              </div> : <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">ชื่ออุปกรณ์ (ไม่บังคับ)</label>
                <input type="text" className="form-control" maxLength="255" value={gadgetName} onChange={(e) => setGadgetName(e.target.value)} placeholder="เช่น iPhone 15, AirPods Pro 2" />
              </div>}
            </div>

            {postType === "exchange" && <div className="mb-3">
              <label className="form-label fw-bold">
                ต้องการแลกกับ
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="อยากแลกกับอะไรครับบบ"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              />
            </div>}

            <div className="mb-3">
              <label className="form-label fw-bold">
                รายละเอียดอุปกรณ์ <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="อธิบายรายละเอียดการใช้งาน ตำหนิ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">รูปภาพ</label>
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
                <p className="small text-muted mb-1">ตัวอย่างรูปภาพ</p>
                <div className="d-flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <img key={url} src={url} alt={`รูปที่เลือก ${index + 1}`} className="img-thumbnail" style={{ width: "120px", height: "100px", objectFit: "contain" }} />
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
