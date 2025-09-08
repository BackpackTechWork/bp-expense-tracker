/**
 * Formats a number as currency without the dollar sign
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "123.45")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formats a number as currency with the dollar sign
 * @param amount - The amount to format
 * @returns Formatted currency string with dollar sign (e.g., "$123.45")
 */
export function formatCurrencyWithSymbol(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}
