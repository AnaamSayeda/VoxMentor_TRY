// app/api/analyze/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    console.log('=== VOXMENTOR ANALYZE API ===');

    try {
        const body = await request.json();
        const { audioData, duration, attemptNumber, previousAttempts = [], userData } = body;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

        if (!googleApiKey || !geminiApiKey) {
            return NextResponse.json(
                { error: 'API keys not configured' },
                { status: 500 }
            );
        }

        // Step 1: Transcribe audio
        console.log(`Transcribing ${duration}s audio...`);
        const transcript = await transcribeAudio(audioData, googleApiKey);

        if (!transcript || !transcript.trim()) {
            return NextResponse.json(
                { error: 'Could not transcribe audio. Please speak clearly.' },
                { status: 400 }
            );
        }

        console.log('Transcript:', transcript);

        // Step 2: Get coaching feedback from Gemini
        console.log(`Getting Round ${attemptNumber} coaching...`);
        const coaching = await getCoachingFeedback({
            transcript,
            duration,
            attemptNumber,
            previousAttempts,
            geminiApiKey
        });

        console.log('Coaching generated successfully');

        // Step 3: Save to database (optional)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
            await saveToDatabase({ userData, transcript, coaching, duration, attemptNumber });
        }

        return NextResponse.json({
            transcript,
            ...coaching
        });

    } catch (error) {
        console.error('API ERROR:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

async function transcribeAudio(base64Audio, googleApiKey) {
    const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                    enableAutomaticPunctuation: true,
                    model: 'default'
                },
                audio: { content: base64Audio }
            })
        }
    );

    if (!response.ok) {
        throw new Error('Speech recognition failed');
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) return '';

    return data.results.map(r => r.alternatives[0].transcript).join(' ');
}

async function getCoachingFeedback({ transcript, duration, attemptNumber, previousAttempts, geminiApiKey }) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
        }
    });

    // Build context from previous attempts
    let previousContext = '';
    let previousScores = null;

    if (previousAttempts.length > 0) {
        previousContext = '\n\nPREVIOUS ATTEMPTS:\n';
        previousAttempts.forEach((attempt, i) => {
            previousContext += `Round ${i + 1}: "${attempt.transcript}"\n`;
            if (attempt.scores) {
                previousContext += `Scores: Clarity ${attempt.scores.clarity}, Structure ${attempt.scores.structure}, Impact ${attempt.scores.impact}, Overall ${attempt.scores.overall_score}\n`;
                if (i === previousAttempts.length - 1) {
                    previousScores = attempt.scores;
                }
            }
        });
    }

    const getStructureRule = () => {
        if (duration === 15) {
            return `15-SECOND STRUCTURE:
Who you are â†’ What you do (specific) â†’ Hook (memorable line)
Priority: Clarity, sharp wording, no filler
Example: "I'm a product designer who helps startups turn messy ideas into clean experiences â€” and I obsess over simplicity."`;
        } else if (duration === 30) {
            return `30-SECOND STRUCTURE:
Hook â†’ Who you help â†’ Problem â†’ What you do â†’ Result
Priority: Audience clarity, outcome over process, strong verbs
Example: "Most teams waste months building the wrong thing. I help startups validate ideas fast through rapid prototyping â€” we've saved clients 6 months of dev time."`;
        } else {
            return `60-SECOND STRUCTURE:
Hook â†’ Context â†’ Who you help â†’ Problem â†’ Method â†’ Example â†’ Result â†’ Strong closing
Priority: Logical flow, one concrete example, authority in ending`;
        }
    };

    const prompt = `You are VoxMentor â€” an energetic, warm, intelligent communication coach.

CONTEXT:
- Round: ${attemptNumber} of 3
- Duration: ${duration} seconds
- Transcript: "${transcript}"
${previousContext}

STRUCTURE RULE FOR ${duration}s:
${getStructureRule()}

CRITICAL: Generate TWO separate outputs:
1. FULL DETAILED TEXT FEEDBACK (for display)
2. SPOKEN SUMMARY (25-30 seconds, 120-160 words) - This is what AI will speak

SPOKEN SUMMARY MUST:
- Sound like a real mentor wrapping up a session
- Be conversational and warm
- Cover key insights in compressed form
- NO section headings
- NO bullet points
- NO robotic tone

${attemptNumber === 1 ? `
ROUND 1: Baseline Assessment
- Calculate initial scores (clarity, structure, impact out of 10)
- Identify what they're trying to say
- Rewrite using correct structure
- Explain why it works

