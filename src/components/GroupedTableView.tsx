"use client";

import React from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Store,
  BarChart2,
  Plus,
  ArrowDownRight,
  HardDrive,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { PriceGroup } from "@/types";
import { formatCurrency, getConditionBadgeStyles } from "@/lib/data-utils";

interface GroupedTableViewProps {
  groups: PriceGroup[];
  onOpenHistory: (group: PriceGroup) => void;
  onQuickAdd: (group: PriceGroup) => void;
}

export const GroupedTableView: React.FC<GroupedTableViewProps> = ({
  groups,
  onOpenHistory,
  onQuickAdd,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl glass-panel border border-slate-800 shadow-xl">
      <table className="w-full text-left text-sm border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="py-3.5 px-4">Gadget & Specs</th>
            <th className="py-3.5 px-4">Cheapest Deal</th>
            <th className="py-3.5 px-4">Market Avg</th>
            <th className="py-3.5 px-4">Latest Price</th>
            <th className="py-3.5 px-4">Price Drop / Trend</th>
            <th className="py-3.5 px-4 text-center">Trend Sparkline</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {groups.map((group) => {
            const condStyles = getConditionBadgeStyles(group.condition);
            const isPriceDown = group.hasDropped;
            const isPriceUp =
              group.previousPrice !== null && group.latestPrice > group.previousPrice;
            const priceUpPercent =
              isPriceUp && group.previousPrice
                ? Number((((group.latestPrice - group.previousPrice) / group.previousPrice) * 100).toFixed(1))
                : 0;

            const strokeColor = isPriceDown
              ? "#10b981"
              : isPriceUp
              ? "#f59e0b"
              : "#38bdf8";

            return (
              <tr
                key={group.key}
                className="hover:bg-slate-800/40 transition-colors group/row"
              >
                {/* Product Name & Specs */}
                <td className="py-4 px-4">
                  <div className="font-bold text-white group-hover/row:text-emerald-300 transition-colors">
                    {group.product}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      <HardDrive className="w-2.5 h-2.5 text-slate-400" />
                      {group.storage}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${condStyles.bg} ${condStyles.text} ${condStyles.border}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${condStyles.dot}`} />
                      {group.condition}
                    </span>
                  </div>
                </td>

                {/* Cheapest Deal */}
                <td className="py-4 px-4">
                  <div className="font-mono font-extrabold text-emerald-400 text-base">
                    {formatCurrency(group.cheapestPrice)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Store className="w-3 h-3 text-slate-500" />
                    <span>{group.cheapestEntry.seller}</span>
                  </div>
                </td>

                {/* Market Avg */}
                <td className="py-4 px-4">
                  <div className="font-mono font-semibold text-slate-200">
                    {formatCurrency(group.averagePrice)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {group.totalRecords} entries
                  </div>
                </td>

                {/* Latest Price */}
                <td className="py-4 px-4">
                  <div className="font-mono font-medium text-white">
                    {formatCurrency(group.latestPrice)}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[100px]">
                    on {group.latestEntry.seller}
                  </div>
                </td>

                {/* Price Drop / Trend */}
                <td className="py-4 px-4">
                  {isPriceDown ? (
                    <div className="badge-drop-glow inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>-{group.priceDropPercent}%</span>
                    </div>
                  ) : isPriceUp ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold font-mono">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      <span>+{priceUpPercent}%</span>
                    </div>
                  ) : group.entries.length > 1 ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono">
                      <Minus className="w-3 h-3" />
                      <span>Stable</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">First entry</span>
                  )}
                </td>

                {/* Mini Sparkline */}
                <td className="py-4 px-4 w-32">
                  {group.history.length > 1 ? (
                    <div className="h-10 w-28 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={group.history}>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono text-white shadow-lg">
                                    <span className="text-emerald-400 font-bold">
                                      {formatCurrency(data.price)}
                                    </span>
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
                            strokeWidth={2}
                            dot={{ r: 2, fill: strokeColor }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-600">—</div>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onQuickAdd(group)}
                      title="Add a price entry for this gadget"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenHistory(group)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      History
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
