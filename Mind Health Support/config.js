// Gemini API Configuration
// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API key
// You can get your API key from: https://makersuite.google.com/app/apikey

const GEMINI_CONFIG = {
    // Replace this with your actual Gemini API key
    API_KEY: 'YOUR_GOOGLE_API_KEY',
    
    // Gemini API endpoint
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    
    // Model configuration
    MODEL_CONFIG: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40
    },
    
    // Mental health specific prompts and context
    SYSTEM_PROMPT: `You are Mind Care Bot, a compassionate AI mental health support assistant. Your role is to:

1. Provide empathetic, non-judgmental support for mental health concerns
2. Offer evidence-based coping strategies and techniques
3. Suggest appropriate resources and professional help when needed
4. Maintain a warm, supportive, and professional tone
5. Always prioritize user safety and well-being

Guidelines:
- Be empathetic and validate the user's feelings
- Provide practical, actionable advice
- Never provide medical diagnoses or replace professional therapy
- Always encourage professional help for serious concerns
- Use appropriate mental health resources and crisis hotlines
- Keep responses concise but helpful
- Maintain confidentiality and respect privacy

Remember: You are not a replacement for professional mental health care, but a supportive companion on the user's mental health journey.`,

    // Crisis detection keywords
    CRISIS_KEYWORDS: [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'want to die', 'hurt myself', 'self harm', 'cut myself',
        'overdose', 'jump', 'bridge', 'crisis', 'emergency',
        'harm myself', 'end my life', 'suicidal thoughts'
    ],

    // Mental health topics for better context
    MENTAL_HEALTH_TOPICS: [
        'anxiety', 'depression', 'stress', 'sleep', 'relationships',
        'work', 'therapy', 'medication', 'self-care', 'trauma',
        'grief', 'addiction', 'eating disorders', 'bipolar',
        'ptsd', 'ocd', 'panic attacks', 'social anxiety'
    ]
};

// Function to get Gemini API response
async function getGeminiResponse(userMessage, conversationHistory = []) {
    try {
        // Check if API key is configured
        if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY') {
            console.warn('Gemini API key not configured. Using fallback responses.');
            return getFallbackResponse(userMessage);
        }

        // Debug logging
        console.log('Attempting to call Gemini API with message:', userMessage);
        console.log('API Key configured:', GEMINI_CONFIG.API_KEY ? 'Yes' : 'No');

        // Prepare the conversation context
        const conversationContext = conversationHistory
            .slice(-10) // Keep last 10 messages for context
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

        // Create the request payload
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `${GEMINI_CONFIG.SYSTEM_PROMPT}\n\nUser message: ${userMessage}`
                        }
                    ]
                }
            ],
            generationConfig: GEMINI_CONFIG.MODEL_CONFIG
        };

        // Make the API request
        const response = await fetch(`${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log('Successfully got Gemini response:', responseText);
            return responseText;
        } else {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from Gemini API');
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        console.log('Falling back to local responses');
        return getFallbackResponse(userMessage);
    }
}

// Fallback response function when API is not available
function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Crisis detection
    if (GEMINI_CONFIG.CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
        return `I'm deeply concerned about what you're sharing with me. Your life has value and meaning, even when it doesn't feel that way right now.

🚨 IMMEDIATE HELP IS AVAILABLE:

• **National Suicide Prevention Lifeline: 988** (available 24/7)
• **Crisis Text Line: Text HOME to 741741**
• **Emergency Services: 911**
• **International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/**

You are not alone in this. There are trained professionals who want to help you through this difficult time. Please reach out to one of these resources immediately.

Your feelings are valid, but they are temporary. Help is available, and recovery is possible. 💙`;
    }

    // General supportive responses
    const responses = [
        "I hear you, and I want you to know that your feelings are valid. While I'm having some technical difficulties right now, I'm still here to support you. Please know that you're not alone, and help is available.",
        "Thank you for reaching out. I'm experiencing some connectivity issues, but I want you to know that your mental health matters. Please consider reaching out to a trusted friend, family member, or mental health professional.",
        "I'm here to listen, even though I'm having some technical difficulties. Your well-being is important, and there are many resources available to support you through whatever you're going through.",
        "I appreciate you sharing with me. While I'm working through some technical issues, please remember that your feelings matter and help is available. Consider reaching out to professional support if you need it."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// Function to detect if message contains crisis keywords
function isCrisisMessage(message) {
    const lowerMessage = message.toLowerCase();
    return GEMINI_CONFIG.CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Function to detect mental health topics
function detectMentalHealthTopics(message) {
    const lowerMessage = message.toLowerCase();
    return GEMINI_CONFIG.MENTAL_HEALTH_TOPICS.filter(topic => lowerMessage.includes(topic));
}

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GEMINI_CONFIG,
        getGeminiResponse,
        getFallbackResponse,
        isCrisisMessage,
        detectMentalHealthTopics
    };
}

