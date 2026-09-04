import { calculateAluFabrication } from '../src/utils/aluCalculEngine.js';

// Test item: 2 units of 140x150 Coulissant 2 vantaux (Série 67)
const testItems = [
  {
    _uid: 'item_1',
    family_id: 'fam_coul_s67',
    product_type_id: 's67_porte_2v',
    couleur: 'blanc',
    hauteur: 140,
    largeur: 150,
    quantity: 2,
    remplissage_id: 'Simple Clair 6mm',
    vitrage_type: 'simple',
    motif_id: 'motif_sans',
    supplements: [],
    fast_lock_points: '2'
  }
];

const res = calculateAluFabrication(testItems);

console.log('=== TEST VERIFICATION ALU CALCUL ===');
console.log('1. CUTTING PIECES COUNT:', res.cuttingPieces.length);
res.cuttingPieces.slice(0, 6).forEach(cp => {
  console.log(` - [${cp.profilRef}] ${cp.profilDesignation}: ${cp.lengthCm} cm (Coupe: ${cp.angleLeft}/${cp.angleRight}) × ${cp.quantity}`);
});

console.log('\n2. TOTAL 6M BARS REQUIRED:', res.totalBarsCount);
res.debitageSummary.forEach(deb => {
  console.log(` - Ref ${deb.profilRef} (${deb.profilDesignation}): ${deb.totalBarsCount} barre(s) de 6m, métrage = ${deb.totalLinearMeters}m, chute moy = ${deb.scrapPercentageAverage.toFixed(1)}%`);
});

console.log('\n3. ACCESSORIES:');
res.accessories.forEach(acc => {
  console.log(` - ${acc.designation}: ${acc.quantity} ${acc.unit} (${acc.details})`);
});

console.log('\n4. GLASS (MIROITERIE):');
res.glassItems.forEach(g => {
  console.log(` - ${g.elementLabel}: ${g.hauteurCm} cm × ${g.largeurCm} cm × ${g.quantity} carreaux = ${g.totalAreaM2} m²`);
});
console.log('TOTAL GLASS AREA:', res.totalGlassAreaM2, 'm²');
console.log('TOTAL JOINT BROSSE 7/6:', res.totalJointBrosseMeters, 'm');
console.log('TOTAL JOINT VITRAGE 0.35:', res.totalJointVitrageMeters, 'm');
