import { 
  MixDesignInputs, 
  MixDesignOutputs, 
  GradeType, 
  ExposureCondition, 
  AggregateSize, 
  SandZone,
  NominalMixSpec
} from '../types/concrete';

// Table 1 - IS 10262:2019 Factor X based on grade
export const FACTOR_X_TABLE: Record<GradeType, number> = {
  M10: 5.0,
  M15: 5.0,
  M20: 5.5,
  M25: 5.5,
  M30: 6.5,
  M35: 6.5,
  M40: 6.5,
  M45: 6.5,
  M50: 6.5,
  M55: 6.5,
  M60: 6.5,
  M65: 8.0,
  M70: 8.0,
  M75: 8.0,
  M80: 8.0,
};

// Table 2 - IS 10262:2019 Assumed Standard Deviation S (for Good site control)
export const STD_DEV_TABLE: Record<GradeType, number> = {
  M10: 3.5,
  M15: 3.5,
  M20: 4.0,
  M25: 4.0,
  M30: 5.0,
  M35: 5.0,
  M40: 5.0,
  M45: 5.0,
  M50: 5.0,
  M55: 5.0,
  M60: 5.0,
  M65: 6.0,
  M70: 6.0,
  M75: 6.0,
  M80: 6.0,
};

// Table 5 IS 456:2000 - Minimum cement & Maximum w/c ratio for 20mm aggregate
export const DURABILITY_LIMITS: Record<
  'RCC' | 'PCC',
  Record<
    ExposureCondition,
    { minCement: number; maxWC: number; minGrade?: GradeType }
  >
> = {
  PCC: {
    Mild: { minCement: 220, maxWC: 0.60 },
    Moderate: { minCement: 240, maxWC: 0.60, minGrade: 'M15' },
    Severe: { minCement: 250, maxWC: 0.50, minGrade: 'M20' },
    'Very Severe': { minCement: 260, maxWC: 0.45, minGrade: 'M20' },
    Extreme: { minCement: 280, maxWC: 0.40, minGrade: 'M25' },
  },
  RCC: {
    Mild: { minCement: 300, maxWC: 0.55, minGrade: 'M20' },
    Moderate: { minCement: 300, maxWC: 0.50, minGrade: 'M25' },
    Severe: { minCement: 320, maxWC: 0.45, minGrade: 'M30' },
    'Very Severe': { minCement: 340, maxWC: 0.45, minGrade: 'M35' },
    Extreme: { minCement: 360, maxWC: 0.40, minGrade: 'M40' },
  },
};

// Table 6 IS 456:2000 - Adjustments to Minimum Cement Content for Aggregates other than 20mm
export const AGG_CEMENT_ADJUSTMENT: Record<AggregateSize, number> = {
  10: 40,
  20: 0,
  40: -30,
};

// Table 3 IS 10262:2019 - Entrapped Air Content %
export const AIR_CONTENT_TABLE: Record<AggregateSize, number> = {
  10: 1.5,
  20: 1.0,
  40: 0.8,
};

// Table 4 IS 10262:2019 - Base Water Content (kg/m3) for angular aggregate & 50mm slump
export const BASE_WATER_CONTENT: Record<AggregateSize, number> = {
  10: 208,
  20: 186,
  40: 165,
};

// Table 5 IS 10262:2019 - Volume of Coarse Aggregate per Unit Volume of Total Aggregate at w/c = 0.50
export const COARSE_AGG_VOLUME_TABLE: Record<
  AggregateSize,
  Record<SandZone, number>
> = {
  10: {
    'Zone IV': 0.54,
    'Zone III': 0.52,
    'Zone II': 0.50,
    'Zone I': 0.48,
  },
  20: {
    'Zone IV': 0.66,
    'Zone III': 0.64,
    'Zone II': 0.62,
    'Zone I': 0.60,
  },
  40: {
    'Zone IV': 0.73,
    'Zone III': 0.72,
    'Zone II': 0.71,
    'Zone I': 0.69,
  },
};

