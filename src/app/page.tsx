"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  TrendingDown,
  Plus,
  Layers,
  Sparkles,
  Database,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PriceEntry, PriceGroup, FilterState, NewPriceEntryInput } from "@/types";
import {
  fetchPriceEntries,
  insertPriceEntry,
  deletePriceEntry,
  resetLocalEntriesToSample,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { groupPriceEntries, filterAndSortGroups, formatCurrency } from "@/lib/data-utils";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { GroupCard } from "@/components/GroupCard";
import { GroupedTableView } from "@/components/GroupedTableView";
import { AddEntryModal } from "@/components/AddEntryModal";
import { PriceHistoryModal } from "@/components/PriceHistoryModal";
import { SupabaseSetupModal } from "@/components/SupabaseSetupModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";

export default function DashboardPage() {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabase, setIsSupabase] = useState(isSupabaseConfigured);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedHistoryGroup, setSelectedHistoryGroup] = useState<PriceGroup | null>(null);
  const [prefilledAddInput, setPrefilledAddInput] = useState<Partial<NewPriceEntryInput> | undefined>();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    condition: "all",
    storage: "all",
    seller: "all",
    sortBy: "drop-desc",
    viewMode: "grid",
  });

  const showToast = useCallback((type: "success" | "error" | "info", title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchPriceEntries();
      setEntries(res.data);
      setIsSupabase(res.isSupabase);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error loading data";
      showToast("error", "Failed to load price entries", errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute groups
  const allGroups = useMemo(() => {
    return groupPriceEntries(entries);
  }, [entries]);

  // Available unique sellers for filter dropdown
  const availableSellers = useMemo(() => {
    const sellers = new Set<string>();
    entries.forEach((e) => {
      if (e.seller) sellers.add(e.seller);
    });
    return Array.from(sellers).sort();
  }, [entries]);

  // Filter and sort groups
  const displayedGroups = useMemo(() => {
    return filterAndSortGroups(allGroups, filters);
  }, [allGroups, filters]);

  // Keep active history modal updated when entries change
  useEffect(() => {
    if (selectedHistoryGroup) {
      const updatedGroup = allGroups.find((g) => g.key === selectedHistoryGroup.key);
      if (updatedGroup) {
        setSelectedHistoryGroup(updatedGroup);
      } else {
        setSelectedHistoryGroup(null);
      }
    }
  }, [allGroups, selectedHistoryGroup]);

  // Handlers
  const handleFilterChange = (updater: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updater }));
  };

  const handleOpenAddModal = (initial?: Partial<NewPriceEntryInput>) => {
    setPrefilledAddInput(initial);
    setIsAddModalOpen(true);
  };

  const handleQuickAdd = (group: PriceGroup) => {
    handleOpenAddModal({
      product: group.product,
      storage: group.storage,
      condition: group.condition,
    });
  };

  const handleAddSubmit = async (input: NewPriceEntryInput) => {
    const res = await insertPriceEntry(input);
    if (res.data) {
      setEntries((prev) => [...prev, res.data!]);

      // Check if this new price is lower than previous price to trigger celebration
      const existingGroup = allGroups.find(
        (g) =>
          g.product.toLowerCase() === input.product.toLowerCase() &&
          g.storage.toLowerCase() === input.storage.toLowerCase() &&
          g.condition.toLowerCase() === input.condition.toLowerCase()
      );

      if (existingGroup && input.price < existingGroup.latestPrice) {
        const dropPct = (
          ((existingGroup.latestPrice - input.price) / existingGroup.latestPrice) *
          100
        ).toFixed(1);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#38bdf8"],
        });
        showToast(
          "success",
          `🔥 Price Drop Detected! (-${dropPct}%)`,
          `${input.product} (${input.storage}) dropped to ${formatCurrency(input.price)} on ${input.seller}`
        );
      } else {
        showToast(
          "success",
          "Price Entry Logged!",
          `Recorded ${formatCurrency(input.price)} for ${input.product} (${input.storage})`
        );
      }
    } else {
      showToast("error", "Could not save entry", res.error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const res = await deletePriceEntry(entryId);
    if (res.success) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      showToast("info", "Price point deleted", "Group statistics updated");
    } else {
      showToast("error", "Failed to delete entry", res.error);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset all local records to the default sample dataset?")) {
      const sample = resetLocalEntriesToSample();
      setEntries(sample);
      showToast("success", "Reset to sample dataset", "Loaded realistic gadget prices");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onResetData={handleResetData}
        isSupabase={isSupabase}
        totalEntries={entries.length}
        totalGroups={allGroups.length}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner Section */}
        <div className="mb-8 relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Real-time Used Gadget Resale Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Spot the Cheapest Deals & Price Drops Across Sellers
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
              Track smartphones, laptops, audio gear, and consoles over time. Compare historical prices across Swappa, eBay, Back Market, and Amazon Renewed.
            </p>

            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <button
                onClick={() => handleOpenAddModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Record New Price
              </button>

              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                {isSupabase ? "Supabase Status" : "Connect Supabase"}
              </button>
            </div>
          </div>
        </div>

        {/* Top Key Metrics Overview */}
        <StatsOverview groups={allGroups} totalEntriesCount={entries.length} />

        {/* Search, Filter & Sort Controls */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          availableSellers={availableSellers}
          totalResults={displayedGroups.length}
        />

        {/* Main Content Area: Cards or Table */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading gadget price entries...</p>
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center my-6">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No gadgets found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No price entries match your current search and filter criteria. Try clearing some filters or record a new price point.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() =>
                  handleFilterChange({
                    search: "",
                    condition: "all",
                    storage: "all",
                    seller: "all",
                  })
                }
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Clear all filters
              </button>
              <button
                onClick={() => handleOpenAddModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Add new price entry
              </button>
            </div>
          </div>
        ) : filters.viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {displayedGroups.map((group) => (
              <GroupCard
                key={group.key}
                group={group}
                onOpenHistory={(g) => setSelectedHistoryGroup(g)}
                onQuickAdd={(g) => handleQuickAdd(g)}
              />
            ))}
          </div>
        ) : (
          <div className="mb-12">
            <GroupedTableView
              groups={displayedGroups}
              onOpenHistory={(g) => setSelectedHistoryGroup(g)}
              onQuickAdd={(g) => handleQuickAdd(g)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Gadget Price Tracker • Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase & Recharts
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Database Config
            </button>
            <span>•</span>
            <span className="text-slate-500 font-mono">
              {entries.length} data points
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledAddInput(undefined);
        }}
        onSubmit={handleAddSubmit}
        initialValues={prefilledAddInput}
      />

      <PriceHistoryModal
        group={selectedHistoryGroup}
        isOpen={Boolean(selectedHistoryGroup)}
        onClose={() => setSelectedHistoryGroup(null)}
        onDeleteEntry={handleDeleteEntry}
        onQuickAdd={(g) => handleQuickAdd(g)}
      />

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        isConfigured={isSupabase}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
