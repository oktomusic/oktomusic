import { ReactPortal, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useAtom } from "jotai";

import { pipOpenAtom, pipSupportedAtom } from "../../atoms/player/pip";
import PipControlsWindow from "./PipControlsWindow";

import "./PipControls.css";

export default function PipControls(): ReactPortal | null {
  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);
  const [pipSupported] = useAtom(pipSupportedAtom);

  const pipWindowRef = useRef<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!pipSupported) {
      if (pipOpen) setPipOpen(false);
      return;
    }

    if (!pipOpen) return;

    let cancelled = false;

    async function openPip() {
      try {
        const pipWin = await window.documentPictureInPicture!.requestWindow({
          width: 320,
          height: 320,
          disallowReturnToOpener: false,
          preferInitialWindowPlacement: false,
        });

        if (cancelled) {
          pipWin.close();
          return;
        }

        pipWindowRef.current = pipWin;

        const doc = pipWin.document;

        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(
          (link) => {
            doc.head.appendChild(link.cloneNode(true));
          },
        );

        doc.title = "Oktomusic PiP";
        doc.body.id = "pip-body";

        // In dev mode styles are applied via style tags
        if (import.meta.env.DEV) {
          Array.from(document.querySelectorAll("style")).forEach((style) => {
            doc.head.appendChild(style.cloneNode(true));
          });
        }

        const container = doc.createElement("main");
        container.id = "pip-shell";
        doc.body.appendChild(container);
        setPipContainer(container);

        const syncClosed = () => setPipOpen(false);
        pipWin.addEventListener("pagehide", syncClosed);
        pipWin.addEventListener("beforeunload", syncClosed);
      } catch (e) {
        console.error("Failed to open Document PiP", e);
        setPipOpen(false);
      }
    }

    void openPip();

    return () => {
      cancelled = true;
      if (pipWindowRef.current) {
        if (!pipWindowRef.current.closed) {
          pipWindowRef.current.close();
        }
        pipWindowRef.current = null;
      }
      setPipContainer(null);
    };
  }, [pipOpen, pipSupported, setPipOpen]);

  if (!pipContainer) return null;

  return ReactDOM.createPortal(<PipControlsWindow />, pipContainer);
}
