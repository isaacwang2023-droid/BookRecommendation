
import { GoogleGenAI, Type } from "@google/genai";
import type { AIBookInfo } from '../types';

// Utility function to convert a File object to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const getBookInfoFromImage = async (imageFile: File): Promise<AIBookInfo | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set in environment variables.");
    alert("Gemini API Key 未配置，无法使用AI识别功能。");
    // Return mock data if API key is not available
    return {
      title: "React权威指南",
      author: "Stoyan Stefanov",
      publisher: "人民邮电出版社",
      isbn: "9787115392634"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                parts: [
                    { text: "Analyze this image of a book cover. Extract the title, author(s), publisher, and ISBN. Return the result as a JSON object with keys 'title', 'author', 'publisher', and 'isbn'. If a piece of information is not visible, use null for its value." },
                    imagePart,
                ]
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "书名" },
                    author: { type: Type.STRING, description: "作者" },
                    publisher: { type: Type.STRING, description: "出版社" },
                    isbn: { type: Type.STRING, description: "ISBN号" },
                },
            },
        },
    });

    const jsonText = response.text.trim();
    if (jsonText) {
        const parsedJson = JSON.parse(jsonText) as AIBookInfo;
        return parsedJson;
    }
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};
