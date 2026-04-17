import { useCallback, useEffect, useMemo, useState } from "react";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { Category } from "../../domain/category";
import { useAlert } from "../contexts/useAlert";
import { calculateWordCount } from "../converter/format";
import { POST_LIMITS } from "../constants";

interface UsePostFormOptions {
  initialTitle?: string;
  initialContent?: string;
  initialCategoryId?: number;
}

export function usePostForm(options: UsePostFormOptions = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(options.initialCategoryId ?? 0);
  const [title, setTitle] = useState(options.initialTitle ?? "");
  const [content, setContent] = useState(options.initialContent ?? "");
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useAlert();

  const wordCount = useMemo(() => calculateWordCount(content), [content]);
  const contentCharacters = content.trim().length;

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0 && categoryId === 0) {
        setCategoryId(data[0].id);
      }
    } catch {
      showError("Failed to load categories.");
    }
  }, [showError, categoryId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    if (!categoryId) {
      showWarning("Please select a category.");
      return false;
    }
    if (!title.trim()) {
      showWarning("Please enter a title.");
      return false;
    }
    if (!content.trim()) {
      showWarning("Please enter the content.");
      return false;
    }
    return true;
  };

  return {
    categories,
    categoryId,
    setCategoryId,
    title,
    setTitle,
    content,
    setContent,
    loading,
    setLoading,
    wordCount,
    contentCharacters,
    titleMaxLength: POST_LIMITS.TITLE_MAX_LENGTH,
    validateForm,
    showError,
  };
}
