import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { User } from "../../models/user.model.js";

export const generateAboutDescription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { context } = req.body;

    if (!context) {
        throw new ApiError(400, true, "Context is required for generating description");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, false, "User not found");
    }

    try {
        const prompt = buildPrompt(user, context);
        const generatedDescription = await callAIAPI(prompt);

        return res.status(200).json(
            new ApiResponse(
                200,
                true,
                false,
                "Description generated successfully",
                { description: generatedDescription }
            )
        );
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new ApiError(500, true, "Failed to generate description. Please try again.");
    }
});

const buildPrompt = (user, context) => {
    const { role, tags, hourlyRate } = user;
    const specialties = tags?.join(", ") || "various skills";
    
    return `Generate a professional and engaging about section for a ${role} on a freelancing platform. 
    
User Information:
- Role: ${role}
- Specialties/Skills: ${specialties}
${hourlyRate ? `- Hourly Rate: Rs. ${hourlyRate}` : ""}
- Additional Context: ${context}

Requirements:
- Write 2-3 sentences maximum
- Professional yet friendly tone
- Highlight key strengths
- Make it compelling for clients/employers
- Do not include personal details like phone or email
- Do not include hashtags
- Focus on what value the ${role} brings

Generate only the about text, no additional formatting or quotes.`;
};

const callAIAPI = async (prompt) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    // Try with gemini-2.0-flash first, fallback to gemini-pro
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Gemini API Error:", error);
            throw new Error(`API Error: ${error.error?.message || "Unknown error"}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!generatedText) {
            throw new Error("No text generated from API");
        }

        return generatedText.trim();
    } catch (error) {
        console.error("callAIAPI error:", error.message);
        throw error;
    }
};
