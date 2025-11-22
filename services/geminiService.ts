import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePolaroidCaption = async (base64Image: string): Promise<string> => {
  try {
    // Remove data URL prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image and write a short, nostalgic, witty, or sentimental caption suitable for writing on the bottom margin of a polaroid photo. It should be casual and feel like a memory. Maximum 8 words. Do not use quotes."
          }
        ]
      },
      config: {
        temperature: 0.7,
        maxOutputTokens: 20,
      }
    });

    return response.text?.trim() || "A moment frozen in time...";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Good times.";
  }
};

export const editPolaroidImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};