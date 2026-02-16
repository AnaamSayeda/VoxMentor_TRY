'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function RecordingStep({ duration, attemptNumber, onComplete, userData, previousAttempts }) {
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState('ready'); // ready, recording, processing
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                }
            });

            streamRef.current = stream;

            const options = { mimeType: 'audio/webm;codecs=opus' };
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                await processRecording(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingStatus('recording');

            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setError('Please allow microphone access to continue.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
        }
    };

    const processRecording = async (audioBlob) => {
        setRecordingStatus('processing');
        setIsProcessing(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                try {
                    const base64Audio = reader.result.split(',')[1];

                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            audioData: base64Audio,
                            duration,
                            attemptNumber,
                            previousAttempts,
                            userData
                        }),
                    });

                    const data = await response.json().catch(() => ({
                        error: 'Invalid response from server'
                    }));

                    if (!response.ok) {
                        throw new Error(data.error || data.details || 'Analysis failed');
                    }

                    onComplete(data);

                } catch (innerError) {
                    console.error('Inner processing error:', innerError);
                    setError(innerError.message || 'Error analyzing audio.');
                    setIsProcessing(false);
                    setRecordingStatus('ready');
                    setTimeLeft(duration);
                }
            };

            reader.onerror = () => {
                throw new Error('Failed to read audio file');
            };

        } catch (error) {
            console.error('Outer processing error:', error);
            setError(error.message || 'Error processing your recording.');
            setIsProcessing(false);
            setRecordingStatus('ready');
            setTimeLeft(duration);
        }
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full bg-red-900/40 backdrop-blur-xl rounded-3xl p-10 border-2 border-red-500"
                >
                    <div className="text-center">
                        <div className="text-6xl mb-6">❌</div>
                        <h3 className="text-3xl font-bold text-white mb-4">Oops!</h3>
                        <p className="text-red-200 text-lg mb-6">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setTimeLeft(duration);
                                setRecordingStatus('ready');
                                setIsProcessing(false);
                            }}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl"
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg">
                    <motion.div
                        className="inline-block w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <h3 className="text-3xl font-bold text-white mb-3">Analyzing your response...</h3>
                    <div className="space-y-2 text-red-200 text-lg">
                        <p>🎤 Converting speech to text...</p>
                        <p>🧠 Evaluating communication patterns...</p>
                        <p>✨ Generating personalized feedback...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full bg-black/40 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-red-800/30"
            >
                <div className="text-center mb-6">
                    <span className="inline-block px-6 py-2 bg-red-900/40 border border-red-700/50 rounded-full text-red-300 font-semibold">
                        Attempt {attemptNumber} of 3 • {duration}s Challenge
                    </span>
                </div>

                <motion.div className="text-center mb-8">
                    <div className={`text-9xl font-black mb-2 ${timeLeft <= 3 && isRecording ? 'text-red-500' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                    <div className="text-xl text-red-300">
                        {isRecording ? 'seconds remaining' : 'seconds to speak'}
                    </div>
                </motion.div>

                <div className="flex justify-center mb-8">
                    <div className="relative w-48 h-48">
                        <svg className="transform -rotate-90 w-48 h-48">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-red-900/30" />
                            <motion.circle
                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                className={timeLeft <= 3 && isRecording ? 'text-red-500' : 'text-red-600'}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl">{isRecording ? '🎙️' : '⏱️'}</span>
                        </div>
                    </div>
                </div>

                {!isRecording && (
                    <div className="bg-red-900/20 rounded-2xl p-6 mb-8 text-center">
                        <p className="text-white text-lg mb-4">
                            {attemptNumber === 1 ? "Speak naturally." : "Focus on improvement."}
                        </p>
                    </div>
                )}

                <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`w-full py-7 text-2xl font-bold rounded-xl transition-all ${isRecording ? 'bg-red-800 text-white' : 'bg-red-600 text-white'
                        }`}
                >
                    {isRecording ? "Stop Recording" : "🎤 Start Recording"}
                </motion.button>
            </motion.div>
        </div>
    );
}

export default RecordingStep;