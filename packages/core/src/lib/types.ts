/**
 * Kanso Protocol — Core Types
 *
 * These types define the shared API contract for all components.
 * Every interactive component MUST use these types consistently.
 */

/** Component size scale */
export type KpSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Visual variant */
export type KpVariant = 'default' | 'subtle' | 'outline' | 'ghost';

/** Color role */
export type KpColorRole = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'neutral';

/** Interactive component states (for documentation/testing) */
export type KpState = 'rest' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error';

/** Size-to-value mappings */
export const KP_SIZES: Record<KpSize, number> = {
  xs: 24,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 52,
};

export const KP_RADII: Record<KpSize, number> = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
};

export const KP_ICON_SIZES: Record<KpSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 24,
};
