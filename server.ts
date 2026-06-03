import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import multer from "multer";
// Vorher: import { GoogleGenAI } from '@google/generative-ai';
// Nachher:
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini Client Lazily
let genAIClient: GoogleGenerativeAI | null = null;

const getGeminiClient = () => {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    // Beim stabilen SDK wird der Key direkt als String übergeben, 
    // nicht als Objekt { apiKey }
    genAIClient = new GoogleGenerativeAI(apiKey);
  }
  return genAIClient; // (Falls das in deinem Code danach kam)
};

// Multer setup for high-res images from camera/uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set standard limits for safety
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // API routes
  app.post("/api/send-sample-request", async (req, res) => {
    const { name, email, street, zip, city } = req.body;
    
    // Lazy initialization
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"Heidecker Maler" <info@malermeisterfrankfurt.de>',
        to: "info@malermeisterfrankfurt.de",
        subject: "Neue Mustertapeten-Anfrage",
        text: `Neue Anfrage erhalten:
        Name: ${name}
        E-Mail: ${email}
        Adresse: ${street}, ${zip} ${city}
        `,
      });
      res.json({ status: "ok" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  /**
   * Route: POST /api/transform-room
   * Details: Transforms a room using the modern gemini-2.5-flash-image model.
   */
  app.post("/api/transform-room", upload.single("roomImage"), async (req, res) => {
    try {
      const style = req.body.style || "Warm Minimalism";
      let imageBuffer: Buffer | null = null;
      let mimeType = "image/jpeg";

      if (req.file) {
        imageBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } else if (req.body.roomImageBase64) {
        // Fallback for direct base64 encoded transmission
        const base64Data = req.body.roomImageBase64.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
        const mimeMatch = req.body.roomImageBase64.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }

      if (!imageBuffer) {
        return res.status(400).json({ error: "Bitte laden Sie ein Raumbild hoch." });
      }

      const stylePrompts: Record<string, string> = {
        "Warm Minimalism": "Transformiere diesen Raum in den exklusiven Stil 'Warm Minimalism'. Nutze neutrale, warme Farben wie Beige, Creme und sanfte Erdtöne. Integriere minimalistische, aber organisch geformte Möbel, natürliche Holzoberflächen und indirekte, gemütliche Beleuchtung. Die grundlegende Raumstruktur und Perspektive müssen beibehalten werden.",
        "Japandi Zen": "Transformiere diesen Raum in den hochmodernen 'Japandi Zen' Stil. Eine anspruchsvolle Symbiose aus japanischer Reduziertheit und skandinavischer Gemütlichkeit. Verwende helle Hölzer, minimalistische, bodennahe Möbel, edle Naturtextilien und subtile Bambus- oder Pflanzenelemente. Behalte die Raumarchitektur exakt bei.",
        "Neo-Nature": "Transformiere diesen Raum in den luxuriösen 'Neo-Nature' Stil. Bringe die Natur nach drinnen mit modernsten Zimmerpflanzen-Arrangements, organischen Formen, Möbeln aus edlem FSC-Naturholz und warmem Tageslichtgefluteter Atmosphäre. Farbakzente in sanftem Salbeigrün und Sandtönen.",
        "Industrial Chic": "Transformiere diesen Raum in den markanten 'Industrial Chic' Stil der Luxusklasse. Setze auf freiliegendes, edles Backsteinmauerwerk, matt-schwarze Stahl- und Metallelemente, geschliffenen Sichtbeton und robustes Altholz für stilvolle Möbelstücke.",
        "Cosmopolitan Luxury": "Transformiere diesen Raum in den glamourösen 'Cosmopolitan Luxury' Stil. Verwende hochglänzende Oberflächen, feine Metalldetails in Messing oder Bronze, edlen Marmor, Samtstoffe, dunkle Edelholztöne und eine prachtvolle, moderne Luxus-Lichtgestaltung."
      };

      const stylePrompt = stylePrompts[style] || `Transformiere diesen Raum professionell in den anspruchsvollen Design-Stil '${style}'. Behalte die Raumarchitektur, Geometrie und Perspektive exakt bei, aber passe die Möbel, Wandverkleidungen, Texturen, Farben und Beleuchtung an diese exklusive Traum-Ästhetik an.`;

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBuffer.toString("base64"),
              },
            },
            {
              text: `${stylePrompt} Erzeuge ein fotorealistisches, professionell gerendertes und perfekt ausgeleuchtetes Bild der Luxusklasse im Format 16:9.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let base64Image: string | null = null;
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
          style,
          description: textResponse || `Der Raum wurde erfolgreich im Stil '${style}' transformiert.`
        });
      } else {
        return res.status(500).json({
          error: "Das Modell hat bei der Raumtransformation kein Bild zurückgegeben.",
          details: textResponse
        });
      }
    } catch (error: any) {
      console.error("Fehler bei der Raumtransformation:", error);
      res.status(500).json({
        error: "Serverfehler bei der Raumtransformation.",
        details: error.message
      });
    }
  });

  /**
   * Route: POST /api/generate-design
   * Details: Generates an interior design image from a text description.
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

      let base64Image: string | null = null;
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
    } catch (error: any) {
      console.error("Fehler bei der Bildgenerierung:", error);
      res.status(500).json({
        error: "Serverfehler bei der Bildgenerierung.",
        details: error.message
      });
    }
  });

  /**
   * Route: POST /api/analyze-room
   * Details: Analyzes a uploaded room image with Gemini Flash.
   */
  app.post("/api/analyze-room", upload.single("roomImage"), async (req, res) => {
    try {
      const { prompt } = req.body;
      let imageBuffer: Buffer | null = null;
      let mimeType = "image/jpeg";

      if (req.file) {
        imageBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      } else if (req.body.roomImageBase64) {
        const base64Data = req.body.roomImageBase64.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
        const mimeMatch = req.body.roomImageBase64.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }

      if (!imageBuffer) {
        return res.status(400).json({ error: "Keine Bilddatei vorhanden." });
      }

      const ai = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBuffer.toString("base64"),
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
    } catch (error: any) {
      console.error("Fehler bei der Raumanalyse:", error);
      res.status(500).json({
        error: "Serverfehler bei der Raumanalyse.",
        details: error.message
      });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
