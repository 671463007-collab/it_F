import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="app-footer text-light mt-auto py-4">
            <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                <Link to="/" className="text-white text-decoration-none fw-bold">
                    ไอทีมือสอง
                </Link>
                <nav className="d-flex flex-wrap justify-content-center gap-3" aria-label="ลิงก์ท้ายเว็บไซต์">
                    <Link to="/" className="text-white-50 text-decoration-none">หน้าหลัก</Link>
                    <Link to="/create-post" className="text-white-50 text-decoration-none">ลงประกาศ</Link>
                </nav>
                <small className="text-white-50">© ไอทีมือสอง</small>
            </div>
        </footer>
    );
}
