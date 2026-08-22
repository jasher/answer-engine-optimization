import React from "react";

interface ReportHeadProps {
  domain: string;
  pagesCrawled: number;
  hasRobots: boolean;
  hasSitemap: boolean;
  isCached?: boolean;
}

export const ReportHead: React.FC<ReportHeadProps> = ({
  domain,
  pagesCrawled,
  hasRobots,
  hasSitemap,
}) => {
  return (
    <div className="page-head">
      <span className="lab-eyebrow">AEO READINESS ASSESSMENT</span>
      <h1>
        Here's how AI <span className="hero-emoji">👀</span> sees <em>{domain}</em>
      </h1>
      <p>
        <span className="hero-highlight">{pagesCrawled || 10} pages crawled</span> · {hasRobots ? "robots.txt found" : "no robots.txt"} ·{" "}
        {hasSitemap ? "sitemap found" : "no sitemap"}. Full breakdown and step-by-step recommendations below.
      </p>
    </div>
  );
};
