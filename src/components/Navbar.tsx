"use client";

import React from "react";
import { Plus, Database, RefreshCw, Sparkles, TrendingDown, Layers } from "lucide-react";

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenSetupModal: () => void;
  onResetData: () => void;
  isSupabase: boolean;
  totalEntries: number;
  totalGroups: number;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenSetupModal,
  onResetData,
  isSupabase,
  totalEntries,
  totalGroups,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <TrendingDown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Gadget<span className="text-emerald-400">Price</span>Tracker
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Track resale deals, market averages & price drops
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Database connection badge / modal trigger */}
            <button
              onClick={onOpenSetupModal}
              title="Click to view Supabase database setup & status"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSupabase
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabase ? "Supabase Live" : "Local Storage Mode"}
              </span>
              <span className="sm:hidden">{isSupabase ? "Supabase" : "Local"}</span>
            </button>

            {/* Quick Reset / Refresh button if in local mode */}
            {!isSupabase && (
              <button
                onClick={onResetData}
                disabled={isLoading}
                title="Reset sample dataset"
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                Reset Demo
              </button>
            )}

            {/* Add Price Entry CTA Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Price Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
