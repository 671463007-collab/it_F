import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((res) => setProfile(res.data))
      .catch((error) => console.error("ไม่สามารถโหลดโปรไฟล์ได้:", error))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5 text-center text-muted">กำลังโหลดโปรไฟล์...</div>;
  if (!profile) return <div className="container py-5 text-center text-danger">ไม่พบข้อมูลผู้ใช้งานนี้</div>;

  return (
    <div className="container py-4 mb-5" style={{ maxWidth: "1000px" }}>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex flex-wrap align-items-center gap-4">
          <img src={profile.avatar_url} alt={profile.name} className="rounded-circle border"
            style={{ width: "90px", height: "90px", objectFit: "cover" }} />
          <div>
            <h2 className="fw-bold mb-1">{profile.name}</h2>
            <p className="text-muted mb-0">รายการแลกเปลี่ยนที่เปิดอยู่</p>
          </div>
        </div>
      </div>

      <h4 className="fw-bold mb-3">ประกาศของผู้ใช้งาน</h4>
      {profile.exchange_posts?.length ? (
        <div className="row g-3">
          {profile.exchange_posts.map((post) => (
            <div className="col-md-6" key={post.id}>
              <div className="card h-100 border-0 shadow-sm">
                {post.images?.[0]?.image_url && (
                  <img src={post.images[0].image_url} alt={post.title}
                    className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                )}
                <div className="card-body">
                  <h5 className="fw-bold">{post.title}</h5>
                  <p className="text-muted small">{post.description}</p>
                  <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm">
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light border text-center">ผู้ใช้งานนี้ยังไม่มีประกาศที่เปิดอยู่</div>
      )}
    </div>
  );
}

export default UserProfilePage;
