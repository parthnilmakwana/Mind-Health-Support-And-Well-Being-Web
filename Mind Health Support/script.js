// Chatbot Toggle Function  
function toggleChatbot() {
    let chatContainer = document.getElementById("chat-container");

    if (chatContainer.classList.contains("active")) {
        chatContainer.classList.remove("active");
    } else {
        chatContainer.classList.add("active");
    }
}

// Healthcare API Integration
const HEALTH_API_BASE_URL = 'https://health.gov/myhealthfinder/api/v3';

// Chatbot conversation history and context
let conversationHistory = [];
let currentContext = {
    userMood: null,
    topics: [],
    sessionStart: new Date(),
    messageCount: 0
};

// Function to get health information from API
async function getHealthInfo(query) {
    try {
        // Search for health topics
        const searchResponse = await fetch(`${HEALTH_API_BASE_URL}/topicsearch.json?keyword=${encodeURIComponent(query)}`);
        const searchData = await searchResponse.json();
        
        if (searchData.Result && searchData.Result.Resources && searchData.Result.Resources.Resource.length > 0) {
            const resource = searchData.Result.Resources.Resource[0];
            return {
                title: resource.Title,
                description: resource.MyHFDescription,
                url: resource.AccessibleVersion,
                type: 'health_info'
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching health data:', error);
        return null;
    }
}

// Function to get mental health resources
async function getMentalHealthResources() {
    try {
        const response = await fetch(`${HEALTH_API_BASE_URL}/topicsearch.json?keyword=mental%20health`);
        const data = await response.json();
        
        if (data.Result && data.Result.Resources && data.Result.Resources.Resource.length > 0) {
            const resources = data.Result.Resources.Resource.slice(0, 3);
            return resources.map(resource => ({
                title: resource.Title,
                description: resource.MyHFDescription,
                url: resource.AccessibleVersion
            }));
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching mental health resources:', error);
        return null;
    }
}

// Function to get wellness tips
async function getWellnessTips() {
    try {
        const response = await fetch(`${HEALTH_API_BASE_URL}/topicsearch.json?keyword=wellness`);
        const data = await response.json();
        
        if (data.Result && data.Result.Resources && data.Result.Resources.Resource.length > 0) {
            const resource = data.Result.Resources.Resource[0];
            return {
                title: resource.Title,
                description: resource.MyHFDescription,
                url: resource.AccessibleVersion
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching wellness tips:', error);
        return null;
    }
}

// Enhanced AI Response System with Gemini API Integration
async function getBotResponse(userInput) {
    const originalInput = userInput;
    userInput = userInput.toLowerCase().trim();
    
    // Update conversation context
    currentContext.messageCount++;
    updateConversationContext(userInput);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Add user message to conversation history
        conversationHistory.push({
            role: 'user',
            content: originalInput,
            timestamp: new Date()
        });
        
        // Handle crisis situations first (highest priority)
        if (isCrisisMessage(userInput) || (typeof isCrisisMessage === 'function' && isCrisisMessage(originalInput))) {
            const response = handleCrisisResponse(userInput);
            conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
            return response;
        }
        
        // Try to get Gemini API response first
        try {
            const geminiResponse = await getGeminiResponse(originalInput, conversationHistory);
            if (geminiResponse && geminiResponse.trim()) {
                conversationHistory.push({
                    role: 'assistant',
                    content: geminiResponse,
                    timestamp: new Date()
                });
                return geminiResponse;
            }
        } catch (geminiError) {
            console.warn('Gemini API error, falling back to local responses:', geminiError);
        }
        
        // Fallback to local responses if Gemini API fails
        // Handle greetings and introductions
        if (isGreeting(userInput)) {
            const response = handleGreeting(userInput);
            conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
            return response;
        }
        
        // Handle follow-up questions based on context
        if (isFollowUpQuestion(userInput)) {
            const response = await handleFollowUpQuestion(userInput);
            conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
            return response;
        }
        
        // Handle specific topics with context awareness
        const response = await handleTopicBasedResponse(userInput);
        conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });
        return response;
        
    } catch (error) {
        console.error('Error in getBotResponse:', error);
        const errorResponse = `I'm having trouble processing your message right now, but I'm still here to support you. Please try rephrasing your question, or visit https://health.gov for immediate health information. 💙`;
        conversationHistory.push({
            role: 'assistant',
            content: errorResponse,
            timestamp: new Date()
        });
        return errorResponse;
    } finally {
        hideTypingIndicator();
    }
}

// Helper function to update conversation context
function updateConversationContext(userInput) {
    // Extract topics from user input
    const topics = extractTopics(userInput);
    currentContext.topics = [...new Set([...currentContext.topics, ...topics])];
    
    // Detect mood indicators
    if (detectMood(userInput)) {
        currentContext.userMood = detectMood(userInput);
    }
}

// Helper function to extract topics from user input
function extractTopics(userInput) {
    const topicKeywords = {
        'anxiety': ['anxious', 'anxiety', 'worried', 'nervous', 'panic'],
        'depression': ['depressed', 'sad', 'down', 'hopeless', 'empty'],
        'stress': ['stressed', 'overwhelmed', 'pressure', 'tension'],
        'sleep': ['sleep', 'insomnia', 'tired', 'exhausted', 'rest'],
        'relationships': ['relationship', 'partner', 'family', 'friends', 'social'],
        'work': ['work', 'job', 'career', 'boss', 'colleague'],
        'health': ['health', 'medical', 'doctor', 'symptoms', 'pain'],
        'therapy': ['therapy', 'counseling', 'therapist', 'treatment'],
        'medication': ['medication', 'medicine', 'pills', 'prescription'],
        'self-care': ['self-care', 'wellness', 'exercise', 'meditation', 'mindfulness']
    };
    
    const detectedTopics = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => userInput.includes(keyword))) {
            detectedTopics.push(topic);
        }
    }
    return detectedTopics;
}

