import { useEffect, useRef, useState } from "react";
import { similarApi } from "../../../../storage/similar/similarApi";
import type { SimilarResponse, SimilarStatus } from "../../../domain/similar";

interface SimilarPostsProps {
  postId: number;
}

const PENDING_RETRY_MS = 15_000;

export function SimilarPosts({ postId }: SimilarPostsProps) {
  const [status, setStatus] = useState<SimilarStatus | "LOADING" | "ERROR">("LOADING");
  const [items, setItems] = useState<SimilarResponse["items"]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;
    const thisRequest = ++requestIdRef.current;

    const fetch = async () => {
      try {
        const data = await similarApi.getSimilar(postId);
        if (cancelled || thisRequest !== requestIdRef.current) return;
        setStatus(data.status);
        setItems(data.items);
        if (data.status === "PENDING") {
          retryTimer = window.setTimeout(fetch, PENDING_RETRY_MS);
        }
      } catch {
        if (cancelled || thisRequest !== requestIdRef.current) return;
        setStatus("ERROR");
      }
    };

    setStatus("LOADING");
    setItems([]);
    fetch();

    return () => {
      cancelled = true;
      if (retryTimer != null) window.clearTimeout(retryTimer);
    };
  }, [postId]);

  if (status === "NOT_FOUND" || status === "DELETED" || status === "ERROR") {
    return null;
  }

  return (
    <section className="mt-8 pt-6 border-t border-ink-ghost">
      <h2 className="text-xs text-ink-faint mb-3">
        <span className="text-ink-faint">$ </span>related # similar tech blog posts
      </h2>
      {status === "LOADING" || status === "PENDING" ? (
        <p className="text-[11px] text-ink-faint">
          {status === "PENDING" ? "indexing this post…" : "loading…"}
        </p>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-ink-faint">no related posts yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <span className="text-[11px] text-term-blue group-hover:opacity-70 transition-opacity">
                  {item.title}
                </span>
                <span className="ml-2 text-[11px] text-ink-faint">
                  — {item.company}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
