import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import MyPostsPage from "./pages/MyPostsPage";
import ReviewPage from "./pages/ReviewPage";
import ReviewListPage from "./pages/ReviewListPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import UserProfilePage from "./pages/UserProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import ChatPage from "./pages/ChatPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePosts from "./pages/admin/ManagePosts";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageReports from "./pages/admin/ManageReports";
import ManageComments from "./pages/admin/ManageComments";
import AdminLogin from "./pages/admin/AdminLogin";

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/reviews/create" element={<ReviewPage />} />
        <Route path="/reviews" element={<ReviewListPage />} />
        <Route path="/my-reviews" element={<MyReviewsPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<ChatPage />} />
        
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/posts" element={<ManagePosts />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/comments" element={<ManageComments />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/reports" element={<ManageReports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;