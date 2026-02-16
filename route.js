// app/api/analyze/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    console.log('=== ANALYZE API CALLED ===');

    try {
        const body = await request.json();
        const { audioData, duration, attemptNumber, previousAttempts = [], userData } = body;

        console.log('Request data:', {
            hasAudioData: !!audioData,
            audioDataLength: audioData?.length,
            duration,
            attemptNumber,
            previousAttemptsCount: previousAttempts.length,
            userId: userData?.userId
        });

        if (!audioData) {
            console.error('No audio data provided');
            return NextResponse.json(
                { error: 'No audio data provided' },
                { status: 400 }
            );
        }

        // Check API keys
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

        console.log('API Keys check:', {
            hasGeminiKey: !!geminiApiKey,
            hasGoogleKey: !!googleApiKey,
            geminiKeyLength: geminiApiKey?.length,
            googleKeyLength: googleApiKey?.length
        });

        if (!googleApiKey) {
            console.error('Google Cloud API key not configured');
            return NextResponse.json(
                { error: 'Google Cloud API key not configured. Add GOOGLE_CLOUD_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        if (!geminiApiKey) {
            console.error('Gemini API key not configured');
            return NextResponse.json(
                { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        // Step 1: Convert audio to text using Google Cloud Speech-to-Text
        console.log('Step 1: Starting transcription...');
        let transcript;

        try {
            transcript = await transcribeAudio(audioData, googleApiKey);
            console.log('Transcription result:', {
                transcript,
                length: transcript?.length
            });
        } catch (transcribeError) {
            console.error('Transcription error:', transcribeError.message);
            return NextResponse.json(
                { error: 'Speech recognition failed', details: transcribeError.message },
                { status: 500 }
            );
        }

        if (!transcript || !transcript.trim()) {
            console.error('Empty transcript');
            return NextResponse.json(
                { error: 'Could not transcribe audio. Please speak clearly and try again.' },
                { status: 400 }
            );
        }

        // Step 2: Get AI analysis from Gemini
        console.log('Step 2: Starting AI analysis...');
        let analysis;

        try {
            analysis = await analyzeWithGemini({
                transcript,
                duration,
                attemptNumber,
                previousAttempts,
                geminiApiKey
            });
            console.log('Analysis result:', {
                hasScores: !!analysis.scores,
                overallScore: analysis.scores?.overall_score
            });
        } catch (analysisError) {
            console.error('Analysis error:', analysisError.message);
            return NextResponse.json(
                { error: 'AI analysis failed', details: analysisError.message },
                { status: 500 }
            );
        }

        // Step 3: Save to database if configured (optional)
        try {
            if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
                console.log('Step 3: Saving to database...');
                await saveToDatabase({
                    userData,
                    transcript,
                    analysis,
                    duration,
                    attemptNumber
                });
            }
        } catch (dbError) {
            console.error('Database save failed (non-critical):', dbError.message);
            // Don't fail the request
        }

        console.log('=== API SUCCESS ===');
        return NextResponse.json({
            transcript,
            ...analysis
        });

    } catch (error) {
        console.error('=== API ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
                type: error.constructor.name
            },
            { status: 500 }
        );
    }
}

// Google Cloud Speech-to-Text
async function transcribeAudio(base64Audio, googleApiKey) {
    console.log('Calling Google Cloud Speech-to-Text...');

    try {
        const response = await fetch(
            `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: {
                        encoding: 'WEBM_OPUS',
                        sampleRateHertz: 48000,
                        languageCode: 'en-US',
                        enableAutomaticPunctuation: true,
                        enableWordTimeOffsets: true,
                        model: 'default'
                    },
                    audio: {
                        content: base64Audio
                    }
                })
            }
        );

        console.log('Google Speech API status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Speech API error response:', errorText);

            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || 'Speech recognition failed');
            } catch (e) {
                throw new Error(`Speech recognition failed: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Google Speech API response:', {
            hasResults: !!data.results,
            resultsCount: data.results?.length
        });

        if (!data.results || data.results.length === 0) {
            console.warn('No speech detected in audio');
            return '';
        }

        const transcript = data.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        return transcript;

    } catch (error) {
        console.error('Transcription function error:', error);
        throw error;
    }
}

// Gemini AI Analysis
async function analyzeWithGemini({ transcript, duration, attemptNumber, previousAttempts, geminiApiKey }) {
    console.log('Calling Gemini AI...');

    // Build context from previous attempts
    let previousContext = '';
    if (previousAttempts.length > 0) {
        previousContext = '\n\nPREVIOUS ATTEMPTS:\n';
        previousAttempts.forEach((attempt, index) => {
            previousContext += `\nAttempt ${index + 1}:\n`;
            previousContext += `Transcript: "${attempt.transcript}"\n`;
            if (attempt.scores) {
                previousContext += `Scores: Clarity ${attempt.scores.clarity}, Structure ${attempt.scores.structure}, Confidence ${attempt.scores.confidence}, Impact ${attempt.scores.impact}\n`;
            }
        });
    }

    const prompt = `You are VoxMentor — an AI communication coach.

Your job is to analyze spoken responses and provide world-class, engaging, and motivating feedback.

INPUT:
- Transcript: "${transcript}"
- Attempt number: ${attemptNumber} of 3
- Time limit: ${duration} seconds${previousContext}

DURATION-SPECIFIC EVALUATION:

${duration === 10 ? `
10-SECOND EVALUATION:
- Focus on FIRST IMPRESSION and HOOK
- Impact weight: HIGH
- User should hint at WHO they help
- Should create intrigue, not explain everything
` : duration === 30 ? `
30-SECOND EVALUATION:
- Focus on WHO you help, WHAT problem you solve, WHY you care
- Required structure: 3 blocks (8-10s each)
- Impact weight: MEDIUM
- Check time balance between blocks
` : `
60-SECOND EVALUATION:
- Focus on TRUST and AUTHORITY
- Required structure: 4 blocks (WHO 10-12s, WHAT 15s, STORY 15-20s, PROOF 10-12s)
- Impact weight: HIGH
- Story must connect to outcome/value
`}

YOU MUST OUTPUT VALID JSON ONLY with this EXACT structure:

{
  "scores": {
    "clarity": 75,
    "structure": 68,
    "confidence": 82,
    "impact": 71,
    "overall_score": 74
  },
  "archetype": {
    "name": "The Thoughtful Builder",
    "description": "You're clear, sincere, and grounded — but you lead with process instead of impact.",
    "insight": "You're smart — but you overthink under pressure."
  },
  "what_worked": [
    "Clear sentence delivery",
    "Calm tone"
  ],
  "what_held_back": [
    "You explained your role but didn't explain why it matters"
  ],
  "rewrite": {
    "original": "Compressed version of what they said",
    "improved": "Stronger rewrite",
    "why_it_works": [
      "Reason 1",
      "Reason 2"
    ]
  },
  "retry_mission": ${attemptNumber < 3 ? `{
    "goal": "Start with WHO you help",
    "constraint": "Don't mention job titles in the first sentence",
    "tone": "You're smart — but let's channel that into impact."
  }` : 'null'},
  "progress_narrative": "Compare to previous attempts, describe improvement",
  "final_report": ${attemptNumber === 3 ? `{
    "transformation_story": "Before → After description",
    "core_pattern": "The ONE pattern holding them back",
    "signature_move": "Their winning formula",
    "unlocks": "What this enables in real situations",
    "shareable_insight": "Screenshot-worthy insight"
  }` : 'null'}
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations.`;

    try {
        console.log('Gemini prompt length:', prompt.length);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        console.log('Gemini API status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error response:', errorText);

            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error?.message || 'AI analysis failed');
            } catch (e) {
                throw new Error(`AI analysis failed: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Gemini response structure:', {
            hasCandidates: !!data.candidates,
            candidatesCount: data.candidates?.length
        });

        const responseText = data.candidates[0].content.parts[0].text;
        console.log('Raw Gemini response preview:', responseText.substring(0, 200));

        // Parse JSON response
        const cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const analysis = JSON.parse(cleanedResponse);
        console.log('Parsed analysis successfully');

        return analysis;

    } catch (error) {
        console.error('Gemini function error:', error);
        throw error;
    }
}

// Save to Supabase
async function saveToDatabase({ userData, transcript, analysis, duration, attemptNumber }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    const attemptData = {
        user_id: userData.userId,
        user_email: userData.email,
        user_name: userData.name,
        duration,
        attempt_number: attemptNumber,
        transcript,
        clarity_score: analysis.scores.clarity,
        structure_score: analysis.scores.structure,
        confidence_score: analysis.scores.confidence,
        impact_score: analysis.scores.impact,
        overall_score: analysis.scores.overall_score,
        archetype: JSON.stringify(analysis.archetype),
        feedback: JSON.stringify({
            what_worked: analysis.what_worked,
            what_held_back: analysis.what_held_back,
            rewrite: analysis.rewrite,
            progress_narrative: analysis.progress_narrative
        }),
        retry_mission: analysis.retry_mission ? JSON.stringify(analysis.retry_mission) : null,
        final_report: analysis.final_report ? JSON.stringify(analysis.final_report) : null,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/attempts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(attemptData)
    });
}