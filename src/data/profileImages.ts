/**
 * Profile Cross-Section Images Database (Coupes de profilés aluminium)
 * Grounded on AtelierPro repository assets and references.
 */

const BASE_PROFIL_IMAGE_URL = 'https://atelierpro.vortech-x.com/profils/';

// Mapping: Normalized profile code (lowercase, stripped spaces) -> file name on server
export const PROFILES_IMAGE_MAP: Record<string, string> = {
  // Série 40 (TPR S40 & Alu Eco S40) — 33 coupes certifiées
  '40100': '40100.png',
  '40102': '40102.png',
  '40103': '40108.png',
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
  '40167': '/profils/fsq163.png',
  '40168': '40168.png',
  '40401': '40401.png',
  '40402': '40402.png',
  '40403': '40403.png',
  '40404': '40404.png',
  '40405': '40405.png',
  '40406': '/profils/fsq406.png',
  '40407': '40407.png',
  '40408': '40408.png',
  '40410': '40410.png',
  '40411': '40411.png',
  '80116': '/profils/csq114.png',
  'tw601314': '/profils/csq301.png',
  'tw603165': '/profils/csq302.png',

  // Coulissant S67 (TPR S67 & Alu Eco S67) — 21 coupes certifiées
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

  // EX45 (TPR EX45 & Alu Eco EX45) — 35 coupes certifiées
  'ex451112': 'EX451112.png',
  'ex451113': 'EX451113.png',
  'ex451114': 'EX451114.png',
  'ex451115': 'EX451115.png',
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
  'ex451215': 'EX451215.png',
  'ex451216': 'EX451216.png',
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
  'ex451513': 'EX451513.png',
  'ex451514': 'EX451514.png',
  'ex451525': 'EX451525.png',

  // EX60 (TPR EX60 & Alu Eco EX60) — 27 coupes certifiées
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

  // Aluco Square 40 (FSQ) — 34 coupes certifiées
  'fsq100': '/profils/fsq100.png',
  'fsq102': '/profils/fsq102.png',
  'fsq104': '/profils/fsq104.png',
  'fsq107': '/profils/fsq107.png',
  'fsq108': '/profils/fsq108.png',
  'fsq110': '/profils/fsq110.png',
  'fsq111': '/profils/fsq111.png',
  'fsq112': '/profils/fsq112.png',
  'fsq121': '/profils/fsq121.png',
  'fsq122': '/profils/fsq122.png',
  'fsq124': '/profils/fsq124.png',
  'fsq130': '/profils/fsq130.png',
  'fsq131': '/profils/fsq131.png',
  'fsq132': '/profils/fsq132.png',
  'fsq139': '/profils/fsq139.png',
  'fsq148': '/profils/fsq148.png',
  'fsq149': '/profils/fsq149.png',
  'fsq150': '/profils/fsq150.png',
  'fsq151': '/profils/fsq151.png',
  'fsq153': '/profils/fsq153.png',
  'fsq156': '/profils/fsq156.png',
  'fsq163': '/profils/fsq163.png',
  'fsq164': '/profils/fsq164.png',
  'fsq165': '/profils/fsq165.png',
  'fsq401': '/profils/fsq401.png',
  'fsq402': '/profils/fsq402.png',
  'fsq403': '/profils/fsq403.png',
  'fsq404': '/profils/fsq404.png',
  'fsq405': '/profils/fsq405.png',
  'fsq406': '/profils/fsq406.png',
  'fsq408': '/profils/fsq408.png',
  'fsq534': '/profils/fsq534.png',
  'fsq535': '/profils/fsq535.png',
  'fsq536': '/profils/fsq536.png',

  // Aluco Couvre-Joints (CSQ & CJ) — 8 coupes certifiées
  'csq300': '/profils/csq300.png',
  'csq301': '/profils/csq301.png',
  'csq302': '/profils/csq302.png',
  'csq303': '/profils/csq303.png',
  'csq304': '/profils/csq304.png',
  'csq305': '/profils/csq305.png',
  'csq306': '/profils/csq306.png',
  'csq460': '/profils/csq460.png',
  'csq400': '/profils/csq460.png',
  'cj101': '/profils/csq301.png',
  'cj102': '/profils/csq302.png',

  // Aluco Square 67 (CSQ Coulissant) — 20 coupes certifiées
  'csq101': '/profils/csq101.png',
  'csq102': '/profils/csq102.png',
  'csq103': '/profils/csq103.png',
  'csq104': '/profils/csq104.png',
  'csq105': '/profils/csq105.png',
  'csq106': '/profils/csq106.png',
  'csq107': '/profils/csq107.png',
  'csq108': '/profils/csq108.png',
  'csq109': '/profils/csq109.png',
  'csq110': '/profils/csq110.png',
  'csq112': '/profils/csq112.png',
  'csq114': '/profils/csq114.png',
  'csq115': '/profils/csq115.png',
  'csq116': '/profils/csq116.png',
  'csq124': '/profils/csq124.png',
  'csq125': '/profils/csq125.png',
  'csq201': '/profils/csq201.png',
  'csq202': '/profils/csq202.png',
  'csq203': '/profils/csq203.png',
  'csq210': '/profils/csq210.png',
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
    if (fileName.startsWith('/')) {
      return fileName;
    }
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
