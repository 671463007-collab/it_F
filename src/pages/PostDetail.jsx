import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // State สำหรับฟอร์มคอมเมนต์หลัก / ตอบกลับ
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  // State สำหรับจัดการการกดปุ่มตอบกลับ (Reply) แยกตามรายคอมเมนต์
  const [replyingTo, setReplyingTo] = useState(null); // เก็บ ID ของคอมเมนต์ที่กำลังจะตอบกลับ
  const [replyText, setReplyText] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

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

  // ส่งคอมเมนต์หลัก / รีวิว
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
        content: commentText,
        rating: Number(rating),
      })
      .then(() => {
        setCommentText("");
        setRating(5);
        fetchPostDetail();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "ไม่สามารถส่งความคิดเห็นได้");
      })
      .finally(() => setSubmitting(false));
  };

  const handleLike = () => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      navigate("/login");
      return;
    }

    setLiking(true);
    api
      .post(`/exchange-posts/${id}/like`)
      .then((res) => {
        setPost((current) => ({
          ...current,
          is_liked: res.data.liked,
          likes_count: res.data.likes_count,
        }));
      })
      .catch((err) => {
        alert(err.response?.data?.message || "ไม่สามารถกดถูกใจได้");
      })
      .finally(() => setLiking(false));
  };

  // ส่งข้อความตอบกลับ (Reply) ในเธรด
  const handleReplySubmit = (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนตอบกลับ");
      navigate("/login");
      return;
    }

    api
      .post(`/exchange-posts/${id}/comments`, {
        content: replyText,
        parent_id: parentId, // ส่ง ID คอมเมนต์แม่ไป (ต้องให้หลังบ้านรองรับฟิลด์นี้)
        rating: null,
      })
      .then(() => {
        setReplyText("");
        setReplyingTo(null);
        fetchPostDetail();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "ไม่สามารถส่งข้อความตอบกลับได้");
      });
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;

    api
      .delete(`/comments/${commentId}`)
      .then(() => {
        fetchPostDetail();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบ");
      });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-body-tertiary">
        <div className="spinner-border text-dark" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-secondary fw-light">ไม่พบข้อมูลรายการที่คุณค้นหา</h3>
        <Link to="/" className="btn btn-dark rounded-pill px-4 mt-3">กลับสู่หน้าแรก</Link>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* Navigation Back */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-link text-decoration-none text-secondary p-0 d-inline-flex align-items-center gap-2 fw-medium"
          >
            <i className="bi bi-arrow-left fs-5"></i> ย้อนกลับ
          </button>
        </div>

        {/* รายละเอียดอุปกรณ์ & รูปภาพ */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
          <div className="row g-4">
            <div className="col-md-5">
              <div className="position-relative bg-dark rounded-3 overflow-hidden" style={{ height: "320px" }}>
                <img
                  src={
                    post.images && post.images.length > 0
                      ? post.images[0].image_url
                      : "https://placehold.co/600x400?text=No+Image"
                  }
                  className="w-100 h-100 object-fit-cover"
                  alt={post.title}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">
                    สภาพ {post.condition_percent}%
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${post.is_liked ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={handleLike}
                    disabled={liking}
                  >
                    <i className={`bi ${post.is_liked ? "bi-heart-fill" : "bi-heart"} me-1`}></i>
                    {liking ? "กำลังบันทึก..." : `ถูกใจ (${post.likes_count || 0})`}
                  </button>
                </div>
                <h2 className="fw-bold text-dark mb-3">{post.title}</h2>
                <p className="text-secondary small lh-lg" style={{ whiteSpace: "pre-line" }}>
                  {post.description}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted small">
                <span>ผู้โพสต์: <strong className="text-dark">{post.user?.name || "ผู้ใช้งาน"}</strong></span>
                <span>{new Date(post.created_at).toLocaleDateString("th-TH")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนความคิดเห็นและการสนทนาแบบเธรด */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <h4 className="fw-bold mb-4 text-dark">ความคิดเห็นและการสนทนา</h4>

          {/* ฟอร์มคอมเมนต์หลัก */}
          {token ? (
            <div className="p-3 p-md-4 rounded-4 bg-body-tertiary mb-5">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-3">
                  <textarea
                    className="form-control rounded-3 border-0 shadow-sm p-3"
                    rows="3"
                    placeholder="พิมพ์ข้อความสอบถาม หรือพูดคุยเกี่ยวกับสินค้า..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <select
                    className="form-select rounded-3 border-0 shadow-sm py-1 w-auto"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 ดาว)</option>
                    <option value="4">⭐⭐⭐⭐ (4 ดาว)</option>
                    <option value="3">⭐⭐⭐ (3 ดาว)</option>
                    <option value="2">⭐⭐ (2 ดาว)</option>
                    <option value="1">⭐ (1 ดาว)</option>
                  </select>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 py-2" disabled={submitting}>
                    {submitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="alert alert-secondary rounded-4 p-3 text-center bg-body-tertiary mb-5">
              กรุณา <Link to="/login" className="text-dark fw-bold">เข้าสู่ระบบ</Link> เพื่อร่วมสนทนา
            </div>
          )}

          {/* รายการคอมเมนต์ (แสดงผลแบบเธรดตอบกลับ) */}
          <div className="comment-thread-list">
            {post.comments && post.comments.length > 0 ? (
              // กรองเอาเฉพาะคอมเมนต์หลัก (ที่ไม่มี parent_id หรือเป็นระดับแรก)
              post.comments
                .filter((item) => !item.parent_id)
                .map((comment) => (
                  <div className="mb-4" key={comment.id}>
                    
                    {/* กล่องข้อความคอมเมนต์หลัก */}
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: "38px", height: "38px", fontSize: "0.9rem" }}>
                        {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-grow-1">
                        <div className="bg-body-tertiary p-3 rounded-4">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark small">{comment.user?.name || "ผู้ใช้งาน"}</span>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {new Date(comment.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mb-1 text-secondary small">{comment.comment || comment.content}</p>
                        </div>

                        {/* ปุ่มตอบกลับ (Reply) */}
                        <div className="d-flex align-items-center gap-3 mt-1 ms-2">
                          <button 
                            className="btn btn-link text-muted text-decoration-none p-0 fw-semibold" 
                            style={{ fontSize: "0.8rem" }}
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            ↳ ตอบกลับ
                          </button>
                          {user && user.id === comment.user_id && (
                            <button 
                              className="btn btn-link text-danger text-decoration-none p-0" 
                              style={{ fontSize: "0.8rem" }}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              ลบ
                            </button>
                          )}
                        </div>

                        {/* กล่องพิมพ์ข้อความสำหรับตอบกลับ (แสดงเฉพาะเมื่อคลิกปุ่มตอบกลับ) */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 ps-3 border-start border-2 border-primary">
                            <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                              <div className="input-group input-group-sm">
                                <input
                                  type="text"
                                  className="form-control rounded-start-pill px-3"
                                  placeholder={`ตอบกลับ ${comment.user?.name}...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  required
                                />
                                <button className="btn btn-dark rounded-end-pill px-3" type="submit">ส่ง</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* วนลูปแสดงข้อความลูก (Replies) ที่ตอบกลับคอมเมนต์นี้ */}
                        {post.comments
                          .filter((reply) => reply.parent_id === comment.id)
                          .map((reply) => (
                            <div className="d-flex align-items-start gap-2 mt-3 ms-4 ps-2 border-start border-2 border-secondary border-opacity-25" key={reply.id}>
                              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "0.75rem" }}>
                                {reply.user?.name ? reply.user.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="flex-grow-1">
                                <div className="bg-light p-3 rounded-4 border border-opacity-10">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-dark small">{reply.user?.name || "ผู้ใช้งาน"}</span>
                                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                      {new Date(reply.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="mb-0 text-secondary small">{reply.comment || reply.content}</p>
                                </div>
                                <div className="d-flex align-items-center gap-3 mt-1 ms-2">
                                  {user && user.id === reply.user_id && (
                                    <button 
                                      className="btn btn-link text-danger text-decoration-none p-0" 
                                      style={{ fontSize: "0.75rem" }}
                                      onClick={() => handleDeleteComment(reply.id)}
                                    >
                                      ลบ
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                      </div>
                    </div>

                  </div>
                ))
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-chat-square-dots display-6 opacity-50 mb-2 d-block"></i>
                <p className="small mb-0">ยังไม่มีบทสนทนา เป็นคนแรกที่เริ่มพูดคุยเลย!</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default PostDetail;