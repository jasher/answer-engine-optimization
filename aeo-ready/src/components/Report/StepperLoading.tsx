import React from "react";

interface StepperLoadingProps {
  domain: string;
  stageMessage?: string;
}

export const StepperLoading: React.FC<StepperLoadingProps> = ({
  domain,
  stageMessage = "Auditing Web Properties...",
}) => {
  return (
    <div className="stepper-card">
      <div className="stepper-spinner" />
      <h3 className="text-lg font-semibold text-white mb-1">{stageMessage}</h3>
      <p className="text-xs text-slate-400 m-0">
        Simulating AI answer crawlers, checking schema, and evaluating live model visibility for <b>{domain}</b>
      </p>
    </div>
  );
};
