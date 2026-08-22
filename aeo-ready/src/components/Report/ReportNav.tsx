import React from "react";

interface ReportNavProps {
  onHomeClick: () => void;
  onNewScanClick: () => void;
}

export const ReportNav: React.FC<ReportNavProps> = ({ onHomeClick, onNewScanClick }) => {
  return (
    <header className="top-nav">
      <div className="top-nav-container">
        <div className="top-nav-brand-wrapper">
          <button type="button" onClick={onHomeClick} className="top-nav-brand bg-transparent border-0 p-0 text-left cursor-pointer">
            <img src="/images/logomark-tight.png" alt="AEO Ready Logo" className="brand-logo-mark" />
            <span className="brand-title">AEO READY</span>
          </button>
        </div>
        <nav className="top-nav-links">
          <button type="button" onClick={onNewScanClick} className="nav-link nav-cta">
            Run Assessment
          </button>
        </nav>
      </div>
    </header>
  );
};
