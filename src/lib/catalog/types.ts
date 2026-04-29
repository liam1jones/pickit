/** Shared catalog item shape used by every vendor file under src/lib/catalog. */
export interface CatalogItem {
  id: string;
  model: string;
  manufacturer: string;
  /** Coarse bucket: cable | transceiver | consumable | hardware | service | other */
  category: string;
  description: string;
  partNumber: string;
  /** Pre-formatted currency string, e.g. '$123.45'. Empty when unknown. */
  estimatedCost: string;
  /** Free-form spec line shown beside the part. */
  specs: string;
  /** Slug(s) of the vendor file(s) this item belongs to. */
  vendorIds: string[];
}
