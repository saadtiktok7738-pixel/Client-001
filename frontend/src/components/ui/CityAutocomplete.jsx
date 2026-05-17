import { useState, useEffect, useRef } from "react";
import { POSTEX_CITIES } from "../../lib/postex-cities.js";

export function CityAutocomplete({ value, onChange, placeholder = "Search city...", className = "", "data-testid": testId }) {
  const [inputVal, setInputVal] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputVal(value || "");
  }, [value]);

  useEffect(() => {
    function onOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeAndRevert();
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [inputVal, value]);

  function closeAndRevert() {
    setOpen(false);
    setSuggestions([]);
    setActiveIdx(-1);
    if (!POSTEX_CITIES.includes(inputVal)) {
      setInputVal(value || "");
    }
  }

  function getMatches(q) {
    const lower = q.toLowerCase().trim();
    if (!lower) return [];
    const starts = POSTEX_CITIES.filter((c) => c.toLowerCase().startsWith(lower));
    const contains = POSTEX_CITIES.filter((c) => !c.toLowerCase().startsWith(lower) && c.toLowerCase().includes(lower));
    return [...starts, ...contains].slice(0, 10);
  }

  function handleInput(e) {
    const q = e.target.value;
    setInputVal(q);
    setActiveIdx(-1);
    if (!q.trim()) {
      onChange("");
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const matches = getMatches(q);
    setSuggestions(matches);
    setOpen(matches.length > 0);
  }

  function handleSelect(city) {
    setInputVal(city);
    onChange(city);
    setOpen(false);
    setSuggestions([]);
    setActiveIdx(-1);
  }

  function handleFocus() {
    if (inputVal.trim()) {
      const matches = getMatches(inputVal);
      setSuggestions(matches);
      setOpen(matches.length > 0);
    }
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx]);
      } else if (suggestions.length === 1) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      closeAndRevert();
    }
  }

  const baseInput = "w-full border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={handleInput}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={className || baseInput}
        data-testid={testId}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-neutral-200 rounded-sm shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((city, idx) => (
            <li
              key={city}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`px-3 py-2 text-sm cursor-pointer ${idx === activeIdx ? "bg-neutral-100 font-medium" : "hover:bg-neutral-50"}`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