// Helper function to detect mood
function detectMood(userInput) {
    const moodIndicators = {
        'positive': ['good', 'great', 'happy', 'better', 'improved', 'relieved'],
        'negative': ['bad', 'terrible', 'awful', 'worse', 'struggling', 'difficult'],
        'neutral': ['okay', 'fine', 'normal', 'same', 'unchanged']
    };
    
    for (const [mood, indicators] of Object.entries(moodIndicators)) {
        if (indicators.some(indicator => userInput.includes(indicator))) {
            return mood;
        }
    }
    return null;
}

// Check if message is a crisis situation
function isCrisisMessage(userInput) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'want to die', 'hurt myself', 'self harm', 'cut myself',
        'overdose', 'jump', 'bridge', 'crisis', 'emergency'
    ];
    return crisisKeywords.some(keyword => userInput.includes(keyword));
}

// Handle crisis responses
function handleCrisisResponse(userInput) {
    return `I'm deeply concerned about what you're sharing with me. Your life has value and meaning, even when it doesn't feel that way right now.\n\n🚨 IMMEDIATE HELP IS AVAILABLE:\n\n• **National Suicide Prevention Lifeline: 988** (available 24/7)\n• **Crisis Text Line: Text HOME to 741741**\n• **Emergency Services: 911**\n• **International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/**\n\nYou are not alone in this. There are trained professionals who want to help you through this difficult time. Please reach out to one of these resources immediately.\n\nYour feelings are valid, but they are temporary. Help is available, and recovery is possible. 💙`;
}

// Check if message is a greeting
function isGreeting(userInput) {
    const greetings = [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
        'how are you', 'what\'s up', 'how do you do', 'nice to meet you'
    ];
    return greetings.some(greeting => userInput.includes(greeting)) || currentContext.messageCount <= 2;
}

// Handle greeting responses
function handleGreeting(userInput) {
    const greetings = [
        "Hello! I'm here to support you on your mental health journey. How are you feeling today?",
        "Hi there! I'm your mental health companion. What's on your mind today?",
        "Hello! I'm glad you're here. How can I help you today?",
        "Hi! I'm here to listen and support you. What would you like to talk about?",
        "Hello! I'm your AI mental health assistant. How are you doing today?"
    ];
    
    if (currentContext.messageCount === 1) {
        return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
        return "Hello again! I'm still here to support you. What would you like to discuss?";
    }
}

