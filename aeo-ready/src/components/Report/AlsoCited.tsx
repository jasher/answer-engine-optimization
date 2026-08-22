import React from "react";

interface CompetitorItem {
  name: string;
  queryCount: number;
}

interface AlsoCitedProps {
  competitors: CompetitorItem[];
}

export const AlsoCited: React.FC<AlsoCitedProps> = ({ competitors }) => {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="card also-cited">
      <p className="label mt-0">Who got cited instead</p>
      <p className="also-body">
        On the questions where you weren't cited, these domains were. Not a competitive ranking — just who currently owns
        the answers you're missing.
      </p>
      <div className="chips">
        {competitors.map((comp, idx) => (
          <div className="chip" key={idx}>
            {comp.name}
            <i>
              {comp.queryCount} {comp.queryCount === 1 ? "query" : "queries"}
            </i>
          </div>
        ))}
      </div>
    </div>
  );
};
