/** Logistics Database row (columns B onward; LOCODE is the map key). */
export type SiteLogistics = {
  regionalIcm: string;
  ics: string;
  address: string;
  loadingDockAvailable: string;
  dockLevel: string;
  dockDoorsWideEnoughLargePallets: string;
  parkingForTrailersTrucks: string;
  vehicleHeightRestrictions: string;
  maximumClearance: string;
  deliveryAppointmentsRequired: string;
  securityBadgesRequired: string;
  securityBadgeProcess: string;
  securityEscortNeeded: string;
  idRequiredDeliveryPersonnel: string;
  indoorPpeRequired: string;
  indoorPpeItems: string;
  forkliftAvailable: string;
  palletJackAvailable: string;
  freightElevatorAvailable: string;
  specialMaterialHandlingNeeded: string;
  deliveryPathFreeOfObstructions: string;
  onsiteStorageEarlyLateShipments: string;
  deliveryIntegratedItProjectTeam: string;
  onsiteInspectionBeforeDeparture: string;
  workPhone: string;
  workEmail: string;
  requiredLeadTime: string;
  deliveryTimeWindowsOrBlackouts: string;
  deliveryTimeWindowsDetails: string;
  overnightAfterHoursReceivingPermitted: string;
  emergencyDeliveryService: string;
  emergencyDeliveryInstructions: string;
  emergencyContactForExceptions: string;
  emergencyContactNamePhone: string;
  dimensionsCapacityKnown: string;
  specifyService: string;
  obstacles: string;
  stairsOrRampsToEquipmentRoom: string;
  receivingAreaIndoorOutdoor: string;
  protectiveFloorCoveringRequired: string;
  designatedUnpackingArea: string;
  unpackingDurationConditions: string;
  packagingDisposalService: string;
  hazardousMaterialRestrictions: string;
  hazardousMaterialRestrictionsDetail: string;
  documentationRequiredOnArrival: string;
  priorCustomsClearanceMandatory: string;
  embargoedRestrictedItems: string;
  embargoedRestrictedItemsList: string;
  leadContact: string;
};

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
  /** Regional ICM (Logistics Database). */
  regionalIcm: string;
  /** ICS contact (Logistics Database). */
  ics: string;
  /** Street address (Logistics Database). */
  address: string;
  /** Row from `docs/Corey ICS Site list.ods` → Logistics Database (when present). */
  logistics?: SiteLogistics;
};
