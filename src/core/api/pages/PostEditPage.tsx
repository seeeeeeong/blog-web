import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postApi } from "../../../storage/post/postApi";
import { usePostForm } from "../../support/hooks/usePostForm";
import { Spinner } from "../components/common/Spinner";
import { PostFormShell } from "../components/post/PostFormShell";

export function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const {
    categories, categoryId, setCategoryId,
    title, setTitle, content, setContent,
    loading, setLoading, wordCount, contentCharacters,
    titleMaxLength, validateForm, showError,
  } = usePostForm();

  const loadPost = useCallback(async () => {
    try {
      const data = await postApi.getPostForAdmin(Number(postId));
      setCategoryId(data.categoryId);
      setTitle(data.title);
      setContent(data.content);
    } catch {
      showError("Post not found.");
      setLoadError(true);
    } finally {
      setInitialLoading(false);
    }
  }, [postId, showError, setCategoryId, setTitle, setContent]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await postApi.updatePost(Number(postId), {
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });
      navigate(isDraft ? "/admin/posts" : `/posts/${postId}`);
    } catch {
      showError("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-[760px] px-6 md:px-10 py-24 text-center">
        <p className="font-meta text-[11px] text-danger uppercase tracking-[0.08em] mb-3">
          Not found
        </p>
        <p className="text-[14.5px] text-muted mb-6">
          Could not load the post or you do not have permission to edit.
        </p>
        <Link
          to="/"
          className="inline-flex h-9 px-4 items-center rounded-md bg-accent text-paper text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <PostFormShell
      mode="edit"
      categories={categories}
      categoryId={categoryId}
      setCategoryId={setCategoryId}
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      loading={loading}
      wordCount={wordCount}
      contentCharacters={contentCharacters}
      titleMaxLength={titleMaxLength}
      onCancel={() => navigate(`/posts/${postId}`)}
      onSaveDraft={() => handleSubmit(true)}
      onPublish={() => handleSubmit(false)}
    />
  );
}
