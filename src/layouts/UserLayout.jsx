import { Outlet } from 'react-router-dom';
import Footer from '../components/navigation/Footer';
import UserNavbar from '../components/navigation/UserNavbar';

export default function UserLayout() {
    return (
        <div className="user-site-shell d-flex flex-column min-vh-100">
            <UserNavbar />
            <main className="user-main flex-grow-1" id="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
