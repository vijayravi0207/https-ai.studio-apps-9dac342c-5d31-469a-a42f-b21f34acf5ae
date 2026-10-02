export type GradeType = 
  | 'M10' | 'M15' | 'M20' 
  | 'M25' | 'M30' | 'M35' | 'M40' | 'M45' | 'M50' | 'M55' | 'M60'
  | 'M65' | 'M70' | 'M75' | 'M80';

export type CementType = 
  | 'OPC_33' 
  | 'OPC_43' 
  | 'OPC_53' 
  | 'PPC' 
  | 'PSC';

export type ExposureCondition = 'Mild' | 'Moderate' | 'Severe' | 'Very Severe' | 'Extreme';

export type AggregateSize = 10 | 20 | 40;

export type AggregateShape = 'Angular' | 'SubAngular' | 'GravelCrushed' | 'Rounded';

export type SandZone = 'Zone I' | 'Zone II' | 'Zone III' | 'Zone IV';

export type SiteControl = 'Good' | 'Fair';

export type PlacingMethod = 'Chute' | 'Pumping' | 'CraneBucket' | 'Tremie';

export type MineralAdmixtureType = 'None' | 'FlyAsh' | 'GGBS' | 'SilicaFume' | 'Metakaolin';

export interface MixDesignInputs {
  grade: GradeType;
  concreteType: 'RCC' | 'PCC';
  cementType: CementType;
  specificGravityCement: number;
  exposureCondition: ExposureCondition;
  maxAggregateSize: AggregateSize;
  aggregateShape: AggregateShape;
  sandZone: SandZone;
  workabilitySlump: number; // in mm, e.g. 50, 75, 100, 120
  placingMethod: PlacingMethod;
  siteControl: SiteControl;
  useCustomStdDev: boolean;
  customStdDev?: number;

  // Mineral Admixture
  mineralAdmixture: MineralAdmixtureType;
  mineralPercentage: number; // % of total cementitious
  specificGravityMineral: number;
  cementitiousIncreasePercent: number; // e.g. 10% when fly ash/GGBS used

  // Chemical Admixture
  useAdmixture: boolean;
  admixtureReductionPercent: number; // % water reduction, e.g. 23%
  admixtureDosagePercent: number; // % by weight of cementitious, e.g. 1.0%
  specificGravityAdmixture: number;

  // Aggregates Specific Gravity & Absorption
  specificGravityCA: number;
  specificGravityFA: number;
  waterAbsorptionCA: number; // % e.g. 0.5%
  waterAbsorptionFA: number; // % e.g. 1.0%
  freeMoistureCA: number; // % e.g. 0% or 1.5%
  freeMoistureFA: number; // % e.g. 0% or 4.0%
  coarseFractionRatio: number; // e.g. 0.6 (60% 20-10mm, 40% 10-4.75mm)
}

export interface MixDesignOutputs {
  fck: number;
  fTarget: number;
  targetFormulaUsed: '1.65S' | 'X_Factor';
  standardDeviation: number;
  xFactor: number;
  adoptedWC: number;
  calculatedWC: number;
  maxPermissibleWC: number;
  isWCGovernedByDurability: boolean;

  baseWater: number;
  slumpAdjustedWater: number;
  shapeAdjustedWater: number;
  finalWater: number;

  baseCementitious: number;
  totalCementitious: number;
  cementContent: number;
  mineralContent: number;
  minCementRequired: number;
  isCementMinSatisfied: boolean;
  maxCementLimit: number;
  isCementMaxSatisfied: boolean;

  airContentVolume: number;
  coarseAggBaseVolumeRatio: number;
  coarseAggCorrectedVolumeRatio: number;
  coarseAggFinalVolumeRatio: number;
  fineAggFinalVolumeRatio: number;

  volCement: number;
  volMineral: number;
  volWater: number;
  volAdmixture: number;
  volTotalAggregate: number;

  coarseAggSSD: number;
  fineAggSSD: number;
  admixtureSSD: number;

  // Field Condition Adjustments
  dryAggCA: number;
  dryAggFA: number;
  extraWaterForAbsorption: number;

  wetAggCA: number;
  wetAggFA: number;
  freeWaterContributed: number;
  actualWaterToAdd: number;

  // Fractions of Coarse Aggregate
  caFraction1: number; // 20-10 mm
  caFraction2: number; // 10-4.75 mm

  // Unit ratio normalized to cement
  ratioString: string;
}

export interface NominalMixSpec {
  grade: 'M5' | 'M7.5' | 'M10' | 'M15' | 'M20';
  proportions: string;
  totalDryAggKg: number;
  faToCaRatio: string;
  maxWaterLiters: number;
  usageDesc: string;
}

export interface CubeTestRecord {
  id: string;
  date: string;
  grade: GradeType;
  curingDays: number;
  sample1: number;
  sample2: number;
  sample3: number;
  average: number;
  isValid: boolean;
  status: 'Pass' | 'Fail' | 'Check Variation';
}
