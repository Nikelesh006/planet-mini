import React from 'react';
import { STYLE_MAPPING } from '../hooks/useStyleFilters';

interface StyleVariantChipsProps {
  selectedGroups: string[];
  selectedVariants: string[];
  onToggleVariant: (variant: string) => void;
  counts?: Record<string, number>;
}

export const StyleVariantChips: React.FC<StyleVariantChipsProps> = ({
  selectedGroups,
  selectedVariants,
  onToggleVariant,
  counts = {}
}) => {
  // Hide if no style group is selected
  if (!selectedGroups || selectedGroups.length === 0) {
    return null;
  }

  // Group active variants by their parent style group
  const activeGroupMappings = selectedGroups
    .map(groupKey => {
      const mapping = STYLE_MAPPING[groupKey] ||
        Object.values(STYLE_MAPPING).find(m => m.name.toLowerCase() === groupKey.toLowerCase());
      return {
        groupName: groupKey,
        variants: mapping?.variants || []
      };
    })
    .filter(g => g.variants.length > 0);

  // Hide if none of the selected groups have defined variants
  if (activeGroupMappings.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-amber-50/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-amber-200/60 dark:border-zinc-700/50 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold tracking-wider text-amber-800 dark:text-amber-400 uppercase">
          STYLE VARIANTS
        </span>
        <span className="text-xs text-muted-foreground font-normal">
          (Grouped by selected style)
        </span>
      </div>

      <div className="space-y-3">
        {activeGroupMappings.map(({ groupName, variants }) => (
          <div key={groupName} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-w-[130px]">
              {groupName}:
            </span>
            <div className="flex flex-wrap gap-2">
              {variants.map(variant => {
                const isSelected = selectedVariants.includes(variant);
                const count = counts[variant] ?? 0;

                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => onToggleVariant(variant)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-amber-600/20 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                    }`}
                  >
                    <span>{variant}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-700 text-amber-100' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
