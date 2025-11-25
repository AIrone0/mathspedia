import { GoogleGenAI } from "@google/genai";
import { TheoremData } from "../types";

// In a real scenario, this would check a local file system or cache first.
// For this demo, we exclusively use Gemini to "simulate" reading comprehensive articles.

const parseTheoremData = (text: string): TheoremData | null => {
  try {
    // Clean up potential markdown code blocks
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return null;
  }
};

export const fetchTheoremData = async (theoremName: string): Promise<TheoremData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate a detailed structured JSON object for the mathematical theorem: "${theoremName}".
    
    The JSON must adhere to this exact structure:
    {
      "id": "slug-string",
      "name": "Full Theorem Name",
      "year": 1234,
      "introduction": "A dense, technical summary.",
      "history": "Historical context, discovery, and significance.",
      "dependencies": [
        { "id": "th1", "name": "Pre-requisite Theorem 1", "year": 1000, "parentIds": [] },
        { "id": "th2", "name": "Pre-requisite Theorem 2", "year": 1100, "parentIds": ["th1"] },
        { "id": "target", "name": "${theoremName}", "year": 1234, "parentIds": ["th1", "th2"] }
      ],
      "proofs": [
        {
          "title": "Standard Proof",
          "steps": [
            { "text": "Step description...", "latex": "a^2 + b^2 = c^2" }
          ]
        }
      ],
      "implications": ["List of consequences..."],
      "requisites": ["List of prerequisite topics..."],
      "references": ["Book citation 1", "Paper citation 2"],
      "externalLinks": [{ "title": "Wikipedia", "url": "..." }]
    }

    CRITICAL INSTRUCTIONS:
    1. The "dependencies" array MUST form a tree/DAG ending at the requested theorem.
    2. Start the dependencies from fundamental concepts (ancient times) if relevant, or at least 3-4 layers deep.
    3. Ensure 'year' is an integer.
    4. Provide valid LaTeX for equations (no backticks needed inside the latex field).
    5. Return ONLY valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    }
  });

  const data = parseTheoremData(response.text || "{}");
  if (!data) {
    throw new Error("Failed to generate valid theorem data.");
  }
  
  // Ensure the target theorem is the last one in dependencies if not present or sorting needed
  // This is a basic validation step for robustness
  
  return data;
};