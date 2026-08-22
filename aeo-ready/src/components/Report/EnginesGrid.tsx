import React from "react";

interface EngineResult {
  engine: string;
  name: string;
  badge: string;
  accentColor: string;
  mentionRate: number;
  citationRate: number;
  mentionCount?: string;
  citationCount?: string;
  band: string;
  notMeasured?: boolean;
}

interface EnginesGridProps {
  engines: EngineResult[];
}

export const EnginesGrid: React.FC<EnginesGridProps> = ({ engines }) => {
  const getBandClass = (band: string) => {
    switch (band.toUpperCase()) {
      case "A":
        return "band-a";
      case "B":
        return "band-b";
      case "C":
        return "band-c";
      case "D":
        return "band-d";
      default:
        return "band-out";
    }
  };

  return (
    <>
      <p className="section-label">What each answer engine says about you</p>
      <div className="engines">
        {engines.map((eng) => {
          if (eng.notMeasured) {
            return (
              <div className="engine engine-out" key={eng.engine}>
                <span className="engine-band band-out">—</span>
                <span className="engine-name">{eng.name}</span>
                <div className="engine-stat out">Not measured</div>
              </div>
            );
          }

          return (
            <div className="engine" key={eng.engine}>
              <span className={`engine-band ${getBandClass(eng.band)}`}>{eng.band}</span>
              <span className="engine-name">{eng.name}</span>
              <div className="engine-stat">
                <span>Mentioned</span>
                <b>{eng.mentionCount || `${Math.round((eng.mentionRate / 100) * 4)}/4`}</b>
              </div>
              <div className="engine-stat">
                <span>Cited w/ link</span>
                <b>{eng.citationCount || `${Math.round((eng.citationRate / 100) * 4)}/4`}</b>
              </div>
            </div>
          );
        })}
      </div>
      <p className="disclosure">
        Measured through each engine's own API using its native search. Not identical to what a signed-in human sees — no
        personalization, no chat memory. Directionally right, not a guarantee.
      </p>
    </>
  );
};
