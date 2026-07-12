const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateChatResponse = async (message, systemPrompt = null, history = [], maxTokens = 500) => {
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
            config: {
                systemInstruction: params.systemInstruction,
                temperature: 0.7,
                maxOutputTokens: maxTokens,
                thinkingConfig: {
                    thinkingBudget: 100
                }
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating Gemini response:", error);

        const errorMessage = error?.message || error?.toString() || '';
        const statusCode = error?.status || error?.code || error?.httpStatusCode;

        // Handle 503 / UNAVAILABLE (high demand)
        if (statusCode === 503 || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
            return "I'm currently experiencing high demand and can't process your request right now. Please try again in a few moments. 🙏";
        }

        // Handle rate limiting (429)
        if (statusCode === 429 || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            return "I've hit my rate limit for the moment. Please wait a minute and try again. ⏳";
        }

        // Generic fallback for any other API error
        return "Sorry, I'm having trouble responding right now. Please try again shortly. 🔄";
    }
};

module.exports = {
    ai,
    generateChatResponse
};
