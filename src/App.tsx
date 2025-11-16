import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertProvider } from "./contexts/AlertContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";
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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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
          </Route>
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;