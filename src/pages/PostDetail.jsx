import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // A blank rating means this comment does not include a score.
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editCommentRating, setEditCommentRating] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
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

  const handleToggleLike = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLiking(true);
    try {
      const response = await api.post(`/exchange-posts/${id}/like`);
      setPost((currentPost) => ({
        ...currentPost,
        is_liked: response.data.liked,
        likes_count: response.data.likes_count,
      }));
    } catch (error) {
      alert(error.response?.data?.message || 'ไม่สามารถกดถูกใจได้');
    } finally {
      setLiking(false);
    }
  };

  const handleReport = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/reports', {
        reported_user_id: post.user_id,
        exchange_post_id: post.id,
        reason: reportReason,
      });
      setReporting(false);
      setReportReason('');
      setReportError('');
      alert(response.data.message || 'ส่งรายงานเรียบร้อยแล้ว');
    } catch (error) {
      const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
      setReportError(validationMessage || error.response?.data?.message || 'ส่งรายงานไม่สำเร็จ');
    }
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
        rating: rating ? Number(rating) : null,
      })
      .then(() => {
        setCommentText("");
        setRating("");
        fetchPostDetail();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "ไม่สามารถส่งความคิดเห็นได้");
      })
      .finally(() => setSubmitting(false));
  };

  const handleCommentUpdate = async (e, commentId) => {
    e.preventDefault();
    try {
      await api.put(`/comments/${commentId}`, {
        content: editCommentText,
        rating: editCommentRating ? Number(editCommentRating) : null,
      });
      setEditingCommentId(null);
      fetchPostDetail();
    } catch (error) {
      const validationMessage = Object.values(error.response?.data?.errors || {}).flat()[0];
      alert(validationMessage || error.response?.data?.message || "ไม่สามารถแก้ไขความคิดเห็นได้");
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("คุณต้องการลบทรุปแบบความเห็นนี้ใช่หรือไม่?")) return;

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
                  src={post.images?.[activeImageIndex]?.image_url || "https://placehold.co/600x400?text=No+Image"}
                  className="w-100 h-100 object-fit-cover"
                  alt={post.title}
                />
              </div>
              {post.images?.length > 1 && (
                <div className="d-flex gap-2 mt-2 overflow-auto">
                  {post.images.map((image, index) => (
                    <button key={image.id || image.image_path} className={`btn p-0 border ${index === activeImageIndex ? 'border-primary' : ''}`} onClick={() => setActiveImageIndex(index)} aria-label={`ดูรูปที่ ${index + 1}`}>
                      <img src={image.image_url} alt={`${post.title} รูปที่ ${index + 1}`} width="64" height="54" className="object-fit-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="col-md-7 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">
                    สภาพ {post.condition_percent}%
                  </span>
                  <button className={`btn btn-sm rounded-pill px-3 ${post.is_liked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={handleToggleLike} disabled={liking}>
                    <i className="bi bi-heart-fill me-1"></i> ถูกใจ ({post.likes_count || 0})
                  </button>
                </div>
                <h2 className="fw-bold text-dark mb-3">{post.title}</h2>
                <p className="small text-muted mb-2">หมวดหมู่: {post.category?.name || 'ไม่ระบุหมวดหมู่'}</p>
                <p className="text-secondary small lh-lg" style={{ whiteSpace: "pre-line" }}>
                  {post.description}
                </p>
                {post.looking_for && <p className="small"><strong>สิ่งที่ต้องการแลก:</strong> {post.looking_for}</p>}
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted small">
                <span>ผู้โพสต์: <Link className="text-dark fw-bold" to={`/users/${post.user_id}`}>{post.user?.name || "ผู้ใช้งาน"}</Link></span>
                <span>{new Date(post.created_at).toLocaleDateString("th-TH")}</span>
              </div>
              {token && Number(user?.id) !== Number(post.user_id) && (
                <Link className="btn btn-primary btn-sm mt-3 align-self-start" to={`/messages?user_id=${post.user_id}&exchange_post_id=${post.id}`}>
                  ส่งข้อความเกี่ยวกับประกาศนี้
                </Link>
              )}
              {token && Number(user?.id) !== Number(post.user_id) && (
                <div className="mt-3">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setReporting((current) => !current)}>{reporting ? 'ยกเลิก' : 'รายงานโพสต์'}</button>
                </div>
              )}
              {reporting && (
                <form className="mt-3" onSubmit={handleReport}>
                  <label className="form-label" htmlFor="post-report-reason">เหตุผลที่รายงาน</label>
                  <textarea id="post-report-reason" className="form-control mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)} required />
                  {reportError && <div className="text-danger small mb-2">{reportError}</div>}
                  <button className="btn btn-danger btn-sm" type="submit">ส่งรายงาน</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ความคิดเห็นและคะแนนของโพสต์ */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <h4 className="fw-bold mb-4 text-dark">ความคิดเห็นและคะแนน</h4>

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
                    <option value="">ไม่ให้คะแนน</option>
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

          {/* Flat comment list */}
          <div className="comment-thread-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
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
                          {comment.rating && (
                            <div className="text-warning small" aria-label={`คะแนน ${comment.rating} จาก 5 ดาว`}>
                              {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
                            </div>
                          )}
                          <p className="mb-1 text-secondary small">{comment.content}</p>
                        </div>

                        <div className="d-flex align-items-center gap-3 mt-1 ms-2">
                          {user && user.id === comment.user_id && (
                            <>
                              <button
                                className="btn btn-link text-muted text-decoration-none p-0"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.content);
                                  setEditCommentRating(comment.rating ? String(comment.rating) : "");
                                }}
                              >แก้ไข</button>
                              <button
                                className="btn btn-link text-danger text-decoration-none p-0"
                                onClick={() => handleDeleteComment(comment.id)}
                              >ลบ</button>
                            </>
                          )}
                        </div>

                        {editingCommentId === comment.id && (
                          <form className="mt-3" onSubmit={(event) => handleCommentUpdate(event, comment.id)}>
                            <textarea
                              className="form-control mb-2"
                              maxLength="1000"
                              value={editCommentText}
                              onChange={(event) => setEditCommentText(event.target.value)}
                              required
                            />
                            <div className="d-flex gap-2">
                              <select
                                className="form-select w-auto"
                                value={editCommentRating}
                                onChange={(event) => setEditCommentRating(event.target.value)}
                              >
                                <option value="">ไม่ให้คะแนน</option>
                                {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} ดาว</option>)}
                              </select>
                              <button className="btn btn-primary" type="submit">บันทึก</button>
                              <button className="btn btn-outline-secondary" type="button" onClick={() => setEditingCommentId(null)}>ยกเลิก</button>
                            </div>
                          </form>
                        )}

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