import api from '../api/axios';

export default async function logout(navigate) {
    try {
        if (localStorage.getItem('token')) await api.post('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }
}
