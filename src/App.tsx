import { lazy, Suspense, type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./core/support/contexts/AlertContext";
import { Layout } from "./core/api/components/common/Layout";
import { checkIsAdmin } from "./core/support/auth/authToken";
import { Spinner } from "./core/api/components/common/Spinner";

const HomePage = lazy(() =>
  import("./core/api/pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const LoginPage = lazy(() =>
  import("./core/api/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const PostDetailPage = lazy(() =>
  import("./core/api/pages/PostDetailPage").then((m) => ({ default: m.PostDetailPage }))
);
const PostCreatePage = lazy(() =>
  import("./core/api/pages/PostCreatePage").then((m) => ({ default: m.PostCreatePage }))
);
const PostEditPage = lazy(() =>
  import("./core/api/pages/PostEditPage").then((m) => ({ default: m.PostEditPage }))
);
const AdminPostsPage = lazy(() =>
  import("./core/api/pages/AdminPostsPage").then((m) => ({ default: m.AdminPostsPage }))
);
const ChatPage = lazy(() =>
  import("./core/api/pages/ChatPage").then((m) => ({ default: m.ChatPage }))
);
const NotFoundPage = lazy(() =>
  import("./core/api/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function PrivateRoute({ children }: { children: JSX.Element }) {
  if (!checkIsAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function App() {
  return (
    <AlertProvider>
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

            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
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
    </AlertProvider>
  );
}
