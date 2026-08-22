import React from "react";

interface QueryItem {
  text: string;
  status: "win" | "partial" | "lose";
  ratio: string;
}

interface QueriesCardProps {
  queries: QueryItem[];
}

export const QueriesCard: React.FC<QueriesCardProps> = ({ queries }) => {
  const getStatusIcon = (status: "win" | "partial" | "lose") => {
    switch (status) {
      case "win":
        return "✓";
      case "partial":
        return "~";
      default:
        return "×";
    }
  };

  return (
    <>
      <p className="section-label mt-8">The {queries.length} buyer questions we asked</p>
      <div className="card queries-card">
        <div className="chips">
          {queries.map((q, idx) => (
            <div className={`chip ${q.status}`} key={idx}>
              {q.text}
              <i>
                {getStatusIcon(q.status)} {q.ratio}
              </i>
            </div>
          ))}
        </div>
        <p className="queries-note">
          Counts are how many engines named you. Only the <em>alternatives</em> and <em>reviews</em> questions mention your
          brand — the rest test whether you surface when nobody asked for you.
        </p>
      </div>
    </>
  );
};
