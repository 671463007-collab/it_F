import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function PostDetail() {
  const { id } = useParams(); // รับ ID โพสต์จาก URL
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // State สำหรับฟอร์มคอมเมนต์/ให้คะแนน
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // ดึงข้อมูล User ปัจจุบันเพื่อเช็กสิทธิ์แก้ไข/ลบความคิดเห็น
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // โหลดข้อมูลโพสต์และคอมเมนต์
  const fetchPostDetail = () => {
    setLoading(true);
    api
      .get(`/exchange-posts/${id}`)
      .then((response) => {
        setPost(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch post detail:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  // ส่งความคิดเห็นใหม่
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    api
      .post(`/exchange-posts/${id}/comments`, {
        comment: commentText,
        rating: Number(rating),
      })
      .then(() => {
        setCommentText("");
        setRating(5);
        fetchPostDetail(); // ดึงข้อมูลใหม่เพื่ออัปเดตคอมเมนต์หน้าเว็บ
      })
      .catch((err) => {
        alert(err.response?.data?.message || "ไม่สามารถส่งความคิดเห็นได้");
      })
      .finally(() => setSubmitting(false));
  };

  // ลบความคิดเห็นของตัวเอง
  const handleDeleteComment = (commentId) => {
    if (!window.confirm("คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;

    api
      .delete(`/comments/${commentId}`)
      .then(() => {
        fetchPostDetail(); // โหลดคอมเมนต์ใหม่หลังลบ
      })
      .catch((err) => {
        alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบความคิดเห็น");
      });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="container mt-5 text-center">ไม่พบข้อมูลรายการนี้</div>;
  }

  return (
    <div className="container my-5">
      {/* ส่วนรายละเอียดโพสต์ */}
      <div className="row g-4 mb-5">
        {/* ฝั่งรูปภาพ */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <img
              src={
                post.images && post.images.length > 0
                  ? post.images[0].image_url
                  : "https://placehold.co/600x400?text=No+Image"
              }
              className="card-img-top rounded"
              alt={post.title}
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* ฝั่งข้อมูลรายละเอียด */}
        <div className="col-md-6">
          <span className="badge bg-primary mb-2">
            {post.category?.name || "ทั่วไป"}
          </span>
          <h2 className="fw-bold mb-3">{post.title}</h2>
          <h5 className="text-muted mb-3">
            สภาพอุปกรณ์: <span className="text-success">{post.condition_percent}%</span>
          </h5>
          <hr />
          <p className="lead">{post.description}</p>
          <div className="alert alert-secondary mt-4">
            <small className="d-block text-muted">ผู้โพสต์: {post.user?.name || "ไม่ระบุ"}</small>
            <small className="d-block text-muted">
              วันที่ลงประกาศ: {new Date(post.created_at).toLocaleDateString("th-TH")}
            </small>
          </div>
        </div>
      </div>

      <hr />

      {/* ส่วนให้คะแนนและแสดงความคิดเห็น (Requirement ข้อ 3) */}
      <div className="row mt-5">
        <div className="col-lg-8 mx-auto">
          <h4 className="mb-4">ความคิดเห็นและคะแนนประเมิน</h4>

          {/* ฟอร์มเขียนคอมเมนต์ (สำหรับคนที่ล็อกอินแล้ว) */}
          {token ? (
            <div className="card p-4 shadow-sm mb-4 bg-light">
              <h5 className="mb-3">แสดงความคิดเห็นของคุณ</h5>
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-3">
                  <label className="form-label">ให้คะแนน (1 - 5 ดาว):</label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "กำลังบันทึก..." : "ส่งความคิดเห็น"}
                </button>
              </form>
            </div>
          ) : (
            <div className="alert alert-info">
              กรุณา <a href="/login">เข้าสู่ระบบ</a> เพื่อแสดงความคิดเห็นและให้คะแนน
            </div>
          )}

          {/* รายการคอมเมนต์ทั้งหมด */}
          <div className="comment-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((item) => (
                <div className="card mb-3 shadow-sm border-0" key={item.id}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 fw-bold">{item.user?.name || "ผู้ใช้งาน"}</h6>
                      <span className="text-warning">
                        {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                      </span>
                    </div>
                    <p className="card-text mb-2">{item.comment}</p>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(item.created_at).toLocaleString("th-TH")}
                      </small>

                      {/* แสดงปุ่มลบเฉพาะความคิดเห็นที่เป็นของผู้ใช้นั้นๆ */}
                      {user && user.id === item.user_id && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteComment(item.id)}
                        >
                          ลบความคิดเห็น
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-4">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;