import React, { useState, useEffect } from "react";

interface LinkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const LinkupModal: React.FC<LinkupModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [key, setKey] = useState(currentKey);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(key.trim());
    onClose();
  };

  const handleClear = () => {
    setKey("");
    onSaveKey("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="15.5" r="4.5" />
              <path d="m21 2-9.6 9.6M15.5 7.5l2.5 2.5M18.5 4.5l2.5 2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white m-0">Linkup API Key</h3>
            <p className="text-xs text-slate-400 m-0">Enables the most accurate competitor discovery and citation analysis.</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-medium block">Your Linkup API Key (Optional)</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="modal-input pr-10"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="lk_live_..."
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔒" : "👁"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Note: Your key is held only in ephemeral browser session memory. It is never saved to a database or shared.
          </p>
        </div>

        <div className="modal-actions">
          {currentKey && (
            <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer" onClick={handleClear}>
              Clear Key
            </button>
          )}
          <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 cursor-pointer" onClick={handleSave}>
            Save for Session
          </button>
        </div>
      </div>
    </div>
  );
};
