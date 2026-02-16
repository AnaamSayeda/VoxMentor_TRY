'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function CoachingFeedback({ coaching, attemptNumber, onContinue }) {
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const audioRef = useRef(null);
    const isSpeakingRef = useRef(false); // New lock to prevent double execution

    useEffect(() => {
        // 1. Safety Check
        if (!coaching || isSpeakingRef.current) return;

        // 2. Clear any existing audio completely
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }

        const runSpeechLogic = async () => {
            isSpeakingRef.current = true; // Set the lock

            // Start speaking the summary
            if (coaching.spoken_summary) {
                console.log('✅ Speaking summary...');
                await speakFeedback(coaching.spoken_summary);
            }

            // Handle Round 3 Transformation sequence
            if (attemptNumber === 3 && coaching.transformation_summary?.spoken_transformation) {
                // Wait for a natural pause (approx based on word count)
                const wordCount = coaching.spoken_summary?.split(' ').length || 0;
                const delay = (wordCount / 2.5) * 1000 + 1000;

                setTimeout(async () => {
                    console.log('✅ Speaking transformation...');
                    await speakFeedback(coaching.transformation_summary.spoken_transformation);
                }, delay);
            }
        };

        runSpeechLogic();

        // Cleanup function: stops audio if user leaves the page or clicks continue
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            isSpeakingRef.current = false; // Reset lock on unmount
        };
    }, [coaching]); // Only trigger when coaching data actually changes

    const speakFeedback = async (text) => {
        setAiSpeaking(true);
        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('TTS Failed');

            const data = await response.json();

            // If another audio started while we were fetching, stop this one
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
            audioRef.current = audio;

            audio.onended = () => {
                setAiSpeaking(false);
                // Don't reset isSpeakingRef here, only on unmount
            };

            await audio.play();
        } catch (error) {
            console.error('❌ Voice Error:', error);
            setAiSpeaking(false);
        }
    };

    if (!coaching) return null;

    const isRound3 = attemptNumber === 3;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="max-w-4xl w-full space-y-8">

                {/* Header with Scores */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h2 className="text-5xl font-black text-white mb-4">
                        Round {attemptNumber} Feedback
                    </h2>

                    {/* Score Display */}
                    {coaching.scores && (
                        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-800/30 inline-block">
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-white mb-1">
                                        {coaching.scores.overall_score}
                                    </div>
                                    <div className="text-red-300 text-sm">out of 30</div>
                                </div>

                                {coaching.improvement && (
                                    <div className="border-l-2 border-red-700 pl-8">
                                        <div className="text-3xl font-bold text-green-400 mb-1">
                                            +{coaching.improvement.overall_change.toFixed(1)}
                                        </div>
                                        <div className="text-green-300 text-sm">
                                            {coaching.improvement.percentage_improvement}% improvement
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* AI Coach Voice Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-3xl p-10"
                >
                    <div className="flex items-start gap-6">
                        <motion.div
                            animate={{
                                scale: aiSpeaking ? [1, 1.15, 1] : 1,
                            }}
                            transition={{
                                duration: 1,
                                repeat: aiSpeaking ? Infinity : 0,
                            }}
                            className="text-6xl"
                        >
                            🎤
                        </motion.div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-2xl font-bold text-white">VoxMentor Coach</h3>
                                {aiSpeaking && (
                                    <motion.div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 h-8 bg-purple-400 rounded-full"
                                                animate={{ scaleY: [1, 1.5, 1] }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.15
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <p className="text-2xl text-purple-100 leading-relaxed">
                                {coaching.spoken_intro}
                            </p>

                            {aiSpeaking && (
                                <p className="text-purple-300 text-sm mt-4 flex items-center gap-2">
                                    <span className="animate-pulse">🔊</span>
                                    Playing mentor summary...
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Detailed Scores Breakdown */}
                {coaching.scores && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-800/30"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">📊 Score Breakdown</h3>

                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { key: 'clarity', label: 'Clarity', emoji: '🧠' },
                                { key: 'structure', label: 'Structure', emoji: '🧱' },
                                { key: 'impact', label: 'Impact', emoji: '🔥' }
                            ].map(({ key, label, emoji }) => (
                                <div key={key} className="text-center">
                                    <div className="text-3xl mb-2">{emoji}</div>
                                    <div className="text-red-300 text-sm mb-2">{label}</div>
                                    <div className="text-4xl font-bold text-white">
                                        {coaching.scores[key]}
                                        <span className="text-lg text-red-400">/10</span>
                                    </div>
                                    {coaching.improvement && coaching.improvement[`${key}_change`] > 0 && (
                                        <div className="text-green-400 text-sm mt-1">
                                            +{coaching.improvement[`${key}_change`].toFixed(1)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* What I'm Hearing */}
                {coaching.what_hearing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-800/30"
                    >
                        <h3 className="text-3xl font-bold text-white mb-6">🧠 What I'm Hearing</h3>

                        <div className="space-y-4">
                            <div>
                                <span className="text-red-400 font-semibold">Core Identity:</span>
                                <p className="text-white text-lg mt-1">{coaching.what_hearing.core_identity}</p>
                            </div>

                            <div>
                                <span className="text-red-400 font-semibold">What You Do:</span>
                                <p className="text-white text-lg mt-1">{coaching.what_hearing.what_they_do}</p>
                            </div>

                            <div>
                                <span className="text-red-400 font-semibold">What's Unclear:</span>
                                <p className="text-orange-300 text-lg mt-1">{coaching.what_hearing.whats_unclear}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* What Needs Sharpening */}
                {coaching.what_needs_sharpening && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-orange-900/20 border-2 border-orange-500/30 rounded-2xl p-8"
                    >
                        <h3 className="text-3xl font-bold text-white mb-6">🧱 What Needs Sharpening</h3>

                        <div className="space-y-4">
                            {coaching.what_needs_sharpening.map((point, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <span className="text-orange-400 font-bold text-xl">{index + 1}.</span>
                                    <p className="text-orange-100 text-lg">{point}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Rewritten Version */}
                {coaching.rewritten_version && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-3xl p-8"
                    >
                        <h3 className="text-3xl font-bold text-white mb-6">✨ Rewritten Version</h3>

                        <div className="bg-black/30 rounded-2xl p-6 mb-6">
                            <p className="text-2xl text-green-100 leading-relaxed">
                                "{coaching.rewritten_version}"
                            </p>
                        </div>

                        <div className="space-y-6">
                            {coaching.why_this_works && (
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-3">Why This Works:</h4>
                                    <p className="text-green-200 text-lg leading-relaxed">
                                        {coaching.why_this_works}
                                    </p>
                                </div>
                            )}

                            {coaching.what_changed && (
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-3">What I Changed:</h4>
                                    <p className="text-green-200 text-lg leading-relaxed">
                                        {coaching.what_changed}
                                    </p>
                                </div>
                            )}

                            {coaching.rephrase_options && coaching.rephrase_options.length > 0 && (
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-3">Your Way (Choose One):</h4>
                                    <div className="space-y-3">
                                        {coaching.rephrase_options.map((option, index) => (
                                            <div key={index} className="bg-green-900/20 rounded-xl p-4 border-l-4 border-green-400">
                                                <p className="text-green-100 text-lg">{option}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Transformation Summary (Round 3 only) */}
                {coaching.transformation_summary && isRound3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-3xl p-10"
                    >
                        <h3 className="text-4xl font-black text-white mb-8 text-center">🚀 Your Transformation</h3>

                        <div className="space-y-6 mb-8">
                            <div>
                                <span className="text-yellow-400 font-bold">Round 1:</span>
                                <p className="text-yellow-100 text-lg mt-1">{coaching.transformation_summary.round_1}</p>
                            </div>
                            <div>
                                <span className="text-yellow-400 font-bold">Round 2:</span>
                                <p className="text-yellow-100 text-lg mt-1">{coaching.transformation_summary.round_2}</p>
                            </div>
                            <div>
                                <span className="text-yellow-400 font-bold">Round 3:</span>
                                <p className="text-yellow-100 text-lg mt-1">{coaching.transformation_summary.round_3}</p>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-2xl p-6 mb-6">
                            <h4 className="text-white font-bold text-xl mb-3">🧠 Your Breakthrough:</h4>
                            <p className="text-yellow-100 text-2xl leading-relaxed">
                                {coaching.transformation_summary.breakthrough_moment}
                            </p>
                        </div>

                        <div className="bg-yellow-900/30 rounded-2xl p-6 mb-6">
                            <h4 className="text-white font-bold text-xl mb-3">🏆 Your Communication Archetype:</h4>
                            <p className="text-3xl font-black text-yellow-300">
                                {coaching.transformation_summary.archetype}
                            </p>
                        </div>

                        {coaching.transformation_summary.what_you_learned && (
                            <div>
                                <h4 className="text-white font-bold text-xl mb-4">🎧 What You Just Learned:</h4>
                                <div className="space-y-3">
                                    {coaching.transformation_summary.what_you_learned.map((lesson, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <span className="text-yellow-400 text-xl">•</span>
                                            <p className="text-yellow-100 text-lg">{lesson}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Continue Button */}
                <motion.button
                    onClick={onContinue}
                    className="w-full py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                >
                    {isRound3 ? '🎉 Complete Challenge' : `⏭ Continue to Round ${attemptNumber + 1}`}
                </motion.button>

            </div>
        </div>
    );
}

export default CoachingFeedback;