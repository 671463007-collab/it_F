import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    api
      .post("/login", { email, password })
      .then((response) => {
        sessionStorage.removeItem("banned-session-notified");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate(response.data.user.role === "admin" ? "/admin/dashboard" : "/");
      })
      .catch((error) => {
        if (error.response && error.response.data.message) {
          setErrorMsg(error.response.data.message);
        } else {
          setErrorMsg("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container auth-page py-5">
      <div className="auth-card">
      <div className="auth-brand"><span className="brand-mark">IT</span><span>ไอทีมือสอง</span></div>
      <h2 className="text-center mb-4">เข้าสู่ระบบ</h2>

      {/* Alert เปลี่ยนมาใช้ div คลาสธรรมดา */}
      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Floating Label แบบ Bootstrap เพียว */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="floatingEmail"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="floatingEmail">อีเมล</label>
        </div>

        {/* Floating Label แบบ Bootstrap เพียว */}
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="floatingPassword">รหัสผ่าน</label>
        </div>

        {/* ปุ่ม Submit แบบคลาสธรรมดา */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <p className="text-center mt-3">
        ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
      </p>
      </div>
    </div>
  );
}

export default Login;