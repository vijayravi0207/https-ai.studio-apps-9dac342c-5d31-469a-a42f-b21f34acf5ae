import { jsPDF } from 'jspdf';
import { MixDesignInputs, MixDesignOutputs, MixReportMetadata, DEFAULT_REPORT_METADATA } from '../types/concrete';

export function generateMixDesignPdf(
  inputs: MixDesignInputs,
  outputs: MixDesignOutputs,
  dateStr: string,
  metadata: MixReportMetadata = DEFAULT_REPORT_METADATA
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;
  const contentWidth = pageWidth - 20;

  const clientName = metadata.clientName || DEFAULT_REPORT_METADATA.clientName;
  const projectSite = metadata.projectSite || DEFAULT_REPORT_METADATA.projectSite;
  const preparedBy = metadata.preparedBy || DEFAULT_REPORT_METADATA.preparedBy;
  const checkedBy = metadata.checkedBy || DEFAULT_REPORT_METADATA.checkedBy;
  const approvedBy = metadata.approvedBy || DEFAULT_REPORT_METADATA.approvedBy || 'Engineer-in-Charge';
  const refNo = metadata.reportRef || `CMD/${inputs.grade}/${dateStr.replace(/[^0-9]/g, '').slice(-6) || '202610'}`;

  // ==========================================
  // PAGE 1: STEPS 1 TO 6 & PROJECT METADATA
  // ==========================================
  let y = 10;

  // Title Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, y, contentWidth, 22, 'F');

  // Accent Line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(marginX, y + 21, contentWidth, 1.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCRETE MIX DESIGN REPORT (IS 10262:2019 & IS 456:2000)', pageWidth / 2, y + 8, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text(`Comprehensive Mix Proportioning for Grade ${inputs.grade} (${inputs.concreteType})`, pageWidth / 2, y + 14, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text(`Report Ref: ${refNo}   |   Date: ${dateStr}`, pageWidth / 2, y + 19, { align: 'center' });

  y += 26;

  // Project & Authority Information Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(marginX, y, contentWidth, 23, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Client Name:', marginX + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, marginX + 27, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Project Site:', marginX + 3, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(projectSite, marginX + 27, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Concrete Grade:', marginX + 3, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.grade} (${outputs.fck} N/mm² @ 28 Days)`, marginX + 27, y + 16);

  // Right column
  const colRightLabel = marginX + 105;
  const colRightValue = marginX + 128;

  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By:', colRightLabel, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(preparedBy, colRightValue, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Checked By:', colRightLabel, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(checkedBy, colRightValue, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Supervision:', colRightLabel, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.siteControl} Control | ${inputs.placingMethod}`, colRightValue, y + 16);

  y += 26;

  // Helper for section header
  const drawSectionHeader = (title: string, curY: number) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(marginX, curY, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX + 3, curY + 3.8);
    return curY + 7;
  };

  // STEP 1: Design Stipulations
  y = drawSectionHeader('STEP 1: DESIGN STIPULATIONS (IS 10262 Clause 4.1)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  const s1Col1 = marginX + 3;
  const s1Col2 = marginX + 50;
  const s1Col3 = marginX + 98;
  const s1Col4 = marginX + 150;

  doc.setFont('helvetica', 'bold');
  doc.text('Characteristic Strength (fck):', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${outputs.fck} N/mm² at 28 days`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Type of Cement:', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.cementType.replace('_', ' ')} (IS 269/1489)`, s1Col4, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Max Nominal Aggregate (MSA):', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.maxAggregateSize} mm (${inputs.aggregateShape})`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Exposure Condition:', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.exposureCondition} (${inputs.concreteType})`, s1Col4, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Workability (Slump):', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.workabilitySlump} mm`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Degree of Site Control:', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.siteControl} Control`, s1Col4, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Placing Method:', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inputs.placingMethod, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Chemical Admixture:', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(inputs.useAdmixture ? `Superplasticizer (${inputs.admixtureDosagePercent}% dosage)` : 'None', s1Col4, y);

  y += 7;

  // STEP 2: Test Data of Materials
  y = drawSectionHeader('STEP 2: TEST DATA OF MATERIALS (Clause 4.3)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Specific Gravity - Cement:', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.specificGravityCement}`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Sand Grading Zone (IS 383):', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.sandZone}`, s1Col4, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Specific Gravity - Coarse Agg (SSD):', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.specificGravityCA}`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Specific Gravity - Fine Agg (SSD):', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.specificGravityFA}`, s1Col4, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Water Absorption (CA / FA):', s1Col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.waterAbsorptionCA}% / ${inputs.waterAbsorptionFA}%`, s1Col2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Free Moisture (CA / FA):', s1Col3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.freeMoistureCA}% / ${inputs.freeMoistureFA}%`, s1Col4, y);

  if (inputs.useAdmixture) {
    y += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Admixture Specific Gravity:', s1Col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inputs.specificGravityAdmixture}`, s1Col2, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Water Reduction Achieved:', s1Col3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inputs.admixtureReductionPercent}%`, s1Col4, y);
  }

  y += 7;

  // STEP 3: Target Mean Compressive Strength
  y = drawSectionHeader('STEP 3: TARGET MEAN COMPRESSIVE STRENGTH OF CONCRETE (Clause 4.2)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`From IS 10262:2019 Table 2, Standard Deviation (s) = ${outputs.standardDeviation} N/mm²`, marginX + 3, y);
  y += 4;
  doc.text(`From IS 10262:2019 Table 1, Factor X for grade ${inputs.grade} = ${outputs.xFactor} N/mm²`, marginX + 3, y);
  y += 4.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(marginX + 2, y - 2.5, contentWidth - 4, 11, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Case A: f'ck = fck + 1.65 × s = ${outputs.fck} + (1.65 × ${outputs.standardDeviation}) = ${(outputs.fck + 1.65 * outputs.standardDeviation).toFixed(2)} N/mm²`, marginX + 5, y + 1);
  y += 4.5;
  doc.text(`Case B: f'ck = fck + X = ${outputs.fck} + ${outputs.xFactor} = ${(outputs.fck + outputs.xFactor).toFixed(2)} N/mm²`, marginX + 5, y + 1);
  y += 4.5;

  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFont('helvetica', 'bold');
  doc.text(`=> Governing Target Mean Strength f'target = ${outputs.fTarget.toFixed(2)} N/mm² (Adopted higher value per IS 10262)`, marginX + 3, y);

  y += 7;

  // STEP 4: Selection of Water-Cement Ratio
  y = drawSectionHeader('STEP 4: SELECTION OF WATER-CEMENT RATIO (Clause 5.2 & IS 456 Table 5)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Preliminary water-cement ratio from IS 10262:2019 Curve 2 (Fig. 1) = ${outputs.calculatedWC.toFixed(3)}`, marginX + 3, y);
  y += 4;
  doc.text(`• Maximum permissible free w/c ratio for '${inputs.exposureCondition}' exposure (IS 456 Table 5) = ${outputs.maxPermissibleWC.toFixed(3)}`, marginX + 3, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70); // emerald-700
  doc.text(`=> Adopted Free Water-Cement Ratio = ${outputs.adoptedWC.toFixed(3)} [≤ ${outputs.maxPermissibleWC.toFixed(3)} - Complies with IS 456 Table 5]`, marginX + 3, y);

  y += 7;

  // STEP 5: Selection of Water Content
  y = drawSectionHeader('STEP 5: SELECTION OF WATER CONTENT (Clause 5.3 & Table 4)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Base water content for ${inputs.maxAggregateSize} mm angular aggregate (for 50 mm slump) = ${outputs.baseWater} kg/m³`, marginX + 3, y);
  y += 4;
  const slumpExtraPercent = ((inputs.workabilitySlump - 50) / 25) * 3;
  doc.text(`• Adjustment for workability (${inputs.workabilitySlump} mm slump: +${slumpExtraPercent.toFixed(1)}%) = ${outputs.slumpAdjustedWater} kg/m³`, marginX + 3, y);
  y += 4;
  if (inputs.useAdmixture) {
    doc.text(`• Water reduction by chemical superplasticizer (${inputs.admixtureReductionPercent}% reduction) = ${outputs.finalWater} kg/m³`, marginX + 3, y);
  } else {
    doc.text(`• Without chemical admixture, net mixing water = ${outputs.finalWater} kg/m³`, marginX + 3, y);
  }
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`=> Net Mixing Water Content = ${outputs.finalWater} kg/m³ (Litres/m³)`, marginX + 3, y);

  y += 7;

  // STEP 6: Calculation of Cementitious Material Content
  y = drawSectionHeader('STEP 6: CALCULATION OF CEMENTITIOUS CONTENT (Clause 5.4)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Water-cement ratio = ${outputs.adoptedWC.toFixed(3)} | Net Water = ${outputs.finalWater} kg/m³`, marginX + 3, y);
  y += 4;
  doc.text(`• Calculated Cementitious Content = ${outputs.finalWater} / ${outputs.adoptedWC.toFixed(3)} = ${outputs.baseCementitious} kg/m³`, marginX + 3, y);
  y += 4;
  doc.text(`• Minimum cement content for '${inputs.exposureCondition}' exposure (IS 456:2000 Table 5) = ${outputs.minCementRequired} kg/m³`, marginX + 3, y);
  y += 4.5;

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.rect(marginX + 2, y - 2.5, contentWidth - 4, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(`=> Total Cementitious Adopted = ${outputs.totalCementitious} kg/m³ (≥ ${outputs.minCementRequired} kg/m³ Minimum Check PASSED)`, marginX + 4, y + 1);
  y += 4.5;
  doc.text(`   OPC Cement: ${outputs.cementContent} kg/m³ | Mineral Replacement: ${outputs.mineralContent} kg/m³ | Max 450 kg/m³ Check PASSED`, marginX + 4, y + 1);

  // Footer of Page 1
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Concrete Mix Design Pro | Conforming to IS 10262:2019 & IS 456:2000', marginX, pageHeight - 8);
  doc.text('Page 1 of 2 (Continued on Page 2...)', pageWidth - marginX, pageHeight - 8, { align: 'right' });

  // ==========================================
  // PAGE 2: STEPS 7 TO 12, RATIOS & SIGNATURES
  // ==========================================
  doc.addPage();
  y = 10;

  // Header Box Page 2
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, y, contentWidth, 14, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(marginX, y + 13, contentWidth, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`CONCRETE MIX DESIGN REPORT - GRADE ${inputs.grade} (PART 2)`, marginX + 4, y + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Ref: ${refNo} | Client: ${clientName} | Site: ${projectSite}`, marginX + 4, y + 10.5);

  y += 18;

  // STEP 7: Aggregate Proportioning
  y = drawSectionHeader('STEP 7: ESTIMATION OF COARSE & FINE AGGREGATE PROPORTIONS (Clause 5.5)', y);

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`• From IS 10262 Table 5: Base volume of Coarse Agg per unit volume of total agg for ${inputs.sandZone} (at w/c 0.50) = ${outputs.coarseAggBaseVolumeRatio}`, marginX + 3, y);
  y += 4;
  const wcDiff = (0.50 - outputs.adoptedWC).toFixed(3);
  doc.text(`• Correction for w/c ratio (${outputs.adoptedWC.toFixed(3)} vs 0.50, delta: ${wcDiff}) = corrected ratio ${outputs.coarseAggCorrectedVolumeRatio}`, marginX + 3, y);
  y += 4;
  if (inputs.placingMethod === 'Pumping') {
    doc.text(`• Pumping concrete correction: Coarse aggregate volume reduced by 10% per Clause 5.5.2`, marginX + 3, y);
    y += 4;
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`=> Final Volume Ratios: Coarse Aggregate = ${outputs.coarseAggFinalVolumeRatio} | Fine Aggregate = ${outputs.fineAggFinalVolumeRatio}`, marginX + 3, y);

  y += 7;

  // STEP 8: Absolute Volume Calculations
  y = drawSectionHeader('STEP 8: MIX CALCULATIONS (ABSOLUTE VOLUME METHOD - Clause 5.6)', y);

  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');

  const volCol1 = marginX + 3;
  const volCol2 = marginX + 98;

  doc.text(`a) Volume of concrete = 1.0000 m³`, volCol1, y);
  doc.text(`b) Volume of entrapped air (Table 3) = ${outputs.airContentVolume.toFixed(4)} m³`, volCol2, y);
  y += 4;
  doc.text(`c) Volume of Cement = ${outputs.cementContent} / (${inputs.specificGravityCement} × 1000) = ${outputs.volCement.toFixed(4)} m³`, volCol1, y);
  doc.text(`d) Volume of Water = ${outputs.finalWater} / (1.0 × 1000) = ${outputs.volWater.toFixed(4)} m³`, volCol2, y);
  y += 4;
  doc.text(`e) Volume of Chemical Admixture = ${outputs.volAdmixture.toFixed(4)} m³`, volCol1, y);
  if (outputs.mineralContent > 0) {
    doc.text(`f) Volume of Mineral = ${outputs.volMineral.toFixed(4)} m³`, volCol2, y);
  } else {
    doc.text(`f) Volume of Mineral = 0.0000 m³`, volCol2, y);
  }
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`g) Volume of All-In Aggregate = 1 - (b + c + d + e + f) = ${outputs.volTotalAggregate.toFixed(4)} m³`, volCol1, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`h) Mass of Coarse Aggregate (SSD) = ${outputs.volTotalAggregate.toFixed(4)} × ${outputs.coarseAggFinalVolumeRatio} × ${inputs.specificGravityCA} × 1000 = ${outputs.coarseAggSSD} kg/m³`, volCol1, y);
  y += 4;
  doc.text(`i) Mass of Fine Aggregate (SSD) = ${outputs.volTotalAggregate.toFixed(4)} × ${outputs.fineAggFinalVolumeRatio} × ${inputs.specificGravityFA} × 1000 = ${outputs.fineAggSSD} kg/m³`, volCol1, y);

  y += 7;

  // STEP 9: Final Mix Proportions Table
  y = drawSectionHeader('STEP 9: RECOMMENDED MIX PROPORTIONS (PER 1 CUBIC METRE - SSD CONDITION)', y);

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(marginX, y, contentWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.text('Material Component', marginX + 3, y + 3.5);
  doc.text('Mass (kg/m³)', marginX + 70, y + 3.5);
  doc.text('Specific Gravity', marginX + 110, y + 3.5);
  doc.text('Volume (m³)', marginX + 150, y + 3.5);
  y += 5;

  const items = [
    { name: `Cement (${inputs.cementType.replace('_', ' ')})`, mass: `${outputs.cementContent.toFixed(1)} kg`, sg: `${inputs.specificGravityCement}`, vol: `${outputs.volCement.toFixed(4)}` },
    ...(inputs.mineralAdmixture !== 'None' && outputs.mineralContent > 0
      ? [{ name: `${inputs.mineralAdmixture} (${inputs.mineralPercentage}%)`, mass: `${outputs.mineralContent.toFixed(1)} kg`, sg: `${inputs.specificGravityMineral}`, vol: `${outputs.volMineral.toFixed(4)}` }]
      : []),
    { name: `Water (w/c: ${outputs.adoptedWC.toFixed(3)})`, mass: `${outputs.finalWater.toFixed(1)} kg / L`, sg: '1.00', vol: `${outputs.volWater.toFixed(4)}` },
    { name: `Fine Aggregate (Sand - ${inputs.sandZone})`, mass: `${outputs.fineAggSSD.toFixed(1)} kg`, sg: `${inputs.specificGravityFA}`, vol: `${(outputs.volTotalAggregate * outputs.fineAggFinalVolumeRatio).toFixed(4)}` },
    { name: `Coarse Aggregate (MSA ${inputs.maxAggregateSize}mm)`, mass: `${outputs.coarseAggSSD.toFixed(1)} kg`, sg: `${inputs.specificGravityCA}`, vol: `${(outputs.volTotalAggregate * outputs.coarseAggFinalVolumeRatio).toFixed(4)}` },
    ...(inputs.useAdmixture && outputs.admixtureSSD > 0
      ? [{ name: `Chemical Admixture (${inputs.admixtureDosagePercent}%)`, mass: `${outputs.admixtureSSD.toFixed(2)} kg`, sg: `${inputs.specificGravityAdmixture}`, vol: `${outputs.volAdmixture.toFixed(4)}` }]
      : []),
  ];

  const totalMass = outputs.cementContent + outputs.mineralContent + outputs.finalWater + outputs.fineAggSSD + outputs.coarseAggSSD + outputs.admixtureSSD;
  const ratioFA = outputs.fineAggSSD / (outputs.cementContent + outputs.mineralContent);
  const ratioCA = outputs.coarseAggSSD / (outputs.cementContent + outputs.mineralContent);

  items.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(marginX, y, contentWidth, 4.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.text(item.name, marginX + 3, y + 3.2);
    doc.setFont('helvetica', 'bold');
    doc.text(item.mass, marginX + 70, y + 3.2);
    doc.setFont('helvetica', 'normal');
    doc.text(item.sg, marginX + 110, y + 3.2);
    doc.text(item.vol, marginX + 150, y + 3.2);
    y += 4.5;
  });

  // Summary Row & Ratio
  doc.setFillColor(226, 232, 240);
  doc.rect(marginX, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.2);
  doc.text('Total Wet Concrete Density', marginX + 3, y + 3.5);
  doc.text(`${totalMass.toFixed(1)} kg/m³`, marginX + 70, y + 3.5);
  doc.text(`Mix Ratio  1 : ${ratioFA.toFixed(2)} : ${ratioCA.toFixed(2)}`, marginX + 110, y + 3.5);
  doc.text('1.0000 m³', marginX + 150, y + 3.5);

  y += 8;

  // STEP 10: Field Moisture Corrections
  y = drawSectionHeader('STEP 10: FIELD MOISTURE ADJUSTMENTS (Clause 5.7 / Site Batch)', y);

  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Fine Aggregate (Wet): ${outputs.wetAggFA} kg (Free Moisture: ${inputs.freeMoistureFA}%, Absorption: ${inputs.waterAbsorptionFA}%)`, marginX + 3, y);
  y += 3.8;
  doc.text(`• Coarse Aggregate (Wet): ${outputs.wetAggCA} kg (Free Moisture: ${inputs.freeMoistureCA}%, Absorption: ${inputs.waterAbsorptionCA}%)`, marginX + 3, y);
  y += 3.8;
  doc.text(`• Net free water contributed by aggregate surfaces = ${outputs.freeWaterContributed} kg/m³`, marginX + 3, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text(`=> Actual Net Water to Add in Mixer = ${outputs.actualWaterToAdd} kg/m³ (Litres/m³)`, marginX + 3, y);

  y += 7;

  // STEP 11: 50 kg Bag Batching
  y = drawSectionHeader('STEP 11: SITE BATCHING QUANTITIES (PER 50 KG CEMENT BAG)', y);

  const bagFactor = 50 / outputs.cementContent;
  const bagCement = 50;
  const bagWater = outputs.actualWaterToAdd * bagFactor;
  const bagFA = outputs.wetAggFA * bagFactor;
  const bagCA = outputs.wetAggCA * bagFactor;
  const bagAdmix = outputs.admixtureSSD * bagFactor;

  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(`• Cement: ${bagCement.toFixed(1)} kg (1 Bag)`, marginX + 3, y);
  doc.text(`• Water to Add: ${bagWater.toFixed(1)} Litres`, marginX + 65, y);
  doc.text(`• Wet Sand (FA): ${bagFA.toFixed(1)} kg`, marginX + 130, y);
  y += 4.2;
  doc.text(`• Wet Aggregate (CA): ${bagCA.toFixed(1)} kg`, marginX + 3, y);
  if (bagAdmix > 0) {
    doc.text(`• Admixture Dosage: ${(bagAdmix * 1000).toFixed(0)} ml`, marginX + 65, y);
  }
  doc.text(`• Required Slump: ${inputs.workabilitySlump} mm`, marginX + 130, y);

  y += 8;

  // STEP 12: Durability & Quality Checklist
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.rect(marginX, y, contentWidth, 11, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('STEP 12: IS 456 & IS 10262 CODE COMPLIANCE VERIFICATION', marginX + 3, y + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text(`✓ Min Cement: ${outputs.cementContent.toFixed(0)} kg/m³ ≥ ${outputs.minCementRequired} kg/m³ (IS 456 Table 5 Pass)   |   ✓ Max w/c: ${outputs.adoptedWC.toFixed(3)} ≤ ${outputs.maxPermissibleWC} (Pass)`, marginX + 3, y + 7.5);
  doc.text(`✓ Compressive Strength Test Frequency: Standard 150mm cubes per IS 456 Clause 15.2.2 (Tested at 7 & 28 days)`, marginX + 3, y + 10);

  y += 16;

  // Signatures & Authorization Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, y, contentWidth, 24, 'FD');

  const sigCol1 = marginX + 8;
  const sigCol2 = marginX + 72;
  const sigCol3 = marginX + 136;

  // Signature Lines
  doc.setDrawColor(148, 163, 184);
  doc.line(sigCol1, y + 13, sigCol1 + 45, y + 13);
  doc.line(sigCol2, y + 13, sigCol2 + 45, y + 13);
  doc.line(sigCol3, y + 13, sigCol3 + 45, y + 13);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Prepared By:', sigCol1, y + 5);
  doc.text('Checked By:', sigCol2, y + 5);
  doc.text('Approved By / Client:', sigCol3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(preparedBy, sigCol1, y + 9);
  doc.text(checkedBy, sigCol2, y + 9);
  doc.text(approvedBy, sigCol3, y + 9);

  doc.setFontSize(6.2);
  doc.setTextColor(148, 163, 184);
  doc.text('Civil QC Engineer', sigCol1, y + 16.5);
  doc.text('Chief Structural Consultant', sigCol2, y + 16.5);
  doc.text('Authorized Signatory & Seal', sigCol3, y + 16.5);

  // Footer of Page 2
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Concrete Mix Design Pro | Conforming to IS 10262:2019 & IS 456:2000', marginX, pageHeight - 8);
  doc.text('Page 2 of 2 (End of Mix Design Report)', pageWidth - marginX, pageHeight - 8, { align: 'right' });

  return doc;
}
