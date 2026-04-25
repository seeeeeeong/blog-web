import { useNavigate } from "react-router-dom";
import { postApi } from "../../../storage/post/postApi";
import { usePostForm } from "../../support/hooks/usePostForm";
import { PostFormShell } from "../components/post/PostFormShell";

export function PostCreatePage() {
  const navigate = useNavigate();
  const {
    categories, categoryId, setCategoryId,
    title, setTitle, content, setContent,
    loading, setLoading, wordCount, contentCharacters,
    titleMaxLength, validateForm, showError,
  } = usePostForm();

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
      showError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostFormShell
      mode="create"
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
      onCancel={() => navigate("/")}
      onSaveDraft={() => handleSubmit(true)}
      onPublish={() => handleSubmit(false)}
    />
  );
}
