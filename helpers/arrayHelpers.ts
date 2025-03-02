/**
 * Expands an array of objects with quantity property into multiple objects
 * @param items Array of objects with quantity property
 * @returns Expanded array with duplicate entries based on quantity
 */
export function expandByQuantity<T extends { quantity: number }>(
  items: T[]
): Omit<T, "quantity">[] {
  return items.flatMap((item) => {
    const { quantity, ...itemWithoutQuantity } = item;
    return Array(quantity).fill(itemWithoutQuantity);
  });
}
