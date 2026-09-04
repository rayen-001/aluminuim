import fs from 'fs';
import path from 'path';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const allCsvPath = path.resolve('ref/atelatlierpro all.csv');
const tprCsvPath = path.resolve('ref/atelierpro tpr.csv');
const alucoCsvPath = path.resolve('ref/atelierpro aluco.csv');
const aluEcoCsvPath = path.resolve('ref/atelierpro alu_eco.csv');

function loadRefsFrom(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const set = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols[0]) set.add(cols[0]);
  }
  return set;
}

const tprRefs = loadRefsFrom(tprCsvPath);
const alucoRefs = loadRefsFrom(alucoCsvPath);
const aluEcoRefs = loadRefsFrom(aluEcoCsvPath);

const allContent = fs.readFileSync(allCsvPath, 'utf-8');
const allLines = allContent.split('\n').map(l => l.trim()).filter(Boolean);

const articles = [];

for (let i = 1; i < allLines.length; i++) {
  const cols = parseCSVLine(allLines[i]);
  if (!cols[0]) continue;
  const ref = cols[0];
  const desc = cols[1] || '';
  const pBlancHT = parseFloat(cols[2]) || 0;
  const pBlancTTC = parseFloat(cols[3]) || 0;
  const pGrisHT = parseFloat(cols[4]) || 0;
  const pGrisTTC = parseFloat(cols[5]) || 0;
  const pNoirHT = parseFloat(cols[6]) || 0;
  const pNoirTTC = parseFloat(cols[7]) || 0;
  const pMatHT = parseFloat(cols[8]) || 0;
  const pMatTTC = parseFloat(cols[9]) || 0;
  const pGivreHT = parseFloat(cols[10]) || 0;
  const pGivreTTC = parseFloat(cols[11]) || 0;
  const editUrl = cols[12] || '';

  let family = 'AUTRES';
  if (tprRefs.has(ref) || ref.startsWith('40') || ref.startsWith('67') || ref.startsWith('EX45') || ref.startsWith('EX60')) {
    family = 'TPR';
  } else if (alucoRefs.has(ref) || ref.startsWith('CSQ') || ref.startsWith('FSQ')) {
    family = 'Aluco';
  } else if (aluEcoRefs.has(ref) || ref.startsWith('AE_')) {
    family = 'Alu Eco';
  } else if (/barreau|main courante|poteau|support vitrage/i.test(desc) || ref === '2878' || ref === '2984' || ref === '4085' || ref === '4723' || ref === '4892') {
    family = 'Garde Corps';
  }

  // Extract ID from edit URL if possible
  const idMatch = editUrl.match(/articles\/(\d+)\/edit/);
  const id = idMatch ? parseInt(idMatch[1]) : (100000 + i);

  articles.push({
    id,
    reference: ref,
    description: desc,
    family,
    category: 'barre',
    prix: {
      blanc: { ht: pBlancHT, ttc: pBlancTTC },
      gris: { ht: pGrisHT, ttc: pGrisTTC },
      noir: { ht: pNoirHT, ttc: pNoirTTC },
      couleur_mat: { ht: pMatHT, ttc: pMatTTC },
      couleur_givre: { ht: pGivreHT, ttc: pGivreTTC }
    }
  });
}

const outDir = path.resolve('src/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tsContent = `// Auto-generated initial articles dataset from AtelierPro CSV catalog (${articles.length} items)
export interface ArticlePrice {
  ht: number;
  ttc: number;
}

export interface ArticleItem {
  id: number;
  reference: string;
  description: string;
  family: 'TPR' | 'Aluco' | 'Alu Eco' | 'Garde Corps' | 'AUTRES';
  category: 'barre' | 'accessoire' | 'vitrage' | 'autre';
  prix: {
    blanc: ArticlePrice;
    gris: ArticlePrice;
    noir: ArticlePrice;
    couleur_mat: ArticlePrice;
    couleur_givre: ArticlePrice;
  };
}

export const INITIAL_ARTICLES: ArticleItem[] = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'initialArticles.ts'), tsContent);
console.log(`Generated src/data/initialArticles.ts with ${articles.length} articles.`);
