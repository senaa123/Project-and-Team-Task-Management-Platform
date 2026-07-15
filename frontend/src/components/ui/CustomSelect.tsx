import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(""); // Reset search query on close
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.subLabel && o.subLabel.toLowerCase().includes(query.toLowerCase()))
      )
    : options;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Display / Search Input */}
      <div 
        className={`flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-xl text-sm transition-colors ${
          disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "bg-white cursor-pointer hover:border-gray-300 focus-within:ring-2 focus-within:ring-primary-light focus-within:border-primary-light"
        }`}
        onClick={() => !disabled && setOpen(true)}
      >
        {searchable && open ? (
          <div className="flex items-center gap-2 w-full">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm outline-none bg-transparent"
              disabled={disabled}
            />
          </div>
        ) : (
          <span className={`truncate flex-1 text-left ${selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}
        
        {/* Toggle / Clear Icon */}
        {!disabled && (
          <div className="shrink-0 ml-2">
            {open ? (
              <ChevronDown size={16} className="text-gray-400 rotate-180 transition-transform" />
            ) : (
              <ChevronDown size={16} className="text-gray-400 transition-transform" />
            )}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden py-1">
          {filteredOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">No options found.</p>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setQuery("");
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-primary-50 ${
                  opt.value === value ? "bg-primary-50 text-primary font-semibold" : "text-gray-700 font-medium"
                }`}
              >
                <div>{opt.label}</div>
                {opt.subLabel && <div className="text-xs text-gray-400 font-normal mt-0.5">{opt.subLabel}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
