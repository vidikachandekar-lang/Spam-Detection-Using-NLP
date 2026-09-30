/**
 * Adversarial NLP Evasion Simulator
 * Provides client-side mutations to demonstrate how malicious senders attempt
 * to evade naive keyword and n-gram filters, and tests NLP resilience.
 */

const CYRILLIC_HOMOGLYPHS: Record<string, string> = {
  'a': 'а', // Cyrillic Small Letter A (U+0430)
  'e': 'е', // Cyrillic Small Letter Ie (U+0435)
  'o': 'о', // Cyrillic Small Letter O (U+043E)
  'p': 'р', // Cyrillic Small Letter Er (U+0440)
  'c': 'с', // Cyrillic Small Letter Es (U+0441)
  'y': 'у', // Cyrillic Small Letter U (U+0443)
  'x': 'х', // Cyrillic Small Letter Kha (U+0445)
  'i': 'і', // Cyrillic Small Letter Byelorussian-Ukrainian I (U+0456)
  'A': 'А',
  'B': 'В',
  'E': 'Е',
  'K': 'К',
  'M': 'М',
  'H': 'Н',
  'O': 'О',
  'P': 'Р',
  'C': 'С',
  'T': 'Т',
  'X': 'Х',
};

const LEET_REPLACEMENTS: Record<string, string> = {
  'a': '@',
  'e': '3',
  'i': '1',
  'o': '0',
  's': '$',
  't': '7',
  'l': '1',
};

const BENIGN_HAM_POISON_TEXT = `
---
Appendix: Notes on the Atmospheric Boundary Layer and Fluid Thermodynamics
In fluid dynamics, the boundary layer represents the thin fluid layer immediately adjacent to a bounding surface where the effects of viscosity are significant. Prandtl's boundary layer hypothesis demonstrates that for large Reynolds numbers, viscous shear stresses are confined near solid walls, while the remaining flow field behaves predominantly as an inviscid potential flow. Subsequent research by Blasius provided exact self-similar solutions for laminar flat plates, showing that boundary layer thickness scales proportionally with the square root of downstream distance and kinematic viscosity.
`;

export function applyHomoglyphs(text: string): { mutated: string; count: number } {
  let count = 0;
  let mutated = '';
  // Target keywords like verify, account, click, free, win, password
  const targetWords = ['verify', 'account', 'click', 'free', 'password', 'urgent', 'winner', 'paypal', 'support', 'bitcoin'];

  const words = text.split(/(\s+)/);
  for (const part of words) {
    const lower = part.toLowerCase();
    const shouldMutate = targetWords.some((w) => lower.includes(w));
    if (shouldMutate) {
      let mutatedWord = '';
      for (const char of part) {
        if (CYRILLIC_HOMOGLYPHS[char] && Math.random() > 0.3) {
          mutatedWord += CYRILLIC_HOMOGLYPHS[char];
          count++;
        } else {
          mutatedWord += char;
        }
      }
      mutated += mutatedWord;
    } else {
      mutated += part;
    }
  }

  return { mutated, count };
}

export function applyLeetspeak(text: string): { mutated: string; count: number } {
  let count = 0;
  const targetWords = ['verify', 'password', 'free', 'win', 'prize', 'cash', 'bitcoin', 'click', 'paypal', 'urgent'];
  const words = text.split(/(\s+)/);
  let mutated = '';

  for (const part of words) {
    const lower = part.toLowerCase();
    const shouldMutate = targetWords.some((w) => lower.includes(w));
    if (shouldMutate) {
      let mutatedWord = '';
      for (const char of part) {
        const lowerChar = char.toLowerCase();
        if (LEET_REPLACEMENTS[lowerChar] && Math.random() > 0.25) {
          mutatedWord += LEET_REPLACEMENTS[lowerChar];
          count++;
        } else {
          mutatedWord += char;
        }
      }
      mutated += mutatedWord;
    } else {
      mutated += part;
    }
  }

  return { mutated, count };
}

export function applyDelimiterSpacing(text: string): { mutated: string; count: number } {
  let count = 0;
  const targetWords = ['click here', 'verify', 'free', 'password', 'urgent', 'suspended'];
  let mutated = text;

  for (const target of targetWords) {
    const regex = new RegExp(`\\b${target}\\b`, 'gi');
    mutated = mutated.replace(regex, (match) => {
      count++;
      // Choose delimiter: period, dash, or space
      const chars = match.split('');
      return chars.join('.');
    });
  }

  return { mutated, count };
}

export function applyZeroWidthInjection(text: string): { mutated: string; count: number } {
  let count = 0;
  const zeroWidthSpace = '\u200B';
  const targetWords = ['verify', 'password', 'suspended', 'account', 'transfer', 'funds'];
  const words = text.split(/(\s+)/);
  let mutated = '';

  for (const part of words) {
    const lower = part.toLowerCase();
    const shouldMutate = targetWords.some((w) => lower.includes(w));
    if (shouldMutate && part.length > 2) {
      const chars = part.split('');
      mutated += chars.join(zeroWidthSpace);
      count += chars.length - 1;
    } else {
      mutated += part;
    }
  }

  return { mutated, count };
}

export function applyHamPoisoning(text: string): { mutated: string; count: number } {
  return {
    mutated: text.trim() + '\n\n' + BENIGN_HAM_POISON_TEXT.trim(),
    count: 1,
  };
}
