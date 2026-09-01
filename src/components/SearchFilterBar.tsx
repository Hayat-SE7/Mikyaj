import { Search, MapPin, Calendar, X, SlidersHorizontal } from 'lucide-react';
import { ServiceCategory, Branch } from '../types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ServiceCategory;
  onCategoryChange: (category: ServiceCategory) => void;
  categories: ServiceCategory[];
  branches: Branch[];
  selectedBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onResetFilters: () => void;
  totalMatches: number;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  branches,
  selectedBranch,
  onBranchChange,
  selectedDate,
  onDateChange,
  onResetFilters,
  totalMatches
}: SearchFilterBarProps) {
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All Services';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5 mb-8 space-y-4">
      {/* Top row: Search input + Branch selection + Date selection */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search input (6 cols) */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="service-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search treatments (e.g. Bridal Makeup, Hydra Facial, Balayage)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-[#FF2B72] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF2B72]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Branch dropdown (3 cols) */}
        <div className="md:col-span-3 relative">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#FF2B72] focus-within:ring-2 focus-within:ring-[#FF2B72]/20">
            <MapPin className="w-4 h-4 text-[#FF2B72] shrink-0" />
            <select
              id="search-branch-select"
              value={selectedBranch.id}
              onChange={(e) => {
                const b = branches.find(br => br.id === e.target.value);
                if (b) onBranchChange(b);
              }}
              className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selector (3 cols) */}
        <div className="md:col-span-3 relative">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#FF2B72] focus-within:ring-2 focus-within:ring-[#FF2B72]/20">
            <Calendar className="w-4 h-4 text-[#FF2B72] shrink-0" />
            <input
              id="search-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Bottom row: Category chips with count indicator */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar w-full sm:w-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`category-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#FF2B72] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-auto pt-1 sm:pt-0 font-medium">
          <span>Showing <strong className="text-slate-900">{totalMatches}</strong> treatments</span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-bold text-[#FF2B72] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
