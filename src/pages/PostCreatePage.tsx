import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title,
        content,
      });

      alert("게시글이 작성되었습니다.");
      navigate(`/posts/${newPost.id}`);
    } catch (error) {
      console.error("작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">글쓰기</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-8"
      >
        <div className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="내용을 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "작성 중..." : "작성완료"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
