import { useEffect, useRef, useState } from "react";
import { similarApi } from "../../../../storage/similar/similarApi";
import type { SimilarResponse, SimilarStatus } from "../../../domain/similar";

interface SimilarPostsProps {
  postId: number;
}

const PENDING_RETRY_MS = 15_000;

function handleShine(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
}

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
    <section className="pt-8 border-t border-border-dim">
      <div className="flex items-baseline gap-2 mb-5">
        <h2 className="text-[15px] font-medium text-ink">Related</h2>
        <span className="text-[13px] text-faint font-mono">— similar reads</span>
      </div>

      {status === "LOADING" || status === "PENDING" ? (
        <p className="text-[13px] text-faint">
          {status === "PENDING" ? "Indexing this post…" : "Loading…"}
        </p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-faint">No related posts yet.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={handleShine}
                className="shine block border border-border-dim rounded-lg p-4 hover:border-border-mid transition-colors"
              >
                <p className="text-[14px] font-medium text-ink leading-snug mb-1.5 line-clamp-2">
                  {item.title}
                </p>
                <p className="text-[12px] text-faint font-mono">{item.company}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
