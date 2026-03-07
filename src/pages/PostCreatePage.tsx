import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/useAlert";
import TipTapEditor from "../components/editor/TipTapEditor";
import PageLayout from "../components/common/PageLayout";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useAlert();
  const contentCharacters = content.trim().length;
  const wordCount = useMemo(() => {
    const plainText = content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#>*_~-]/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return plainText ? plainText.split(" ").length : 0;
  }, [content]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch {
      showError("카테고리를 불러오지 못했습니다.");
    }
  }, [showError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    if (!categoryId) {
      showWarning("카테고리를 선택해 주세요.");
      return false;
    }
    if (!title.trim()) {
      showWarning("제목을 입력해 주세요.");
      return false;
    }
    if (!content.trim()) {
      showWarning("본문을 입력해 주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      navigate(isDraft ? "/admin/posts" : `/posts/${newPost.id}`);
    } catch {
      showError("게시글 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="새 글 작성">
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-8 pb-24"
        >
          <header className="space-y-2 border-b border-gray-200 pb-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">새 글 작성</h1>
              <p className="text-sm text-gray-500">제목, 카테고리, 본문을 입력한 뒤 바로 발행하거나 임시저장할 수 있습니다.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>제목 {title.length}/200</span>
              <span>단어 {wordCount}</span>
              <span>문자 {contentCharacters}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-accent/80 focus:outline-none"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="category" className="mb-2 block text-sm font-semibold text-gray-700">
                카테고리
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 transition-colors focus:border-accent/80 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-semibold text-gray-700">본문</label>
              <span className="text-xs text-gray-500">
                이미지는 붙여넣기 또는 업로드 버튼으로 추가할 수 있습니다.
              </span>
            </div>
            <TipTapEditor value={content} onChange={setContent} />
          </div>

          <div className="sticky bottom-3 z-20 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
            <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                취소
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "저장 중..." : "임시저장"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-accent bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "발행 중..." : "발행하기"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
