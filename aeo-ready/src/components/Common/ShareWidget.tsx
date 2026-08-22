import React, { useState, useEffect, useRef } from "react";

interface ShareWidgetProps {
  title?: string;
  githubPath?: string;
}

export const ShareFab: React.FC<ShareWidgetProps> = ({
  title = "AEO Ready · Answer Engine Optimization Assessment",
  githubPath = "jasher/answer-engine-optimization",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? window.location.href : "https://aeoready.xyz";
  const noteText = `${title} — ${url}`;
  const ghUrl = githubPath ? `https://github.com/${githubPath}` : "";

  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    substack: `https://substack.com/note/new?text=${encodeURIComponent(noteText)}`,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`lab-share-fab-root ${isOpen ? "is-open" : ""}`}>
      <button
        className="lab-share-fab"
        type="button"
        aria-label="Share"
        aria-expanded={isOpen}
        aria-controls="lab-share-fab-menu"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M18 16.08a2.92 2.92 0 0 0-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.93 2.93 0 0 0 18 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81A2.93 2.93 0 0 0 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92S20.92 19.61 20.92 18s-1.31-1.92-2.92-1.92Z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="lab-share-fab-menu" id="lab-share-fab-menu" role="menu">
          <a role="menuitem" href={shareUrls.x} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
            <span>Share on X</span>
          </a>
          <a role="menuitem" href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.87 0-2.16 1.46-2.16 2.96v5.65H9.34V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.59 0 4.25 2.36 4.25 5.42v6.33ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"
              />
            </svg>
            <span>Share on LinkedIn</span>
          </a>
          <a role="menuitem" href={shareUrls.substack} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46ZM22.54 0H1.46v2.836h21.08V0Z" />
            </svg>
            <span>Share on Substack</span>
          </a>
          {ghUrl && (
            <a role="menuitem" className="lab-share-fab-source" href={ghUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.55v-2.12c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.74-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.44-2.7 5.41-5.27 5.7.42.36.79 1.07.79 2.16v3.21c0 .31.21.67.79.55A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5Z"
                />
              </svg>
              <span>View source</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export const ShareStrip: React.FC<ShareWidgetProps> = ({
  title = "AEO Ready · Answer Engine Optimization Assessment",
  githubPath = "jasher/answer-engine-optimization",
}) => {
  const url = typeof window !== "undefined" ? window.location.href : "https://aeoready.xyz";
  const noteText = `${title} — ${url}`;
  const ghUrl = githubPath ? `https://github.com/${githubPath}` : "";

  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    substack: `https://substack.com/note/new?text=${encodeURIComponent(noteText)}`,
  };

  return (
    <div className="lab-share-strip">
      <div className="lab-share-strip-inner">
        <div className="lab-share-group">
          <span className="lab-share-label">Share</span>
          <a className="lab-share-btn" href={shareUrls.x} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>
          <a className="lab-share-btn" href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.87 0-2.16 1.46-2.16 2.96v5.65H9.34V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.59 0 4.25 2.36 4.25 5.42v6.33ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"
              />
            </svg>
          </a>
          <a className="lab-share-btn" href={shareUrls.substack} target="_blank" rel="noopener noreferrer" aria-label="Share on Substack">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46ZM22.54 0H1.46v2.836h21.08V0Z" />
            </svg>
          </a>
        </div>
        {ghUrl && (
          <a className="lab-share-source" href={ghUrl} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.55v-2.12c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.74-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.44-2.7 5.41-5.27 5.7.42.36.79 1.07.79 2.16v3.21c0 .31.21.67.79.55A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5Z"
              />
            </svg>
            <span>View source on GitHub →</span>
          </a>
        )}
      </div>
    </div>
  );
};
