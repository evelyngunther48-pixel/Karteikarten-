import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support base64 image uploads up to 25MB
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Flashcard Schema for Structured JSON response
const flashcardSchema = {
  type: Type.ARRAY,
  description: 'Liste didaktisch strukturierter Karteikarten',
  items: {
    type: Type.OBJECT,
    properties: {
      front: {
        type: Type.STRING,
        description: 'Vorderseite: Präzise Frage, Schlüsselbegriff oder Problemstellung',
      },
      back: {
        type: Type.STRING,
        description: 'Rückseite: Prägnante, verständliche Antwort, Erklärung oder Definition',
      },
      hint: {
        type: Type.STRING,
        description: 'Optionaler Hinweis oder Merkhilfe',
      },
    },
    required: ['front', 'back'],
  },
};

// Helper: Try generateContent with primary model, then fallback if 503 high-demand spike occurs
async function generateWithFallback(options: {
  contents: any;
  systemInstruction?: string;
}) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: flashcardSchema,
          systemInstruction: options.systemInstruction,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Kein Modell verfügbar');
}

// API: Generate Flashcards from Image (notes, book page, mindmap, slides)
app.post('/api/generate-cards-from-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType: providedMimeType, deckTopic = '', count = 8 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Kein Bild bereitgestellt' });
    }

    // Auto-detect MIME type from Data URL header if present
    let mimeType = providedMimeType || 'image/jpeg';
    const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }

    // Clean base64 string
    const cleanBase64 = imageBase64
      .replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '')
      .replace(/\s/g, '');

    const promptText = `Du bist ein didaktischer Experte für Karteikarten und Spaced Repetition Lernen.
Analysiere das beigefügte Lernmaterial (Foto von Skript, Buchseite, handschriftlichen Notizen, Folie oder Tafelbild).
Extrahiere die wichtigsten Kernkonzepte, Definitionen, Fakten und Zusammenhänge.
Erstelle daraus ca. ${count} präzise, lernfördernde Karteikarten.
${deckTopic ? `Themenfokus / Fach: ${deckTopic}` : ''}

Kriterien für exzellente Karteikarten:
1. Vorderseite: Klare, unmissverständliche Fragestellung oder ein konkreter Begriff.
2. Rückseite: Verständlich, auf den Punkt gebracht, mit Beispielen oder Eselsbrücken falls nützlich.
3. Formuliere auf Deutsch (sofern das Material nicht ausdrücklich eine Fremdsprache wie Englisch oder Spanisch behandelt).
4. Vermeide überlange Textblöcke auf der Rückseite.`;

    const rawOutput = await generateWithFallback({
      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        {
          text: promptText,
        },
      ],
      systemInstruction: 'Du erstellst professionelle, pädagogisch wertvolle Lern-Karteikarten im JSON-Format.',
    });

    // Clean markdown wrappers if any
    let cleaned = rawOutput.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const cards = JSON.parse(cleaned);

    return res.json({ cards });
  } catch (error: any) {
    console.error('Error generating cards from image:', error);
    return res.status(500).json({
      error: 'Fehler bei der KI-Generierung aus dem Bild. Bitte versuche es erneut.',
      details: error?.message || String(error),
    });
  }
});

// API: Generate Flashcards from Text / Topic / Notes
app.post('/api/generate-cards-from-text', async (req: Request, res: Response) => {
  try {
    const { promptText, deckTopic = '', count = 8 } = req.body;

    if (!promptText || promptText.trim().length === 0) {
      return res.status(400).json({ error: 'Kein Text oder Thema angegeben' });
    }

    const prompt = `Erstelle ca. ${count} didaktisch strukturierte Karteikarten für Spaced Repetition Lernen basierend auf folgendem Text oder Thema:

Thema / Notizen:
${promptText}
${deckTopic ? `\nZusätzlicher Kontext / Fach: ${deckTopic}` : ''}

Regeln:
- Vorderseite: Klare Frage oder Begriff
- Rückseite: Prägnante Antwort / Erklärung
- Optional ein nützlicher Hinweis (hint)`;

    const rawOutput = await generateWithFallback({
      contents: prompt,
      systemInstruction: 'Du erstellst professionelle Karteikarten für effektives Lernen im JSON-Format.',
    });

    let cleaned = rawOutput.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const cards = JSON.parse(cleaned);

    return res.json({ cards });
  } catch (error: any) {
    console.error('Error generating cards from text:', error);
    return res.status(500).json({
      error: 'Fehler bei der KI-Generierung aus Text',
      details: error?.message || String(error),
    });
  }
});

// Setup dev server with Vite or production static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