SPOKEN SUMMARY STRUCTURE:
"Good. I can hear what you're trying to say. [Briefly state what needs work]. I rewrote it to [main change]. Notice how [principle]. [What changed]. Let's tighten this in the next round."
` : attemptNumber === 2 ? `
ROUND 2: Structured Improvement
- Calculate new scores
- Calculate improvement % from Round 1
- Point out weak language
- Provide stronger alternatives

SPOKEN SUMMARY STRUCTURE:
"Much clearer. [Brief improvement]. Your [strength]. What still needs work: [issue]. I rewrote it to [change]. This works because [principle]. [What changed]. Final round, make it yours."
` : `
ROUND 3: Final Assessment
- Calculate final scores
- Calculate total improvement % from Round 1
- Show transformation arc
- Give communication archetype

SPOKEN SUMMARY STRUCTURE:
"Alright, strong final round. In round one, you were [state]. By round three, you're [state]. That's progress. Your [strengths]. What needed sharpening: [issues]. I rewrote it to [change]. Notice how [principle]. The biggest change: [insight]. This now sounds [outcome]."

ALSO generate spoken_transformation (20 seconds, 80-100 words):
"[Summarize journey]. [Breakthrough]. [Archetype revealed]. [Final encouragement]."
`}

Return JSON with EXACT structure:
{
  "scores": {
    "clarity": 7.5,
    "structure": 6.0,
    "impact": 7.0,
    "overall_score": 20.5
  },
  ${previousScores ? `"improvement": {
    "clarity_change": ${previousScores ? 'number (new - old)' : '0'},
    "structure_change": ${previousScores ? 'number' : '0'},
    "impact_change": ${previousScores ? 'number' : '0'},
    "overall_change": ${previousScores ? 'number' : '0'},
    "percentage_improvement": ${previousScores ? 'number (percentage)' : '0'}
  },` : ''}
  "spoken_summary": "120-160 word mentor summary. Warm, conversational. This will be spoken by AI.",
  "spoken_intro": "2-3 sentence warm opening for text",
  "what_hearing": {
    "core_identity": "...",
    "what_they_do": "...",
    "whats_unclear": "..."
  },
  "what_needs_sharpening": ["point 1", "point 2", "point 3"],
  "rewritten_version": "Improved version with structure",
  "why_this_works": "Explanation with principle",
  "what_changed": "Specific changes made",
  "rephrase_options": ["option 1", "option 2"],
  ${attemptNumber === 3 ? `"transformation_summary": {
    "round_1": "...",
    "round_2": "...",
    "round_3": "...",
    "breakthrough_moment": "...",
    "archetype": "Professional archetype name",
    "what_you_learned": ["lesson 1", "lesson 2", "lesson 3"],
    "spoken_transformation": "80-100 word transformation summary for voice"
  },` : ''}
  "next_instruction": "Motivational direction"
}`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}

async function saveToDatabase({ userData, transcript, coaching, duration, attemptNumber }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    await fetch(`${supabaseUrl}/rest/v1/attempts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
            user_id: userData.userId,
            user_email: userData.email,
            user_name: userData.name,
            duration,
            attempt_number: attemptNumber,
            transcript,
            scores: JSON.stringify(coaching.scores),
            coaching_data: JSON.stringify(coaching),
            created_at: new Date().toISOString()
        })
    });
}