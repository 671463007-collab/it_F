import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  // เก็บ error เป็น object เพื่อรับค่า validation จาก Laravel (เช่น { email: ['The email has already been taken.'] })
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    api
      .post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation, // ตรงกับกฎ confirmed ของ Laravel
      })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      })
      .catch((error) => {
        if (error.response && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: ["เกิดข้อผิดพลาด ไม่สามารถสมัครสมาชิกได้"] });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "60px" }}>
      <h2 className="text-center mb-4">สมัครสมาชิก</h2>

      {/* Error รวม (General Error) */}
      {errors.general && (
        <div className="alert alert-danger" role="alert">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* ช่องกรอกชื่อ */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            id="floatingName"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="floatingName">ชื่อ</label>
          {/* แจ้งเตือนใต้ฟิลด์ */}
          {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
        </div>

        {/* ช่องกรอกอีเมล */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            id="floatingEmail"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="floatingEmail">อีเมล</label>
          {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
        </div>

        {/* ช่องกรอกรหัสผ่าน */}
        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="floatingPassword">รหัสผ่าน</label>
          {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>

        {/* ช่องยืนยันรหัสผ่าน */}
        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            id="floatingPasswordConfirm"
            placeholder="Confirm Password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <label htmlFor="floatingPasswordConfirm">ยืนยันรหัสผ่าน</label>
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>
      </form>

      <p className="text-center mt-3">
        มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;