import { useEffect, useState } from "react";
import { fetchSimilarArticles, type SimilarArticle } from "../../api/similar";

interface Props {
  title: string;
  content: string;
  topicHints: string[];
}

export default function SimilarArticles({ title, content, topicHints }: Props) {
  const [articles, setArticles] = useState<SimilarArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchSimilarArticles(title, content, topicHints)
      .then((items) => {
        if (!cancelled) setArticles(items);
      })
      .catch(() => {
        // 실패해도 본문은 정상 노출, 섹션만 숨김
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, content, topicHints]);

  if (loading || articles.length === 0) return null;

  return (
    <section>
      <p className="font-mono text-xs font-semibold text-muted uppercase tracking-widest mb-4">
        함께 읽을 만한 기업 기술글
      </p>
      <p className="text-xs text-muted leading-relaxed mb-4">
        제목, 핵심 토픽, 본문 문맥이 겹치는 글을 우선 보여줍니다.
      </p>
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.articleId}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="text-sm font-medium text-text group-hover:underline leading-snug line-clamp-2">
                {article.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-muted">
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded">
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
