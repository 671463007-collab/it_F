import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          IT Management System
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                หน้าหลัก
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center">
            {token ? (
              <>
                {/* เพิ่มปุ่มลงประกาศตรงนี้ */}
                <li className="nav-item me-3">
                  <Link className="btn btn-success btn-sm" to="/create-post">
                    + ลงประกาศ
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link text-white me-2">
                    สวัสดี, {user?.name}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    เข้าสู่ระบบ
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    สมัครสมาชิก
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;