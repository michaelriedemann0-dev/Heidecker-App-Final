import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS fuer Frontend-Anfragen vorbereiten
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
  credentials: true,
}));

app.use(express.json({ limit: "20mb" }));

// Multer fuer Bild-Uploads (Speicherung im Arbeitsspeicher fuer einfachen Transfer an Gemini)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB Limit
  },
});

// Initialisierung des modernen @google/genai SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ist in den Backend-Umgebungsvariable nicht definiert.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "DesignCraft Studio Backend ist aktiv." });
});

/**
 * Route: POST /api/generate-design
 * Beschreibung: Generiert ein Interior-Design-Bild basierend auf der Textbeschreibung.
 * Modell: gemini-2.5-flash-image
 */
app.post("/api/generate-design", async (req, res) => {
  const { prompt, aspectRatio = "16:9" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Ein Prompt für die Bildgenerierung ist erforderlich." });
  }

  try {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Exklusives Interior Design: ${prompt}. Professionelle Fotografie, elegantes Licht, luxuriöse Ästhetik.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio, // "1:1", "3:4", "4:3", "9:16", oder "16:9"
        },
      },
    });

    let base64Image = null;
    let textResponse = "";

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (base64Image) {
      return res.json({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        description: textResponse || "Design erfolgreich generiert."
      });
    } else {
      return res.status(500).json({
        error: "Das Modell hat kein Bild zurückgegeben.",
        details: textResponse
      });
    }
  } catch (error) {
    console.error("Fehler bei der Bildgenerierung:", error);
    res.status(500).json({
      error: "Serverfehler bei der Bildgenerierung.",
      details: error.message
    });
  }
});

/**
 * Route: POST /api/analyze-room
 * Beschreibung: Lädt ein Raumbild hoch und analysiert es mit Gemini, um Design-Empfehlungen zu geben.
 * Modell: gemini-3.5-flash
 */
app.post("/api/analyze-room", upload.single("roomImage"), async (req, res) => {
  const { prompt } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Keine Bilddatei hochgeladen." });
  }

  try {
    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      },
    };

    const textPart = {
      text: prompt || "Analysiere diesen Raum und gib mir exklusive Einrichtungs- und Farbvorschläge der Luxusklasse.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        systemInstruction: "Du bist ein erfahrener High-End Interior Designer für Heidecker Frankfurt. Antworte auf Deutsch mit anspruchsvoller, fachlicher Stilberatung.",
      }
    });

    res.json({
      success: true,
      analysis: response.text
    });
  } catch (error) {
    console.error("Fehler bei der Raumanalyse:", error);
    res.status(500).json({
      error: "Serverfehler bei der Raumanalyse.",
      details: error.message
    });
  }
});

/**
 * Route: POST /api/transform-room
 * Beschreibung: Empfängt ein Raumbild und transformiert es basierend auf dem ausgewählten Design-Stil mit Gemini.
 * Modell: gemini-2.5-flash-image
 */
app.post("/api/transform-room", upload.single("roomImage"), async (req, res) => {
  const { style } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Keine Bilddatei hochgeladen." });
  }

  if (!style) {
    return res.status(400).json({ error: "Ein Design-Stil ist erforderlich." });
  }

  try {
    const ai = getGeminiClient();

    // Optimierte Prompts für vordefinierte Luxus-Designstile
    const stylePrompts = {
      "Warm Minimalism": "Transformiere diesen Raum in den exklusiven Stil 'Warm Minimalism'. Nutze neutrale, warme Farben wie Beige, Creme und sanfte Erdtöne. Integriere minimalistische, aber organisch geformte Möbel, natürliche Holzoberflächen und indirekte, gemütliche Beleuchtung. Die grundlegende Raumstruktur und Perspektive müssen beibehalten werden.",
      "Japandi Zen": "Transformiere diesen Raum in den hochmodernen 'Japandi Zen' Stil. Eine anspruchsvolle Symbiose aus japanischer Reduziertheit und skandinavischer Gemütlichkeit. Verwende helle Hölzer, minimalistische, bodennahe Möbel, edle Naturtextilien und subtile Bambus- oder Pflanzenelemente. Behalte die Raumarchitektur exakt bei.",
      "Neo-Nature": "Transformiere diesen Raum in den luxuriösen 'Neo-Nature' Stil. Bringe die Natur nach drinnen mit modernsten Zimmerpflanzen-Arrangements, organischen Formen, Möbeln aus edlem FSC-Naturholz und warmem Tageslichtgefluteter Atmosphäre. Farbakzente in sanftem Salbeigrün und Sandtönen.",
      "Industrial Chic": "Transformiere diesen Raum in den markanten 'Industrial Chic' Stil der Luxusklasse. Setze auf freiliegendes, edles Backsteinmauerwerk, matt-schwarze Stahl- und Metallelemente, geschliffenen Sichtbeton und robustes Altholz für stilvolle Möbelstücke.",
      "Cosmopolitan Luxury": "Transformiere diesen Raum in den glamourösen 'Cosmopolitan Luxury' Stil. Verwende hochglänzende Oberflächen, feine Metalldetails in Messing oder Bronze, edlen Marmor, Samtstoffe, dunkle Edelholztöne und eine prachtvolle, moderne Luxus-Lichtgestaltung."
    };

    const stylePrompt = stylePrompts[style] || `Transformiere diesen Raum professionell in den anspruchsvollen Design-Stil '${style}'. Behalte die Raumarchitektur, Geometrie und Perspektive exakt bei, aber passe die Möbel, Wandverkleidungen, Texturen, Farben und Beleuchtung an diese exklusive Traum-Ästhetik an.`;

    const imagePart = {
      inlineData: {
        mimeType: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      },
    };

    const textPart = {
      text: `${stylePrompt} Erzeuge ein fotorealistisches, professionell gerendertes und perfekt ausgeleuchtetes Bild der Luxusklasse.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [imagePart, textPart]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", // Standardmäßig hochwertiges Breitbildformat
        }
      }
    });

    let base64Image = null;
    let textResponse = "";

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (base64Image) {
      res.json({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        style,
        description: textResponse || `Der Raum wurde erfolgreich im Stil '${style}' transformiert.`
      });
    } else {
      res.status(500).json({
        error: "Das Modell hat bei der Raumtransformation kein Bild zurückgegeben.",
        details: textResponse
      });
    }
  } catch (error) {
    console.error("Fehler bei der Raumtransformation:", error);
    res.status(500).json({
      error: "Serverfehler bei der Raumtransformation.",
      details: error.message
    });
  }
});

// Fehlerbehandlung-Middleware
app.use((err, req, res, next) => {
  console.error("Unbehandelter Fehler:", err);
  res.status(500).json({ error: "Ein unerwarteter Serverfehler ist aufgetreten." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Server läuft erfolgreich auf http://localhost:${PORT}`);
});
