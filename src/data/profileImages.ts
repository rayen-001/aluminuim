/**
 * Profile Cross-Section Images Database (Coupes de profilés aluminium)
 * Grounded on AtelierPro repository assets and references.
 */

const BASE_PROFIL_IMAGE_URL = 'https://atelierpro.vortech-x.com/profils/';

// Mapping: Normalized profile code (lowercase, stripped spaces) -> file name on server
export const PROFILES_IMAGE_MAP: Record<string, string> = {
  // Série 40 (TPR S40 & Alu Eco S40)
  '40100': '40100.png',
  '40102': '40102.png',
  '40104': '40104.png',
  '40107': '40107.png',
  '40108': '40108.png',
  '40110': '40110.png',
  '40111': '40111.png',
  '40112': '40112.png',
  '40121': '40121.png',
  '40123': '40123.png',
  '40129': '40129.png',
  '40133': '40133.png',
  '40135': '40135.png',
  '40139': '40139.png',
  '40148': '40148.png',
  '40149': '40149.png',
  '40150': '40150.png',
  '40151': '40151.png',
  '40154': '40154.png',
  '40155': '40155.png',
  '40156': '40156.png',
  '40165': '40165.png',
  '40166': '40166.png',
  '40168': '40168.png',
  '40401': '40401.png',
  '40402': '40402.png',
  '40403': '40403.png',
  '40404': '40404.png',
  '40405': '40405.png',
  '40407': '40407.png',
  '40408': '40408.png',
  '40410': '40410.png',
  '40411': '40411.png',

  // Coulissant S67 (TPR S67 & Alu Eco S67)
  '67101': '67101.png',
  '67102': '67102.png',
  '67103': '67103.png',
  '67104': '67104.png',
  '67105': '67105.png',
  '67106': '67106.png',
  '67107': '67107.png',
  '67108': '67108.png',
  '67110': '67110.png',
  '67112': '67112.png',
  '67113': '67113.png',
  '67114': '67114.png',
  '67115': '67115.png',
  '67201': '67201.png',
  '67202': '67202.png',
  '67203': '67203.png',
  '67204': '67204.png',
  '67205': '67205.png',
  '67206': '67206.png',
  '67207': '67207.png',
  '67208': '67208.png',
  '80116': '80116.png',

  // EX45 (TPR EX45 & Alu Eco EX45)
  'ex451112': 'EX451112.png',
  'ex451113': 'EX451113.png',
  'ex451114': 'EX451114.png',
  'ex451115': 'EX451115.png',
  'ex451116': 'EX451116.png',
  'ex451119': 'EX451119.png',
  'ex451120': 'EX451120.png',
  'ex451121': 'EX451121.png',
  'ex451122': 'EX451122.png',
  'ex451123': 'EX451123.png',
  'ex451124': 'EX451124.png',
  'ex451125': 'EX451125.png',
  'ex451126': 'EX451126.png',
  'ex451130': 'EX451130.png',
  'ex451131': 'EX451131.png',
  'ex451132': 'EX451132.png',
  'ex451210': 'EX451210.png',
  'ex451211': 'EX451211.png',
  'ex451212': 'EX451212.png',
  'ex451213': 'EX451213.png',
  'ex451214': 'EX451214.png',
  'ex451215': 'EX451215.png',
  'ex451216': 'EX451216.png',
  'ex451217': 'EX451217.png',
  'ex451218': 'EX451218.png',
  'ex451219': 'EX451219.png',
  'ex451220': 'EX451220.png',
  'ex451310': 'EX451310.png',
  'ex451311': 'EX451311.png',
  'ex451312': 'EX451312.png',
  'ex451313': 'EX451313.png',
  'ex451314': 'EX451314.png',
  'ex451315': 'EX451315.png',
  'ex451318': 'EX451318.png',
  'ex451319': 'EX451319.png',
  'ex451320': 'EX451320.png',
  'ex451321': 'EX451321.png',
  'ex451410': 'EX451410.png',
  'ex451513': 'EX451513.png',
  'ex451514': 'EX451514.png',
  'ex451525': 'EX451525.png',

  // EX60 (TPR EX60 & Alu Eco EX60)
  'ex602114': 'EX602114.png',
  'ex602115': 'EX602115.png',
  'ex602116': 'EX602116.png',
  'ex602117': 'EX602117.png',
  'ex602118': 'EX602118.png',
  'ex602119': 'EX602119.png',
  'ex602121': 'EX602121.png',
  'ex602122': 'EX602122.png',
  'ex602123': 'EX602123.png',
  'ex602125': 'EX602125.png',
  'ex602126': 'EX602126.png',
  'ex602210': 'EX602210.png',
  'ex602211': 'EX602211.png',
  'ex602212': 'EX602212.png',
  'ex602213': 'EX602213.png',
  'ex602214': 'EX602214.png',
  'ex602215': 'EX602215.png',
  'ex602216': 'EX602216.png',
  'ex602217': 'EX602217.png',
  'ex602218': 'EX602218.png',
  'ex602221': 'EX602221.png',
  'ex602222': 'EX602222.png',
  'ex602223': 'EX602223.png',
  'ex602310': 'EX602310.png',
  'ex602311': 'EX602311.png',
  'ex602312': 'EX602312.png',
};

/**
 * Normalise un code de profilé pour la recherche d'image
 */
export function normalizeProfileCode(ref?: string | null): string {
  return String(ref || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '');
}

/**
 * Retourne l'URL de l'image de coupe technique d'un profilé
 * Si aucune image spécifique n'est trouvée, retourne null
 */
export function getProfileImageUrl(ref?: string | null): string | null {
  if (!ref) return null;
  const rawCode = String(ref).trim();
  if (rawCode === '' || rawCode.startsWith('—')) return null;

  // Clean AE_ prefix for Alu Eco profiles as they share the same physical shape
  const cleanCode = rawCode.replace(/^AE[_\s]+/i, '');
  const normalized = normalizeProfileCode(cleanCode);
  const fileName = PROFILES_IMAGE_MAP[normalized];

  if (fileName) {
    return `${BASE_PROFIL_IMAGE_URL}${fileName}`;
  }

  return null;
}

/**
 * Vérifie si une image de coupe existe pour ce profilé
 */
export function hasProfileImage(ref?: string | null): boolean {
  return getProfileImageUrl(ref) !== null;
}
