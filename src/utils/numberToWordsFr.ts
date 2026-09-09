/**
 * Convertisseur de nombres en toutes lettres en français (Dinars Tunisiens & Millimes)
 */

const UNITES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const DIZAINES_SPECIALES = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const DIZAINES = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function convertUnder100(n: number): string {
  if (n === 0) return '';
  if (n < 10) return UNITES[n];
  if (n >= 10 && n < 20) return DIZAINES_SPECIALES[n - 10];

  const tens = Math.floor(n / 10);
  const units = n % 10;

  if (tens === 7) {
    if (units === 1) return 'soixante-et-onze';
    return `soixante-${DIZAINES_SPECIALES[units]}`;
  }

  if (tens === 8) {
    if (units === 0) return 'quatre-vingts';
    return `quatre-vingt-${UNITES[units]}`;
  }

  if (tens === 9) {
    return `quatre-vingt-${DIZAINES_SPECIALES[units]}`;
  }

  if (units === 1 && tens < 8) {
    return `${DIZAINES[tens]}-et-un`;
  }

  if (units > 0) {
    return `${DIZAINES[tens]}-${UNITES[units]}`;
  }

  return DIZAINES[tens];
}

function convertUnder1000(n: number): string {
  if (n === 0) return '';
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  let result = '';
  if (hundreds === 1) {
    result = 'cent';
  } else if (hundreds > 1) {
    result = `${UNITES[hundreds]} cent${remainder === 0 ? 's' : ''}`;
  }

  if (remainder > 0) {
    const under100 = convertUnder100(remainder);
    result = result ? `${result} ${under100}` : under100;
  }

  return result;
}

function convertInteger(n: number): string {
  if (n === 0) return 'zéro';

  const chunks: { value: number; labelSingle: string; labelPlural: string }[] = [
    { value: 1_000_000_000, labelSingle: 'milliard', labelPlural: 'milliards' },
    { value: 1_000_000, labelSingle: 'million', labelPlural: 'millions' },
    { value: 1_000, labelSingle: 'mille', labelPlural: 'mille' },
    { value: 1, labelSingle: '', labelPlural: '' }
  ];

  let remaining = n;
  const parts: string[] = [];

  for (const chunk of chunks) {
    if (remaining >= chunk.value) {
      const count = Math.floor(remaining / chunk.value);
      remaining %= chunk.value;

      if (chunk.value === 1_000) {
        if (count === 1) {
          parts.push('mille');
        } else {
          parts.push(`${convertUnder1000(count)} mille`);
        }
      } else if (chunk.value > 1_000) {
        const label = count > 1 ? chunk.labelPlural : chunk.labelSingle;
        parts.push(`${convertUnder1000(count)} ${label}`);
      } else {
        parts.push(convertUnder1000(count));
      }
    }
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Convertit un montant numérique en dinars tunisiens en toutes lettres en français
 * Exemple: 11901.000 -> "ONZE MILLE NEUF CENT UN DINARS"
 * Exemple: 935.283 -> "NEUF CENT TRENTE-CINQ DINARS ET DEUX CENT QUATRE-VINGT-TROIS MILLIMES"
 */
export function numberToWordsDinar(amount: number): string {
  if (isNaN(amount) || amount < 0) return 'ZÉRO DINAR';

  const dinars = Math.floor(amount);
  const millimes = Math.round((amount - dinars) * 1000);

  let result = '';

  if (dinars === 0) {
    if (millimes === 0) return 'ZÉRO DINAR';
  } else if (dinars === 1) {
    result = 'UN DINAR';
  } else {
    result = `${convertInteger(dinars).toUpperCase()} DINARS`;
  }

  if (millimes > 0) {
    const millimesText = convertInteger(millimes).toUpperCase();
    if (dinars > 0) {
      result += ` ET ${millimesText} MILLIMES`;
    } else {
      result = `${millimesText} MILLIMES`;
    }
  }

  return result.trim();
}
