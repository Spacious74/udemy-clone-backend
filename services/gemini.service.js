const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateChatResponse = async (message, systemPrompt = null, history = []) => {
    try {
        const params = {
            contents: [
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                { role: 'user', parts: [{ text: message }] }
            ]
        };

        if (systemPrompt) {
            params.systemInstruction = {
                role: "system",
                parts: [{ text: systemPrompt }]
            };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: params.contents,
            systemInstruction: params.systemInstruction
        });

        return response.text;
    } catch (error) {
        console.error("Error generating Gemini response:", error);
        throw error;
    }
};

module.exports = {
    ai,
    generateChatResponse
};