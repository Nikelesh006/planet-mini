/**
 * Converts a price to the 9s pricing pattern
 * Examples: 200 → 199, 230 → 229, 345 → 339
 * @param price - The original price
 * @returns The price converted to end with 9
 */
export function convertToPriceEndingIn9(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  return Math.floor((price + 1) / 10) * 10 - 1;
}

/**
 * Converts a string price to the 9s pricing pattern
 * @param priceStr - The original price as string
 * @returns The price converted to end with 9 as string
 */
export function convertPriceStringTo9(priceStr: string): string {
  const price = parseFloat(priceStr);
  if (!Number.isFinite(price) || price <= 0) return priceStr;
  return convertToPriceEndingIn9(price).toString();
}
