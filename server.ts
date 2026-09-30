import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Semantic NLP Analysis endpoint via Gemini
app.post('/api/nlp/semantic-analyze', async (req: Request, res: Response) => {
  try {
    const { text, context } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is available in the environment.',
      });
      return;
    }

    const systemInstruction = `You are an elite Natural Language Processing (NLP) and Cybersecurity Forensic Analyst specializing in message classification, phishing analysis, and spam detection.
Analyze the provided message thoroughly across linguistic semantics, intent, social engineering techniques, structural deception, and pragmatic discourse.
Provide objective, quantitative, and explainable NLP outputs in the specified JSON structure.`;

    const prompt = `Analyze this message for spam, phishing, social engineering, or legitimate intent:
---
${text.slice(0, 4000)}
---
Context info: ${context || 'General email/SMS communication'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              description: 'One of: SPAM, PHISHING, SUSPICIOUS, HAM (Legitimate)',
            },
            primaryCategory: {
              type: Type.STRING,
              description:
                'e.g. Credential Phishing, Advance-Fee/Lottery Scam, Financial Extortion, Promotional Marketing Spam, Malware Delivery, Urgent Transactional, Personal Ham, Work Communication',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence in this classification between 0 and 100',
            },
            threatLevel: {
              type: Type.STRING,
              description: 'One of: NONE, LOW, MEDIUM, HIGH, CRITICAL',
            },
            semanticSummary: {
              type: Type.STRING,
              description: 'Crisp 2-3 sentence semantic rationale explaining the linguistic intent and purpose',
            },
            socialEngineeringVectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vector: {
                    type: Type.STRING,
                    description: 'Name of the tactic, e.g., Authority Impersonation, Artificial Scarcity, Fear Appeal, Greed Incentive, Curiosity Bait, Technical Jargon Masking',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'LOW, MEDIUM, or HIGH',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Brief explanation of how the text weaponizes this vector',
                  },
                },
                required: ['vector', 'severity', 'explanation'],
              },
            },
            suspiciousEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  entityText: {
                    type: Type.STRING,
                    description: 'The exact phrase or entity from the message',
                  },
                  type: {
                    type: Type.STRING,
                    description: 'URGENCY_TRIGGER, SUSPICIOUS_CTA, SPOOFED_BRAND, FINANCIAL_DEMAND, EVASION_PATTERN, PHISHING_LINK',
                  },
                  riskWeight: {
                    type: Type.NUMBER,
                    description: 'Risk factor from 0.0 to 1.0',
                  },
                  reason: {
                    type: Type.STRING,
                    description: 'Why this token/phrase flags the NLP filter',
                  },
                },
                required: ['entityText', 'type', 'riskWeight', 'reason'],
              },
            },
            linguisticMarkers: {
              type: Type.OBJECT,
              properties: {
                urgencyLevel: { type: Type.STRING, description: 'NONE, MILD, AGGRESSIVE' },
                toneSentiment: { type: Type.STRING, description: 'e.g. Threatening, Overly Familiar, Fake Corporate, Neutral' },
                grammarAnomalies: { type: Type.STRING, description: 'Observations on syntax, unnatural phrasing, or machine translation artifacts' },
                callToAction: { type: Type.STRING, description: 'The requested action from recipient' },
              },
              required: ['urgencyLevel', 'toneSentiment', 'callToAction'],
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Actionable security advice for the recipient (e.g. Delete and block, Report phishing, Safe to open, Verify out-of-band)',
            },
          },
          required: [
            'classification',
            'primaryCategory',
            'confidenceScore',
            'threatLevel',
            'semanticSummary',
            'socialEngineeringVectors',
            'suspiciousEntities',
            'linguisticMarkers',
            'recommendedAction',
          ],
        },
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Semantic NLP analysis error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during semantic NLP analysis',
    });
  }
});

// Adversarial rewrite simulation endpoint (demonstrates evasion vs NLP defense)
app.post('/api/nlp/adversarial-evasion', async (req: Request, res: Response) => {
  try {
    const { originalText, technique } = req.body;
    if (!originalText) {
      res.status(400).json({ error: 'Original text is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API not configured' });
      return;
    }

    const prompt = `You are a researcher demonstrating how spam and phishing authors attempt to evade naive keyword and Bayesian NLP filters, for educational security testing purposes.
Technique requested: ${technique || 'Bayesian Poisoning or Homoglyph / Leetspeak Masking'}
Original spam text:
"${originalText}"

Provide an educational demonstration showing:
1. The mutated adversarial text designed to attempt evasion.
2. The specific evasion mechanics used (e.g., unicode homoglyphs, synonym replacement, delimiter insertion, good-word stuffing).
3. How modern NLP (contextual embeddings, token normalization, transformer attention) still catches this technique.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evasionTechniqueName: { type: Type.STRING },
            mutatedText: { type: Type.STRING },
            evasionMechanics: { type: Type.STRING },
            howNlpDefeatsIt: { type: Type.STRING },
            robustnessAdvice: { type: Type.STRING },
          },
          required: [
            'evasionTechniqueName',
            'mutatedText',
            'evasionMechanics',
            'howNlpDefeatsIt',
            'robustnessAdvice',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Adversarial evasion error:', err);
    res.status(500).json({ error: err.message || 'Adversarial generation failed' });
  }
});

// Mount Vite or serve static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
