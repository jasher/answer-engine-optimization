import React from "react";

export const Hero: React.FC = () => {
  return (
    <header className="hero">
      <h1>
        How does AI<br />
        <span className="hero-emoji">👀</span> see <em>you</em>?
      </h1>
      <p className="hero-subtitle">
        <span className="hero-highlight">Run an audit</span>&nbsp; to learn how AI models (e.g., ChatGPT, Gemini, Claude) read and index your
        content. Then follow the custom &nbsp;<span className="hero-highlight">step-by-step recommendations</span> to improve your visibility.
      </p>
    </header>
  );
};
