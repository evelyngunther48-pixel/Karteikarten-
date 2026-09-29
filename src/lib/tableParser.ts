import { GeneratedCardDraft } from '../types';

/**
 * Parses raw text input (Markdown table, ChatGPT copy-paste, CSV, TSV, or delimiter-separated)
 * into a list of flashcard drafts with front, back, and optional hint.
 */
export function parseTableText(input: string): { cards: GeneratedCardDraft[]; error?: string } {
  if (!input || !input.trim()) {
    return { cards: [], error: 'Der Text ist leer.' };
  }

  const rawLines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rawLines.length === 0) {
    return { cards: [], error: 'Keine gültigen Zeilen gefunden.' };
  }

  const cards: GeneratedCardDraft[] = [];

  // 1. Try Markdown Table detection (| Column 1 | Column 2 |)
  const isMarkdownTable = rawLines.some((line) => line.includes('|') && line.startsWith('|'));

  if (isMarkdownTable) {
    for (const line of rawLines) {
      // Skip Markdown divider lines like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue;
      }

      // Split by pipe
      const parts = line
        .split('|')
        .map((p) => p.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // remove outer empty splits

      if (parts.length >= 2) {
        // Skip header if it contains typical header words
        const first = parts[0].toLowerCase();
        const second = parts[1].toLowerCase();
        if (
          (first === 'frage' || first === 'begriff' || first === 'vorderseite' || first === 'front' || first === 'question') &&
          (second === 'antwort' || second === 'erklärung' || second === 'rückseite' || second === 'back' || second === 'answer')
        ) {
          continue;
        }

        const front = parts[0];
        const back = parts[1];
        const hint = parts[2] || undefined;

        if (front && back) {
          cards.push({ front, back, hint, selected: true });
        }
      }
    }

    if (cards.length > 0) {
      return { cards };
    }
  }

  // 2. Try Tab-Separated (Common when copying table cells from ChatGPT or Excel)
  const isTabSeparated = rawLines.some((line) => line.includes('\t'));
  if (isTabSeparated) {
    for (const line of rawLines) {
      const parts = line.split('\t').map((p) => p.trim());
      if (parts.length >= 2) {
        const first = parts[0].toLowerCase();
        const second = parts[1].toLowerCase();
        if (
          (first === 'frage' || first === 'begriff' || first === 'front') &&
          (second === 'antwort' || second === 'erklärung' || second === 'back')
        ) {
          continue;
        }

        const front = parts[0];
        const back = parts[1];
        const hint = parts[2] || undefined;

        if (front && back) {
          cards.push({ front, back, hint, selected: true });
        }
      }
    }

    if (cards.length > 0) {
      return { cards };
    }
  }

  // 3. Try Semicolon or Comma-separated (CSV format)
  // Check if semicolon is frequent
  const semicolonCount = rawLines.filter((l) => l.includes(';')).length;
  if (semicolonCount >= rawLines.length * 0.5) {
    for (const line of rawLines) {
      const parts = splitCsvLine(line, ';');
      if (parts.length >= 2) {
        const front = parts[0].trim();
        const back = parts[1].trim();
        const hint = parts[2]?.trim() || undefined;

        // Skip headers
        const fLow = front.toLowerCase();
        if (fLow === 'frage' || fLow === 'begriff' || fLow === 'vorderseite') continue;

        if (front && back) {
          cards.push({ front, back, hint, selected: true });
        }
      }
    }
    if (cards.length > 0) {
      return { cards };
    }
  }

  // 4. Try colon / dash delimiter (e.g. "Begriff - Definition" or "Frage: Antwort")
  for (const line of rawLines) {
    let front = '';
    let back = '';

    if (line.includes(' - ')) {
      const parts = line.split(' - ');
      front = parts[0].trim().replace(/^[-*•\d+.]\s*/, '');
      back = parts.slice(1).join(' - ').trim();
    } else if (line.includes(': ')) {
      const parts = line.split(': ');
      front = parts[0].trim().replace(/^[-*•\d+.]\s*/, '');
      back = parts.slice(1).join(': ').trim();
    } else if (line.includes(';')) {
      const parts = line.split(';');
      front = parts[0].trim();
      back = parts.slice(1).join(';').trim();
    }

    if (front && back) {
      cards.push({ front, back, selected: true });
    }
  }

  if (cards.length > 0) {
    return { cards };
  }

  return {
    cards: [],
    error: 'Konnte keine Tabelle erkennen. Bitte verwende das Format "Frage | Antwort" oder getrennt durch Tabulatoren/Semikolons.',
  };
}

/**
 * Handles basic quoted CSV segments (e.g. "Text; mit Semikolon"; "Antwort")
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}