// High strength concrete Table 8 (IS 10262:2019)
export const HIGH_STRENGTH_WC_TABLE: Array<{
  targetStrength: number;
  wcByMSA: Record<AggregateSize, number>;
}> = [
  { targetStrength: 70, wcByMSA: { 10: 0.36, 20: 0.33, 40: 0.32 } },
  { targetStrength: 75, wcByMSA: { 10: 0.34, 20: 0.31, 40: 0.30 } },
  { targetStrength: 80, wcByMSA: { 10: 0.32, 20: 0.29, 40: 0.28 } },
  { targetStrength: 85, wcByMSA: { 10: 0.30, 20: 0.27, 40: 0.26 } },
  { targetStrength: 90, wcByMSA: { 10: 0.28, 20: 0.26, 40: 0.25 } },
  { targetStrength: 100, wcByMSA: { 10: 0.26, 20: 0.24, 40: 0.23 } },
];

/**
 * Calculates preliminary w/c ratio based on Fig. 1 curves (IS 10262:2019)
 */
export function estimateWaterCementFromCurve(
  targetStrength: number,
  cementType: 'OPC_33' | 'OPC_43' | 'OPC_53' | 'PPC' | 'PSC',
  msa: AggregateSize = 20
): number {
  // If high strength concrete (target strength >= 70 MPa)
  if (targetStrength >= 70) {
    if (targetStrength >= 100) return HIGH_STRENGTH_WC_TABLE[5].wcByMSA[msa];
    for (let i = 0; i < HIGH_STRENGTH_WC_TABLE.length - 1; i++) {
      const lower = HIGH_STRENGTH_WC_TABLE[i];
      const upper = HIGH_STRENGTH_WC_TABLE[i + 1];
      if (targetStrength >= lower.targetStrength && targetStrength <= upper.targetStrength) {
        const factor = (targetStrength - lower.targetStrength) / (upper.targetStrength - lower.targetStrength);
        const wcVal = lower.wcByMSA[msa] + factor * (upper.wcByMSA[msa] - lower.wcByMSA[msa]);
        return Number(wcVal.toFixed(3));
      }
    }
  }

  // Curve 1: OPC 33 (Expected 28 day strength 33 to <43 MPa)
  // Curve 2: OPC 43, PPC, PSC (Expected 28 day strength 43 to <53 MPa)
  // Curve 3: OPC 53 (Expected 28 day strength 53 MPa & above)
  if (cementType === 'OPC_33') {
    // Calibrated curve for OPC 33: at 20 MPa -> 0.58, at 30 MPa -> 0.46, at 40 MPa -> 0.36
    const wc = 0.82 - 0.0115 * targetStrength;
    return Math.min(0.65, Math.max(0.30, Number(wc.toFixed(3))));
  } else if (cementType === 'OPC_53') {
    // Calibrated curve for OPC 53: at 35 MPa -> 0.52, at 48.25 MPa -> 0.42, at 60 MPa -> 0.33, at 70 MPa -> 0.28
    const wc = 0.86 - 0.0089 * targetStrength;
    return Math.min(0.60, Math.max(0.24, Number(wc.toFixed(3))));
  } else {
    // OPC 43, PPC, PSC (Curve 2):
    // From IS 10262:2019 Annex A: f'ck = 48.25 -> w/c = 0.36
    // From Annex B & C: f'ck = 48.25 -> w/c = 0.36
    // From Annex E: f'ck = 38.25 -> w/c = 0.43
    // From Annex F: f'ck = 20.77 -> w/c = 0.61
    // Linear regression on exact code examples: slope = (0.36 - 0.61)/(48.25 - 20.77) = -0.25 / 27.48 = -0.0091
    // intercept = 0.36 - (-0.0091 * 48.25) = 0.36 + 0.439 = 0.799
    const wc = 0.80 - 0.00912 * targetStrength;
    return Math.min(0.65, Math.max(0.25, Number(wc.toFixed(3))));
  }
}

/**
 * Main concrete mix design calculation complying strictly with IS 10262:2019 & IS 456:2000
 */
