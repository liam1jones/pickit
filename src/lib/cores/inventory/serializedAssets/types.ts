/**
 * Datacenter equipment and specification types from
 * `00.References/from.dcSupreme/datacenterCore`.
 */

export type ConnectionType = "fiber" | "ethernet";

export interface Equipment {
  id: string;
  name: string;
  rackUnit: number;
  height: number;
  connectionType: ConnectionType;
  connectionTypes?: ConnectionType[];
  connectsTo?: string;
  transceivers?: Array<{
    model: string;
    quantity: number;
  }>;
}

export interface DataHall {
  id: string;
  name: string;
}

export interface Cabinet {
  id: string;
  number: number;
  row: number;
  position: number;
  x: number;
  y: number;
  dataHallId: string;
  specificationModel?: string;
  equipment: Equipment[];
  pdus?: Array<{
    model: string;
    quantity: number;
  }>;
}

export interface Connection {
  id: string;
  fromCabinetId: string;
  fromEquipmentId: string;
  toCabinetId: string;
  toEquipmentId: string;
  connectionType: ConnectionType;
  length: number;
}

export interface CableInventory {
  type: ConnectionType;
  length: number;
  quantity: number;
}

export interface Pod {
  id: string;
  name: string;
  rows: number[];
}

export interface Measurement {
  imperial: number;
  metric: number;
  unitImperial: string;
  unitMetric: string;
}

export interface CabinetSpecification {
  model: string;
  manufacturer: string;
  type: string;
  rackUnits: number;
  dimensions: {
    height: Measurement;
    width: Measurement;
    depth: Measurement;
    internalDepth: Measurement;
  };
  weight: {
    empty: Measurement;
    maxStaticLoad: Measurement;
    maxDynamicLoad: Measurement;
  };
  features: {
    cableManagement: string[];
    cooling: string[];
    power: string[];
    security: string[];
  };
  compliance: string[];
  partNumbers: Record<string, string>;
}

export interface PDUSpecification {
  model: string;
  manufacturer: string;
  description: string;
  electrical: {
    input: {
      voltage: string;
      current: string;
      frequency: string;
      maxPower: string;
      plugType: string;
    };
    output: {
      voltage: string;
      outlets: { type: string; quantity: number }[];
      overloadProtection: string;
    };
  };
  metering: {
    attributes: string[];
    accuracy: string;
    locations: string[];
    remoteOutletSwitching: boolean;
  };
  networkManagement: {
    connectivity: string[];
    protocols: string[];
    features: string[];
  };
  physical: {
    dimensions: {
      height: Measurement;
      width: Measurement;
      depth: Measurement;
    };
    cordLength: Measurement;
  };
  environmental: {
    operatingTemp: string;
    storageTemp: string;
    humidity: string;
    maxElevation: string;
  };
  compliance: string[];
  links?: {
    manufacturer: string;
    productPage: string;
    datasheet: string;
  };
  estimatedCost?: string;
  releaseDate?: string;
}

export interface ServerSpecification {
  model: string;
  manufacturer: string;
  description: string;
  chassis: {
    formFactor: string;
    rackUnits: number;
    dimensions: {
      height: Measurement;
      width: Measurement;
      depth: Measurement;
    };
    weight: {
      max: Measurement;
    };
  };
  compute: {
    processors: {
      model: string;
      sockets: number;
      maxCores: number;
    };
    memory: {
      type: string;
      slots: number;
      maxCapacity: string;
    };
    storage: {
      bays: string;
      supportedTypes: string[];
    };
    gpu: {
      model: string;
      count: number;
      memory: string;
      connection: string;
    };
  };
  networking: {
    ports: string[];
    options: string[];
    portCapacity?: {
      fiber: number;
      ethernet: number;
    };
  };
  power: {
    powerSupply: string;
    quantity: number;
    maxConsumption: string;
  };
  cooling: {
    fans: string;
    type: string;
  };
  compliance: string[];
  links?: {
    manufacturer: string;
    productPage: string;
    datasheet: string;
  };
  estimatedCost?: string;
  releaseDate?: string;
}

export interface CableSpecification {
  model: string;
  type: "copper" | "fiber";
  category: string;
  connector: string;
  shielding?: string;
  jacket?: string;
  availableLengths: Measurement[];
  technicalSpecs: {
    bandwidth: string;
    frequency: string;
    gauge: string;
    compliance: string[];
  };
}

export interface TransceiverSpecification {
  model: string;
  manufacturer: string;
  description: string;
  formFactor: string;
  type: string;
  connector: string;
  dataRate: string;
  wavelength: string;
  reach: {
    value: number;
    unit: string;
    conditions?: string;
  };
  power: {
    maxConsumption: string;
  };
  compatibility?: {
    cableType: string;
    devices: string[];
  };
  compliance: string[];
  links?: {
    manufacturer: string;
    productPage: string;
    datasheet: string;
  };
  estimatedCost?: string;
  releaseDate?: string;
}

export interface SwitchSpecification {
  model: string;
  manufacturer: string;
  description: string;
  type: string;
  ports: {
    total: number;
    types: {
      type: string;
      count: number;
      speed: string;
    }[];
  };
  performance: {
    switchingCapacity: string;
    latency: string;
  };
  physical: {
    chassis: {
      rackUnits: number;
      dimensions: {
        height: Measurement;
        width: Measurement;
        depth: Measurement;
      };
      weight: Measurement;
    };
    cooling: {
      airflow: string;
    };
  };
  power: {
    supplies: string;
    maxConsumption: string;
  };
  portCapacity?: {
    fiber: number;
    ethernet: number;
  };
  compliance: string[];
  links?: {
    manufacturer: string;
    productPage: string;
    datasheet: string;
  };
  estimatedCost?: string;
  releaseDate?: string;
}

import type { InventoryTheme } from "../theme";

/** Theme tokens for serialized-asset category chips (subset of `D`). */
export type CategoryPresentationTheme = Pick<
  InventoryTheme,
  "blue" | "green" | "teal" | "purple" | "amber" | "t3"
>;

export type CategoryColorToken = keyof CategoryPresentationTheme;

export type SerializedAssetCategoryDef = {
  label: string;
  colorToken: CategoryColorToken;
};
