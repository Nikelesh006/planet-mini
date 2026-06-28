export const isOutOfStock = (product: { stockQuantity?: unknown } | null | undefined) =>
  Number(product?.stockQuantity ?? 0) <= 0;

export const getAvailableStock = (product: { stockQuantity?: unknown } | null | undefined) =>
  Math.max(0, Number(product?.stockQuantity ?? 0));
