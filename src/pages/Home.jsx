import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [postType, setPostType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ดึงรายการหมวดหมู่
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const data = res.data?.data || res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Categories error:", err);
        setCategories([]);
      });
  }, []);

  // ดึงรายการโพสต์
  useEffect(() => {
    setLoading(true);
    api
      .get("/exchange-posts", {
        params: {
          keyword: keyword,
          category_id: categoryId,
          post_type: postType === "all" ? undefined : postType,
          page: currentPage,
        },
      })
      .then((res) => {
        // ข้อมูลจาก Controller paginate(10) ข้อมูลโพสต์จะอยู่ใน res.data.data
        const rawData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPosts(Array.isArray(rawData) ? rawData : []);
        setLastPage(res.data?.last_page || 1);
      })
      .catch((err) => {
        console.error("Posts error:", err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, postType, currentPage]);

  // ฟังก์ชันดึง URL รูปภาพจาก Accessor image_url ที่อยู่ใน PostImage.php
  const getImageUrl = (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      return "https://placehold.co/300x200?text=No+Image";
    }
    return images[0]?.image_url || "https://placehold.co/300x200?text=No+Image";
  };

  return (
    <div className="container mt-4 mb-5">
      <h1 className="h3 mb-4 fw-bold">โพสต์อุปกรณ์ไอที</h1>

      <ul className="nav nav-tabs mb-4" aria-label="ประเภทโพสต์">
        {[
          ["all", "ทั้งหมด"],
          ["exchange", "แลกเปลี่ยนอุปกรณ์"],
          ["discussion", "รีวิว / พูดคุย"],
        ].map(([type, label]) => (
          <li className="nav-item" key={type}>
            <button className={`nav-link ${postType === type ? "active" : ""}`} onClick={() => { setPostType(type); setCurrentPage(1); }}>
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* ช่องค้นหาและคัดกรอง */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder={postType === "discussion" ? "ค้นหาหัวข้อ รายละเอียด หรือชื่ออุปกรณ์..." : "ค้นหาหัวข้อ รายละเอียด หรือสิ่งที่ต้องการแลก..."}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- ทุกหมวดหมู่ --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="alert alert-light text-center py-5 border">
              <p className="text-muted mb-0">
                ยังไม่มีรายการอุปกรณ์ หรือไม่พบข้อมูลที่ตรงตามเงื่อนไข
              </p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
              {posts.map((post) => (
                <div className="col" key={post.id}>
                  <div className="card h-100 shadow-sm">
                    <img
                      src={getImageUrl(post.images)}
                      className="card-img-top"
                      alt={post.title || "อุปกรณ์"}
                      style={{ height: "180px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x200?text=No+Image";
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h2
                        className="card-title fw-bold mb-1 text-truncate"
                        title={post.title}
                      >
                        {post.title}
                          </h2>
                          <span className={`badge ${post.post_type === "discussion" ? "text-bg-info" : "text-bg-primary"}`}>
                            {post.post_type === "discussion" ? "รีวิว / พูดคุย" : "แลกเปลี่ยน"}
                          </span>
                        </div>
                      <p className="card-text text-muted small mb-2">
                        หมวดหมู่: {post.category?.name || "ทั่วไป"}
                      </p>
                      {post.post_type === "exchange" && <p className="card-text text-muted small mb-2">สภาพ: {post.condition_percent}%</p>}
                      {post.post_type === "discussion" && post.gadget_name && <p className="card-text text-muted small mb-2">อุปกรณ์: {post.gadget_name}</p>}
                      {post.post_type === "exchange" && post.looking_for && (
                        <div className="mb-3">
                          <span className="badge bg-info text-dark text-wrap text-start">
                            สนใจแลก: {post.looking_for}
                          </span>
                        </div>
                      )}
                      <div className="small text-secondary mb-3">
                        โดย {post.user?.name || "ผู้ใช้"} · {post.likes_count || 0} ถูกใจ · {post.comments_count || 0} ความคิดเห็น
                      </div>
                      <Link
                        to={`/posts/${post.id}`}
                        className="btn btn-primary mt-auto"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ปุ่มเปลี่ยนหน้า Pagination */}
          {lastPage > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                {Array.from({ length: lastPage }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${
                      i + 1 === currentPage ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default Home;