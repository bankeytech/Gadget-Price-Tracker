import { PriceEntry, PriceGroup, PricePoint } from "@/types";

/**
 * Format currency in USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date nicely e.g. "Aug 20, 2026" or "Aug 20"
 */
export function formatDate(dateString: string, includeYear: boolean = true): string {
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: includeYear ? "numeric" : undefined,
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Group price entries by `product + storage + condition` and calculate stats
 */
export function groupPriceEntries(entries: PriceEntry[]): PriceGroup[] {
  const map = new Map<string, PriceEntry[]>();

  // Group entries by product + storage + condition
  for (const entry of entries) {
    const normalizedProduct = entry.product.trim();
    const normalizedStorage = (entry.storage || "N/A").trim();
    const normalizedCondition = (entry.condition || "Good").trim();
    const key = `${normalizedProduct}::${normalizedStorage}::${normalizedCondition}`;

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(entry);
  }

  const groups: PriceGroup[] = [];

  map.forEach((groupEntries, key) => {
    const [product, storage, condition] = key.split("::");

    // Sort entries chronologically (oldest first)
    const sortedEntries = [...groupEntries].sort((a, b) => {
      const dateDiff = new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });

    if (sortedEntries.length === 0) return;

    // Calculate Cheapest
    let cheapestEntry = sortedEntries[0];
    let highestPrice = sortedEntries[0].price;
    let totalPrice = 0;
    const sellersSet = new Set<string>();

    for (const entry of sortedEntries) {
      if (entry.price < cheapestEntry.price) {
        cheapestEntry = entry;
      }
      if (entry.price > highestPrice) {
        highestPrice = entry.price;
      }
      totalPrice += entry.price;
      if (entry.seller) sellersSet.add(entry.seller);
    }

    const cheapestPrice = cheapestEntry.price;
    const averagePrice = Math.round((totalPrice / sortedEntries.length) * 100) / 100;

    // Latest & Previous price comparison
    const latestEntry = sortedEntries[sortedEntries.length - 1];
    const latestPrice = latestEntry.price;

    let previousPrice: number | null = null;
    if (sortedEntries.length > 1) {
      previousPrice = sortedEntries[sortedEntries.length - 2].price;
    }

    const hasDropped = previousPrice !== null && latestPrice < previousPrice;
    const priceDropAmount = hasDropped && previousPrice !== null ? previousPrice - latestPrice : 0;
    const priceDropPercent =
      hasDropped && previousPrice !== null && previousPrice > 0
        ? Number((((previousPrice - latestPrice) / previousPrice) * 100).toFixed(1))
        : 0;

    // Build history for Recharts
    const history: PricePoint[] = sortedEntries.map((entry) => ({
      id: entry.id,
      date: formatDate(entry.date_recorded, false),
      rawDate: entry.date_recorded,
      price: Number(entry.price),
      seller: entry.seller,
      condition: entry.condition,
    }));

    groups.push({
      key,
      product,
      storage,
      condition,
      entries: sortedEntries,
      cheapestEntry,
      cheapestPrice,
      averagePrice,
      latestEntry,
      latestPrice,
      previousPrice,
      highestPrice,
      hasDropped,
      priceDropAmount,
      priceDropPercent,
      history,
      sellers: Array.from(sellersSet),
      totalRecords: sortedEntries.length,
      lastUpdated: latestEntry.date_recorded,
    });
  });

  return groups;
}

/**
 * Filter and sort groups
 */
export function filterAndSortGroups(
  groups: PriceGroup[],
  filters: {
    search: string;
    condition: string;
    storage: string;
    seller: string;
    sortBy: string;
  }
): PriceGroup[] {
  const { search, condition, storage, seller, sortBy } = filters;
  const searchLower = search.toLowerCase().trim();

  const filtered = groups.filter((group) => {
    // Search matching product, storage, condition, or seller
    if (searchLower) {
      const matchProduct = group.product.toLowerCase().includes(searchLower);
      const matchStorage = group.storage.toLowerCase().includes(searchLower);
      const matchCondition = group.condition.toLowerCase().includes(searchLower);
      const matchSeller = group.sellers.some((s) => s.toLowerCase().includes(searchLower));
      if (!matchProduct && !matchStorage && !matchCondition && !matchSeller) {
        return false;
      }
    }

    // Condition filter
    if (condition && condition !== "all") {
      if (group.condition.toLowerCase() !== condition.toLowerCase()) {
        return false;
      }
    }

    // Storage filter
    if (storage && storage !== "all") {
      if (group.storage.toLowerCase() !== storage.toLowerCase()) {
        return false;
      }
    }

    // Seller filter
    if (seller && seller !== "all") {
      if (!group.sellers.some((s) => s.toLowerCase() === seller.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "drop-desc": {
        // First sort by hasDropped, then by priceDropPercent descending
        if (a.hasDropped && !b.hasDropped) return -1;
        if (!a.hasDropped && b.hasDropped) return 1;
        if (a.hasDropped && b.hasDropped) {
          return b.priceDropPercent - a.priceDropPercent;
        }
        return b.totalRecords - a.totalRecords;
      }
      case "price-asc":
        return a.cheapestPrice - b.cheapestPrice;
      case "price-desc":
        return b.cheapestPrice - a.cheapestPrice;
      case "name-asc":
        return a.product.localeCompare(b.product);
      case "entries-desc":
        return b.totalRecords - a.totalRecords;
      case "recent-desc":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  return filtered;
}

/**
 * Condition style helpers
 */
export function getConditionBadgeStyles(condition: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (condition.toLowerCase()) {
    case "pristine":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30",
        dot: "bg-purple-400",
      };
    case "excellent":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        dot: "bg-emerald-400",
      };
    case "good":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-400",
        border: "border-sky-500/30",
        dot: "bg-sky-400",
      };
    case "fair":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
      };
    default:
      return {
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        border: "border-zinc-500/30",
        dot: "bg-zinc-400",
      };
  }
}
