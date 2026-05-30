import { useEffect, useState } from "react";

export function WindowTitle() {
  const [title, setTitle] = useState<string>(() => document.title);

  useEffect(() => {
    const titleElement = document.head.querySelector("title");
    if (!titleElement) {
      return;
    }

    const observer = new MutationObserver(() => {
      setTitle(document.title);
    });

    observer.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <h1>{title}</h1>;
}
