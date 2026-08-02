export const isOutOfStock = (product: { stockQuantity?: unknown } | null | undefined) => {
  // Treat undefined/null stockQuantity as in stock (assume available if not specified)
  if (product?.stockQuantity === undefined || product?.stockQuantity === null) {
    return false;
  }
  return Number(product.stockQuantity) <= 0;
};

export const getAvailableStock = (product: { stockQuantity?: unknown } | null | undefined) =>
  Math.max(0, Number(product?.stockQuantity ?? 0));

export const isLowStock = (
  product: { stockQuantity?: unknown; lowStockAlert?: unknown } | null | undefined
) => {
  const stockQuantity = Number(product?.stockQuantity ?? 0);
  const lowStockAlert = Number(product?.lowStockAlert ?? 0);
  return stockQuantity > 0 && lowStockAlert > 0 && stockQuantity <= lowStockAlert;
};