// Check if message is a follow-up question
function isFollowUpQuestion(userInput) {
    const followUpIndicators = [
        'tell me more', 'can you explain', 'what do you mean', 'how does that work',
        'what about', 'and then', 'also', 'additionally', 'furthermore',
        'yes', 'no', 'maybe', 'i think', 'i feel', 'i believe'
    ];
    return followUpIndicators.some(indicator => userInput.includes(indicator)) || 
           currentContext.topics.length > 0;
}

// Handle follow-up questions with context
async function handleFollowUpQuestion(userInput) {
    const lastTopic = currentContext.topics[currentContext.topics.length - 1];
    
    if (lastTopic === 'anxiety') {
        return await getAnxietyFollowUp(userInput);
    } else if (lastTopic === 'depression') {
        return await getDepressionFollowUp(userInput);
    } else if (lastTopic === 'stress') {
        return await getStressFollowUp(userInput);
    } else if (lastTopic === 'sleep') {
        return await getSleepFollowUp(userInput);
    } else {
        return await getGeneralFollowUp(userInput);
    }
}

// Handle topic-based responses with context
async function handleTopicBasedResponse(userInput) {
    // Check for specific topics and provide contextual responses
    if (userInput.includes('anxiety') || userInput.includes('anxious') || userInput.includes('worried')) {
        return await getAnxietyResponse(userInput);
    } else if (userInput.includes('depression') || userInput.includes('depressed') || userInput.includes('sad')) {
        return await getDepressionResponse(userInput);
    } else if (userInput.includes('stress') || userInput.includes('stressed') || userInput.includes('overwhelmed')) {
        return await getStressResponse(userInput);
    } else if (userInput.includes('sleep') || userInput.includes('insomnia') || userInput.includes('tired')) {
        return await getSleepResponse(userInput);
    } else if (userInput.includes('therapy') || userInput.includes('counseling') || userInput.includes('therapist')) {
        return await getTherapyResponse(userInput);
    } else if (userInput.includes('medication') || userInput.includes('medicine') || userInput.includes('pills')) {
        return await getMedicationResponse(userInput);
    } else if (userInput.includes('relationship') || userInput.includes('partner') || userInput.includes('family')) {
        return await getRelationshipResponse(userInput);
    } else if (userInput.includes('work') || userInput.includes('job') || userInput.includes('career')) {
        return await getWorkResponse(userInput);
    } else {
        return await getGeneralResponse(userInput);
    }
}

