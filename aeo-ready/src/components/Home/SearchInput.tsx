import React, { useState } from "react";

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (domain: string) => void;
  isLoading: boolean;
  onOpenLinkupModal: () => void;
  hasLinkupKey: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  onSubmit,
  isLoading,
  onOpenLinkupModal,
  hasLinkupKey,
}) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <section className="search" id="search">
      <form onSubmit={handleSubmit} className="search-row">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://yourcompany.com"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          disabled={isLoading}
        />
        <button className="btn" type="submit" disabled={isLoading || !value.trim()}>
          {isLoading ? "Running..." : "Run Assessment →"}
        </button>
      </form>

      <div className="search-hint">
        <button
          type="button"
          className={`linkup-key-trigger ${hasLinkupKey ? "is-active" : ""}`}
          onClick={onOpenLinkupModal}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="4.5" />
            <path d="m21 2-9.6 9.6M15.5 7.5l2.5 2.5M18.5 4.5l2.5 2.5" />
          </svg>
          <span>
            {hasLinkupKey ? "✓ LinkUp key active (Click to edit)" : "Add your LinkUp key for optimal competitor search"}
          </span>
        </button>
      </div>
    </section>
  );
};
