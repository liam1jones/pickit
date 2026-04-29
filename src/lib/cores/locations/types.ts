/** CoreWeave-style site / DC location metadata */
export type CoreWeaveLocation = {
  /** Site code, e.g. US-BVI01 */
  code: string;
  /** Full option label, e.g. US-BVI01 – Breinigsville, PA */
  label: string;
  /** IANA time zone name */
  timezone: string;
  /** US ZIP or international postal code */
  zipCode: string;
};
