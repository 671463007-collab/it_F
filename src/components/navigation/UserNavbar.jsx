import { Link, useNavigate } from "react-router-dom";
import logout from "../../utils/logout";

function UserNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="brand-mark" aria-hidden="true">IT</span>
          <span>มือสอง</span>
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
                <li className="nav-item me-3">
                  <Link className="btn btn-brand-light btn-sm" to="/create-post">
                    โพสต์
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link" to="/my-posts">โพสต์ของฉัน</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link" to="/my-reports">รายงานของฉัน</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link" to="/messages">แชท</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link" to="/profile">โปรไฟล์</Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => logout(navigate)}
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

export default UserNavbar;
