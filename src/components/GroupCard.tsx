"use client";

import React from "react";
import {
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Sparkles,
  Calendar,
  Store,
  ChevronRight,
  Plus,
  BarChart2,
  HardDrive,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { PriceGroup } from "@/types";
import { formatCurrency, formatDate, getConditionBadgeStyles } from "@/lib/data-utils";

interface GroupCardProps {
  group: PriceGroup;
  onOpenHistory: (group: PriceGroup) => void;
  onQuickAdd: (group: PriceGroup) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onOpenHistory,
  onQuickAdd,
}) => {
  const condStyles = getConditionBadgeStyles(group.condition);

  // Sparkline data preparation
  const sparklineData = group.history.map((h) => ({
    date: h.date,
    price: h.price,
    seller: h.seller,
  }));

  const isPriceDown = group.hasDropped;
  const isPriceUp =
    group.previousPrice !== null && group.latestPrice > group.previousPrice;
  const priceUpPercent =
    isPriceUp && group.previousPrice
      ? Number((((group.latestPrice - group.previousPrice) / group.previousPrice) * 100).toFixed(1))
      : 0;

  // Chart line stroke color based on price trend
  const strokeColor = isPriceDown
    ? "#10b981" // Emerald
    : isPriceUp
    ? "#f59e0b" // Amber
    : "#38bdf8"; // Sky

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group/card">
      {/* Top Background Glow if Price Dropped */}
      {isPriceDown && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Card Header: Product name & Tags */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div>
            <h3
              className="text-base font-bold text-white group-hover/card:text-emerald-300 transition-colors leading-tight line-clamp-1"
              title={group.product}
            >
              {group.product}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Storage pill */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <HardDrive className="w-3 h-3 text-slate-400" />
                {group.storage}
              </span>

              {/* Condition Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${condStyles.bg} ${condStyles.text} ${condStyles.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${condStyles.dot}`} />
                {group.condition}
              </span>
            </div>
          </div>

          {/* Price Dropped / Trend Indicator Badge */}
          {isPriceDown ? (
            <div className="badge-drop-glow inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>-{group.priceDropPercent}%</span>
            </div>
          ) : isPriceUp ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold font-mono">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>+{priceUpPercent}%</span>
            </div>
          ) : group.entries.length > 1 ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono">
              <Minus className="w-3 h-3" />
              <span>Stable</span>
            </div>
          ) : null}
        </div>

        {/* Pricing Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y border-slate-800/80">
          {/* Cheapest Deal */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Cheapest Deal
            </span>
            <div className="text-xl font-extrabold font-mono text-emerald-400">
              {formatCurrency(group.cheapestPrice)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
              <Store className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="truncate">{group.cheapestEntry.seller}</span>
            </div>
          </div>

          {/* Average Price */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Avg Market Price
            </span>
            <div className="text-xl font-bold font-mono text-slate-200">
              {formatCurrency(group.averagePrice)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              across {group.totalRecords} {group.totalRecords === 1 ? "entry" : "entries"}
            </div>
          </div>
        </div>

        {/* Latest Recorded Price & Drop Details */}
        <div className="flex items-center justify-between text-xs py-1 text-slate-400">
          <div>
            <span>Latest: </span>
            <span className="font-mono font-semibold text-white">
              {formatCurrency(group.latestPrice)}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">
              ({group.latestEntry.seller})
            </span>
          </div>

          {isPriceDown && group.priceDropAmount > 0 && (
            <span className="text-emerald-400 font-mono text-[11px] font-medium flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" />
              Save {formatCurrency(group.priceDropAmount)}
            </span>
          )}
        </div>

        {/* Mini Sparkline Chart Preview */}
        {sparklineData.length > 1 && (
          <div className="h-14 w-full mt-3 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono text-white shadow-lg">
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(data.price)}
                          </span>{" "}
                          • {data.seller} ({data.date})
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: strokeColor }}
                  activeDot={{ r: 4, fill: "#ffffff", stroke: strokeColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Quick Add Price */}
        <button
          onClick={() => onQuickAdd(group)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700 transition-colors"
          title="Add a new price point for this gadget"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Price
        </button>

        {/* View Detailed History & Trends */}
        <button
          onClick={() => onOpenHistory(group)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors ml-auto"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Price History
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
