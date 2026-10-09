import type { AssetClass } from './model'

/** Fixed categorical slot per asset class, so a class keeps its color everywhere. */
export const ASSET_COLOR: Record<AssetClass, string> = {
  stock: 'var(--series-1)',
  fund: 'var(--series-2)',
  bond: 'var(--series-3)',
  insurance: 'var(--series-4)',
  realEstate: 'var(--series-5)',
  cash: 'var(--series-6)',
}
