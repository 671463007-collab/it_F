import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/posts/Home";
import PostDetail from "./pages/posts/PostDetail";
import CreatePost from "./pages/posts/CreatePost";
import MyPostsPage from "./pages/posts/MyPostsPage";
import MyReportsPage from "./pages/reports/MyReportsPage";
import UserProfilePage from "./pages/profile/UserProfilePage";
import MyProfilePage from "./pages/profile/MyProfilePage";
import ChatPage from "./pages/chat/ChatPage";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePosts from "./pages/admin/ManagePosts";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategoriesPage";
import ManageReports from "./pages/admin/ManageReports";
import ManageComments from "./pages/admin/ManageComments";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    currentUser = null;
  }

  if (currentUser?.role === 'admin' && !isAdminRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<ChatPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/posts" element={<ManagePosts />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/comments" element={<ManageComments />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/reports" element={<ManageReports />} />
      </Route>
    </Routes>
  );
}

function App() {
  return <Router><AppRoutes /></Router>;
}

export default App;