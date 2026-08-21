"use client";

import React from "react";
import { TrendingDown, Tag, Smartphone, Store, ArrowDownRight, Sparkles } from "lucide-react";
import { PriceGroup } from "@/types";
import { formatCurrency } from "@/lib/data-utils";

interface StatsOverviewProps {
  groups: PriceGroup[];
  totalEntriesCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ groups, totalEntriesCount }) => {
  // Find group with biggest price drop percentage
  const groupsWithDrop = groups.filter((g) => g.hasDropped && g.priceDropPercent > 0);
  const bestDropGroup = groupsWithDrop.length > 0
    ? [...groupsWithDrop].sort((a, b) => b.priceDropPercent - a.priceDropPercent)[0]
    : null;

  // Find lowest price deal across all groups
  const lowestDeal = groups.length > 0
    ? [...groups].sort((a, b) => a.cheapestPrice - b.cheapestPrice)[0]
    : null;

  // Count unique sellers
  const uniqueSellers = new Set<string>();
  groups.forEach((g) => g.sellers.forEach((s) => uniqueSellers.add(s)));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Top Price Drop Deal */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Top Price Drop
          </span>
          {bestDropGroup && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ArrowDownRight className="w-3.5 h-3.5" />
              -{bestDropGroup.priceDropPercent}%
            </span>
          )}
        </div>

        {bestDropGroup ? (
          <div>
            <h4 className="text-base font-bold text-white truncate" title={bestDropGroup.product}>
              {bestDropGroup.product}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(bestDropGroup.latestPrice)}
              </span>
              {bestDropGroup.previousPrice && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  {formatCurrency(bestDropGroup.previousPrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {bestDropGroup.storage} • {bestDropGroup.condition} on {bestDropGroup.latestEntry.seller}
            </p>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-slate-400">No active drops yet</p>
            <p className="text-xs text-slate-500 mt-0.5">Add more price points to track trends</p>
          </div>
        )}
      </div>

      {/* Lowest Active Deal */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-blue-400" />
            Lowest Tracked Deal
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            Cheapest
          </span>
        </div>

        {lowestDeal ? (
          <div>
            <h4 className="text-base font-bold text-white truncate" title={lowestDeal.product}>
              {lowestDeal.product}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-blue-400">
                {formatCurrency(lowestDeal.cheapestPrice)}
              </span>
              <span className="text-xs text-slate-400">
                on {lowestDeal.cheapestEntry.seller}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {lowestDeal.storage} • {lowestDeal.condition}
            </p>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-slate-400">No items tracked</p>
          </div>
        )}
      </div>

      {/* Tracked Configurations */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            Tracked Gadgets
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            Groups
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {groups.length}
            </span>
            <span className="text-xs text-slate-400">
              distinct configurations
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-indigo-300 font-mono font-medium">{totalEntriesCount}</span> total price entries logged
          </p>
        </div>
      </div>

      {/* Marketplaces Monitored */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-300 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-400" />
            Marketplaces
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            Sellers
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {uniqueSellers.size}
            </span>
            <span className="text-xs text-slate-400">
              active sources
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {Array.from(uniqueSellers).slice(0, 3).join(", ")}
            {uniqueSellers.size > 3 ? ` +${uniqueSellers.size - 3} more` : ""}
          </p>
        </div>
      </div>
    </div>
  );
};
