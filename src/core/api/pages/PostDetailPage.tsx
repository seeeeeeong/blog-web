import { useCallback, useEffect, useRef, useState } from "react";
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
import { Spinner } from "../components/common/Spinner";
import { calculateWordCount } from "../../support/converter/format";

function formatPrettyDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readMinutes(content: string | undefined): number {
  if (!content) return 1;
  const words = calculateWordCount(content);
  return Math.max(1, Math.round(words / 200));
}

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

  const fetchPost = useCallback((id: number) => {
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
  }, [navigate]);

  useEffect(() => {
    if (parsedId == null) return;
    fetchPost(parsedId);
    return () => {
      requestIdRef.current += 1;
    };
  }, [parsedId, fetchPost]);

  const handleDelete = async () => {
    try {
      await postApi.deletePost(Number(rawPostId));
      navigate("/");
    } catch {
      showError("Failed to delete post.");
    }
  };

  const categoryName = post
    ? categories.find((c) => c.id === post.categoryId)?.name ?? "etc"
    : "";

  if (parsedId == null) {
    return (
      <div className="max-w-[760px] mx-auto px-6 md:px-10 py-24 text-center">
        <p className="font-meta text-[11px] text-danger mb-4 tracking-[0.08em] uppercase">
          404 · Not found
        </p>
        <Link to="/" className="text-[13px] text-muted hover:text-ink transition-colors">
          ← Home
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
      <div className="max-w-[760px] mx-auto px-6 md:px-10 py-24 text-center">
        <p className="font-meta text-[11px] text-danger mb-4 tracking-[0.08em] uppercase">
          Failed to load post
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchPost(parsedId)}
            className="h-8 px-3 border border-rule rounded-md font-meta text-[11.5px] text-muted hover:border-ink hover:text-ink transition-colors"
          >
            retry
          </button>
          <Link
            to="/"
            className="h-8 px-3 font-meta text-[11.5px] text-muted hover:text-ink inline-flex items-center transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const readTime = readMinutes(post.content);
  const wordCount = calculateWordCount(post.content ?? "");
  const isDraft = post.status === "DRAFT";

  return (
    <div className="px-6 md:px-10 py-7 md:py-8">
      <div className="max-w-[860px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5 flex-wrap">
          <Link to="/" className="hover:text-ink transition-colors">
            seeeeeeong.log
          </Link>
          <span className="text-faint">/</span>
          <Link
            to={`/?category=${post.categoryId}`}
            className="hover:text-ink transition-colors"
          >
            {categoryName}
          </Link>
          <span className="text-faint">/</span>
          <span className="text-ink font-medium truncate">{post.title}</span>
        </div>

        <article>
          {/* Article head */}
          <header className="mb-7">
            <div className="flex items-center gap-1.5 mb-3.5">
              <span className="tag-chip">{categoryName.toLowerCase()}</span>
              {isDraft && (
                <span className="status-chip draft">
                  <span className="dot" />
                  Draft
                </span>
              )}
            </div>

            <h1 className="text-[30px] md:text-[32px] font-bold tracking-[-0.02em] leading-[1.2] text-ink mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 text-[13px] text-muted flex-wrap">
              <span className="inline-flex items-center gap-2">
                <span className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-accent to-[oklch(0.55_0.16_300)]" />
                <span className="font-medium text-ink">seeeeeeong</span>
              </span>
              <span className="text-faint">·</span>
              <span className="font-meta text-[12px]">{formatPrettyDate(post.createdAt)}</span>
              <span className="text-faint">·</span>
              <span>{readTime} min read</span>
              <span className="text-faint">·</span>
              <span>{wordCount.toLocaleString()} words</span>
              {!isDraft && (
                <>
                  <span className="text-faint">·</span>
                  <span className="status-chip published">
                    <span className="dot" />
                    Published
                  </span>
                </>
              )}
              {isAuthor && (
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to={`/posts/${parsedId}/edit`}
                    className="h-7 px-3 inline-flex items-center rounded-md text-[12px] text-muted hover:bg-chip hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="h-7 px-3 inline-flex items-center rounded-md text-[12px] text-danger hover:bg-[var(--c-input)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </header>

          {post.excerpt && (
            <section className="mb-8 rounded-2xl border border-rule bg-[var(--c-surface)] px-4 py-3.5 text-[14px] leading-[1.6] text-muted">
              <span className="font-semibold text-ink">Case summary</span>
              <span className="text-faint mx-2">—</span>
              {post.excerpt}
            </section>
          )}

          {/* Body */}
          <div className="mb-10">
            <MarkdownViewer contentHtml={post.contentHtml} />
          </div>

          {/* Similar posts */}
          <div className="mb-10 pt-6 border-t border-rule">
            <SimilarPosts postId={parsedId} />
          </div>

          {/* Comments */}
          <CommentSection postId={parsedId} />
        </article>
      </div>
    </div>
  );
}
