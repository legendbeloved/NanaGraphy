import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function fileToBase64Content(file: Blob): Promise<{ mimeType: string; data: string }> {
  const base64DataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const base64Content = base64DataUrl.split(',')[1] || '';
  return { mimeType: (file as any).type || 'application/octet-stream', data: base64Content };
}

export async function generateAltText(imageUrl: string): Promise<string> {
  try {
    const model = "gemini-3-flash-preview";
    
    // Fetch image data
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const inlineData = await fileToBase64Content(blob);

    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Describe this photograph in detail for an accessibility alt-text. Focus on the mood, lighting, composition, and key subjects. Keep it under 150 characters." },
            {
              inlineData: {
                mimeType: inlineData.mimeType,
                data: inlineData.data,
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

export async function generateAltTextFromFile(file: File): Promise<string> {
  try {
    const model = "gemini-3-flash-preview";
    const inlineData = await fileToBase64Content(file);

    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Describe this photograph in detail for an accessibility alt-text. Focus on the mood, lighting, composition, and key subjects. Keep it under 150 characters." },
            { inlineData },
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
