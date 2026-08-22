import React, { useEffect, useState } from "react";

interface TopNavProps {
  onGetStartedClick: () => void;
  onHomeClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onGetStartedClick, onHomeClick }) => {
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  useEffect(() => {
    const searchSec = document.getElementById("search");
    if (!searchSec) {
      setIsCtaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            setIsCtaVisible(true);
          } else {
            setIsCtaVisible(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(searchSec);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="top-banner">
        <span>
          Answer Engine Optimization (AEO){" "}
          <span className="banner-highlight">Readiness Assessment</span>{" "}
          <span className="banner-separator">✦</span> No Signup Required{" "}
          <span className="banner-separator">✦</span> Free
        </span>
      </div>

      <header className="top-nav">
        <div className="top-nav-container">
          <div className="top-nav-brand-wrapper">
            <button type="button" onClick={onHomeClick} className="top-nav-brand bg-transparent border-0 p-0 text-left">
              <img src="/images/logomark-tight.png" alt="AEO Ready Logo" className="brand-logo-mark" />
              <span className="brand-title">AEO READY</span>
            </button>
          </div>

          <nav className="top-nav-links">
            <a href="#how-it-works" className="nav-link">
              How it Works
            </a>
            <button
              type="button"
              onClick={onGetStartedClick}
              className={`nav-link nav-cta ${isCtaVisible ? "is-visible" : ""}`}
              id="nav-get-started"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};