export function calculateMixDesign(inputs: MixDesignInputs): MixDesignOutputs {
  const fck = parseInt(inputs.grade.replace('M', ''), 10);

  // 1. Target Mean Compressive Strength (Clause 4.2)
  const baseS = STD_DEV_TABLE[inputs.grade] || 5.0;
  const sCorrection = inputs.siteControl === 'Fair' ? 1.0 : 0.0;
  const S = inputs.useCustomStdDev && inputs.customStdDev ? inputs.customStdDev : baseS + sCorrection;
  const X = FACTOR_X_TABLE[inputs.grade] || 6.5;

  const fTargetA = fck + 1.65 * S;
  const fTargetB = fck + X;
  const fTarget = Number(Math.max(fTargetA, fTargetB).toFixed(2));
  const targetFormulaUsed: '1.65S' | 'X_Factor' = fTargetA >= fTargetB ? '1.65S' : 'X_Factor';

  // 2. Selection of Water-Cement Ratio (Clause 5.1 & Table 5 IS 456)
  const calculatedWC = estimateWaterCementFromCurve(
    fTarget,
    inputs.cementType,
    inputs.maxAggregateSize
  );

  const durabilitySpec = DURABILITY_LIMITS[inputs.concreteType][inputs.exposureCondition];
  const maxPermissibleWC = durabilitySpec.maxWC;
  const adoptedWC = Math.min(calculatedWC, maxPermissibleWC);
  const isWCGovernedByDurability = calculatedWC > maxPermissibleWC;

  // 3. Selection of Water Content (Clause 5.3 & Table 4)
  const baseWater = BASE_WATER_CONTENT[inputs.maxAggregateSize] || 186;

  // Slump adjustment: 3% for each 25mm variation from 50mm
  const slumpDelta = inputs.workabilitySlump - 50;
  const slumpAdjustFactor = 1 + (slumpDelta / 25) * 0.03;
  const slumpAdjustedWater = baseWater * slumpAdjustFactor;

  // Aggregate shape adjustment:
  let shapeAdjustKg = 0;
  if (inputs.aggregateShape === 'SubAngular') shapeAdjustKg = -10;
  else if (inputs.aggregateShape === 'GravelCrushed') shapeAdjustKg = -15;
  else if (inputs.aggregateShape === 'Rounded') shapeAdjustKg = -20;

  const shapeAdjustedWater = slumpAdjustedWater + shapeAdjustKg;

  // Chemical admixture reduction (Clause 5.3)
  const admixFactor = inputs.useAdmixture
    ? 1 - inputs.admixtureReductionPercent / 100
    : 1.0;
  const finalWater = Math.round(shapeAdjustedWater * admixFactor);

  // 4. Calculation of Cementitious Material Content (Clause 5.4)
  const baseCementitious = finalWater / adoptedWC;

  // Optional cementitious content increase (Clause 5.4.1)
  const cementitiousMultiplier =
    inputs.mineralAdmixture !== 'None'
      ? 1 + (inputs.cementitiousIncreasePercent || 0) / 100
      : 1.0;
  const totalCementitious = Math.round(baseCementitious * cementitiousMultiplier);

  // Split into Mineral Admixture and OPC
  let mineralContent = 0;
  if (inputs.mineralAdmixture !== 'None' && inputs.mineralPercentage > 0) {
    mineralContent = Math.round(totalCementitious * (inputs.mineralPercentage / 100));
  }
  const cementContent = totalCementitious - mineralContent;

  // Durability Check against Table 5 & Table 6 of IS 456
  const baseMinCement = durabilitySpec.minCement;
  const aggAdjustment = AGG_CEMENT_ADJUSTMENT[inputs.maxAggregateSize] || 0;
  const minCementRequired = baseMinCement + aggAdjustment;
  const isCementMinSatisfied = totalCementitious >= minCementRequired;

  const maxCementLimit = 450; // IS 456 Clause 8.2.4.2 (OPC content)
  const isCementMaxSatisfied = cementContent <= maxCementLimit;

  // 5. Estimation of Coarse Aggregate Proportion (Clause 5.5 & Table 5)
  const baseCAVolRatio =
    COARSE_AGG_VOLUME_TABLE[inputs.maxAggregateSize]?.[inputs.sandZone] ?? 0.62;

  // Correction for w/c ratio (Clause 5.5.1):
  // At w/c = 0.50, ratio is baseCAVolRatio. For every decrease of 0.05 in w/c, increase CA by 0.01
  const wcDelta = 0.50 - adoptedWC;
  const caWCCorrection = (wcDelta / 0.05) * 0.01;
  const coarseAggCorrectedVolumeRatio = baseCAVolRatio + caWCCorrection;

  // Placing method reduction (e.g. pumpable concrete reduce up to 10% - Clause 5.5.2)
  const pumpReduction = inputs.placingMethod === 'Pumping' ? 0.90 : 1.0;
  const coarseAggFinalVolumeRatio = Number(
    (coarseAggCorrectedVolumeRatio * pumpReduction).toFixed(3)
  );
  const fineAggFinalVolumeRatio = Number(
    (1 - coarseAggFinalVolumeRatio).toFixed(3)
  );

  // 6. Absolute Volume Calculations per 1 m³ (Clause 5.7)
  const airContentPercent = AIR_CONTENT_TABLE[inputs.maxAggregateSize] || 1.0;
  const airContentVolume = airContentPercent / 100;

  const volCement = cementContent / (inputs.specificGravityCement * 1000);
  const volMineral =
    mineralContent > 0
      ? mineralContent / (inputs.specificGravityMineral * 1000)
      : 0;
  const volWater = finalWater / (1.0 * 1000);

  // Chemical Admixture weight & volume
  const admixtureDosageKg = inputs.useAdmixture
    ? totalCementitious * (inputs.admixtureDosagePercent / 100)
    : 0;
  const volAdmixture =
    admixtureDosageKg > 0
      ? admixtureDosageKg / (inputs.specificGravityAdmixture * 1000)
      : 0;

  // Total Volume of All Aggregate
  const volTotalAggregate =
    1.0 -
    airContentVolume -
    (volCement + volMineral + volWater + volAdmixture);

  // Masses of Coarse & Fine Aggregate in SSD condition
  const coarseAggSSD = Math.round(
    volTotalAggregate *
      coarseAggFinalVolumeRatio *
      inputs.specificGravityCA *
      1000
  );
  const fineAggSSD = Math.round(
    volTotalAggregate *
      fineAggFinalVolumeRatio *
      inputs.specificGravityFA *
      1000
  );
  const admixtureSSD = Number(admixtureDosageKg.toFixed(2));

  // 7. Field Adjustments for Dry Aggregate (Clause A-11)
  const dryAggCA = Math.round(
    coarseAggSSD / (1 + inputs.waterAbsorptionCA / 100)
  );
  const dryAggFA = Math.round(
    fineAggSSD / (1 + inputs.waterAbsorptionFA / 100)
  );
  const extraWaterForAbsorption = Math.round(
    (coarseAggSSD - dryAggCA) + (fineAggSSD - dryAggFA)
  );

  // 8. Field Adjustments for Wet Aggregate (Clause B-11)
  // Free moisture = Total moisture - Water absorption
  const wetAggCA = Math.round(
    coarseAggSSD * (1 + inputs.freeMoistureCA / 100)
  );
  const wetAggFA = Math.round(
    fineAggSSD * (1 + inputs.freeMoistureFA / 100)
  );
  const freeWaterContributed = Math.round(
    (wetAggCA - coarseAggSSD) + (wetAggFA - fineAggSSD)
  );
  const actualWaterToAdd = Math.round(finalWater - freeWaterContributed);

  // 9. Coarse Aggregate fractions (Clause A-13)
  const fractionRatio = inputs.coarseFractionRatio || 0.6;
  const caFraction1 = Math.round(coarseAggSSD * fractionRatio);
  const caFraction2 = coarseAggSSD - caFraction1;

  // 10. Normalized Ratio: Cement : FA : CA : Water
  const normCement = 1;
  const normFA = Number((fineAggSSD / cementContent).toFixed(2));
  const normCA = Number((coarseAggSSD / cementContent).toFixed(2));
  const ratioString = `1 : ${normFA} : ${normCA}`;

  return {
    fck,
    fTarget,
    targetFormulaUsed,
    standardDeviation: S,
    xFactor: X,
    adoptedWC,
    calculatedWC,
    maxPermissibleWC,
    isWCGovernedByDurability,

    baseWater,
    slumpAdjustedWater: Math.round(slumpAdjustedWater),
    shapeAdjustedWater: Math.round(shapeAdjustedWater),
    finalWater,

    baseCementitious: Math.round(baseCementitious),
    totalCementitious,
    cementContent,
    mineralContent,
    minCementRequired,
    isCementMinSatisfied,
    maxCementLimit,
    isCementMaxSatisfied,

    airContentVolume,
    coarseAggBaseVolumeRatio: baseCAVolRatio,
    coarseAggCorrectedVolumeRatio: Number(coarseAggCorrectedVolumeRatio.toFixed(3)),
    coarseAggFinalVolumeRatio,
    fineAggFinalVolumeRatio,

    volCement: Number(volCement.toFixed(4)),
    volMineral: Number(volMineral.toFixed(4)),
    volWater: Number(volWater.toFixed(4)),
    volAdmixture: Number(volAdmixture.toFixed(4)),
    volTotalAggregate: Number(volTotalAggregate.toFixed(4)),

    coarseAggSSD,
    fineAggSSD,
    admixtureSSD,

    dryAggCA,
    dryAggFA,
    extraWaterForAbsorption,

    wetAggCA,
    wetAggFA,
    freeWaterContributed,
    actualWaterToAdd,

    caFraction1,
    caFraction2,
    ratioString,
  };
}

