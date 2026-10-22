import { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const SPECIES_OPTIONS = ["", "dog", "cat", "rabbit", "bird"];
const GENDER_OPTIONS  = ["", "male", "female"];
const STATUS_OPTIONS  = ["", "available", "pending", "adopted"];
const SORT_OPTIONS    = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc",  label: "Oldest First" },
  { value: "name:asc",        label: "Name A–Z" },
  { value: "name:desc",       label: "Name Z–A" },
  { value: "age:asc",         label: "Youngest First" },
  { value: "age:desc",        label: "Oldest First (age)" },
];

const DEFAULT_FILTERS = {
  search:    "",
  species:   "",
  gender:    "",
  status:    "available",
  vaccinated: "",
  location:  "",
  age_min:   "",
  age_max:   "",
  sort:      "created_at:desc",
};

export default function FilterBar({ filters, onChange, onClear, totalResults }) {
  const [expanded, setExpanded] = useState(false);

  function handleChange(field, value) {
    onChange({ ...filters, [field]: value });
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== "" && v !== DEFAULT_FILTERS[k]
  );

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-dark p-5 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="pet-search"
          type="text"
          placeholder="Search by name, breed…"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="input-field pl-9"
        />
        {filters.search && (
          <button onClick={() => handleChange("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Species chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Species</p>
        <div className="flex flex-wrap gap-2">
          {[
            { val: "", label: "All" },
            { val: "dog",    label: "🐶 Dogs" },
            { val: "cat",    label: "🐱 Cats" },
            { val: "rabbit", label: "🐰 Rabbits" },
            { val: "bird",   label: "🐦 Birds" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => handleChange("species", opt.val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.species === opt.val
                  ? "bg-forest-500 text-white shadow-sm"
                  : "bg-cream-dark text-gray-600 hover:bg-forest-100 hover:text-forest-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {[
            { val: "",          label: "All" },
            { val: "available", label: "Available" },
            { val: "pending",   label: "Pending" },
            { val: "adopted",   label: "Adopted" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => handleChange("status", opt.val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.status === opt.val
                  ? "bg-forest-500 text-white shadow-sm"
                  : "bg-cream-dark text-gray-600 hover:bg-forest-100 hover:text-forest-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700"
      >
        {expanded ? "Fewer filters" : "More filters"}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded filters */}
      {expanded && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Gender
              </label>
              <select value={filters.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="select-field text-sm py-2">
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Vaccinated
              </label>
              <select value={filters.vaccinated}
                onChange={(e) => handleChange("vaccinated", e.target.value)}
                className="select-field text-sm py-2">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Austin, TX"
              value={filters.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Min Age (yrs)
              </label>
              <input type="number" min="0" max="30" step="0.5"
                value={filters.age_min}
                onChange={(e) => handleChange("age_min", e.target.value)}
                className="input-field text-sm py-2" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Max Age (yrs)
              </label>
              <input type="number" min="0" max="30" step="0.5"
                value={filters.age_max}
                onChange={(e) => handleChange("age_max", e.target.value)}
                className="input-field text-sm py-2" placeholder="30" />
            </div>
          </div>
        </div>
      )}

      {/* Sort & results */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <select
          value={filters.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="select-field text-sm py-2 flex-1"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Clear & count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{totalResults ?? 0} pets found</span>
        {hasActiveFilters && (
          <button onClick={onClear}
            className="flex items-center gap-1 text-coral hover:text-red-600 font-medium transition-colors">
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
