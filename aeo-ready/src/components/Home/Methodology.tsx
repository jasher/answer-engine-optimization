import React, { useEffect, useRef, useState } from "react";

export const Methodology: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, 120);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`method has-anim ${isVisible ? "is-visible" : ""}`}
      id="how-it-works"
    >
      <h2>How the Assessment Works</h2>
      <div className="method-steps">
        <div className="method-step" data-step="01">
          <div className="method-step-header">
            <span className="method-badge">DISCOVER</span>
          </div>
          <h3>Bot Emulation &amp; Discovery</h3>
          <p>Inspects your web properties exactly like modern AI indexers - without relying on client JavaScript: analyzing <code>robots.txt</code> directives and sitemaps.</p>
        </div>

        <div className="method-step" data-step="02">
          <div className="method-step-header">
            <span className="method-badge">AUDIT</span>
          </div>
          <h3>Structural &amp; Semantic Audit</h3>
          <p>Validates AI crawler permissions, schema.org structured data, semantic headings, Content Signals, and <code>llms.txt</code> discovery files.</p>
        </div>

        <div className="method-step" data-step="03">
          <div className="method-step-header">
            <span className="method-badge">SCORE</span>
          </div>
          <h3>Readiness Scoring</h3>
          <p>Calculates an objective 100-point grade across five key dimensions, flagging missing checks without penalizing your score.</p>
        </div>

        <div className="method-step" data-step="04">
          <div className="method-step-header">
            <span className="method-badge">GENERATE</span>
          </div>
          <h3>Actionable Code Generation</h3>
          <p>Builds tailored JSON-LD blocks, customized <code>llms.txt</code> templates, and <code>robots.txt</code> rules sourced directly from your pages.</p>
        </div>
      </div>
    </section>
  );
};
