import React, { useEffect, useRef, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

function FilterChip({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  return (
    <div className="filter-chip" ref={ref}>
      <button
        type="button"
        className={`filter-chip-btn${selected.length ? ' filter-chip-btn--active' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {label}{selected.length > 0 && <span className="filter-chip-count">{selected.length}</span>}
        <MdArrowDropDown aria-hidden="true" />
      </button>
      {open && (
        <div className="filter-chip-menu" role="group" aria-label={label}>
          {options.map(option => (
            <label key={option.value} className="filter-chip-option">
              <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterChip;
