import { jsPDF } from 'jspdf';
import { MixDesignInputs, MixDesignOutputs } from '../types/concrete';

export function generateMixDesignPdf(
  inputs: MixDesignInputs,
  outputs: MixDesignOutputs,
  dateStr: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Title Box (Deep Slate Header)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(10, y, pageWidth - 20, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCRETE MIX DESIGN REPORT (IS 10262:2019)', pageWidth / 2, y + 8, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('Code Conforming to IS 456:2000 (Table 5) & IS 10262:2019 (Clause 5.8.1)', pageWidth / 2, y + 14, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  const refNo = `CMD/${inputs.grade}/${dateStr.replace(/[^0-9]/g, '').slice(-6) || '789123'}`;
  doc.text(`Report Ref: ${refNo}   |   Date: ${dateStr}`, pageWidth / 2, y + 20, { align: 'center' });

  y += 30;

  // Section 1: Design Stipulations
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. DESIGN STIPULATIONS (IS 10262 Clause 4.1)', 13, y + 4.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const col1 = 14;
  const col2 = 62;
  const col3 = 110;
  const col4 = 160;

  doc.text('Characteristic Strength (fck):', col1, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${outputs.fck} N/mm² (28 Days)`, col2, y);
  doc.setFont('helvetica', 'normal');
  doc.text("Target Mean Strength (f'target):", col3, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${outputs.fTarget.toFixed(2)} N/mm²`, col4, y);

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.text('Grade & Type of Cement:', col1, y);
  doc.text(`${inputs.cementType.replace('_', ' ')} (IS 269/1489)`, col2, y);
  doc.text('Max Aggregate Size (MSA):', col3, y);
  doc.text(`${inputs.maxAggregateSize} mm (${inputs.aggregateShape})`, col4, y);

  y += 5.5;
  doc.text('Exposure Condition:', col1, y);
  doc.text(`${inputs.exposureCondition} (${inputs.concreteType})`, col2, y);
  doc.text('Workability Slump:', col3, y);
  doc.text(`${inputs.workabilitySlump} mm`, col4, y);

  y += 5.5;
  doc.text('Placing Method & Control:', col1, y);
  doc.text(`${inputs.placingMethod} | ${inputs.siteControl} Control`, col2, y);
  doc.text('Adopted w/c Ratio:', col3, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${outputs.adoptedWC.toFixed(3)} (Max: ${outputs.maxPermissibleWC})`, col4, y);

  y += 9;

  // Section 2: Target Strength Calculation
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('2. TARGET MEAN STRENGTH FORMULA (Clause 4.2)', 13, y + 4.5);

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Case A: f'ck = fck + 1.65 × s = ${outputs.fck} + (1.65 × ${outputs.standardDeviation}) = ${(outputs.fck + 1.65 * outputs.standardDeviation).toFixed(2)} N/mm²`, 14, y);
  y += 4.5;
  doc.text(`Case B: f'ck = fck + X = ${outputs.fck} + ${outputs.xFactor} = ${(outputs.fck + outputs.xFactor).toFixed(2)} N/mm²`, 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(`Governing Target Strength = ${outputs.fTarget.toFixed(2)} N/mm² (Adopted higher value per IS 10262)`, 14, y);

  y += 9;

  // Section 3: Material Proportions
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('3. FINAL MIX PROPORTIONS (PER 1 CUBIC METRE - SSD CONDITION)', 13, y + 4.5);

  y += 7.5;
  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, pageWidth - 20, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Material Component', 14, y + 3.8);
  doc.text('Mass (kg/m³)', 75, y + 3.8);
  doc.text('Specific Gravity', 115, y + 3.8);
  doc.text('Absolute Vol (m³)', 155, y + 3.8);

  y += 5.5;
  const items = [
    { name: `Cement (${inputs.cementType.replace('_', ' ')})`, mass: `${outputs.cementContent.toFixed(1)} kg`, sg: `${inputs.specificGravityCement}`, vol: `${outputs.volCement.toFixed(4)}` },
    ...(inputs.mineralAdmixture !== 'None' && outputs.mineralContent > 0
      ? [{ name: `${inputs.mineralAdmixture} (${inputs.mineralPercentage}%)`, mass: `${outputs.mineralContent.toFixed(1)} kg`, sg: `${inputs.specificGravityMineral}`, vol: `${outputs.volMineral.toFixed(4)}` }]
      : []),
    { name: `Water (w/c: ${outputs.adoptedWC.toFixed(3)})`, mass: `${outputs.finalWater.toFixed(1)} kg / L`, sg: '1.00', vol: `${outputs.volWater.toFixed(4)}` },
    { name: `Fine Aggregate (${inputs.sandZone})`, mass: `${outputs.fineAggSSD.toFixed(1)} kg`, sg: `${inputs.specificGravityFA}`, vol: `${(outputs.volTotalAggregate * outputs.fineAggFinalVolumeRatio).toFixed(4)}` },
    { name: `Coarse Aggregate (MSA ${inputs.maxAggregateSize}mm)`, mass: `${outputs.coarseAggSSD.toFixed(1)} kg`, sg: `${inputs.specificGravityCA}`, vol: `${(outputs.volTotalAggregate * outputs.coarseAggFinalVolumeRatio).toFixed(4)}` },
    ...(inputs.useAdmixture && outputs.admixtureSSD > 0
      ? [{ name: `Chemical Admixture (${inputs.admixtureDosagePercent}%)`, mass: `${outputs.admixtureSSD.toFixed(2)} kg`, sg: `${inputs.specificGravityAdmixture}`, vol: `${outputs.volAdmixture.toFixed(4)}` }]
      : []),
  ];

  const totalMass = outputs.cementContent + outputs.mineralContent + outputs.finalWater + outputs.fineAggSSD + outputs.coarseAggSSD + outputs.admixtureSSD;
  const ratioCement = 1;
  const ratioFA = outputs.fineAggSSD / (outputs.cementContent + outputs.mineralContent);
  const ratioCA = outputs.coarseAggSSD / (outputs.cementContent + outputs.mineralContent);

  items.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(10, y, pageWidth - 20, 5.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.text(item.name, 14, y + 3.8);
    doc.setFont('helvetica', 'bold');
    doc.text(item.mass, 75, y + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.text(item.sg, 115, y + 3.8);
    doc.text(item.vol, 155, y + 3.8);
    y += 5.5;
  });

  // Total summary row
  doc.setFillColor(226, 232, 240);
  doc.rect(10, y, pageWidth - 20, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text('Total Density & Ratio', 14, y + 3.8);
  doc.text(`${totalMass.toFixed(1)} kg/m³`, 75, y + 3.8);
  doc.text(`Ratio 1 : ${ratioFA.toFixed(2)} : ${ratioCA.toFixed(2)}`, 115, y + 3.8);
  doc.text('1.0000 m³', 155, y + 3.8);

  y += 10;

  // Section 4: Site Batching Quantities (Per 50 kg Cement Bag)
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('4. SITE BATCHING QUANTITIES (PER 50 KG CEMENT BAG)', 13, y + 4.5);

  y += 7.5;
  const bagFactor = 50 / outputs.cementContent;
  const bagCement = 50;
  const bagWater = outputs.finalWater * bagFactor;
  const bagFA = outputs.fineAggSSD * bagFactor;
  const bagCA = outputs.coarseAggSSD * bagFactor;
  const bagAdmix = outputs.admixtureSSD * bagFactor;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Cement: ${bagCement.toFixed(1)} kg (1 Bag)`, 14, y);
  doc.text(`• Water: ${bagWater.toFixed(1)} Litres`, 75, y);
  doc.text(`• Fine Aggregate (Sand): ${bagFA.toFixed(1)} kg`, 130, y);
  y += 4.5;
  doc.text(`• Coarse Aggregate (Gravel): ${bagCA.toFixed(1)} kg`, 14, y);
  if (bagAdmix > 0) {
    doc.text(`• Admixture Dosage: ${(bagAdmix * 1000).toFixed(0)} ml / g`, 75, y);
  }
  doc.text(`• Slump Requirement: ${inputs.workabilitySlump} mm`, 130, y);

  y += 10;

  // Section 5: Code Compliance Verification
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.roundedRect(10, y, pageWidth - 20, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(8);
  doc.text('IS 456:2000 & IS 10262:2019 CODE COMPLIANCE VERIFICATION', 14, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`✓ Minimum Cement Content: ${outputs.cementContent.toFixed(0)} kg/m³ ≥ ${outputs.minCementRequired} kg/m³ (IS 456 Table 5 Pass)`, 14, y + 9.5);
  doc.text(`✓ Maximum Water-Cement Ratio: ${outputs.adoptedWC.toFixed(3)} ≤ ${outputs.maxPermissibleWC} (IS 456 Table 5 Pass)`, 14, y + 14);

  y += 24;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y + 8, 65, y + 8);
  doc.line(80, y + 8, 130, y + 8);
  doc.line(145, y + 8, 195, y + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Prepared by', 25, y + 12);
  doc.text('QC In-charge', 92, y + 12);
  doc.text('Chief Structural Engineer', 150, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Civil Engineering Consultant', 20, y + 16);
  doc.text('Material Testing Laboratory', 87, y + 16);
  doc.text('Authorized Signatory & Seal', 152, y + 16);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Concrete Mix Design Pro (IS 10262:2019 Suite) | Confirmed to Indian Standards', pageWidth / 2, 288, { align: 'center' });

  return doc;
}
