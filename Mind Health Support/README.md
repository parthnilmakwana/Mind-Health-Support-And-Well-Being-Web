# Mind Health Support - Healthcare API Integration

## Overview
This mental health support chatbot now integrates with the **Health.gov API** to provide real-time, professional healthcare information and resources.

## Features

### 🤖 AI-Powered Healthcare Chatbot
- **Real-time health information** from Health.gov API
- **Mental health resources** and professional guidance
- **Crisis intervention** with emergency contact information
- **Wellness tips** and self-care advice
- **Professional health data** instead of preset responses

### 🏥 Healthcare API Integration
The chatbot uses the **Health.gov MyHealthFinder API** which provides:
- Official health information from the U.S. Department of Health and Human Services
- Evidence-based health recommendations
- Accessible health resources
- Professional medical guidance

### 💬 Chat Features
- **Typing indicator** for better user experience
- **Enter key support** for easy messaging
- **Real-time API responses** based on user queries
- **Crisis detection** with immediate resource provision
- **Professional health information** for various topics

## API Endpoints Used

### Health.gov MyHealthFinder API
- **Base URL**: `https://health.gov/myhealthfinder/api/v3`
- **Endpoint**: `/topicsearch.json`
- **Parameters**: `keyword` (search term)
- **Response**: JSON with health resources and information

## How It Works

1. **User Input**: User types a health-related question
2. **API Query**: System searches Health.gov API for relevant information
3. **Response Generation**: Professional health information is retrieved and formatted
4. **User Display**: Information is presented in a user-friendly format

## Supported Topics

- **Mental Health**: Depression, anxiety, stress management
- **Crisis Support**: Suicide prevention, emergency resources
- **Wellness**: Self-care, healthy living tips
- **Physical Health**: Exercise, nutrition, sleep
- **General Health**: Medical information, preventive care

## Crisis Support

The chatbot automatically detects crisis situations and provides:
- **24/7 Crisis Hotlines**
- **Emergency Contact Information**
- **Immediate Resource Links**
- **Professional Support Guidance**

## Technical Implementation

- **Frontend**: HTML, CSS, JavaScript
- **API**: Health.gov MyHealthFinder API (Free, no authentication required)
- **Data Storage**: Local storage for user preferences
- **Responsive Design**: Works on all devices

## Benefits

✅ **Professional Information**: Official health data from government sources
✅ **Real-time Updates**: Always current health information
✅ **Crisis Support**: Immediate help for emergency situations
✅ **No API Keys**: Free to use, no authentication required
✅ **Reliable Source**: Government-backed health information
✅ **Accessible**: Information from Health.gov accessibility standards

## Usage

1. Open the chatbot by clicking the chat button
2. Type health-related questions or concerns
3. Receive professional health information and resources
4. Access additional resources through provided links

## Emergency Resources

- **National Suicide Prevention Lifeline**: 988 or 1-800-273-8255
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911
- **Health.gov**: https://health.gov

---

*This chatbot is designed to provide support and information but is not a substitute for professional medical care. Always consult healthcare professionals for medical advice.* 