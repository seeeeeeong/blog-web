import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { postApi } from "../../../storage/post/postApi";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { Post } from "../../domain/post";
import type { Category } from "../../domain/category";
import { useAlert } from "../../support/contexts/useAlert";
import { MarkdownViewer } from "../components/editor/MarkdownViewer";
import { CommentSection } from "../components/comment/CommentSection";
import { SimilarPosts } from "../components/post/SimilarPosts";
import { CatTag } from "../components/common/CatTag";
import { Spinner } from "../components/common/Spinner";
import { formatDateLong } from "../../support/converter/format";

function parsePostId(raw: string | undefined): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function PostDetailPage() {
  const { postId: rawPostId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [error, setError] = useState<"server_error" | null>(null);
  const { showError } = useAlert();

  const requestIdRef = useRef(0);
  const parsedId = parsePostId(rawPostId);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (parsedId == null) return;
    fetchPost(parsedId);
    return () => {
      requestIdRef.current += 1;
    };
  }, [parsedId]);

  function fetchPost(id: number) {
    const thisRequest = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    postApi
      .getPost(id)
      .then((data) => {
        if (thisRequest !== requestIdRef.current) return;
        setPost(data);
        const userId = localStorage.getItem("userId");
        setIsAuthor(userId === String(data.userId));
      })
      .catch((err: unknown) => {
        if (thisRequest !== requestIdRef.current) return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404) {
          navigate("/");
        } else {
          setError("server_error");
        }
      })
      .finally(() => {
        if (thisRequest === requestIdRef.current) setLoading(false);
      });
  }

  const handleDelete = async () => {
    try {
      await postApi.deletePost(Number(rawPostId));
      navigate("/");
    } catch {
      showError("Failed to delete post.");
    }
  };

  const categoryName = post
    ? (categories.find((c) => c.id === post.categoryId)?.name ?? "etc").toLowerCase()
    : "";

  if (parsedId == null) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-24 text-center">
        <p className="text-danger text-sm mb-4">Post not found.</p>
        <Link to="/" className="text-sm text-muted hover:text-ink">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (error === "server_error") {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-24 text-center">
        <p className="text-danger text-sm mb-4">Failed to load post.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchPost(parsedId)}
            className="h-9 px-4 rounded-md border border-border-dim hover:border-border-mid text-sm text-muted hover:text-ink transition-colors"
          >
            Retry
          </button>
          <Link
            to="/"
            className="h-9 px-4 rounded-md text-sm text-muted hover:text-ink inline-flex items-center transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-24 text-center">
        <p className="text-danger text-sm mb-4">Post not found.</p>
        <Link to="/" className="text-sm text-muted hover:text-ink">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <article className="max-w-[760px] mx-auto px-6 pt-10 pb-16">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors mb-10"
        >
          <span>←</span> All posts
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <CatTag name={categoryName} />
          <span className="font-mono text-[12px] text-faint">{formatDateLong(post.createdAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-tighter-plus mb-6 grad-text">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center justify-between pb-8 mb-10 border-b border-border-dim">
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cat-blue to-cat-purple flex items-center justify-center text-[11px] font-semibold text-white">
              S
            </div>
            <span className="text-ink">Sun Seong Lee</span>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link
                to={`/posts/${parsedId}/edit`}
                className="h-8 px-3 rounded-md border border-border-dim hover:border-border-mid text-[12px] text-muted hover:text-ink flex items-center transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="h-8 px-3 rounded-md border border-border-dim hover:border-danger text-[12px] text-muted hover:text-danger transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mb-16">
          <MarkdownViewer contentHtml={post.contentHtml} />
        </div>

        <SimilarPosts postId={parsedId} />

        <div className="mt-16">
          <CommentSection postId={parsedId} />
        </div>
      </article>
    </div>
  );
}
