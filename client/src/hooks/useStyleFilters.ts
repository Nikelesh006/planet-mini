import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export const STYLE_MAPPING: Record<string, { name: string; variants: string[] }> = {
  "Jhablas": {
    name: "Jhablas",
    variants: ["Knot Jhablas", "Button Jhablas"]
  },
  "Towels & Blankets": {
    name: "Towels & Blankets",
    variants: ["Hooded Towels", "Swaddle"]
  },
  "Nappies": {
    name: "Nappies",
    variants: ["Newborn Nappies", "Small Nappies", "Medium Nappies", "Large Nappies"]
  },
  "Wipes": {
    name: "Wipes",
    variants: ["Wet Wipes", "Dry Wipes", "Baby Wipes"]
  },
  "Newborn Accessories": {
    name: "Newborn Accessories",
    variants: ["Hat", "Mittens", "Booties"]
  },
  "Hats": {
    name: "Hats",
    variants: ["Sun Hats", "Beanie"]
  },
  "Beds": {
    name: "Beds",
    variants: ["Baby Nest", "Baby Net Bed"]
  }
};

export interface UseStyleFiltersOptions {
  minPrice?: number;
  maxPrice?: number;
}

export function useStyleFilters(options?: UseStyleFiltersOptions) {
  // Helper to parse current query parameters from window.location.search
  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const parse = (key: string): string[] => {
      const val = params.get(key);
      return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    };
    return {
      styleGroup: parse('styleGroup'),
      styleVariant: parse('styleVariant'),
      size: parse('size'),
      color: parse('color'),
    };
  }, []);

  const initialParams = getQueryParams();

  const [styleGroups, setStyleGroups] = useState<string[]>(initialParams.styleGroup);
  const [styleVariants, setStyleVariants] = useState<string[]>(initialParams.styleVariant);
  const [sizes, setSizes] = useState<string[]>(initialParams.size);
  const [colors, setColors] = useState<string[]>(initialParams.color);

  // Sync state to URL without disturbing price query params
  const syncToUrl = useCallback((
    groups: string[],
    variants: string[],
    szs: string[],
    clrs: string[]
  ) => {
    const params = new URLSearchParams(window.location.search);

    if (groups.length > 0) params.set('styleGroup', groups.join(','));
    else params.delete('styleGroup');

    if (variants.length > 0 && groups.length > 0) params.set('styleVariant', variants.join(','));
    else params.delete('styleVariant');

    if (szs.length > 0) params.set('size', szs.join(','));
    else params.delete('size');

    if (clrs.length > 0) params.set('color', clrs.join(','));
    else params.delete('color');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  // Prune variants when their parent style group is deselected
  const pruneVariants = useCallback((activeGroups: string[], currentVariants: string[]) => {
    if (activeGroups.length === 0) return [];

    const allowed = new Set<string>();
    activeGroups.forEach(groupKey => {
      const mapping = STYLE_MAPPING[groupKey] ||
        Object.values(STYLE_MAPPING).find(m => m.name.toLowerCase() === groupKey.toLowerCase());
      if (mapping?.variants) {
        mapping.variants.forEach(v => allowed.add(v.toLowerCase()));
      }
    });

    return currentVariants.filter(v => allowed.has(v.toLowerCase()));
  }, []);

  const toggleStyleGroup = useCallback((group: string) => {
    setStyleGroups(prev => {
      const nextGroups = prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group];

      setStyleVariants(prevVariants => {
        const nextVariants = pruneVariants(nextGroups, prevVariants);
        syncToUrl(nextGroups, nextVariants, sizes, colors);
        return nextVariants;
      });

      return nextGroups;
    });
  }, [pruneVariants, syncToUrl, sizes, colors]);

  const toggleStyleVariant = useCallback((variant: string) => {
    setStyleVariants(prev => {
      const nextVariants = prev.includes(variant)
        ? prev.filter(v => v !== variant)
        : [...prev, variant];

      syncToUrl(styleGroups, nextVariants, sizes, colors);
      return nextVariants;
    });
  }, [styleGroups, syncToUrl, sizes, colors]);

  const toggleSize = useCallback((size: string) => {
    setSizes(prev => {
      const nextSizes = prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size];

      syncToUrl(styleGroups, styleVariants, nextSizes, colors);
      return nextSizes;
    });
  }, [styleGroups, styleVariants, syncToUrl, colors]);

  const toggleColor = useCallback((color: string) => {
    setColors(prev => {
      const nextColors = prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color];

      syncToUrl(styleGroups, styleVariants, sizes, nextColors);
      return nextColors;
    });
  }, [styleGroups, styleVariants, sizes, syncToUrl]);

  // Reset filters (leaving price range intact)
  const clearFilters = useCallback(() => {
    setStyleGroups([]);
    setStyleVariants([]);
    setSizes([]);
    setColors([]);
    syncToUrl([], [], [], []);
  }, [syncToUrl]);

  // Construct query string for backend API call
  const queryParamsString = useMemo(() => {
    const params = new URLSearchParams();
    if (styleGroups.length > 0) params.set('styleGroup', styleGroups.join(','));
    if (styleVariants.length > 0 && styleGroups.length > 0) params.set('styleVariant', styleVariants.join(','));
    if (sizes.length > 0) params.set('size', sizes.join(','));
    if (colors.length > 0) params.set('color', colors.join(','));
    if (options?.minPrice !== undefined) params.set('minPrice', String(options.minPrice));
    if (options?.maxPrice !== undefined) params.set('maxPrice', String(options.maxPrice));
    return params.toString();
  }, [styleGroups, styleVariants, sizes, colors, options?.minPrice, options?.maxPrice]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-by-style-products', queryParamsString],
    queryFn: async () => {
      const res = await fetch(`/api/products/shop-by-style?${queryParamsString}`);
      if (!res.ok) throw new Error('Failed to fetch shop-by-style products');
      return res.json();
    }
  });

  return {
    styleGroups,
    styleVariants,
    sizes,
    colors,
    toggleStyleGroup,
    toggleStyleVariant,
    toggleSize,
    toggleColor,
    clearFilters,
    products: data?.products || [],
    counts: data?.counts || { styleGroups: {}, styleVariants: {} },
    isLoading,
    isError,
    error,
    refetch
  };
}
