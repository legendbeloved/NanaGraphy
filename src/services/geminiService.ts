import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateAltText(imageUrl: string): Promise<string> {
  try {
    const model = "gemini-3-flash-preview";
    
    // Fetch image data
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const base64Content = base64Data.split(',')[1];

    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Describe this photograph in detail for an accessibility alt-text. Focus on the mood, lighting, composition, and key subjects. Keep it under 150 characters." },
            {
              inlineData: {
                mimeType: blob.type,
                data: base64Content,
              },
            },
          ],
        },
      ],
    });

    return result.text || "A beautiful photograph by NanaGraphy.";
  } catch (error) {
    console.error("Error generating alt text:", error);
    return "A beautiful photograph by NanaGraphy.";
  }
}
