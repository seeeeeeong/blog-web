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
    <section className="lg:pt-0 pt-8 lg:border-t-0 border-t border-rule">
      <div className="eyebrow mb-4 pb-2 border-b border-rule-soft">
        Further reading
      </div>

      {status === "LOADING" || status === "PENDING" ? (
        <p className="font-meta text-[11px] text-faint tracking-[0.08em] uppercase">
          {status === "PENDING" ? "indexing…" : "loading…"}
        </p>
      ) : items.length === 0 ? (
        <p className="font-body text-[14px] text-muted italic">
          No related entries.
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <p className="font-display text-[15.5px] font-medium leading-[1.3] text-ink group-hover:text-accent transition-colors mb-1.5 line-clamp-2">
                  {item.title}
                </p>
                <p className="font-meta text-[10px] text-muted tracking-[0.08em] uppercase truncate">
                  @ {item.company}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
