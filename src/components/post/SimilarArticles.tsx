import { useEffect, useMemo, useState } from "react";
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

  const stableTopicHints = useMemo(() => topicHints, [JSON.stringify(topicHints)]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchSimilarArticles(title, content, stableTopicHints, 5, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setArticles(items);
        }
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        if (!controller.signal.aborted) {
          setArticles([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [title, content, stableTopicHints]);

  if (loading || articles.length === 0) return null;

  const handleClick = (article: SimilarArticle, index: number) => {
    recordSimilarClick(
      article.articleId,
      title,
      index + 1,
      articles.length,
      article.similarity,
    );
  };

  return (
    <section className="mb-6 lg:mb-0">
      <p className="text-[11px] font-semibold text-term-green uppercase tracking-widest mb-4">
        $ similar --articles
      </p>
      <ul className="space-y-2">
        {articles.map((article, index) => (
          <li key={article.articleId}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(article, index)}
              className="group block p-3 border border-ink-ghost rounded hover:border-term-green hover:bg-[rgba(74,222,128,0.08)] transition-all"
            >
              <p className="text-xs font-medium text-term-white group-hover:text-term-green leading-snug line-clamp-2 transition-colors">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink-faint">
                <span className="text-term-amber border border-[#78350f] px-1.5 py-px rounded">
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
