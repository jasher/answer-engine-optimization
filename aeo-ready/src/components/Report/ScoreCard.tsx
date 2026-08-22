import React from "react";

interface Pillar {
  id: string;
  name: string;
  score: number;
  max: number;
}

interface ScoreCardProps {
  domain: string;
  score: {
    total: number;
    band: string;
  };
  pillars: Pillar[];
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  domain,
  score,
  pillars,
}) => {
  const circumference = 238.76;
  const strokeDashoffset = circumference - (score.total / 100) * circumference;

  const getBandClass = (band: string) => {
    switch (band.toUpperCase()) {
      case "A":
        return "grade-a-bg";
      case "B":
        return "grade-b-bg";
      case "C":
        return "grade-c-bg";
      default:
        return "grade-d-bg";
    }
  };

  const getStrokeColor = (total: number) => {
    if (total >= 80) return "var(--emerald)";
    if (total >= 65) return "var(--cyan)";
    if (total >= 50) return "var(--amber)";
    return "var(--rose)";
  };

  return (
    <div className="card score-card">
      <div className="score-head">
        <div className="score-id">
          <span className="score-eyebrow">OVERALL READINESS SCORE</span>
          <h2 className="source-name">{domain}</h2>
          <p className="source-sub">Assessed against 5 AEO readiness pillars</p>
        </div>
        <div className="score-big">
          <div className="score-ring">
            <svg viewBox="0 0 96 96">
              <circle className="ring-bg" cx="48" cy="48" r="38" strokeWidth="7" />
              <circle
                className="ring-fg"
                cx="48"
                cy="48"
                r="38"
                strokeWidth="7"
                stroke={getStrokeColor(score.total)}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="score-num">{score.total}</div>
          </div>
          <span className={`grade-band ${getBandClass(score.band)}`}>GRADE {score.band}</span>
        </div>
      </div>

      <p className="label">Where the points went</p>
      <div className="pillars">
        {pillars.map((pillar) => {
          const fillPct = Math.min(Math.round((pillar.score / pillar.max) * 100), 100);
          const isLow = fillPct < 40;
          return (
            <div className="pillar" key={pillar.id}>
              <div className="axis-top">
                <span>{pillar.name}</span>
                <span className="of mono">
                  {pillar.score}/{pillar.max}
                </span>
              </div>
              <div className="axis-bar">
                <div
                  className={`axis-fill ${isLow ? "low" : ""}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
