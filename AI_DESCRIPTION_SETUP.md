# AI Description Generation Setup Guide

## Overview
The profile's "About" section now supports AI-powered description generation using Google's Generative AI API (Gemini).

## Setup Instructions

### 1. Get a Google Generative AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project (or create a new one)
4. Copy the generated API key

### 2. Add to Environment Variables

Add the following to your `.env` file in the `/server` directory:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Required Dependencies (if not already installed)

The backend uses `node-fetch` for making API calls. This is typically already installed, but if needed:

```bash
npm install node-fetch
```

## How It Works

### Frontend Flow (EditAboutModal)
1. User clicks "Edit About" button on profile
2. Modal opens with "Generate with AI" button
3. User clicks the button and provides context (skills, experience, etc.)
4. AI generates a professional description
5. User can review and edit the generated text
6. User clicks "Save" to update profile

### Backend Flow
1. Frontend sends POST request to `/user/generate-about`
2. Controller receives user's profile data and context
3. Builds a prompt using:
   - User role (freelancer/client)
   - Skills/tags
   - Hourly rate (if freelancer)
   - User-provided context
4. Sends request to Google Generative AI API (Gemini)
5. Receives generated description
6. Returns to frontend

## API Endpoint

**Endpoint:** `POST /user/generate-about`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "context": "I have 5 years of experience in web development with React and Node.js..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Description generated successfully",
  "data": {
    "description": "Generated professional description text"
  }
}
```

## Prompt Structure

The AI receives a prompt that includes:
- User's role (freelancer/client)
- Skills/specialties
- Hourly rate (for freelancers)
- Additional context provided by the user
- Requirements for professional, compelling content
- 2-3 sentence maximum

## Features

✅ Professional tone
✅ Highlights key strengths
✅ Customizable with user context
✅ Error handling
✅ Loading states
✅ Character limit validation (1500 chars)
✅ User can edit generated content
✅ One-click generation

## Customization

You can modify the prompt in `generateAboutDescription.controller.js` in the `buildPrompt()` function to adjust:
- Tone (professional, friendly, formal, etc.)
- Length (adjust maxOutputTokens)
- Specific fields to include
- Requirements

## Troubleshooting

**Error: "GEMINI_API_KEY is not configured"**
- Make sure you've added the API key to your `.env` file
- Restart the server after adding the key

**Error: "API Error: ..."**
- Check if your API key is valid
- Verify you have API quota remaining in Google AI Studio
- Check network connectivity

**No response from generation**
- Ensure the context is not empty
- Check server logs for errors
- Verify the API key has access to gemini-1.5-flash model

## Notes

- The API uses `gemini-1.5-flash` which is fast and cost-effective
- Generation is configurable (temperature: 0.7, maxTokens: 200)
- Prompts are designed to ensure professional, appropriate content
- All AI-generated descriptions can be edited before saving
