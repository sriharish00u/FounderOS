import React, { useEffect, useMemo, useRef, useState } from 'react';

interface AutocompleteCreateProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  onCreate?: (value: string) => void;
  createLabel?: string;
}

export const AutocompleteCreate: React.FC<AutocompleteCreateProps> = ({
  value,
  onChange,
  options,
  placeholder,
  onCreate,
  createLabel = 'Create'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== query) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalized) return options.slice(0, 8);
    return options.filter(o => o.toLowerCase().includes(normalized)).slice(0, 8);
  }, [options, normalized]);

  const exactMatch = options.some(o => o.trim().toLowerCase() === normalized);
  const showCreate = !!onCreate && normalized.length > 0 && !exactMatch;

  const pick = (name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={placeholder}
        className="w-full bg-[var(--panel)] border border-[var(--ink)] p-2 font-mono-custom text-[12px] focus:outline-none"
      />
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 border border-[var(--ink)] bg-[var(--paper)] shadow-xl max-h-56 overflow-y-auto">
          {filtered.length > 0 && (
            <div className="py-1">
              {filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pick(opt)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--accent)] hover:text-[var(--paper)] font-mono-custom text-[12px]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {showCreate && (
            <button
              type="button"
              onClick={() => {
                const raw = query.trim();
                setOpen(false);
                onCreate?.(raw);
              }}
              className={`w-full text-left px-3 py-1.5 font-mono-custom text-[12px] font-bold border-t ${
                filtered.length > 0 ? 'border-[var(--rule)]' : ''
              } bg-[var(--panel)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`}
            >
              + {createLabel} “{query.trim()}”
            </button>
          )}
          {filtered.length === 0 && !showCreate && (
            <div className="px-3 py-2 font-mono-custom text-[11px] text-[var(--muted)]">
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
};