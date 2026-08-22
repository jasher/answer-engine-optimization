import React from "react";

interface FooterProps {
  onRunNowClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRunNowClick }) => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-brand-link mb-2">
            <img src="/images/logomark-tight.png" alt="AEO Ready Logo" className="brand-logo-mark" />
            <span className="footer-logo-text">AEO READY</span>
          </div>
          <p className="footer-desc">An open source tool to test your website’s AI readability, schema markup, and crawler access.</p>
          <div className="footer-os-badge">
            <span className="os-dot"></span>
            <span>Open Source (MIT)</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Platform</h4>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={onRunNowClick} className="bg-transparent border-0 p-0 text-slate-400 hover:text-cyan-400 cursor-pointer text-sm">
                Run Assessment →
              </button>
            </li>
            <li>
              <a href="#how-it-works">Methodology</a>
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Machine Readable</h4>
          <ul className="footer-links">
            <li>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
                /llms.txt
              </a>
            </li>
            <li>
              <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer">
                /llms-full.txt
              </a>
            </li>
            <li>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                /robots.txt
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>Answer Engine Optimization (AEO) Readiness Assessment</p>
          <a href="https://github.com/jasher/answer-engine-optimization" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
            github.com/jasher/answer-engine-optimization
          </a>
        </div>
      </div>
    </footer>
  );
};
