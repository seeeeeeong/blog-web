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
    <section className="lg:pt-0 pt-8 lg:border-t-0 border-t border-dashed border-border-mid">
      <div className="flex items-baseline gap-2 mb-4 text-[13px]">
        <h2 className="text-cat-amber">
          <span className="text-muted">$ grep </span>--related
        </h2>
      </div>

      {status === "LOADING" || status === "PENDING" ? (
        <p className="text-[12px] text-faint">
          <span className="prompt-green">▸</span>{" "}
          {status === "PENDING" ? "indexing…" : "loading…"}
        </p>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-faint">
          <span className="prompt-muted">—</span> no related entries
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 auto-rows-fr">
          {items.map((item) => (
            <li key={item.id} className="flex">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col border border-border-dim hover:border-cat-green p-3 min-h-[78px] transition-colors group"
              >
                <p className="text-[12.5px] text-ink-bright leading-snug mb-auto line-clamp-2 group-hover:text-cat-green transition-colors">
                  <span className="prompt-green">▸</span> {item.title}
                </p>
                <p className="text-[11px] text-muted pl-4 mt-1.5 truncate">@ {item.company}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