// IS 456:2000 Table 9 - Proportions for Nominal Mix Concrete
export const NOMINAL_MIX_DATA: Record<string, NominalMixSpec> = {
  M5: {
    grade: 'M5',
    proportions: '1 : 5 : 10',
    totalDryAggKg: 800,
    faToCaRatio: '1:2 (subject to limits 1:1.5 to 1:2.5)',
    maxWaterLiters: 60,
    usageDesc: 'Lean concrete bases, foundation bedding, leveling course',
  },
  M7_5: {
    grade: 'M7.5',
    proportions: '1 : 4 : 8',
    totalDryAggKg: 625,
    faToCaRatio: '1:2 (subject to limits 1:1.5 to 1:2.5)',
    maxWaterLiters: 45,
    usageDesc: 'Foundation bedding, mass concrete walls, floor sub-bases',
  },
  M10: {
    grade: 'M10',
    proportions: '1 : 3 : 6',
    totalDryAggKg: 480,
    faToCaRatio: '1:2 (Zone II: 1:1.5 for 10mm, 1:2 for 20mm, 1:2.5 for 40mm)',
    maxWaterLiters: 34,
    usageDesc: 'Plain concrete works, path paving, simple foundations',
  },
  M15: {
    grade: 'M15',
    proportions: '1 : 2 : 4',
    totalDryAggKg: 330,
    faToCaRatio: '1:2 (Zone II: 1:1.5 for 10mm, 1:2 for 20mm, 1:2.5 for 40mm)',
    maxWaterLiters: 32,
    usageDesc: 'Flooring, general plain concrete, non-structural elements',
  },
  M20: {
    grade: 'M20',
    proportions: '1 : 1.5 : 3',
    totalDryAggKg: 250,
    faToCaRatio: '1:2 (Zone II: 1:1.5 for 10mm, 1:2 for 20mm, 1:2.5 for 40mm)',
    maxWaterLiters: 30,
    usageDesc: 'Permissible for residential slabs, beams, columns (max grade for nominal mix)',
  },
};

