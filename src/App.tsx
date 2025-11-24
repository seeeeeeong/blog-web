import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./contexts/AlertContext";
import { GitHubAuthProvider } from "./contexts/GitHubAuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AdminPostsPage from "./pages/AdminPostsPage";
import Layout from "./components/common/Layout";
import type { JSX } from "react";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAdmin = !!localStorage.getItem("userId");
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AlertProvider>
      <GitHubAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route 
                path="/posts/create" 
                element={
                  <PrivateRoute>
                    <PostCreatePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/posts/:postId/edit" 
                element={
                  <PrivateRoute>
                    <PostEditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/posts" 
                element={
                  <PrivateRoute>
                    <AdminPostsPage />
                  </PrivateRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GitHubAuthProvider>
    </AlertProvider>
  );
}

export default App;