// Topic-specific response functions
async function getAnxietyResponse(userInput) {
    const responses = [
        "I understand that anxiety can feel overwhelming. You're not alone in this experience. Let me help you with some strategies:\n\n🧘 **Immediate Relief:**\n• Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8\n• Ground yourself with the 5-4-3-2-1 technique: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste\n\n💡 **Long-term Strategies:**\n• Practice mindfulness meditation daily\n• Regular exercise, even a short walk\n• Limit caffeine and alcohol\n• Maintain a consistent sleep schedule\n\nWould you like me to guide you through a breathing exercise right now?",
        
        "Anxiety is your body's natural response to stress, but when it becomes overwhelming, it's important to have tools to manage it. Here are some evidence-based approaches:\n\n🎯 **Cognitive Techniques:**\n• Challenge negative thoughts with evidence\n• Practice positive self-talk\n• Use thought-stopping techniques\n\n🌱 **Lifestyle Changes:**\n• Regular physical activity\n• Balanced nutrition\n• Adequate sleep\n• Social connections\n\nWhat specific aspect of anxiety would you like to explore further?",
        
        "It sounds like you're dealing with anxiety, and I want you to know that this is completely valid and manageable. Here's what I can help you with:\n\n⚡ **Quick Anxiety Relief:**\n• Box breathing: 4 counts in, 4 hold, 4 out, 4 hold\n• Progressive muscle relaxation\n• Cold water on your wrists\n\n📚 **Understanding Anxiety:**\n• It's your body's alarm system\n• It's temporary, even when it doesn't feel that way\n• You have more control than you think\n\nWould you like to try a specific technique, or do you have questions about managing anxiety?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getDepressionResponse(userInput) {
    const responses = [
        "I hear that you're going through a difficult time, and I want you to know that depression is treatable and you don't have to face it alone.\n\n🌟 **Small Steps That Help:**\n• Get sunlight for at least 15 minutes daily\n• Maintain a regular sleep schedule\n• Eat regular, nutritious meals\n• Stay connected with supportive people\n\n💙 **Professional Support:**\n• Therapy can be incredibly helpful\n• Medication, when appropriate, can make a significant difference\n• Support groups provide community\n\nWhat feels most challenging for you right now?",
        
        "Depression can make everything feel heavy and hopeless, but please remember that these feelings are temporary, even when they don't feel that way. Here are some gentle approaches:\n\n🔄 **Daily Routines:**\n• Start with one small task each day\n• Celebrate small victories\n• Be patient and kind with yourself\n\n🤝 **Support Systems:**\n• Reach out to trusted friends or family\n• Consider professional help\n• Join online support communities\n\nIs there a particular area where you'd like more support or information?",
        
        "Thank you for sharing what you're going through. Depression is a real and treatable condition. Here's what I want you to know:\n\n💪 **You're Stronger Than You Think:**\n• Getting through each day with depression takes courage\n• Your feelings are valid\n• Recovery is possible\n\n🛠️ **Tools That Can Help:**\n• Cognitive Behavioral Therapy (CBT)\n• Mindfulness and meditation\n• Regular exercise, even gentle movement\n• Creative expression\n\nWhat would be most helpful for you to focus on right now?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getStressResponse(userInput) {
    const responses = [
        "Stress is a natural part of life, but when it becomes chronic, it can really impact your well-being. Let me share some effective stress management techniques:\n\n⚡ **Immediate Stress Relief:**\n• Deep breathing exercises\n• Quick meditation (even 2-3 minutes)\n• Physical movement or stretching\n• Listening to calming music\n\n🎯 **Long-term Stress Management:**\n• Time management and prioritization\n• Setting healthy boundaries\n• Regular exercise routine\n• Adequate sleep and nutrition\n\nWhat's causing you the most stress right now?",
        
        "I understand that stress can feel overwhelming. The good news is that there are many proven strategies to help you manage it effectively:\n\n🧠 **Mind-Based Techniques:**\n• Mindfulness meditation\n• Progressive muscle relaxation\n• Visualization exercises\n• Journaling your thoughts\n\n🏃‍♀️ **Body-Based Techniques:**\n• Regular physical exercise\n• Yoga or tai chi\n• Massage or self-massage\n• Spending time in nature\n\nWould you like me to guide you through a specific stress-relief technique?",
        
        "Stress affects everyone differently, and it's important to find what works best for you. Here are some evidence-based approaches:\n\n📋 **Organizational Strategies:**\n• Break large tasks into smaller ones\n• Use to-do lists and calendars\n• Learn to say no when needed\n• Delegate when possible\n\n💆‍♀️ **Relaxation Techniques:**\n• Breathing exercises\n• Guided imagery\n• Aromatherapy\n• Warm baths or showers\n\nWhat type of stress management approach interests you most?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getSleepResponse(userInput) {
    const responses = [
        "Sleep is crucial for both physical and mental health. If you're having trouble sleeping, here are some evidence-based strategies:\n\n🌙 **Sleep Hygiene Tips:**\n• Keep a consistent sleep schedule\n• Create a cool, dark, quiet bedroom\n• Avoid screens 1 hour before bed\n• Limit caffeine after 2 PM\n\n🛏️ **Bedtime Routine:**\n• Wind down with relaxing activities\n• Try reading or gentle stretching\n• Use relaxation techniques\n• Keep a worry journal to clear your mind\n\nWhat's keeping you from getting good sleep?",
        
        "Poor sleep can really impact your mood and daily functioning. Here's how to improve your sleep quality:\n\n⏰ **Timing and Routine:**\n• Go to bed and wake up at the same time daily\n• Create a relaxing bedtime routine\n• Avoid naps longer than 20 minutes\n• Get natural light in the morning\n\n🚫 **What to Avoid:**\n• Large meals before bedtime\n• Alcohol and nicotine\n• Intense exercise close to bedtime\n• Stressful activities before bed\n\nWould you like specific tips for your sleep situation?",
        
        "Sleep problems are common and can be really frustrating. Here are some proven strategies to help you get better rest:\n\n🧘 **Relaxation Techniques:**\n• Progressive muscle relaxation\n• Breathing exercises\n• Meditation or mindfulness\n• Gentle yoga or stretching\n\n🏠 **Environment Optimization:**\n• Invest in comfortable bedding\n• Use blackout curtains\n• Consider white noise or earplugs\n• Keep your bedroom for sleep only\n\nWhat's your biggest sleep challenge right now?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getTherapyResponse(userInput) {
    const responses = [
        "Therapy can be incredibly helpful for mental health challenges. Here's what you should know:\n\n🎯 **Types of Therapy:**\n• Cognitive Behavioral Therapy (CBT)\n• Dialectical Behavior Therapy (DBT)\n• Psychodynamic therapy\n• Group therapy\n\n🔍 **Finding a Therapist:**\n• Ask for referrals from your doctor\n• Use online directories like Psychology Today\n• Check with your insurance provider\n• Consider online therapy options\n\nWhat questions do you have about starting therapy?",
        
        "Taking the step to consider therapy shows great self-awareness and courage. Here's some helpful information:\n\n💡 **What to Expect:**\n• First session is usually an assessment\n• It's normal to feel nervous initially\n• You can change therapists if needed\n• Progress takes time and consistency\n\n💰 **Cost Considerations:**\n• Many insurance plans cover therapy\n• Sliding scale options available\n• Some employers offer EAP programs\n• Online therapy can be more affordable\n\nWhat's holding you back from starting therapy, if anything?",
        
        "Therapy is one of the most effective treatments for mental health challenges. Here's how to make the most of it:\n\n🤝 **Therapeutic Relationship:**\n• Find someone you feel comfortable with\n• Be honest and open\n• Ask questions about the process\n• Give it time to work\n\n📈 **Maximizing Benefits:**\n• Do homework between sessions\n• Practice skills learned in therapy\n• Be patient with the process\n• Communicate your needs\n\nWould you like help finding therapy resources in your area?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getMedicationResponse(userInput) {
    const responses = [
        "Medication can be an important part of mental health treatment. Here's what you should know:\n\n💊 **Important Considerations:**\n• Only a qualified healthcare provider can prescribe\n• It often works best combined with therapy\n• It may take time to find the right medication\n• Side effects are usually temporary\n\n🤝 **Working with Your Doctor:**\n• Be honest about all symptoms\n• Report any side effects immediately\n• Don't stop medication without consulting your doctor\n• Keep track of how you're feeling\n\nWhat questions do you have about medication?",
        
        "Mental health medication is a personal decision that should be made with a healthcare professional. Here's some helpful information:\n\n⚖️ **Benefits and Considerations:**\n• Can help manage symptoms effectively\n• Often most effective with therapy\n• May need adjustments over time\n• Everyone responds differently\n\n📋 **What to Discuss with Your Doctor:**\n• Your specific symptoms and concerns\n• Any other medications you're taking\n• Family history of mental health conditions\n• Your lifestyle and preferences\n\nAre you currently considering medication, or do you have questions about your current treatment?",
        
        "Medication for mental health is a valid and often effective treatment option. Here's what's important to understand:\n\n🔬 **How It Works:**\n• Affects brain chemistry to improve symptoms\n• Different medications work for different conditions\n• May take 4-6 weeks to see full effects\n• Regular monitoring is important\n\n📞 **When to Seek Help:**\n• If you're having thoughts of self-harm\n• If side effects are concerning\n• If symptoms worsen\n• If you want to make changes to your treatment\n\nWhat would you like to know about mental health medication?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getRelationshipResponse(userInput) {
    const responses = [
        "Relationships can significantly impact our mental health. Here are some strategies for healthy relationships:\n\n💬 **Communication Skills:**\n• Use 'I' statements instead of 'you' statements\n• Listen actively and empathetically\n• Express needs clearly and respectfully\n• Practice conflict resolution\n\n🛡️ **Setting Boundaries:**\n• Know your limits and communicate them\n• It's okay to say no\n• Protect your emotional well-being\n• Seek support when needed\n\nWhat relationship challenges are you facing?",
        
        "Healthy relationships are crucial for mental well-being. Here's how to nurture them:\n\n🤝 **Building Connection:**\n• Spend quality time together\n• Show appreciation and gratitude\n• Be supportive during difficult times\n• Maintain your own interests and friendships\n\n⚖️ **Balancing Needs:**\n• Communicate your needs clearly\n• Respect each other's boundaries\n• Work together on solutions\n• Seek professional help if needed\n\nWhat aspect of your relationships would you like to work on?",
        
        "Relationships can be both a source of joy and stress. Here are some tips for maintaining healthy connections:\n\n💕 **Emotional Support:**\n• Be there for each other during tough times\n• Celebrate successes together\n• Practice empathy and understanding\n• Give each other space when needed\n\n🔧 **Problem-Solving:**\n• Address issues early before they escalate\n• Focus on solutions, not blame\n• Consider couples therapy if needed\n• Remember that both people need to be committed\n\nWhat's happening in your relationships that you'd like to discuss?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getWorkResponse(userInput) {
    const responses = [
        "Work stress is a common challenge that can significantly impact mental health. Here are some strategies:\n\n⚖️ **Work-Life Balance:**\n• Set clear boundaries between work and personal time\n• Take regular breaks throughout the day\n• Use your vacation time\n• Don't check work emails outside of work hours\n\n💼 **Managing Work Stress:**\n• Prioritize tasks and focus on what's most important\n• Communicate with your supervisor about workload\n• Practice time management techniques\n• Build positive relationships with colleagues\n\nWhat's causing you the most stress at work?",
        
        "Workplace mental health is increasingly recognized as important. Here's how to protect yours:\n\n🧠 **Mental Health at Work:**\n• Take mental health days when needed\n• Practice stress management techniques\n• Seek support from HR or employee assistance programs\n• Know your rights regarding mental health accommodations\n\n🎯 **Career Development:**\n• Set realistic goals and expectations\n• Seek feedback and growth opportunities\n• Consider if your current role aligns with your values\n• Don't be afraid to explore new opportunities\n\nWhat work-related challenges are you facing?",
        
        "Work can be a significant source of stress, but there are ways to manage it effectively:\n\n📋 **Organization and Planning:**\n• Use tools like calendars and to-do lists\n• Break large projects into smaller tasks\n• Set realistic deadlines\n• Learn to delegate when possible\n\n🤝 **Building Support:**\n• Develop positive relationships with colleagues\n• Find a mentor or supportive supervisor\n• Join professional networks\n• Consider therapy if work stress is overwhelming\n\nWhat specific work situation would you like help with?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getGeneralResponse(userInput) {
    const responses = [
        "I'm here to listen and support you. While I can't provide medical advice, I can offer general guidance and resources.\n\n💡 **General Mental Health Tips:**\n• Practice self-care regularly\n• Maintain social connections\n• Get regular exercise\n• Eat a balanced diet\n• Get adequate sleep\n\n🤝 **When to Seek Professional Help:**\n• If symptoms persist for more than 2 weeks\n• If they interfere with daily functioning\n• If you have thoughts of self-harm\n• If you feel overwhelmed or hopeless\n\nWhat would you like to talk about?",
        
        "Thank you for reaching out. I'm here to provide support and information about mental health and well-being.\n\n🌟 **Building Resilience:**\n• Practice gratitude daily\n• Develop coping strategies\n• Build a support network\n• Learn stress management techniques\n• Maintain hope and optimism\n\n📚 **Resources Available:**\n• Mental health hotlines\n• Online support groups\n• Self-help books and apps\n• Professional therapy services\n\nHow can I best support you today?",
        
        "I appreciate you sharing with me. Mental health is important, and it's great that you're taking steps to care for yourself.\n\n🔄 **Daily Wellness Practices:**\n• Start your day with intention\n• Practice mindfulness or meditation\n• Stay hydrated and eat regularly\n• Move your body in ways you enjoy\n• End your day with reflection\n\n💙 **Remember:**\n• Your feelings are valid\n• It's okay to not be okay\n• Help is available\n• Recovery is possible\n\nWhat's on your mind today?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Follow-up response functions
async function getAnxietyFollowUp(userInput) {
    const responses = [
        "I'm glad you're asking more about anxiety management. Here are some additional strategies:\n\n🎯 **Advanced Techniques:**\n• Exposure therapy (gradual, with support)\n• Cognitive restructuring\n• Mindfulness-based stress reduction\n• Biofeedback techniques\n\n📱 **Helpful Tools:**\n• Anxiety tracking apps\n• Guided meditation apps\n• Breathing exercise apps\n• Journaling for anxiety patterns\n\nWhat specific anxiety technique would you like to explore further?",
        
        "Great question! Let me dive deeper into anxiety management:\n\n🧠 **Understanding Your Anxiety:**\n• What triggers your anxiety?\n• What physical symptoms do you notice?\n• What thoughts go through your mind?\n• How long do episodes typically last?\n\n🛠️ **Personalized Strategies:**\n• Create an anxiety toolkit\n• Develop a support plan\n• Practice techniques regularly\n• Track what works for you\n\nWould you like help creating a personalized anxiety management plan?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getDepressionFollowUp(userInput) {
    const responses = [
        "I'm here to continue supporting you with depression. Let's explore this further:\n\n🔍 **Understanding Depression:**\n• It's more than just feeling sad\n• It affects thoughts, feelings, and behaviors\n• It's treatable with the right support\n• Recovery looks different for everyone\n\n💪 **Building Hope:**\n• Focus on small, achievable goals\n• Celebrate even tiny victories\n• Remember that feelings are temporary\n• Connect with others who understand\n\nWhat aspect of depression would you like to discuss more?",
        
        "Thank you for continuing this conversation about depression. Here's more support:\n\n🌟 **Recovery Strategies:**\n• Build a daily routine\n• Practice self-compassion\n• Engage in activities you used to enjoy\n• Challenge negative thought patterns\n\n🤝 **Support Systems:**\n• Professional therapy\n• Support groups\n• Trusted friends and family\n• Online communities\n\nWhat feels most helpful for you to focus on right now?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getStressFollowUp(userInput) {
    const responses = [
        "Let's continue exploring stress management together:\n\n📊 **Stress Assessment:**\n• What are your main stress sources?\n• How does stress show up in your body?\n• What coping strategies have you tried?\n• What's worked well in the past?\n\n🎯 **Personalized Approach:**\n• Identify your stress triggers\n• Develop a stress management toolkit\n• Practice techniques regularly\n• Adjust strategies as needed\n\nWhat would be most helpful for your stress management?",
        
        "Great! Let's build on stress management strategies:\n\n⚡ **Quick Stress Relief:**\n• 4-7-8 breathing technique\n• Progressive muscle relaxation\n• 5-minute meditation\n• Quick walk or stretch\n\n📈 **Long-term Management:**\n• Regular exercise routine\n• Healthy sleep habits\n• Time management skills\n• Boundary setting\n\nWhich stress management approach interests you most?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getSleepFollowUp(userInput) {
    const responses = [
        "Let's dive deeper into improving your sleep:\n\n🕐 **Sleep Schedule:**\n• What time do you usually go to bed?\n• What time do you wake up?\n• How long does it take you to fall asleep?\n• Do you wake up during the night?\n\n🌙 **Sleep Environment:**\n• Is your bedroom cool and dark?\n• Do you have a comfortable mattress?\n• Are there noise distractions?\n• Do you use your bed only for sleep?\n\nWhat's your biggest sleep challenge?",
        
        "Excellent! Let's continue working on your sleep:\n\n📱 **Pre-Bedtime Routine:**\n• Avoid screens 1 hour before bed\n• Try reading or gentle stretching\n• Practice relaxation techniques\n• Keep a worry journal\n\n☀️ **Morning Routine:**\n• Get natural light first thing\n• Avoid hitting snooze\n• Have a consistent wake time\n• Start with something pleasant\n\nWhat part of your sleep routine would you like to improve?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function getGeneralFollowUp(userInput) {
    const responses = [
        "I'm here to continue supporting you. What would you like to explore further?\n\n💭 **You might consider:**\n• Specific coping strategies\n• Professional resources\n• Self-care techniques\n• Support systems\n\n🤔 **Questions to explore:**\n• What's working well for you?\n• What challenges are you facing?\n• What support do you need?\n• What would be most helpful right now?\n\nWhat's on your mind?",
        
        "Thank you for continuing our conversation. I'm here to help you explore whatever you'd like to discuss.\n\n🎯 **Areas we can explore:**\n• Mental health strategies\n• Coping mechanisms\n• Professional resources\n• Self-care practices\n• Support systems\n\n💙 **Remember:**\n• Your feelings are valid\n• It's okay to take things one step at a time\n• Help is available\n• You're not alone in this\n\nWhat would be most helpful for you to talk about?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Function to show typing indicator with realistic delay
function showTypingIndicator() {
    let chatBox = document.getElementById("chat-box");
    let typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("bot-message", "typing");
    typingDiv.innerHTML = '<span class="typing-dots">Mind Care Bot is typing<span>.</span><span>.</span><span>.</span></span>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to clear conversation history
function clearConversationHistory() {
    conversationHistory = [];
    currentContext = {
        userMood: null,
        topics: [],
        sessionStart: new Date(),
        messageCount: 0
    };
    
    // Clear chat box
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = '<div class="bot-message">Hello! How can I support you today? 😊</div>';
}

// Function to get conversation summary
function getConversationSummary() {
    const topics = currentContext.topics.join(', ');
    const duration = Math.round((new Date() - currentContext.sessionStart) / 1000 / 60); // minutes
    
    return {
        messageCount: currentContext.messageCount,
        topics: topics,
        duration: duration,
        userMood: currentContext.userMood
    };
}

// Function to hide typing indicator
function hideTypingIndicator() {
    let typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Function to Handle Chat Messages  
async function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBox = document.getElementById("chat-box");

    // Add user message  
    let userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.innerText = userInput;
    chatBox.appendChild(userMessage);

    // Clear input  
    document.getElementById("user-input").value = "";

    // Scroll to bottom  
    chatBox.scrollTop = chatBox.scrollHeight;

    // Get AI response with API integration
    let botResponse = await getBotResponse(userInput);

    // Remove typing indicator and add bot response
    hideTypingIndicator();
    
    let botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerText = botResponse;
    chatBox.appendChild(botMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to Show/Hide Help Modal  
function toggleHelpModal() {
    let helpModal = document.getElementById("help-modal");

    if (helpModal.classList.contains("active")) {
        helpModal.classList.remove("active");
    } else {
        helpModal.classList.add("active");
    }
}

// Add Enter key support for chat input
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById("user-input");
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                const menuContent = mobileMenu.querySelector('div');
                if (menuContent) {
                    menuContent.style.transform = 'translateX(0)';
                }
            }, 10);
        });
    }
    
    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', function() {
            const menuContent = mobileMenu.querySelector('div');
            if (menuContent) {
                menuContent.style.transform = 'translateX(100%)';
            }
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        });
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                const menuContent = mobileMenu.querySelector('div');
                if (menuContent) {
                    menuContent.style.transform = 'translateX(100%)';
                }
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
        });
    }
    
    // Close mobile menu when clicking on navigation links
    const mobileNavLinks = mobileMenu.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            const menuContent = mobileMenu.querySelector('div');
            if (menuContent) {
                menuContent.style.transform = 'translateX(100%)';
            }
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        });
    });
    
    // Close mobile menu when clicking on buttons
    const mobileNavButtons = mobileMenu.querySelectorAll('button');
    mobileNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuContent = mobileMenu.querySelector('div');
            if (menuContent) {
                menuContent.style.transform = 'translateX(100%)';
            }
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        });
    });
});