// Stripping Time of Formwork (IS 456 Clause 11.3)
export const STRIPPING_TIME_GUIDE = [
  {
    type: 'Vertical formwork to columns, walls, beams',
    period: '16 – 24 hours',
    tamil: 'தூண்கள், சுவர்கள், பீம்களின் செங்குத்து பலகைகள்',
  },
  {
    type: 'Soffit formwork to slabs (props to be refixed immediately)',
    period: '3 days',
    tamil: 'தளங்களின் கீழ்ப் பகுதி தட்டு (முட்டுகள் மீண்டும் வைக்கப்பட வேண்டும்)',
  },
  {
    type: 'Soffit formwork to beams (props to be refixed immediately)',
    period: '7 days',
    tamil: 'பீம்களின் அடி பலகைகள் (முட்டுகள் உடனே பொருத்தப்பட வேண்டும்)',
  },
  {
    type: 'Props to slabs: Spanning up to 4.5 m',
    period: '7 days',
    tamil: 'தள முட்டுகள்: 4.5 மீ இடைவெளி வரை',
  },
  {
    type: 'Props to slabs: Spanning over 4.5 m',
    period: '14 days',
    tamil: 'தள முட்டுகள்: 4.5 மீட்டருக்கு மேல்',
  },
  {
    type: 'Props to beams and arches: Spanning up to 6 m',
    period: '14 days',
    tamil: 'பீம் & ஆர்ச் முட்டுகள்: 6 மீ இடைவெளி வரை',
  },
  {
    type: 'Props to beams and arches: Spanning over 6 m',
    period: '21 days',
    tamil: 'பீம் & ஆர்ச் முட்டுகள்: 6 மீட்டருக்கு மேல்',
  },
];
