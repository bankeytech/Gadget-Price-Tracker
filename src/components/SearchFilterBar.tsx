"use client";

import React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  TrendingDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { FilterState, SortOption } from "@/types";
import { CONDITION_OPTIONS, STORAGE_OPTIONS } from "@/lib/sample-data";

interface SearchFilterBarProps {
  filters: FilterState;
  onFilterChange: (updater: Partial<FilterState>) => void;
  availableSellers: string[];
  totalResults: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  availableSellers,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.condition !== "all" ||
    filters.storage !== "all" ||
    filters.seller !== "all";

  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      condition: "all",
      storage: "all",
      seller: "all",
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Search input + View toggle + Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search gadget (e.g. 'iPhone 13', 'MacBook'), storage, seller..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Sort and View mode */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
                className="bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-4"
              >
                <option value="drop-desc" className="bg-slate-900 text-white">
                  🔥 Biggest Price Drop %
                </option>
                <option value="price-asc" className="bg-slate-900 text-white">
                  💲 Lowest Price First
                </option>
                <option value="price-desc" className="bg-slate-900 text-white">
                  📈 Highest Price First
                </option>
                <option value="name-asc" className="bg-slate-900 text-white">
                  🔤 Gadget Name (A-Z)
                </option>
                <option value="entries-desc" className="bg-slate-900 text-white">
                  📊 Most Tracked Points
                </option>
                <option value="recent-desc" className="bg-slate-900 text-white">
                  ⏱️ Recently Recorded
                </option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => onFilterChange({ viewMode: "grid" })}
              title="Card Grid View"
              className={`p-2 rounded-lg transition-colors ${
                filters.viewMode === "grid"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFilterChange({ viewMode: "table" })}
              title="Table View"
              className={`p-2 rounded-lg transition-colors ${
                filters.viewMode === "table"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row: Condition Pills + Storage Dropdown + Seller Dropdown */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>

        {/* Condition Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onFilterChange({ condition: "all" })}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filters.condition === "all"
                ? "bg-slate-200 text-slate-950 font-semibold shadow-sm"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Conditions
          </button>
          {CONDITION_OPTIONS.map((cond) => {
            const isSelected = filters.condition.toLowerCase() === cond.toLowerCase();
            return (
              <button
                key={cond}
                onClick={() => onFilterChange({ condition: cond })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block mx-1" />

        {/* Storage Filter */}
        <select
          value={filters.storage}
          onChange={(e) => onFilterChange({ storage: e.target.value })}
          className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Storage</option>
          {STORAGE_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Seller Filter */}
        {availableSellers.length > 0 && (
          <select
            value={filters.seller}
            onChange={(e) => onFilterChange({ seller: e.target.value })}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Sellers</option>
            {availableSellers.map((seller) => (
              <option key={seller} value={seller}>
                {seller}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Showing <span className="text-white font-mono font-medium">{totalResults}</span> gadget{" "}
          {totalResults === 1 ? "group" : "groups"}
        </span>
        {filters.sortBy === "drop-desc" && (
          <span className="text-emerald-400/90 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            Sorted by biggest recent price drops
          </span>
        )}
      </div>
    </div>
  );
};
