"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Post = { id: string; image: string; alt: string; caption: string };

/** Latest six posts, fetched only when the strip nears the viewport. */
export function InstagramStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        try {
          const res = await fetch("/api/instagram");
          const data = (await res.json()) as { posts: Post[] };
          setPosts(data.posts);
        } catch {
          setPosts([]);
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="insta" aria-busy={posts === null}>
      <ul className="insta__grid">
        {(posts ?? (Array(6).fill(null) as (Post | null)[])).map((p, i) => (
          <li key={p?.id ?? i} className={`insta__tile insta__tile--${i % 3}`}>
            {p ? (
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="insta__link">
                <Image src={p.image} alt={p.alt} width={300} height={300} sizes="(min-width: 1024px) 200px, 33vw" loading="lazy" />
                <span className="insta__caption">{p.caption}</span>
              </a>
            ) : (
              <span className="insta__placeholder" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
