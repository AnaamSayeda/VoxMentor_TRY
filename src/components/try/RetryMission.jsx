'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function RetryMission({ mission, attemptNumber, previousScore, onStart }) {
    const [aiSpeaking, setAiSpeaking] = useState(false);

    useEffect(() => {
        // Speak the mission tone/encouragement
        if (mission && mission.tone) {
            speakText(mission.tone);
        }
    }, [mission]);

    const speakText = async (text) => {
        setAiSpeaking(true);

        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);

                audio.onended = () => {
                    setAiSpeaking(false);
                };

                audio.play();
            } else {
                setAiSpeaking(false);
            }
        } catch (error) {
            console.error('TTS error:', error);
            setAiSpeaking(false);
        }
    };

    const getMissionEmoji = (attemptNumber) => {
        if (attemptNumber === 2) return '🎮';
        if (attemptNumber === 3) return '🔥';
        return '🎯';
    };

    const getMissionTitle = (attemptNumber) => {
        if (attemptNumber === 2) return 'Retry Mission #2';
        if (attemptNumber === 3) return 'Final Challenge';
        return 'Next Challenge';
    };

    const getMissionSubtitle = (attemptNumber) => {
        if (attemptNumber === 2) return 'Same intro — new focus';
        if (attemptNumber === 3) return 'This is your moment';
        return 'Level this up';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-black/40 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-red-800/30"
            >
                {/* Mission Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-center text-8xl mb-6"
                >
                    {getMissionEmoji(attemptNumber)}
                </motion.div>

                {/* Mission Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-5xl font-black text-white mb-2">
                        {getMissionTitle(attemptNumber)}
                    </h2>
                    <p className="text-2xl text-red-300">
                        {getMissionSubtitle(attemptNumber)}
                    </p>
                </motion.div>

                {/* Previous Score (if available) */}
                {previousScore !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-red-900/20 rounded-2xl p-6 mb-8 text-center"
                    >
                        <p className="text-red-200 text-sm mb-2">Your Last Score</p>
                        <p className="text-5xl font-black text-yellow-400">
                            {Math.round(previousScore)}<span className="text-2xl text-red-300">/100</span>
                        </p>
                    </motion.div>
                )}

                {/* Mission Details */}
                {mission && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-700/50 rounded-2xl p-8 mb-8"
                    >
                        {/* Goal */}
                        <div className="mb-6">
                            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                                <span>🎯</span> Your Mission:
                            </h3>
                            <p className="text-white text-xl font-semibold">
                                {mission.goal}
                            </p>
                        </div>

                        {/* Constraint */}
                        {mission.constraint && (
                            <div className="mb-6">
                                <h3 className="text-red-200 font-bold text-lg mb-3 flex items-center gap-2">
                                    <span>🚫</span> New Rule:
                                </h3>
                                <p className="text-red-100 text-lg">
                                    {mission.constraint}
                                </p>
                            </div>
                        )}

                        {/* Encouragement */}
                        {mission.tone && (
                            <div className="bg-black/30 rounded-xl p-5 border-l-4 border-orange-400">
                                <div className="flex items-start gap-3">
                                    <motion.span
                                        animate={{
                                            scale: aiSpeaking ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: aiSpeaking ? Infinity : 0,
                                        }}
                                        className="text-2xl"
                                    >
                                        💪
                                    </motion.span>
                                    <p className="text-white text-lg flex-1">
                                        {mission.tone}
                                    </p>
                                </div>
                                {aiSpeaking && (
                                    <p className="text-orange-300 text-sm mt-2 ml-9 flex items-center gap-2">
                                        <motion.span
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            🔊
                                        </motion.span>
                                        AI Coach speaking...
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Motivational Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-6 mb-8 text-center"
                >
                    <p className="text-purple-200 text-lg">
                        {attemptNumber === 2
                            ? '✨ Every retry is a chance to level up. Focus on one thing.'
                            : '🌟 This is your final shot. Show what you\'ve learned.'}
                    </p>
                </motion.div>

                {/* Start Button */}
                <motion.button
                    onClick={onStart}
                    className={`w-full py-6 font-bold text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all ${attemptNumber === 3
                            ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white'
                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    {attemptNumber === 3 ? '🔥 Final Attempt — Let\'s Go!' : '🎮 Level This Up'}
                </motion.button>

                {/* Info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center text-red-300/60 text-sm mt-6"
                >
                    {attemptNumber === 2
                        ? 'Focus on improving your weakest area'
                        : 'Make this count — it\'s your last chance to refine'}
                </motion.p>
            </motion.div>
        </div>
    );
}

export default RetryMission;