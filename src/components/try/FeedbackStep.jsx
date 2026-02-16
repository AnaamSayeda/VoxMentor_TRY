'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function FeedbackStep({ duration, attemptNumber, onComplete }) {
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackData, setFeedbackData] = useState(null);
    const [aiSpeaking, setAiSpeaking] = useState(false);

    useEffect(() => {
        // Simulate loading (actual data will come from RecordingStep via API)
        // In real implementation, this would receive data as a prop
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    useEffect(() => {
        if (feedbackData && feedbackData.feedback) {
            speakFeedback(feedbackData.feedback);
        }
    }, [feedbackData]);

    const speakFeedback = (text) => {
        setAiSpeaking(true);

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                setAiSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => {
                setAiSpeaking(false);
            }, 3000);
        }
    };

    // This will be replaced with actual data from props
    // For now, using mock data for UI development
    const mockFeedbackData = {
        scores: {
            clarity: 7,
            structure: 6,
            confidence: 8
        },
        totalScore: 21,
        feedback: "You clearly explained what you do, but your opening was vague. Try starting with a stronger hook next time. Great energy though!",
        highlights: [
            { text: "Hi, I'm Sarah, a software engineer.", type: "strong" },
            { text: "I work on various projects.", type: "unclear" },
            { text: "I really love coding and building things and working with teams and learning new technologies.", type: "rambling" }
        ],
        improvementTip: "Start with: 'I'm a software engineer who helps startups build scalable web applications.'"
    };

    useEffect(() => {
        if (!isLoading && !feedbackData) {
            setFeedbackData(mockFeedbackData);
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        className="inline-block w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Analyzing your response... 🧠
                    </h3>
                    <p className="text-red-300">
                        Our AI coach is evaluating your performance
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!feedbackData) return null;

    const totalScore = feedbackData.scores.clarity + feedbackData.scores.structure + feedbackData.scores.confidence;
    const maxScore = 30;
    const scorePercentage = (totalScore / maxScore) * 100;

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHighlightColor = (type) => {
        if (type === 'strong') return 'bg-green-500/20 border-green-500';
        if (type === 'unclear') return 'bg-yellow-500/20 border-yellow-500';
        return 'bg-red-500/20 border-red-500';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-5xl font-black text-white mb-2">
                        Your Feedback 📊
                    </h2>
                    <p className="text-xl text-red-300">
                        Attempt {attemptNumber} • {duration}s Challenge
                    </p>
                </motion.div>

                {/* Overall Score Circle */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative w-48 h-48">
                        <svg className="transform -rotate-90 w-48 h-48">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-red-900/30"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                className={`${scorePercentage >= 83 ? 'text-green-500' :
                                    scorePercentage >= 60 ? 'text-yellow-500' :
                                        'text-red-500'
                                    }`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - scorePercentage / 100) }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="text-5xl font-black text-white"
                            >
                                {totalScore}
                            </motion.div>
                            <div className="text-red-300 text-sm">out of {maxScore}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Individual Scores */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-4 mb-8"
                >
                    {Object.entries(feedbackData.scores).map(([key, value], index) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-800/30 text-center"
                        >
                            <div className="text-sm text-red-300 uppercase tracking-wider mb-2">
                                {key === 'clarity' ? '🧠 Clarity' : key === 'structure' ? '🧱 Structure' : '🔥 Confidence'}
                            </div>
                            <div className={`text-5xl font-black ${getScoreColor(value)} mb-1`}>
                                {value}
                            </div>
                            <div className="text-sm text-red-400">/ 10</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* AI Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-800/30 mb-8"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <motion.div
                            animate={{
                                scale: aiSpeaking ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                                duration: 1,
                                repeat: aiSpeaking ? Infinity : 0,
                            }}
                            className="text-4xl"
                        >
                            🤖
                        </motion.div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-white font-bold text-lg">AI Coach Feedback</h3>
                                {aiSpeaking && (
                                    <motion.div
                                        className="w-2 h-2 bg-red-500 rounded-full"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                )}
                            </div>
                            <p className="text-red-100 text-lg leading-relaxed">
                                {feedbackData.feedback}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Highlighted Transcript */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-800/30 mb-8"
                >
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span>📝</span> Your Response (Highlighted)
                    </h3>

                    <div className="space-y-3 mb-6">
                        {feedbackData.highlights.map((segment, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.1 + index * 0.1 }}
                                className={`inline-block mr-2 mb-2 px-4 py-2 rounded-lg border-2 ${getHighlightColor(segment.type)}`}
                            >
                                <span className="text-white">{segment.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500 rounded" />
                            <span className="text-green-300">Strong</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500/20 border-2 border-yellow-500 rounded" />
                            <span className="text-yellow-300">Unclear</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 rounded" />
                            <span className="text-red-300">Rambling</span>
                        </div>
                    </div>
                </motion.div>

                {/* Improvement Tip (if retry available) */}
                {attemptNumber < 3 && totalScore < 25 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                        className="bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-xl rounded-2xl p-6 border border-red-700/50 mb-8"
                    >
                        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                            <span>💡</span> Pro Tip for Next Attempt:
                        </h3>
                        <p className="text-red-100 text-lg">
                            {feedbackData.improvementTip}
                        </p>
                    </motion.div>
                )}

                {/* Action Button */}
                <motion.button
                    onClick={() => onComplete(feedbackData)}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    {totalScore >= 25 || attemptNumber >= 3 ? (
                        "See Final Results 🎉"
                    ) : (
                        `Try Again (Attempt ${attemptNumber + 1}/3) 🔄`
                    )}
                </motion.button>
            </div>
        </div>
    );
}

export default FeedbackStep;