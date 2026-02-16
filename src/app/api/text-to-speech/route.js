// app/api/text-to-speech/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

        if (!googleApiKey) {
            return NextResponse.json(
                { error: 'Google Cloud API key not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: 'en-US',
                        name: 'en-US-Neural2-F',
                        ssmlGender: 'FEMALE'
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 0.98,
                        pitch: 0.0,
                        volumeGainDb: 0.0
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Google TTS API error:', errorData);
            return NextResponse.json(
                { error: 'Text-to-speech failed' },
                { status: 500 }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            audioContent: data.audioContent
        });

    } catch (error) {
        console.error('Error in text-to-speech API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}