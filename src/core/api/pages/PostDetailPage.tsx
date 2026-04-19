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

function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function readMinutes(content: string | undefined): number {
  if (!content) return 1;
  const words = calculateWordCount(content);
  return Math.max(1, Math.round(words / 200));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "post";
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
    ? (categories.find((c) => c.id === post.categoryId)?.name ?? "etc").toLowerCase()
    : "";

  if (parsedId == null) {
    return (
      <div className="max-w-[760px] mx-auto px-8 py-24 text-center">
        <p className="text-danger text-[13px] mb-4">
          <span className="prompt-pink">!</span> cat: post not found
        </p>
        <Link to="/" className="text-[12px] text-muted hover:text-cat-green transition-colors">
          <span className="prompt-green">$</span> cd ~/blog
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
      <div className="max-w-[760px] mx-auto px-8 py-24 text-center">
        <p className="text-danger text-[13px] mb-4">
          <span className="prompt-pink">!</span> cat: failed to load post
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchPost(parsedId)}
            className="h-8 px-3 border border-border-mid text-[12px] text-muted hover:text-cat-green hover:border-cat-green transition-colors"
          >
            :retry
          </button>
          <Link
            to="/"
            className="h-8 px-3 text-[12px] text-muted hover:text-cat-green inline-flex items-center transition-colors"
          >
            <span className="prompt-green mr-1.5">$</span> cd ~
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[760px] mx-auto px-8 py-24 text-center">
        <p className="text-danger text-[13px] mb-4">
          <span className="prompt-pink">!</span> cat: post not found
        </p>
        <Link to="/" className="text-[12px] text-muted hover:text-cat-green transition-colors">
          <span className="prompt-green">$</span> cd ~/blog
        </Link>
      </div>
    );
  }

  const slug = slugify(post.title);
  const readTime = readMinutes(post.content);
  const wordCount = calculateWordCount(post.content ?? "");

  return (
    <div className="animate-fade-in">
      <article className="max-w-[760px] mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-12">
        {/* Breadcrumb path */}
        <div className="text-[12px] text-muted mb-6 font-mono">
          <Link to="/" className="text-cat-green hover:underline">
            ~
          </Link>
          <span className="text-faint mx-1.5">/</span>
          <span className="text-muted">posts</span>
          <span className="text-faint mx-1.5">/</span>
          <Link to={`/?category=${post.categoryId}`} className="text-cat-green hover:underline">
            {categoryName}
          </Link>
          <span className="text-faint mx-1.5">/</span>
          <span className="text-ink-bright">{slug}.md</span>
        </div>

        {/* Tag + date row */}
        <div className="flex items-center gap-3 mb-3.5">
          <Link
            to={`/?category=${post.categoryId}`}
            className="inline-block px-2 py-[3px] border border-border-mid text-cat-amber text-[11px] font-mono uppercase tracking-[0.08em] hover:border-cat-amber transition-colors"
          >
            {categoryName}
          </Link>
          <span className="text-muted text-[12px] font-mono">
            {formatIsoDate(post.createdAt)} · {readTime} min
          </span>
        </div>

        {/* Title */}
        <h1 className="font-prose font-bold text-[26px] md:text-[34px] leading-[1.2] tracking-[-0.02em] text-ink-bright mb-[18px]">
          {post.title}
        </h1>

        {/* Meta row: author + stats + actions */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted font-mono py-4 border-t border-b border-border-dim mb-10">
          <span className="flex items-center gap-2 text-ink">
            <span className="w-[22px] h-[22px] bg-cat-green text-bg font-bold text-[11px] inline-flex items-center justify-center">
              L
            </span>
            LEE SIN SEONG
          </span>
          <span>· {wordCount.toLocaleString()} words</span>
          {isAuthor && (
            <div className="ml-auto flex items-center gap-4">
              <Link to={`/posts/${parsedId}/edit`} className="text-cat-green hover:underline">
                :edit
              </Link>
              <button onClick={handleDelete} className="text-cat-pink hover:underline">
                :rm
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mb-14">
          <MarkdownViewer contentHtml={post.contentHtml} />
        </div>

        <SimilarPosts postId={parsedId} />

        <div className="mt-14">
          <CommentSection postId={parsedId} />
        </div>
      </article>
    </div>
  );
}
