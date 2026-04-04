import { lazy, Suspense, type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./contexts/AlertContext";
import { GitHubAuthProvider } from "./contexts/GitHubAuthContext";
import Layout from "./components/common/Layout";
import { isAdminToken } from "./utils/authToken";
import Spinner from "./components/common/Spinner";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const PostCreatePage = lazy(() => import("./pages/PostCreatePage"));
const PostEditPage = lazy(() => import("./pages/PostEditPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const AdminPostsPage = lazy(() => import("./pages/AdminPostsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("accessToken");
  const isAdmin = token ? isAdminToken(token) : false;
  
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
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <Spinner />
              </div>
            }
          >
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

              <Route element={<Layout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </GitHubAuthProvider>
    </AlertProvider>
  );
}

export default App;
