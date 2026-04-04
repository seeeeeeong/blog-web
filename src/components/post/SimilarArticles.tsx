import { useEffect, useState } from "react";
import axios from "axios";
import { fetchSimilarArticles, recordSimilarClick, type SimilarArticle } from "../../api/similar";

interface Props {
  title: string;
  content: string;
  topicHints: string[];
}

export default function SimilarArticles({ title, content, topicHints }: Props) {
  const [articles, setArticles] = useState<SimilarArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchSimilarArticles(title, content, topicHints, 5, controller.signal)
      .then((items) => {
        setArticles(items);
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
          return;
        }
        setArticles([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [title, content, topicHints]);

  if (loading || articles.length === 0) return null;

  const handleClick = (article: SimilarArticle) => {
    recordSimilarClick(article.articleId, title);
  };

  return (
    <section className="mb-6">
      <p className="font-mono text-xs font-semibold text-ink-light uppercase tracking-widest mb-4">
        함께 읽을 만한 기업 기술글
      </p>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.articleId}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(article)}
              className="group block p-3 border-[1.5px] border-ink-ghost rounded-lg hover:border-ink hover:-translate-y-px hover:shadow-sm transition-all"
            >
              <p className="text-sm font-medium text-ink group-hover:underline leading-snug line-clamp-2">
                {article.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 font-mono text-xs text-ink-lighter">
                <span className="text-[10px] font-semibold text-accent-text bg-accent px-1.5 py-0.5 rounded">
                  {article.company}
                </span>
                {article.publishedAt && (
                  <span>{article.publishedAt.slice(0, 10)}</span>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
