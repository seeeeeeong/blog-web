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
import { Spinner } from "../components/common/Spinner";
import { calculateWordCount } from "../../support/converter/format";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatPrettyDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
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
    ? categories.find((c) => c.id === post.categoryId)?.name ?? "etc"
    : "";

  if (parsedId == null) {
    return (
      <div className="max-w-[760px] mx-auto px-6 md:px-10 py-24 text-center">
        <p className="font-meta text-[11px] text-danger mb-4 tracking-[0.1em] uppercase">
          404 · Not found
        </p>
        <Link to="/" className="font-meta text-[12px] text-muted hover:text-ink transition-colors">
          ← Back to the reading room
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
        <p className="font-meta text-[11px] text-danger mb-4 tracking-[0.1em] uppercase">
          Failed to load post
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchPost(parsedId)}
            className="h-8 px-3 border border-rule rounded-sm font-meta text-[11px] text-muted hover:border-ink hover:text-ink transition-colors"
          >
            :retry
          </button>
          <Link
            to="/"
            className="h-8 px-3 font-meta text-[11px] text-muted hover:text-ink inline-flex items-center transition-colors"
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

  return (
    <div className="px-6 md:px-10 pt-10 pb-16 animate-fade-in">
      <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-14">
        <article className="max-w-[720px] mx-auto lg:mx-0 w-full min-w-0">
          <div className="mb-6 font-meta text-[11px] text-muted tracking-[0.08em] uppercase">
            <Link to="/" className="hover:text-ink transition-colors">
              The Reading Room
            </Link>
            <span className="mx-2 text-faint">/</span>
            <Link
              to={`/?category=${post.categoryId}`}
              className="text-accent hover:underline"
            >
              {categoryName}
            </Link>
          </div>

          <h1 className="font-display text-[40px] md:text-[52px] font-normal leading-[1.02] tracking-[-0.025em] text-ink mb-6 text-balance">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-body italic text-[19px] md:text-[21px] text-ink-soft leading-[1.55] mb-8 text-pretty">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-meta text-[11px] text-muted tracking-[0.08em] uppercase py-4 border-t border-b border-rule mb-10">
            <span className="text-ink">by seeeeeeong</span>
            <span>{formatPrettyDate(post.createdAt)}</span>
            <span>{readTime} min read</span>
            <span>{wordCount.toLocaleString()} words</span>
            {isAuthor && (
              <div className="ml-auto flex items-center gap-3">
                <Link
                  to={`/posts/${parsedId}/edit`}
                  className="text-ink hover:text-accent transition-colors"
                >
                  :edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-danger hover:underline"
                >
                  :delete
                </button>
              </div>
            )}
          </div>

          <div className="mb-14">
            <MarkdownViewer contentHtml={post.contentHtml} />
          </div>

          <div className="text-center font-display text-rule text-[22px] tracking-[1em] pl-[1em] my-12">
            ❦❦❦
          </div>

          <div className="lg:hidden mb-14">
            <SimilarPosts postId={parsedId} />
          </div>

          <CommentSection postId={parsedId} />
        </article>

        <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start lg:h-fit">
          <SimilarPosts postId={parsedId} />
        </aside>
      </div>
    </div>
  );
}
