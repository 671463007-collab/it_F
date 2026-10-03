import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      const response = await api.get("/my/posts");
      setPosts(response.data?.data || []);
    } catch (error) {
      console.error("ไม่สามารถโหลดโพสต์ของคุณได้:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?")) return;

    try {
      await api.delete(`/exchange-posts/${id}`);
      setPosts((current) => current.filter((post) => post.id !== id));
      alert("ลบโพสต์เรียบร้อยแล้ว");
    } catch (error) {
      alert(error.response?.data?.message || "ไม่สามารถลบโพสต์ได้");
    }
  };

  const handleToggleStatus = async (post) => {
    const nextStatus = post.status === "open" ? "closed" : "open";

    try {
      await api.post(`/exchange-posts/${post.id}`, {
        category_id: post.category_id,
        title: post.title,
        description: post.description,
        condition_percent: post.condition_percent,
        looking_for: post.looking_for,
        status: nextStatus,
      });
      fetchMyPosts();
    } catch (error) {
      alert(error.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center text-muted">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="container py-4 mb-5" style={{ maxWidth: "1000px" }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">โพสต์ขอแลกเปลี่ยนของฉัน</h2>
          <p className="text-muted mb-0">จัดการประกาศและสถานะการแลกเปลี่ยน</p>
        </div>
        <Link to="/create-exchange-post" className="btn btn-primary">+ สร้างโพสต์ใหม่</Link>
      </div>

      {posts.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-muted">คุณยังไม่มีประกาศขอแลกเปลี่ยนสินค้า</div>
        </div>
      ) : (
        <div className="row g-3">
          {posts.map((post) => (
            <div className="col-12" key={post.id}>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between gap-3">
                    <div className="flex-grow-1">
                      <div className="mb-2">
                        <span className={`badge ${post.status === "open" ? "text-bg-success" : post.status === "closed" ? "text-bg-secondary" : "text-bg-warning"}`}>
                          {post.status === "open" ? "เปิดแลกเปลี่ยน" : post.status === "closed" ? "ปิดการแลกเปลี่ยน" : "รอตรวจสอบ"}
                        </span>
                        <span className="text-muted small ms-2">สภาพ {post.condition_percent}%</span>
                      </div>
                      <h5 className="fw-bold mb-1">{post.title}</h5>
                      <p className="text-muted mb-2">{post.description}</p>
                      {post.looking_for && <div className="small">ต้องการแลกกับ: {post.looking_for}</div>}
                    </div>
                    <div className="d-flex align-items-start gap-2">
                      {(post.status === "open" || post.status === "closed") && (
                        <button className={`btn btn-sm ${post.status === "open" ? "btn-outline-warning" : "btn-outline-success"}`}
                          onClick={() => handleToggleStatus(post)}>
                          {post.status === "open" ? "ปิดการแลก" : "เปิดอีกครั้ง"}
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(post.id)}>ลบ</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPostsPage;
